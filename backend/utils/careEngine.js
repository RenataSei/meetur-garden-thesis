// backend/utils/careEngine.js

// Helper to parse ranges like "18-25°C" or "60-80%"
const parseRange = (rangeStr) => {
  if (!rangeStr) return null;

  // Remove non-digits (like °C, %, spaces)
  const cleanStr = rangeStr.replace(/[^0-9-]/g, "");
  const parts = cleanStr.split("-");

  if (parts.length === 2) {
    return { min: Number(parts[0]), max: Number(parts[1]) };
  }
  return null;
};

const differenceInDays = (date1, date2) => {
  const diff = Math.abs(date1 - date2);
  return diff / (1000 * 60 * 60 * 24);
};

const analyzePlantHealth = (plant, weatherData, gardenItem = null) => {
  const alerts = [];
  const status = { health: "Optimal", alerts: [], next_actions: {} };

  // 1. Check Temperature
  // Weather API usually returns temp in Celsius if units='metric'
  const currentTemp = weatherData.main.temp;
  const tempRange = parseRange(plant.ecological_descriptors.temperature_range);

  if (tempRange) {
    if (currentTemp < tempRange.min) {
      alerts.push(
        `Too Cold! Current temp is ${currentTemp}°C. ${plant.common_name[0]} needs at least ${tempRange.min}°C.`
      );
    } else if (currentTemp > tempRange.max) {
      alerts.push(
        `Too Hot! Current temp is ${currentTemp}°C. ${plant.common_name[0]} prefers below ${tempRange.max}°C.`
      );
    }
  }

  // 2. Humidity Check
  const currentHumidity = weatherData.main.humidity;
  const humidityReq = plant.ecological_descriptors.humidity_level || "";
  if (humidityReq.toLowerCase().includes("high") && currentHumidity < 40) {
    alerts.push(`💧 Air is dry (${currentHumidity}%). Mist this plant.`);
  }

  // 3. Smart Watering Schedule
  if (gardenItem && gardenItem.last_watered) {
    const daysSinceWatering = differenceInDays(
      new Date(),
      new Date(gardenItem.last_watered)
    );

    // Parse Frequency from DB (Defaulting to 7 days if parsing fails)
    let requiredDays = 7;
    const freq = plant.ecological_descriptors.water_frequency.toLowerCase();

    if (freq.includes("daily")) requiredDays = 1;
    else if (freq.includes("bi-weekly") || freq.includes("2 weeks"))
      requiredDays = 14;
    else if (freq.includes("weekly")) requiredDays = 7;

    // Smart Adjustment: Rain delays the need for water
    const isRaining = weatherData.weather[0].main
      .toLowerCase()
      .includes("rain");
    if (isRaining) {
      requiredDays += 2;
      alerts.push("🌧️ It's raining! Watering pushed back 2 days.");
    }

    // Calculate Countdown
    const dueInDays = requiredDays - daysSinceWatering;

    if (dueInDays <= 0) {
      status.health = "Thirsty";
      status.next_actions.water_in = "Now";
      alerts.push(`💧 Time to water!`);
    } else {
      status.next_actions.water_in = `${Math.round(dueInDays)} days`;
    }
  }

  // 4. Sun Exposure Alert (If currently outside)
  if (gardenItem && gardenItem.is_in_sun) {
    alerts.push("☀️ Plant is currently under sun exposure.");
  }

  if (alerts.length > 0 && status.health === "Optimal") {
    status.health = "Needs Attention";
  }
  status.alerts = alerts;

  return status;
};
module.exports = { analyzePlantHealth };
