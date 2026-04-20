// backend/utils/careEngine.js

const parseRange = (rangeStr) => {
  if (!rangeStr || typeof rangeStr !== "string") return null;
  const matches = rangeStr.match(/\d+(\.\d+)?/g);
  if (matches && matches.length >= 2) {
    return { min: parseFloat(matches[0]), max: parseFloat(matches[1]) };
  }
  return null;
};

const differenceInDays = (date1, date2) => {
  const diff = Math.abs(date1 - date2);
  return diff / (1000 * 60 * 60 * 24);
};

const analyzePlantHealth = (plant, weatherData, gardenItem = null) => {
  const alerts = [];
  if (!weatherData || !weatherData.main) {
    return { status: "Unknown", message: "Waiting for local weather data..." };
  }
  
  const status = { health: "OPTIMAL", alerts: [], next_actions: {} };

  const currentTemp = weatherData.main.temp;
  const tempRange = parseRange(plant.ecological_descriptors?.temperature_range);
  const BUFFER = 2.0;

  const lastActionTime = gardenItem && gardenItem.last_action_date ? new Date(gardenItem.last_action_date).getTime() : 0;
  const hoursSinceLastAction = (Date.now() - lastActionTime) / (1000 * 60 * 60);

  const hasHeatImmunity = hoursSinceLastAction < 4 && (gardenItem?.last_action === 'mist' || gardenItem?.last_action === 'move_shade');
  const hasColdImmunity = hoursSinceLastAction < 4 && (gardenItem?.last_action === 'move_inside');

  // Physical properties
  const isOutdoor = gardenItem?.placement === "Outdoor";
  const isTerraCotta = gardenItem?.potType === "Terra Cotta";

  // 1. TEMPERATURE & MICRO-CLIMATE LOGIC
  if (tempRange) {
    if (currentTemp < tempRange.min) {
      if (isOutdoor) {
        if (hasColdImmunity) {
          alerts.push(`🌡️ Safe inside from the ${currentTemp}°C cold.`);
        } else {
          status.health = "TOO COLD!"; 
          alerts.push(`🚨 FROST RISK: It's ${currentTemp}°C outside. Bring ${plant.common_name?.[0] || 'plant'} indoors!`);
        }
      } else {
        // Plant is indoors. Outside is freezing. Heater is probably on.
        alerts.push(`⚠️ Outside is freezing (${currentTemp}°C). Heaters dry the indoor air. Mist leaves today.`);
      }
    } 
    else if (currentTemp > tempRange.max) {
      if (isOutdoor) {
        if (hasHeatImmunity) {
          alerts.push(`🌡️ Protected from ${currentTemp}°C heat by recent care.`);
        } else {
          status.health = "TOO HOT!"; 
          alerts.push(`🔥 RAPID EVAPORATION: It's ${currentTemp}°C outside! Move to shade!`);
        }
      } else {
        // Plant is indoors. Outside is scorching. AC is probably on.
        alerts.push(`⚠️ Outside is scorching (${currentTemp}°C). AC units dry the indoor air. Mist leaves today.`);
      }
    }
  }

  // 2. HUMIDITY
  const currentHumidity = weatherData.main.humidity;
  const humidityReq = plant.ecological_descriptors?.humidity_level || "";
  if (humidityReq.toLowerCase().includes("high") && currentHumidity < 40) {
    if (hoursSinceLastAction < 4 && gardenItem?.last_action === 'mist') {
      alerts.push(`💧 Air is dry, but recently misted.`);
    } else {
      alerts.push(`💧 Air is very dry (${currentHumidity}%). Mist required.`);
    }
  }

  // 3. 🟢 THE DYNAMIC EVAPORATION WATERING ALGORITHM
  if (gardenItem && gardenItem.last_watered) {
    const daysSinceWatering = differenceInDays(new Date(), new Date(gardenItem.last_watered));

    // A. Base Frequency
    let requiredDays = 7;
    const freq = (plant.ecological_descriptors?.water_frequency || "").toLowerCase();
    if (freq.includes("daily")) requiredDays = 1;
    else if (freq.includes("bi-weekly") || freq.includes("2 weeks")) requiredDays = 14;
    else if (freq.includes("weekly")) requiredDays = 7;

    // B. Material Modifier (Terra Cotta breathes)
    if (isTerraCotta) {
      requiredDays *= 0.8; // Dries 20% faster
      alerts.push("🪴 Terra Cotta pot detected: Soil dries faster.");
    }

    // C. Seasonal Dormancy Modifier (Nov - Feb)
    const currentMonth = new Date().getMonth(); 
    if (currentMonth === 10 || currentMonth === 11 || currentMonth === 0 || currentMonth === 1) {
      requiredDays *= 1.3; // Drinks 30% slower in winter
    }

    // D. Weather Overrides (Only affects Outdoor plants)
    const isRaining = weatherData.weather?.[0]?.main?.toLowerCase().includes("rain");
    if (isOutdoor && isRaining) {
      requiredDays += 2; // Nature watered it
      alerts.push("🌧️ Rain delay: Nature is watering your outdoor plant.");
    }
    if (isOutdoor && currentTemp > tempRange?.max) {
      requiredDays *= 0.7; // Extreme heat bakes outdoor soil
    }

    const dueInDays = requiredDays - daysSinceWatering;
    const hydration = Math.max(0, Math.min(100, Math.round((dueInDays / requiredDays) * 100)));
    status.hydration_percent = hydration;

    if (dueInDays <= 0) {
      if (status.health === "OPTIMAL") status.health = "THIRSTY";
      status.next_actions.water_in = "Now";
      alerts.push(`💧 Soil is completely dry. Time to water!`);
    } else {
      // Show decimals if < 2 days so they see it dropping
      status.next_actions.water_in = dueInDays < 2 ? `${dueInDays.toFixed(1)} days` : `${Math.round(dueInDays)} days`;
    }
  } else {
    status.hydration_percent = 0;
    status.next_actions.water_in = "Now";
  }

  // 4. Sun Exposure
  if (gardenItem && gardenItem.is_in_sun && isOutdoor) {
    alerts.push("☀️ Plant is baking in direct outdoor sun.");
  }

  // 5. Final Catch-All
  if (alerts.length > 0 && status.health === "OPTIMAL") {
    status.health = "NEEDS ATTENTION";
  }

  status.alerts = [...new Set(alerts)]; // Remove duplicate alerts just in case
  return status;
};

// ... keep analyzeForecast and exports the same
const analyzeForecast = (forecastData, plantTempRange) => {
  if (!forecastData || !forecastData.list) return [];
  const futureAlerts = [];
  let rainFound = false, extremeHeatFound = false;

  forecastData.list.forEach((slot) => {
    const temp = slot.main.temp;
    const isRaining = slot.weather[0].main.toLowerCase().includes("rain");
    
    if (isRaining && !rainFound) {
      futureAlerts.push(`🌧️ Rain expected on ${new Date(slot.dt * 1000).toLocaleDateString('en-US', {weekday: 'short'})}. Hold off on deep watering.`);
      rainFound = true; 
    }
    if (plantTempRange && temp > plantTempRange.max + 2 && !extremeHeatFound) {
      futureAlerts.push(`🔥 Heatwave warning: Temps hitting ${Math.round(temp)}°C soon. Prepare shade!`);
      extremeHeatFound = true;
    }
  });
  return futureAlerts;
};

module.exports = { analyzePlantHealth, analyzeForecast, parseRange };