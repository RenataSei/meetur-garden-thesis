import { useState, useEffect } from "react";
import { MapContainer, TileLayer, LayersControl } from "react-leaflet";
import { WeatherAPI } from "../api";
import "leaflet/dist/leaflet.css";

const styles = `
  .radar-page {
    width: 100%;
    min-height: calc(100vh - 80px);
    display: flex;
    flex-direction: column;
    gap: 24px;
    animation: fadeIn 0.4s ease-out;
  }

  .radar-header {
    background: #111827;
    border: 1px solid #374151;
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  }

  .radar-title {
    font-size: 2rem;
    font-weight: 800;
    color: #38bdf8;
    margin: 0 0 8px 0;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .radar-desc {
    color: #9ca3af;
    margin: 0;
    font-size: 1rem;
  }

  .map-wrapper {
    flex-grow: 1;
    min-height: 600px;
    border-radius: 16px;
    overflow: hidden;
    border: 2px solid #374151;
    box-shadow: 0 20px 40px rgba(0,0,0,0.5);
    background: #0f172a; /* Fallback color before map loads */
    position: relative;
  }

  /* Fix for Leaflet in dark mode to not flash white */
  .leaflet-container {
    background: #0f172a !important; 
    height: 100%;
    width: 100%;
  }

  /* Custom styling for the layer control box */
  .leaflet-control-layers {
    background: #1f2937 !important;
    border: 1px solid #374151 !important;
    color: #f3f4f6 !important;
    border-radius: 12px !important;
  }
  .leaflet-control-layers-toggle {
    background-color: #1f2937 !important;
    border-radius: 12px !important;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

export default function LiveRadar() {
  const [apiKey, setApiKey] = useState(null);
  const [error, setError] = useState(null);

  // Dasmariñas, Cavite Coordinates
  const DASCA_COORDS = [14.3294, 120.9367];

  useEffect(() => {
    WeatherAPI.getMapConfig()
      .then((data) => setApiKey(data.apiKey))
      .catch((err) => {
        console.error("Failed to load map config", err);
        setError("Could not connect to weather services. Please try again later.");
      });
  }, []);

  if (error) {
    return (
      <div className="radar-page" style={{ justifyContent: "center", alignItems: "center" }}>
        <style>{styles}</style>
        <h3 style={{ color: "#ef4444" }}>📡 Radar Offline</h3>
        <p style={{ color: "#9ca3af" }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="radar-page">
      <style>{styles}</style>
      
      <div className="radar-header">
        <h1 className="radar-title">📡 Live Weather Radar</h1>
        <p className="radar-desc">
          Track precipitation and cloud cover across Cavite in real-time to protect your outdoor plants.
        </p>
      </div>

      <div className="map-wrapper">
        {apiKey ? (
          <MapContainer center={DASCA_COORDS} zoom={11} scrollWheelZoom={true}>
            {/* Base Map (Dark Mode CartoDB Map) */}
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />

            {/* Weather Overlays (Users can toggle between Rain and Clouds) */}
            <LayersControl position="topright">
              
              <LayersControl.Overlay checked name="🌧️ Precipitation (Rain)">
                <TileLayer
                  attribution='&copy; <a href="https://openweathermap.org/">OpenWeatherMap</a>'
                  url={`https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${apiKey}`}
                  opacity={0.7}
                />
              </LayersControl.Overlay>

              <LayersControl.Overlay name="☁️ Cloud Cover">
                <TileLayer
                  attribution='&copy; <a href="https://openweathermap.org/">OpenWeatherMap</a>'
                  url={`https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${apiKey}`}
                  opacity={0.7}
                />
              </LayersControl.Overlay>

            </LayersControl>
          </MapContainer>
        ) : (
          <div style={{ display: "flex", height: "100%", justifyContent: "center", alignItems: "center", color: "#38bdf8" }}>
            Connecting to satellites...
          </div>
        )}
      </div>
    </div>
  );
}