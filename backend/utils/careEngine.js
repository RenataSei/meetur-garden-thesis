// backend/utils/careEngine.js

// Helper to parse ranges like "18-25°C", "15.6 - 23.9 C", or "60-80%"
const parseRange = (rangeStr) => {
  if (!rangeStr) return null;

  // 🟢 FIX: Added the decimal point (.) inside the brackets!
  const cleanStr = rangeStr.replace(/[^0-9.-]/g, ""); 
  const parts = cleanStr.split("-");

  if (parts.length === 2) {
    return { 
      min: Number(parts[0]), 
      max: Number(parts[1]) 
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

  if (tempRange) {
    if (currentTemp < tempRange.min) {
      status.health = "TOO COLD!"; // FIX 3: Set main health status to trigger the red UI border
      alerts.push(`Too Cold! Current temp is ${currentTemp}°C. Needs at least ${tempRange.min}°C.`);
    } else if (currentTemp > tempRange.max) {
      status.health = "TOO HOT!"; // FIX 3: Set main health status to trigger the red UI border
      alerts.push(`Too Hot! Current temp is ${currentTemp}°C. Prefers below ${tempRange.max}°C.`);
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
      new Date(gardenItem.last_watered)
    );

    let requiredDays = 7;
    // FIX 2: Safely handle missing DB fields with (?.) and an empty string fallback
    const freq = (plant.ecological_descriptors?.water_frequency || "").toLowerCase();

    if (freq.includes("daily")) requiredDays = 1;
    else if (freq.includes("bi-weekly") || freq.includes("2 weeks")) requiredDays = 14;
    else if (freq.includes("weekly")) requiredDays = 7;

    // Safely check weather array in case the API temporarily drops the data
    const isRaining = weatherData.weather?.[0]?.main?.toLowerCase().includes("rain");
    if (isRaining) {
      requiredDays += 2;
      alerts.push("🌧️ It's raining! Watering pushed back 2 days.");
    }

    const dueInDays = requiredDays - daysSinceWatering;

    if (dueInDays <= 0) {
      // Only set to THIRSTY if it isn't already dying of heat/cold!
      if (status.health === "OPTIMAL") status.health = "THIRSTY";
      status.next_actions.water_in = "Now";
      alerts.push(`💧 Time to water!`);
    } else {
      status.next_actions.water_in = `${Math.round(dueInDays)} days`;
    }
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
