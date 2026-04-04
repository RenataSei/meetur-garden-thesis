// src/contexts/WeatherContext.js
import { createContext, useState, useEffect } from "react";
import { WeatherAPI } from "../api"; // Assuming your API handles the openweathermap URL

export const WeatherContext = createContext();

export function WeatherProvider({ children }) {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null); // 🟢 NEW: Forecast state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper to fetch weather AND forecast by Coordinates
  const fetchByCoords = async (lat, lon) => {
    setLoading(true);
    try {
      // 🟢 FIXED: .catch(e => null) prevents a forecast crash from killing the main weather!
      const [weatherData, forecastData] = await Promise.all([
        WeatherAPI.get({ lat, lon }).catch(() => null), 
        WeatherAPI.getForecast({ lat, lon }).catch(() => null) 
      ]);
      
      if (weatherData) setWeather(weatherData);
      if (forecastData) setForecast(forecastData);
      
      setError(null);
    } catch (err) {
      setError("Failed to fetch weather data.");
    } finally {
      setLoading(false);
    }
  };

  // Helper to fetch weather AND forecast by City Name
  const fetchByCity = async (city) => {
    setLoading(true);
    try {
      // 🟢 FIXED: Safe Promise fetching
      const [weatherData, forecastData] = await Promise.all([
        WeatherAPI.get({ city }).catch(() => null), 
        WeatherAPI.getForecast({ city }).catch(() => null)
      ]);
      
      if (weatherData) setWeather(weatherData);
      if (forecastData) setForecast(forecastData);
      
      setError(null);
    } catch (err) {
      setError("Failed to fetch weather data.");
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchByCoords(position.coords.latitude, position.coords.longitude);
        },
        (err) => {
          console.warn("Location denied. Defaulting to Manila.");
          fetchByCity("Manila");
        }
      );
    } else {
      fetchByCity("Manila");
    }
  }, []);

  return (
    <WeatherContext.Provider value={{ weather, forecast, loading, error, fetchByCity }}>
      {children}
    </WeatherContext.Provider>
  );
}