import { useState, useEffect, useContext } from "react";
import { MapContainer, TileLayer, LayersControl, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { WeatherAPI } from "../api";
import { WeatherContext } from "../contexts/WeatherContext"; // 🟢 Bring in the Weather
import "leaflet/dist/leaflet.css";

// --- 🟢 FIX FOR LEAFLET PINS IN REACT ---
// React bundlers often break Leaflet's default pin images. This forces them to load.
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import markerShadowPng from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: markerIconPng,
  shadowUrl: markerShadowPng,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;
// ----------------------------------------

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
    background: #0f172a; 
    position: relative;
    z-index: 1; /* Keeps map behind modals */
  }

  .leaflet-container {
    background: #e5e7eb !important; /* Light gray fallback */
    height: 100%;
    width: 100%;
  }

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

  /* Make the popup look dark mode friendly */
  .leaflet-popup-content-wrapper, .leaflet-popup-tip {
    background: #1f2937;
    color: #f3f4f6;
    border: 1px solid #374151;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

// 🟢 NEW: Component to automatically move the map when location changes
function MapRecenter({ coords }) {
  const map = useMap();
  useEffect(() => {
    map.setView(coords, map.getZoom());
  }, [coords, map]);
  return null;
}

export default function LiveRadar() {
  const [apiKey, setApiKey] = useState(null);
  const [error, setError] = useState(null);

  // 🟢 Access user's active weather data from Context
  const { weather } = useContext(WeatherContext);

  // Determine active coordinates. 
  // If WeatherContext has loaded, use those exact coordinates. Otherwise fallback to Dasmariñas.
  const activeCoords = weather && weather.coord 
    ? [weather.coord.lat, weather.coord.lon] 
    : [14.3294, 120.9367];

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
          Track precipitation and cloud cover across {weather?.name || "your area"} in real-time.
        </p>
      </div>

      <div className="map-wrapper">
        {apiKey ? (
          <MapContainer 
            center={activeCoords} 
            zoom={10} 
            scrollWheelZoom={true}
            style={{ height: "600px", width: "100%" }}
          >
            {/* Smoothly moves the map if the user updates their location settings */}
            <MapRecenter coords={activeCoords} />

           {/* Base Map (Standard Light Mode) */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* 🟢 NEW: The User's Location Pin */}
            <Marker position={activeCoords}>
              <Popup>
                <strong style={{ color: "#34d399", fontSize: "14px" }}>
                  {weather?.name || "Your Location"}
                </strong>
                <br />
                {weather?.weather[0]?.description && (
                  <span style={{ textTransform: "capitalize", color: "#9ca3af" }}>
                    {weather.weather[0].description}
                  </span>
                )}
              </Popup>
            </Marker>

            {/* Weather Overlays */}
            <LayersControl position="topright">
              <LayersControl.Overlay checked name="🌧️ Precipitation (Rain)">
                <TileLayer
                  attribution='&copy; <a href="https://openweathermap.org/">OpenWeatherMap</a>'
                  url={`https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${apiKey}`}
                  opacity={0.8}
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