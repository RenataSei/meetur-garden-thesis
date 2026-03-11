// backend/utils/careEngine.js

const parseRange = (rangeStr) => {
  if (!rangeStr || typeof rangeStr !== "string") return null;

  // This Regex specifically finds all numbers (including decimals)
  const matches = rangeStr.match(/\d+(\.\d+)?/g);

  if (matches && matches.length >= 2) {
    return {
      min: parseFloat(matches[0]),
      max: parseFloat(matches[1]),
    };
  }
  return null;
};

const differenceInDays = (date1, date2) => {
  const diff = Math.abs(date1 - date2);
  return diff / (1000 * 60 * 60 * 24);
};

const analyzePlantHealth = (plant, weatherData, gardenItem = null) => {
  const alerts = [];
  // FIX 1: Default to exact ALL CAPS to match your frontend Home.js
  const status = { health: "OPTIMAL", alerts: [], next_actions: {} };

  // 1. Check Temperature
  const currentTemp = weatherData.main.temp;
  const tempRange = parseRange(plant.ecological_descriptors?.temperature_range);
  const BUFFER = 2.0; // The "Gradient" window in Celsius

  if (tempRange) {
    // --- TOO COLD LOGIC ---
    if (currentTemp < tempRange.min) {
      const severity = tempRange.min - currentTemp;

      if (severity > BUFFER) {
        status.health = "TOO COLD!"; // CRITICAL (Red)
        alerts.push(
          `🚨 CRITICAL: Temp is ${currentTemp}°C. Move ${plant.nickname} inside immediately!`,
        );
      } else {
        status.health = "NEEDS ATTENTION"; // WARNING (Yellow/Orange)
        alerts.push(
          `⚠️ Low Temp Warning: It's ${currentTemp}°C. Getting a bit chilly for this plant.`,
        );
      }
    }
    // --- TOO HOT LOGIC ---
    else if (currentTemp > tempRange.max) {
      const severity = currentTemp - tempRange.max;

      if (severity > BUFFER) {
        status.health = "TOO HOT!"; // CRITICAL (Red)
        alerts.push(
          `🔥 CRITICAL: Temp is ${currentTemp}°C. Provide shade or mist immediately!`,
        );
      } else {
        status.health = "NEEDS ATTENTION"; // WARNING (Yellow/Orange)
        alerts.push(
          `☀️ High Temp Warning: It's ${currentTemp}°C. Monitor for wilting.`,
        );
      }
    }
  }
  // 2. Humidity Check
  const currentHumidity = weatherData.main.humidity;
  const humidityReq = plant.ecological_descriptors?.humidity_level || "";
  if (humidityReq.toLowerCase().includes("high") && currentHumidity < 40) {
    alerts.push(`💧 Air is dry (${currentHumidity}%). Mist this plant.`);
  }

  // 3. Smart Watering Schedule
  if (gardenItem && gardenItem.last_watered) {
    const daysSinceWatering = differenceInDays(
      new Date(),
      new Date(gardenItem.last_watered),
    );

    let requiredDays = 7;
    // FIX 2: Safely handle missing DB fields with (?.) and an empty string fallback
    const freq = (
      plant.ecological_descriptors?.water_frequency || ""
    ).toLowerCase();

    if (freq.includes("daily")) requiredDays = 1;
    else if (freq.includes("bi-weekly") || freq.includes("2 weeks"))
      requiredDays = 14;
    else if (freq.includes("weekly")) requiredDays = 7;

    // Safely check weather array in case the API temporarily drops the data
    const isRaining = weatherData.weather?.[0]?.main
      ?.toLowerCase()
      .includes("rain");
    if (isRaining) {
      requiredDays += 2;
      alerts.push("🌧️ It's raining! Watering pushed back 2 days.");
    }

    const dueInDays = requiredDays - daysSinceWatering;

    // --- Calculate Hydration Percentage (0 to 100) ---
    // Math.max and Math.min keep the bar strictly between 0% and 100%
    const hydration = Math.max(0, Math.min(100, Math.round((dueInDays / requiredDays) * 100)));
    status.hydration_percent = hydration;

    if (dueInDays <= 0) {
      if (status.health === "OPTIMAL") status.health = "THIRSTY";
      status.next_actions.water_in = "Now";
      alerts.push(`💧 Time to water!`);
    } else {
      status.next_actions.water_in = `${Math.round(dueInDays)} days`;
    }
  } else {
    // Fallback if the plant has never been watered
    status.hydration_percent = 0;
    status.next_actions.water_in = "Now";
  }

  // 4. Sun Exposure Alert
  if (gardenItem && gardenItem.is_in_sun) {
    alerts.push("☀️ Plant is currently under sun exposure.");
  }

  // 5. Final Catch-All for Minor Alerts
  if (alerts.length > 0 && status.health === "OPTIMAL") {
    status.health = "NEEDS ATTENTION";
  }

  status.alerts = alerts;
  return status;
};
module.exports = { analyzePlantHealth };
