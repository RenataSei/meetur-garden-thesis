// src/utils/statMapper.js

export const calculateWaterStat = (waterString) => {
  if (!waterString) return 50; // Default to moderate if empty
  const str = waterString.toLowerCase();

  // 1. High Thirst (95%)
  const highKeywords = ['daily', 'constantly moist', 'keep moist', 'frequent', 'wet'];
  if (highKeywords.some(kw => str.includes(kw))) return 95;

  // 2. Moderate Thirst (65%)
  const modKeywords = ['weekly', 'soil is dry', 'moderate', 'top inch', 'partially dry'];
  if (modKeywords.some(kw => str.includes(kw))) return 65;

  // 3. Low Thirst (25%)
  const lowKeywords = ['monthly', 'succulent', 'rarely', 'dry out completely', 'cactus', 'arid'];
  if (lowKeywords.some(kw => str.includes(kw))) return 25;

  // Fallback if no keywords match
  return 50; 
};

export const calculateHumidityStat = (humidityString) => {
  if (!humidityString) return 50; // Default to moderate
  const str = humidityString.toLowerCase();

  // 1. High Humidity (85%)
  const highKeywords = ['high', 'tropical', 'humid', 'mist often', 'terrarium'];
  if (highKeywords.some(kw => str.includes(kw))) return 85;

  // 2. Low Humidity (25%)
  const lowKeywords = ['low', 'arid', 'dry air', 'desert'];
  if (lowKeywords.some(kw => str.includes(kw))) return 25;

  // Fallback
  return 50; 
};