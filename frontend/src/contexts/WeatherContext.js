// src/contexts/WeatherContext.js
import { createContext, useState, useEffect } from "react";
import { WeatherAPI } from "../api";

export const WeatherContext = createContext();

export function WeatherProvider({ children }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper to fetch weather by Coordinates
  const fetchByCoords = async (lat, lon) => {
    setLoading(true);
    try {
      const data = await WeatherAPI.get({ lat, lon });
      setWeather(data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch weather data.");
    } finally {
      setLoading(false);
    }
  };

  // Helper to fetch weather by City Name (Fallback)
  const fetchByCity = async (city) => {
    setLoading(true);
    try {
      const data = await WeatherAPI.get({ city });
      setWeather(data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch weather data.");
    } finally {
      setLoading(false);
    }
  };

  // Get location on first load
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchByCoords(position.coords.latitude, position.coords.longitude);
        },
        (err) => {
          console.warn("Location denied. Defaulting to Dasmariñas/Manila.");
          fetchByCity("Manila"); // Fallback city for your region
        }
      );
    } else {
      fetchByCity("Manila");
    }
  }, []);

  return (
    <WeatherContext.Provider value={{ weather, loading, error, fetchByCity }}>
      {children}
    </WeatherContext.Provider>
  );
}