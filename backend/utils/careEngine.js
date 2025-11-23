// backend/utils/careEngine.js

// Helper to parse ranges like "18-25°C" or "60-80%"
const parseRange = (rangeStr) => {
  if (!rangeStr) return null;
  
  // Remove non-digits (like °C, %, spaces)
  const cleanStr = rangeStr.replace(/[^0-9-]/g, '');
  const parts = cleanStr.split('-');

  if (parts.length === 2) {
    return { min: Number(parts[0]), max: Number(parts[1]) };
  }
  return null;
};

const analyzePlantHealth = (plant, weatherData) => {
  const alerts = [];
  const status = { health: 'Good', alerts: [] };
  
  // 1. Check Temperature
  // Weather API usually returns temp in Celsius if units='metric'
  const currentTemp = weatherData.main.temp; 
  const tempRange = parseRange(plant.ecological_descriptors.temperature_range);

  if (tempRange) {
    if (currentTemp < tempRange.min) {
      alerts.push(`Too Cold! Current temp is ${currentTemp}°C. ${plant.common_name[0]} needs at least ${tempRange.min}°C.`);
    } else if (currentTemp > tempRange.max) {
      alerts.push(`Too Hot! Current temp is ${currentTemp}°C. ${plant.common_name[0]} prefers below ${tempRange.max}°C.`);
    }
  }

  // 2. Check Humidity
  const currentHumidity = weatherData.main.humidity;
  const humidityReq = plant.ecological_descriptors.humidity_level; 
  // Note: Our DB stores this as "High", "Medium"". 
  // We might need a mapping function here. For now, let's assume simpler text alerts.

  // Simple text check example:
  if (currentHumidity < 40 && humidityReq.toLowerCase().includes('high')) {
    alerts.push(`Air is too dry (${currentHumidity}%) for this humidity-loving plant.`);
  }

  // 3. Determine Final Status
  if (alerts.length > 0) {
    status.health = 'Needs Attention';
    status.alerts = alerts;
  }

  return status;
};

module.exports = { analyzePlantHealth };