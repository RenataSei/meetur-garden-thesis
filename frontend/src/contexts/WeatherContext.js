import { createContext, useState, useEffect, useContext } from "react";
import { WeatherAPI } from "../api"; 
import { AuthContext } from "./AuthContext"; // 🟢 Import AuthContext

export const WeatherContext = createContext();

export function WeatherProvider({ children }) {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🟢 Grab the user to check their settings
  const { user } = useContext(AuthContext); 

  const fetchByCoords = async (lat, lon) => {
    setLoading(true);
    try {
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

  const fetchByCity = async (city) => {
    setLoading(true);
    try {
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
  
  // 🟢 THE OVERRIDE LOGIC
  useEffect(() => {
    const customCity = user?.settings?.customLocation;

    // 1. If the user set a custom location, use it and IGNORE the phone's GPS
    if (customCity && customCity.trim() !== "") {
      fetchByCity(customCity);
      return; 
    }

    // 2. Otherwise, fall back to the phone's GPS
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
  }, [user?.settings?.customLocation]); // 🟢 Re-run instantly if they change this setting!

  return (
    <WeatherContext.Provider value={{ weather, forecast, loading, error, fetchByCity }}>
      {children}
    </WeatherContext.Provider>
  );
}