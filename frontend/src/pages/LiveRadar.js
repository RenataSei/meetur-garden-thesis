import { useState, useEffect, useContext } from "react";
import { MapContainer, TileLayer, LayersControl, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { WeatherAPI } from "../api";
import { WeatherContext } from "../contexts/WeatherContext";
import "leaflet/dist/leaflet.css";


// --- FIX FOR LEAFLET PINS IN REACT ---
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

  /* 🔴 NEW ALERT BANNER STYLES */
  .alert-banner {
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid #ef4444;
    border-left: 6px solid #ef4444;
    border-radius: 12px;
    padding: 16px 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .alert-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    color: #f8fafc;
    font-size: 0.95rem;
    line-height: 1.4;
  }

  /* Dashboard Styles */
  .weather-dashboard {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
  }

  .stat-box {
    background: #1f2937;
    border: 1px solid #374151;
    border-radius: 12px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  }

  .stat-box label {
    font-size: 11px;
    color: #9ca3af;
    letter-spacing: 1px;
    margin-bottom: 8px;
    text-transform: uppercase;
  }

  .stat-box .value {
    font-size: 1.5rem;
    font-weight: 800;
    color: #f3f4f6;
    display: flex;
    align-items: baseline;
    gap: 4px;
  }

  .stat-box .sub-value {
    font-size: 0.9rem;
    color: #38bdf8;
    font-weight: normal;
  }

  .map-wrapper {
    flex-grow: 1;
    min-height: 600px;
    border-radius: 16px;
    overflow: hidden;
    border: 2px solid #374151;
    box-shadow: 0 20px 40px rgba(0,0,0,0.5);
    background: #e5e7eb; 
    position: relative;
    z-index: 1; 
  }

  .leaflet-container {
    background: #e5e7eb !important; 
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

  .leaflet-popup-content-wrapper, .leaflet-popup-tip {
    background: #1f2937;
    color: #f3f4f6;
    border: 1px solid #374151;
  }

  .map-legend {
    position: absolute;
    bottom: 24px;
    left: 24px;
    background: rgba(17, 24, 39, 0.9);
    backdrop-filter: blur(4px);
    border: 1px solid #374151;
    padding: 12px 16px;
    border-radius: 12px;
    z-index: 1000;
    color: #f3f4f6;
    font-size: 0.85rem;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  }
  
  .legend-title {
    font-weight: 800;
    margin-bottom: 8px;
    color: #38bdf8;
    font-size: 0.9rem;
    letter-spacing: 0.5px;
  }
  
  .legend-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
  }
  
  .legend-color {
    width: 14px;
    height: 14px;
    border-radius: 4px;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

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

  // 🟢 Correct placement of the hook inside the component
  const { weather, forecast } = useContext(WeatherContext);

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

  // --- DATA PROCESSING FOR DASHBOARD & ALERTS ---
  let impactTip = "Conditions are generally mild. Standard watering schedules apply.";
  if (weather?.main?.temp > 32) impactTip = "It's very hot! Soil will dry out much faster today.";
  else if (weather?.main?.temp < 15) impactTip = "Cooler temperatures today. Be careful not to overwater.";
  else if (weather?.weather?.[0]?.main.includes("Rain")) impactTip = "Rain is expected! Great for outdoor plants.";

  const dailyData = [];
  const systemAlerts = []; // 🟢 Array to hold extreme weather warnings

  if (forecast && forecast.list) {
    const seenDays = new Set();
    let heatwaveFound = false;
    let stormFound = false;

    forecast.list.forEach((slot) => {
      const date = new Date(slot.dt * 1000);
      const dayStr = date.toLocaleDateString("en-US", { weekday: "short" });
      const fullDateStr = date.toLocaleDateString("en-US", { weekday: "long", hour: "numeric" });

      // 🟢 EXTREME WEATHER DETECTION
      // 1. Check for Typhoons / High Wind ( > 17 m/s is roughly 61 km/h )
      if (slot.wind?.speed > 17 && !stormFound) {
        systemAlerts.push(
          `🌀 Tropical Storm/High Wind Warning: Speeds exceeding 60km/h expected around ${fullDateStr}. Secure outdoor plants and pots!`
        );
        stormFound = true; // Only alert once per 5-day cycle
      }

      // 2. Check for Heatwaves ( > 35°C )
      if (slot.main?.temp > 35 && !heatwaveFound) {
        systemAlerts.push(
          `🔥 Heatwave Alert: Temperatures reaching ${Math.round(slot.main.temp)}°C expected around ${fullDateStr}. Prepare to shade and deeply hydrate plants.`
        );
        heatwaveFound = true;
      }

      // Populate Daily Graph Data
      if (!seenDays.has(dayStr) && seenDays.size < 5) {
        seenDays.add(dayStr);
        dailyData.push({
          day: dayStr,
          temp: Math.round(slot.main.temp),
          icon: slot.weather[0].main.includes("Rain") ? "🌧️" 
              : slot.weather[0].main.includes("Cloud") ? "⛅" : "☀️",
        });
      }
    });
  }

  const maxTemp = dailyData.length > 0 ? Math.max(...dailyData.map((d) => d.temp)) : 40;

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

      {/* 🟢 NEW: EXTREME WEATHER ALERTS BANNER */}
      {systemAlerts.length > 0 && (
        <div className="alert-banner">
          <strong style={{ color: "#fca5a5", fontSize: "1.1rem", marginBottom: "4px" }}>
            ⚠️ Extreme Weather Ahead
          </strong>
          {systemAlerts.map((alert, index) => (
            <div key={index} className="alert-item">
              <span>{alert}</span>
            </div>
          ))}
        </div>
      )}

      {weather && (
        <div className="weather-dashboard">
          
          <div className="stat-box" style={{ borderLeft: "4px solid #38bdf8" }}>
            <label>Current Weather</label>
            <div className="value">
              {Math.round(weather.main.temp)}°C 
              <span className="sub-value" style={{ textTransform: "capitalize" }}>
                ({weather.weather[0].description})
              </span>
            </div>
            <span style={{ fontSize: "12px", color: "#9ca3af", marginTop: "4px" }}>
              Feels like {Math.round(weather.main.feels_like)}°C
            </span>
          </div>

          <div className="stat-box">
            <label>Wind & Humidity</label>
            <div className="value" style={{ fontSize: "1.2rem" }}>
              💨 {(weather.wind.speed * 3.6).toFixed(1)} <span className="sub-value">km/h</span>
            </div>
            <div className="value" style={{ fontSize: "1.2rem", marginTop: "4px" }}>
              💧 {weather.main.humidity} <span className="sub-value">%</span>
            </div>
          </div>

          <div className="stat-box" style={{ gridColumn: "span 2" }}>
            <label>Garden Impact</label>
            <span style={{ color: "#e2e8f0", lineHeight: "1.5", fontSize: "14px" }}>
              {impactTip}
            </span>
            {weather.rain && weather.rain['1h'] && (
              <span style={{ color: "#38bdf8", marginTop: "8px", fontSize: "13px", fontWeight: "bold" }}>
                Current Rainfall: {weather.rain['1h']} mm/hr
              </span>
            )}
          </div>

          {dailyData.length > 0 && (
            <div className="stat-box" style={{ gridColumn: "1 / -1", background: "#0b1220" }}>
              <label style={{ marginBottom: "16px" }}>5-Day Forecast</label>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", height: "100px", gap: "8px" }}>
                {dailyData.map((day, idx) => {
                  const barHeight = `${(day.temp / maxTemp) * 100}%`;
                  const isHot = day.temp > 30;
                  const barColor = isHot ? "#ef4444" : "#38bdf8";

                  return (
                    <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                      <span style={{ fontSize: "14px", marginBottom: "8px" }}>{day.icon}</span>
                      <div style={{ width: "100%", maxWidth: "30px", height: "60px", display: "flex", alignItems: "flex-end", background: "rgba(255,255,255,0.05)", border: "1px solid #334155", borderBottom: "none" }}>
                        <div style={{ width: "100%", height: barHeight, background: barColor, borderTop: "2px solid #fff", transition: "height 0.5s ease-out" }} />
                      </div>
                      <strong style={{ fontSize: "12px", marginTop: "8px", color: "#f8fafc" }}>{day.temp}°</strong>
                      <small style={{ fontSize: "9px", color: "#9ca3af", fontFamily: "'Press Start 2P', cursive", marginTop: "4px" }}>{day.day}</small>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      )}

      {/* THE MAP */}
      <div className="map-wrapper">
        <div className="map-legend">
          <div className="legend-title">Precipitation</div>
          <div className="legend-row">
            <div className="legend-color" style={{ background: '#a7f3d0' }}></div> 
            <span>Light Rain</span>
          </div>
          <div className="legend-row">
            <div className="legend-color" style={{ background: '#fde047' }}></div> 
            <span>Moderate</span>
          </div>
          <div className="legend-row">
            <div className="legend-color" style={{ background: '#ef4444' }}></div> 
            <span>Heavy Rain</span>
          </div>
          <div className="legend-row">
            <div className="legend-color" style={{ background: '#a855f7' }}></div> 
            <span>Extreme</span>
          </div>
        </div>

        {apiKey ? (
          <MapContainer 
            center={activeCoords} 
            zoom={10} 
            scrollWheelZoom={true}
            style={{ height: "600px", width: "100%" }}
          >
            <MapRecenter coords={activeCoords} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
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