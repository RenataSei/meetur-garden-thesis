// src/utils/careEngine.js

const parseRange = (rangeStr) => {
  if (!rangeStr) return null;
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

// Changed from 'const analyzePlantHealth =' to 'export const analyzePlantHealth ='
export const analyzePlantHealth = (plant, weatherData, gardenItem = null) => {
  const alerts = [];
  const status = { health: "OPTIMAL", alerts: [], next_actions: {} };

  // SAFETY CHECK: If weather or plant data is missing, return a loading state
  if (!weatherData || !plant || !plant.ecological_descriptors) {
    return { health: "ANALYZING...", alerts: [], next_actions: {} };
  }

  // 1. Check Temperature
  const currentTemp = weatherData.main.temp;
  const tempRange = parseRange(plant.ecological_descriptors.temperature_range);

  if (tempRange) {
    if (currentTemp < tempRange.min) {
      alerts.push(`TOO COLD! CURR: ${Math.round(currentTemp)}°C (NEEDS ${tempRange.min}°C)`);
    } else if (currentTemp > tempRange.max) {
      alerts.push(`TOO HOT! CURR: ${Math.round(currentTemp)}°C (MAX ${tempRange.max}°C)`);
    }
  }

  // 2. Humidity Check
  const currentHumidity = weatherData.main.humidity;
  const humidityReq = plant.ecological_descriptors.humidity_level || "";
  if (humidityReq.toLowerCase().includes("high") && currentHumidity < 40) {
    alerts.push(`DRY AIR (${currentHumidity}%). MIST NEEDED.`);
  }

  // 3. Smart Watering Schedule
  if (gardenItem && gardenItem.last_watered) {
    const daysSinceWatering = differenceInDays(
      new Date(),
      new Date(gardenItem.last_watered)
    );

    let requiredDays = 7;
    const freq = plant.ecological_descriptors.water_frequency.toLowerCase();

    if (freq.includes("daily")) requiredDays = 1;
    else if (freq.includes("bi-weekly") || freq.includes("2 weeks")) requiredDays = 14;
    else if (freq.includes("weekly")) requiredDays = 7;

    const isRaining = weatherData.weather[0].main.toLowerCase().includes("rain");
    if (isRaining) {
      requiredDays += 2;
      alerts.push("🌧️ RAIN DETECTED: WATERING DELAYED 2 DAYS.");
    }

    const dueInDays = requiredDays - daysSinceWatering;

    if (dueInDays <= 0) {
      status.health = "THIRSTY";
      status.next_actions.water_in = "NOW";
      alerts.push(`💧 TIME TO WATER!`);
    } else {
      status.next_actions.water_in = `${Math.round(dueInDays)} DAYS`;
    }
  }

  if (alerts.length > 0 && status.health === "OPTIMAL") {
    status.health = "NEEDS ATTENTION";
  }
  status.alerts = alerts;

  return status;
};