import { useEffect, useState, useContext } from "react";
import { analyzePlantHealth } from "../utils/careEngine";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { WeatherContext } from "../contexts/WeatherContext";
import { GardenAPI } from "../api";
import "./Home.css";

// --- HELPER: FORMAT DATE ---
function formatLastWatered(dateString) {
  if (!dateString) return "Never watered";
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// --- HELPER: CONVERT FILE TO BASE64 ---
const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);
    fileReader.onload = () => resolve(fileReader.result);
    fileReader.onerror = (error) => reject(error);
  });
};

// --- HELPER: FORMAT TEMPERATURE ---
function formatTemp(tempStr) {
  if (!tempStr) return "N/A";
  const nums = tempStr.match(/\d+(\.\d+)?/g);
  if (nums && nums.length >= 2) {
    return `${Math.round(Number(nums[0]))}°C - ${Math.round(Number(nums[1]))}°C`;
  }
  return tempStr;
}

// --- SUB-COMPONENT: The Plant Detail Modal ---
function PlantModal({ plant, weather, onClose, onUpdate, onAction, onRemove }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newNick, setNewNick] = useState(plant.nickname);
  const [newImage, setNewImage] = useState("");
  const [uploading, setUploading] = useState(false);

  const plantInfo = plant.plant_id || {};
  const cleanPlantInfo = {
    ...plantInfo,
    ecological_descriptors: {
      ...plantInfo.ecological_descriptors,
      temperature_range:
        plantInfo.ecological_descriptors?.temperature_range?.replace?.(
          /\s/g,
          "",
        ),
    },
  };

  const healthReport = analyzePlantHealth(cleanPlantInfo, weather, plant);
  const displayImage =
    newImage || plant.custom_image || plantInfo.image_url || null;

  async function handleSave() {
    const payload = {};
    if (newNick && newNick.trim()) payload.nickname = newNick;
    if (newImage) payload.custom_image = newImage;
    await onUpdate(plant._id, payload);
    setIsEditing(false);
  }

  async function handleWriteNFC() {
    if (!("NDEFReader" in window)) {
      alert("NFC not supported on this device.");
      return;
    }
    try {
      const ndef = new window.NDEFReader();
      await ndef.write(plant._id);
      alert(`✅ Success! This tag is now linked to ${plant.nickname}`);
    } catch (error) {
      alert("Write failed: " + error.message);
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 500 * 1024) {
      alert("Please choose an image smaller than 500KB");
      return;
    }
    setUploading(true);
    try {
      const base64 = await convertToBase64(file);
      setNewImage(base64);
    } catch (err) {
      alert("Failed to process image");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>

        {/* HEADER */}
        <div className="modal-header">
          <div className="modal-icon-wrapper">
            <div className="modal-icon">
              {displayImage ? (
                <img
                  src={displayImage}
                  alt="Plant"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <span style={{ fontSize: "40px" }}>🌿</span>
              )}
            </div>
            {isEditing && (
              <label className="camera-btn">
                {uploading ? "..." : "📷"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  hidden
                />
              </label>
            )}
          </div>

          <div className="modal-title-box">
            {isEditing ? (
              <div className="edit-column">
                <input
                  type="text"
                  value={newNick}
                  onChange={(e) => setNewNick(e.target.value)}
                  className="modal-input"
                  placeholder="Nickname..."
                />
                <button
                  onClick={handleSave}
                  className="btn btn--small btn--green"
                >
                  Save Changes
                </button>
              </div>
            ) : (
              <h2 className="modal-title">
                {plant.nickname}
                <button
                  className="edit-icon"
                  onClick={() => setIsEditing(true)}
                >
                  ✏️
                </button>
              </h2>
            )}
            <p className="modal-species">
              {plantInfo.common_name?.[0] || "Unknown Species"}
            </p>
          </div>
        </div>

        {/* DETAILS GRID */}
        <div className="modal-grid">
          <div className="detail-box">
            <label>HEALTH STATUS</label>
            <strong
              style={{
                color:
                  healthReport.health === "OPTIMAL" ? "#8fd081" : "#ef4444",
              }}
            >
              {healthReport.health}
            </strong>
          </div>
          <div className="detail-box">
            <label>LAST WATERED</label>
            <span>{formatLastWatered(plant.last_watered)}</span>
          </div>
          <div className="detail-box">
            <label>CURRENT WEATHER</label>
            <span>{weather ? `${Math.round(weather.main.temp)}°C` : "--"}</span>
          </div>
          <div className="detail-box">
            <label>IDEAL CONDITIONS</label>
            <small>
              Temp:{" "}
              {formatTemp(plantInfo.ecological_descriptors?.temperature_range)}
            </small>
          </div>

          <div className="detail-box" style={{ gridColumn: "1 / -1" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "8px",
              }}
            >
              <label>HYDRATION LEVEL</label>
              <span
                style={{
                  fontSize: "10px",
                  color: "#9ca3af",
                  fontWeight: "bold",
                }}
              >
                {healthReport.hydration_percent}% -{" "}
                {healthReport.next_actions?.water_in === "Now"
                  ? "Needs Water"
                  : `Due in ${healthReport.next_actions?.water_in}`}
              </span>
            </div>
            <div className="water-bar-container">
              <div
                className="water-bar-fill"
                style={{
                  width: `${healthReport.hydration_percent}%`,
                  backgroundColor:
                    healthReport.hydration_percent > 40
                      ? "#3b82f6"
                      : healthReport.hydration_percent > 15
                        ? "#fbbf24"
                        : "#ef4444",
                }}
              />
            </div>
          </div>
        </div>

        {/* 🟢 NEW: DYNAMIC MODAL ACTIONS */}
        <div className="modal-actions" style={{ flexWrap: "wrap" }}>
          {healthReport.health === "TOO HOT!" ? (
            <>
              <button
                onClick={() => onAction(plant._id, "mist")}
                className="btn btn--blue btn--wide"
              >
                Mist 🌬️
              </button>
              <button
                onClick={() => onAction(plant._id, "move_shade")}
                className="btn btn--wide"
                style={{
                  background: "#fbbf24",
                  color: "#0f172a",
                  border: "none",
                }}
              >
                To Shade ⛅
              </button>
            </>
          ) : healthReport.health === "TOO COLD!" ? (
            <button
              onClick={() => onAction(plant._id, "move_inside")}
              className="btn btn--wide"
              style={{ background: "#ef4444", color: "#fff", border: "none" }}
            >
              Move Inside 🏠
            </button>
          ) : (
            <button
              onClick={() => onAction(plant._id, "water")}
              className="btn btn--blue btn--wide"
            >
              Water 💧
            </button>
          )}

          <button
            onClick={() => {
              if (window.confirm("Delete this plant?"))
                onRemove(plant._id, plant.nickname);
            }}
            className="btn btn--danger btn--wide"
          >
            Remove 🗑️
          </button>
          <button
            onClick={handleWriteNFC}
            className="btn btn--small"
            style={{
              background: "#8b5cf6",
              color: "white",
              width: "100%",
              marginTop: "8px",
            }}
          >
            Link NFC 📡
          </button>
        </div>
      </div>

      <style>
        {`
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.75); display: flex; align-items: center; justify-content: center; z-index: 9999; backdrop-filter: blur(4px); animation: fadeIn 0.2s ease; }
        .modal-content { background: #111827; border: 2px solid #374151; width: 90%; max-width: 500px; border-radius: 16px; padding: 24px; position: relative; box-shadow: 0 20px 50px rgba(0,0,0,0.5); animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        .modal-close { position: absolute; top: 16px; right: 16px; background: none; border: none; color: #9ca3af; font-size: 24px; cursor: pointer; }
        .modal-header { display: flex; gap: 16px; align-items: center; margin-bottom: 24px; }
        .modal-icon { width: 80px; height: 80px; background: #1f2937; border-radius: 12px; display: flex; align-items: center; justify-content: center; border: 1px solid #374151; overflow: hidden; }
        .modal-title { margin: 0; color: #f3f4f6; font-size: 1.5rem; display: flex; align-items: center; gap: 8px; }
        .edit-icon { font-size: 14px; background: none; border: none; cursor: pointer; opacity: 0.5; transition: 0.2s; }
        .edit-icon:hover { opacity: 1; transform: scale(1.1); }
        .modal-species { color: #8fd081; margin: 4px 0 0 0; font-style: italic; }
        .modal-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; }
        .detail-box { background: #1f2937; padding: 12px; border-radius: 8px; border: 1px solid #374151; display: flex; flex-direction: column; }
        .detail-box label { font-size: 10px; color: #9ca3af; letter-spacing: 1px; margin-bottom: 4px; }
        .detail-box span { font-weight: 600; color: #e5e7eb; }
        .detail-box small { font-size: 11px; color: #6b7280; margin-top: 2px; }
        .modal-actions { display: flex; gap: 12px; }
        .btn--wide { flex: 1; justify-content: center; }
        .modal-input { background: #374151; border: 1px solid #4b5563; color: white; padding: 4px 8px; border-radius: 4px; font-family: inherit; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; }}
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; }}
        .modal-icon-wrapper { position: relative; width: 80px; height: 80px; }
        .camera-btn { position: absolute; bottom: -5px; right: -5px; background: #3b82f6; color: white; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; cursor: pointer; border: 2px solid #111827; font-size: 14px; }
        .edit-column { display: flex; flex-direction: column; gap: 8px; align-items: flex-start; }
        .water-bar-container { width: 100%; height: 10px; background: #111827; border-radius: 6px; overflow: hidden; border: 1px solid #374151; }
        .water-bar-fill { height: 100%; border-radius: 4px; transition: width 1s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.5s ease; }
        `}
      </style>
    </div>
  );
}

// --- SUB-COMPONENT: The Guest Landing View ---
function LandingView({ handleSearchSubmit }) {
  return (
    <>
      <section className="hero">
        <h2 className="hero__title">Grow. Track. Thrive.</h2>
        <p className="hero__text">
          Manage your garden with simple create, read, update, and delete tools.
        </p>
        <div className="hero__cta">
          <Link to="/login" className="btn btn--primary">
            Login to Start
          </Link>
          <Link to="/register" className="btn btn--secondary">
            Register
          </Link>
        </div>

        <form className="hero__search" onSubmit={handleSearchSubmit}>
          <div className="hero__search-row">
            <input
              type="text"
              name="query"
              className="hero__search-input"
              placeholder="SEARCH PLANTS..."
            />
            <select
              name="field"
              className="hero__search-select"
              defaultValue="none"
            >
              <option value="none">ANY FIELD</option>
              <option value="family">FAMILY</option>
              <option value="genus">GENUS NAME</option>
            </select>
            <button type="submit" className="btn btn--primary hero__search-btn">
              SEARCH
            </button>
          </div>
        </form>
      </section>
      <section className="features">
        <article className="card">
          <div className="card__icon card__icon--green" />
          <h3 className="card__title">Quick Entries</h3>
        </article>
        <article className="card">
          <div className="card__icon card__icon--blue" />
          <h3 className="card__title">Smart Views</h3>
        </article>
        <article className="card">
          <div className="card__icon card__icon--purple" />
          <h3 className="card__title">Safe Changes</h3>
        </article>
      </section>
    </>
  );
}

// --- SUB-COMPONENT: The Weather Detail Modal ---
function WeatherModal({ weather, onClose }) {
  if (!weather) return null;

  // Determine a quick "Garden Impact" tip based on conditions
  let impactTip = "Conditions are generally mild. Standard watering schedules apply.";
  if (weather.main.temp > 32) {
    impactTip = "It's very hot! Soil will dry out much faster today. Keep an eye on moisture levels.";
  } else if (weather.main.temp < 15) {
    impactTip = "Cooler temperatures today. Plants won't dry out as fast, so be careful not to overwater.";
  } else if (weather.main.humidity < 40) {
    impactTip = "Low humidity detected. Your tropical plants might appreciate a quick misting today.";
  } else if (weather.weather[0].main.includes("Rain")) {
    impactTip = "Rain is expected! Great for outdoor plants—hold off on watering them.";
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <div className="modal-header" style={{ marginBottom: "16px" }}>
          <div className="modal-icon-wrapper">
            <div className="modal-icon" style={{ fontSize: "40px" }}>
              {weather.weather[0].main.includes("Rain") ? "🌧️" 
               : weather.weather[0].main.includes("Cloud") ? "⛅" 
               : "☀️"}
            </div>
          </div>
          <div className="modal-title-box">
            <h2 className="modal-title">Local Weather</h2>
            <p className="modal-species" style={{ color: "#38bdf8" }}>{weather.name}</p>
          </div>
        </div>

        <div className="modal-grid">
          <div className="detail-box">
            <label>CONDITION</label>
            <strong style={{ textTransform: 'capitalize', color: '#f8fafc' }}>
              {weather.weather[0].description}
            </strong>
          </div>
          <div className="detail-box">
            <label>FEELS LIKE</label>
            <span>{Math.round(weather.main.feels_like)}°C</span>
          </div>
          <div className="detail-box">
            <label>HUMIDITY</label>
            <span>{weather.main.humidity}%</span>
          </div>
          <div className="detail-box">
            <label>WIND SPEED</label>
            <span>{weather.wind.speed} m/s</span>
          </div>
          
          <div className="detail-box" style={{ gridColumn: "1 / -1", borderLeft: "3px solid #38bdf8" }}>
            <label>GARDEN IMPACT</label>
            <span style={{ fontSize: "13px", color: "#e2e8f0", lineHeight: "1.5", marginTop: "6px", display: "block", fontWeight: "normal" }}>
              {impactTip}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- SUB-COMPONENT: The User's "My Garden" Dashboard ---
function GardenDashboard({ user }) {
  const [garden, setGarden] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [searchParams] = useSearchParams();
  const { weather, loading: weatherLoading } = useContext(WeatherContext);
  const [showWeatherModal, setShowWeatherModal] = useState(false);

  const [activeTab, setActiveTab] = useState("overview");
  const [actionLoading, setActionLoading] = useState(null);

  async function loadGarden() {
    try {
      const data = await GardenAPI.list();
      setGarden(data);
    } catch (err) {
      setError("Could not load your garden.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const openId = searchParams.get("open");
    if (garden.length > 0 && openId) {
      const targetPlant = garden.find((p) => p._id === openId);
      if (targetPlant) setSelectedPlant(targetPlant);
    }
  }, [garden, searchParams]);

  useEffect(() => {
    loadGarden();
  }, []);

  async function handleRemove(id, name) {
    try {
      await GardenAPI.remove(id);
      setGarden((prev) => prev.filter((item) => item._id !== id));
      setSelectedPlant(null);
    } catch (err) {
      alert("Failed to remove plant");
    }
  }

  // 🟢 NEW: Highly dynamic generic action handler
  async function handleAction(id, actionType) {
    try {
      await GardenAPI.logAction(id, actionType);
      const updatedList = await GardenAPI.list();
      setGarden(updatedList);
      if (selectedPlant && selectedPlant._id === id) {
        const updatedItem = updatedList.find((i) => i._id === id);
        setSelectedPlant(updatedItem);
      }
    } catch (err) {
      alert(`Failed to log action: ${actionType}`);
    }
  }

  // 🟢 Quick action wrapper for the dashboard to stop propagation
  async function handleQuickAction(e, id, actionType) {
    e.stopPropagation();
    setActionLoading(id);
    await handleAction(id, actionType);
    setActionLoading(null);
  }

  async function handleUpdate(id, payload) {
    try {
      await GardenAPI.update(id, payload);
      const updatedList = await GardenAPI.list();
      setGarden(updatedList);
      if (selectedPlant && selectedPlant._id === id) {
        const updatedItem = updatedList.find((i) => i._id === id);
        setSelectedPlant(updatedItem);
      }
    } catch (err) {
      alert("Failed to update plant");
    }
  }

  let totalAlerts = 0;
  let attentionPlants = [];

  const processedGarden = garden.map((item) => {
    const plantInfo = item.plant_id || {};
    const cleanPlantInfo = {
      ...plantInfo,
      ecological_descriptors: {
        ...plantInfo.ecological_descriptors,
        temperature_range:
          plantInfo.ecological_descriptors?.temperature_range?.toString(),
      },
    };
    const healthReport = analyzePlantHealth(cleanPlantInfo, weather, item);

    if (healthReport.alerts && healthReport.alerts.length > 0) {
      totalAlerts += healthReport.alerts.length;
      if (
        healthReport.health === "THIRSTY" ||
        healthReport.health === "TOO HOT!" ||
        healthReport.health === "TOO COLD!" ||
        healthReport.next_actions?.water_in === "Now"
      ) {
        attentionPlants.push({ ...item, healthReport, cleanPlantInfo });
      }
    }
    return { ...item, healthReport, cleanPlantInfo };
  });

  return (
    <div className="dashboard-container">
      {/* 🟢 Render Weather Modal */}
      {showWeatherModal && weather && (
        <WeatherModal 
          weather={weather} 
          onClose={() => setShowWeatherModal(false)} 
        />
      )}

      {/* 🟢 Render Plant Detail Modal */}
      {selectedPlant && (
        <PlantModal
          plant={selectedPlant}
          weather={weather}
          onClose={() => setSelectedPlant(null)}
          onUpdate={handleUpdate}
          onAction={handleAction}
          onRemove={handleRemove}
        />
      )}

      <div
        className="dashboard-header"
        style={{ borderBottom: "none", paddingBottom: 0, marginBottom: "24px" }}
      >
        <h2
          className="hero__title"
          style={{
            fontSize: "2rem",
            marginBottom: "8px",
            textTransform: "none",
          }}
        >
          Welcome back, {user.email.split("@")[0]} 👋
        </h2>
        <p
          className="hero__text"
          style={{ maxWidth: "600px", margin: "0 0 24px 0", color: "#94a3b8" }}
        >
          Here is what is happening in your garden today.
        </p>
      </div>

      <div className="dashboard-bento">
        <div className="bento-stat bento-stat--green">
          <span className="bento-icon">🌱</span>
          <div className="bento-info">
            <strong>{garden.length}</strong>
            <span>Total Plants</span>
          </div>
        </div>

        <div className="bento-stat bento-stat--blue" 
          onClick={() => setShowWeatherModal(true)}
          style={{ cursor: "pointer" }}>
          <span className="bento-icon">🌤️</span>
          <div className="bento-info">
            <strong>
              {weatherLoading || !weather
                ? "--"
                : `${Math.round(weather.main.temp)}°C`}
            </strong>
            <span>{weather ? weather.weather[0].main : "Weather"}</span>
          </div>
        </div>

        <div
          className={`bento-stat ${totalAlerts > 0 ? "bento-stat--orange" : "bento-stat--perfect"}`}
        >
          <span className="bento-icon">{totalAlerts > 0 ? "⚠️" : "✅"}</span>
          <div className="bento-info">
            <strong style={{ color: totalAlerts > 0 ? "#fbbf24" : "#34d399" }}>
              {totalAlerts > 0 ? `${totalAlerts} Alerts` : "All Good"}
            </strong>
            <span>Garden Status</span>
          </div>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button
          className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          Needs Attention{" "}
          {attentionPlants.length > 0 && (
            <span className="tab-badge">{attentionPlants.length}</span>
          )}
        </button>
        <button
          className={`tab-btn ${activeTab === "plants" ? "active" : ""}`}
          onClick={() => setActiveTab("plants")}
        >
          All My Plants
        </button>
      </div>

      {loading && <p className="loading">Loading your garden...</p>}
      {error && <p className="error">{error}</p>}

      {/* OVERVIEW TAB */}
      {!loading && !error && activeTab === "overview" && (
        <section className="tab-content">
          {attentionPlants.length === 0 ? (
            <div className="empty-state">
              <span style={{ fontSize: "40px" }}>✨</span>
              <p
                style={{
                  marginTop: "16px",
                  fontSize: "14px",
                  color: "var(--pure-white)",
                }}
              >
                Your garden is thriving!
              </p>
              <p style={{ textTransform: "none" }}>
                No plants need immediate action right now.
              </p>
            </div>
          ) : (
            <div className="urgent-list">
              <h3
                className="urgent-title"
                style={{
                  color: "var(--pure-white)",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "16px",
                  marginBottom: "16px",
                }}
              >
                ⚡ Quick Actions Required
              </h3>
              <div className="garden-grid">
                {attentionPlants.map((item) => (
                  <div
                    key={item._id}
                    className="quick-action-card"
                    onClick={() => setSelectedPlant(item)}
                  >
                    <div className="quick-info">
                      <h4>
                        {item.nickname || item.cleanPlantInfo.common_name?.[0]}
                      </h4>
                      <span
                        className="last-watered"
                        style={{
                          color:
                            item.healthReport.health === "TOO HOT!"
                              ? "#ef4444"
                              : "#94a3b8",
                        }}
                      >
                        {item.healthReport.health}
                      </span>
                    </div>

                    {/* 🟢 FIXED: DYNAMIC MODAL ACTIONS */}
                    <div className="modal-actions" style={{ flexWrap: "wrap" }}>
                      {/* 1. Show Water if thirsty */}
                      {(healthReport.health === "THIRSTY" ||
                        healthReport.next_actions?.water_in === "Now") && (
                        <button
                          onClick={() => onAction(plant._id, "water")}
                          className="btn btn--blue btn--wide"
                        >
                          Water 💧
                        </button>
                      )}

                      {/* 2. Show Heat actions */}
                      {healthReport.health === "TOO HOT!" && (
                        <>
                          <button
                            onClick={() => onAction(plant._id, "mist")}
                            className="btn btn--blue btn--wide"
                          >
                            Mist 🌬️
                          </button>
                          <button
                            onClick={() => onAction(plant._id, "move_shade")}
                            className="btn btn--wide"
                            style={{
                              background: "#fbbf24",
                              color: "#0f172a",
                              border: "none",
                            }}
                          >
                            To Shade ⛅
                          </button>
                        </>
                      )}

                      {/* 3. Show Cold actions */}
                      {healthReport.health === "TOO COLD!" && (
                        <button
                          onClick={() => onAction(plant._id, "move_inside")}
                          className="btn btn--wide"
                          style={{
                            background: "#ef4444",
                            color: "#fff",
                            border: "none",
                          }}
                        >
                          Move Inside 🏠
                        </button>
                      )}

                      {/* 4. If it's perfectly OPTIMAL, still give them the option to water just in case */}
                      {healthReport.health === "OPTIMAL" &&
                        healthReport.next_actions?.water_in !== "Now" && (
                          <button
                            onClick={() => onAction(plant._id, "water")}
                            className="btn btn--blue btn--wide"
                          >
                            Water 💧
                          </button>
                        )}

                      {/* Danger & Tech actions stay at the bottom */}
                      <div
                        style={{
                          width: "100%",
                          display: "flex",
                          gap: "12px",
                          marginTop: "8px",
                        }}
                      >
                        <button
                          onClick={() => {
                            if (window.confirm("Delete this plant?"))
                              onRemove(plant._id, plant.nickname);
                          }}
                          className="btn btn--danger btn--wide"
                        >
                          Remove 🗑️
                        </button>
                        <button
                          onClick={handleWriteNFC}
                          className="btn btn--wide"
                          style={{
                            background: "#8b5cf6",
                            color: "white",
                            border: "none",
                          }}
                        >
                          Link NFC 📡
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* ALL PLANTS TAB */}
      {!loading && !error && activeTab === "plants" && (
        <section className="tab-content">
          {garden.length === 0 ? (
            <div className="empty-state">
              <p>Your garden is currently empty.</p>
              <Link
                to="/plants"
                className="btn btn--primary"
                style={{ marginTop: "12px" }}
              >
                + Add New Plant
              </Link>
            </div>
          ) : (
            <div className="garden-grid">
              {processedGarden.map((item) => {
                const { cleanPlantInfo, healthReport } = item;
                const commonName = cleanPlantInfo.common_name
                  ? Array.isArray(cleanPlantInfo.common_name)
                    ? cleanPlantInfo.common_name[0]
                    : cleanPlantInfo.common_name
                  : "Unknown Plant";

                let statusColor = "var(--leaf-green)";
                if (healthReport.health === "THIRSTY")
                  statusColor = "var(--weather-blue)";
                if (healthReport.health === "NEEDS ATTENTION")
                  statusColor = "#fbbf24";
                if (
                  healthReport.health === "TOO HOT!" ||
                  healthReport.health === "TOO COLD!"
                )
                  statusColor = "#ef4444";

                return (
                  <div
                    key={item._id}
                    className="garden-card"
                    style={{ borderColor: statusColor, cursor: "pointer" }}
                    onClick={() => setSelectedPlant(item)}
                  >
                    <div className="garden-card__header">
                      <h3>{item.nickname}</h3>
                      <span className="species">{commonName}</span>
                    </div>
                    <div
                      className="garden-card__stats"
                      style={{ borderColor: statusColor }}
                    >
                      <div className="stat">
                        <small>STATUS:</small>
                        <strong style={{ color: statusColor }}>
                          {healthReport.health}
                        </strong>
                      </div>
                    </div>
                    {healthReport.alerts?.length > 0 && (
                      <ul className="card-alerts-list">
                        {healthReport.alerts?.map((alert, idx) => (
                          <li key={idx}>▸ {alert}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

// --- MAIN COMPONENT ---
export default function Home() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  function handleSearchSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const query = (formData.get("query") || "").toString().trim();
    const field = (formData.get("field") || "none").toString();
    const params = new URLSearchParams();
    if (query) params.set("search", query);
    if (field && field !== "none") params.set("field", field);
    const searchString = params.toString();
    navigate(searchString ? `/plants?${searchString}` : "/plants");
  }

  return (
    <main className="home">
      <span className="bubble bubble--green" />
      <span className="bubble bubble--blue" />
      <span className="bubble bubble--purple" />
      <header className="home__header">
        <div className="brand">
          <div className="brand__dot" />
          <h1 className="brand__name">Meet-Ur Garden</h1>
        </div>
        <nav style={{ display: "flex", gap: "10px" }}>
          <Link to="/plants" className="btn btn--ghost">
            All Plants
          </Link>
          <Link
            to="/scan"
            className="btn btn--primary"
            style={{ background: "#8b5cf6", borderColor: "#8b5cf6" }}
          >
            Scan Tag
          </Link>
          {user && (
            <Link to="/logout" className="btn btn--ghost">
              Logout
            </Link>
          )}
        </nav>
      </header>
      {user ? (
        <GardenDashboard user={user} />
      ) : (
        <LandingView handleSearchSubmit={handleSearchSubmit} />
      )}
      <footer className="home__footer">
        <small>© {new Date().getFullYear()} Meet-Ur Garden</small>
      </footer>
    </main>
  );
}
