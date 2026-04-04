import { useEffect, useState, useContext } from "react";
import { analyzePlantHealth } from "../utils/careEngine";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { WeatherContext } from "../contexts/WeatherContext";

import { GardenAPI } from "../api";
import { useSearchParams } from "react-router-dom";
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
    fileReader.onload = () => {
      resolve(fileReader.result);
    };
    fileReader.onerror = (error) => {
      reject(error);
    };
  });
};
// --- HELPER: FORMAT TEMPERATURE ---
function formatTemp(tempStr) {
  if (!tempStr) return "N/A";
  // Find the numbers in the string, even if they have decimals
  const nums = tempStr.match(/\d+(\.\d+)?/g);
  if (nums && nums.length >= 2) {
    // Round them to whole numbers for a cleaner UI
    return `${Math.round(Number(nums[0]))}°C - ${Math.round(Number(nums[1]))}°C`;
  }
  return tempStr; // Fallback just in case
}

// --- SUB-COMPONENT: The Plant Detail Modal ---
function PlantModal({ plant, weather, onClose, onUpdate, onWater, onRemove }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newNick, setNewNick] = useState(plant.nickname);

  const [newImage, setNewImage] = useState("");
  const [uploading, setUploading] = useState(false);

  // Analyze health again for the modal details
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

  // Determine which image to show:
  const displayImage =
    newImage || plant.custom_image || plantInfo.image_url || null;

  // --- 🟢 ADDED: THE MISSING handleSave FUNCTION ---
  async function handleSave() {
    const payload = {};

    // Only add fields if they exist/changed
    if (newNick && newNick.trim()) {
      payload.nickname = newNick;
    }
    if (newImage) {
      payload.custom_image = newImage;
    }

    // Call the update function passed from parent
    await onUpdate(plant._id, payload);

    // Close edit mode
    setIsEditing(false);
  }
  // ------------------------------------------------

  async function handleWriteNFC() {
    if (!("NDEFReader" in window)) {
      alert("NFC not supported on this device.");
      return;
    }

    try {
      const ndef = new window.NDEFReader();
      await ndef.write(plant._id); // Writes the Plant ID to the tag
      alert(`✅ Success! This tag is now linked to ${plant.nickname}`);
    } catch (error) {
      alert("Write failed: " + error.message);
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check size (Limit to roughly 500kb to save DB space)
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

            {/* CAMERA BUTTON (Only shows when editing) */}
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
          {/* --- 🟢 NEW: HYDRATION BAR --- */}
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
                {healthReport.next_actions.water_in === "Now"
                  ? "Needs Water"
                  : `Due in ${healthReport.next_actions.water_in}`}
              </span>
            </div>
            <div className="water-bar-container">
              <div
                className="water-bar-fill"
                style={{
                  width: `${healthReport.hydration_percent}%`,
                  backgroundColor:
                    healthReport.hydration_percent > 40
                      ? "#3b82f6" // Deep Water Blue
                      : healthReport.hydration_percent > 15
                        ? "#fbbf24" // Warning Yellow
                        : "#ef4444", // Critical Red
                }}
              />
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button
            onClick={() => onWater(plant._id)}
            className="btn btn--blue btn--wide"
          >
            Water Plant 💧
          </button>
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
            style={{ background: "#8b5cf6", color: "white" }} // Purple for "Tech"
          >
            Link NFC 📡
          </button>
        </div>
      </div>

      <style>
        {`
        .modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.75);
          display: flex; align-items: center; justify-content: center; z-index: 9999;
          backdrop-filter: blur(4px); animation: fadeIn 0.2s ease;
        }
        .modal-content {
          background: #111827; border: 2px solid #374151; width: 90%; max-width: 500px;
          border-radius: 16px; padding: 24px; position: relative;
          box-shadow: 0 20px 50px rgba(0,0,0,0.5); animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .modal-close {
          position: absolute; top: 16px; right: 16px; background: none; border: none;
          color: #9ca3af; font-size: 24px; cursor: pointer;
        }
        .modal-header { display: flex; gap: 16px; align-items: center; margin-bottom: 24px; }
        .modal-icon {
          width: 80px; height: 80px; background: #1f2937; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          border: 1px solid #374151; overflow: hidden;
        }
        .modal-title { margin: 0; color: #f3f4f6; font-size: 1.5rem; display: flex; align-items: center; gap: 8px; }
        .edit-icon { font-size: 14px; background: none; border: none; cursor: pointer; opacity: 0.5; transition: 0.2s; }
        .edit-icon:hover { opacity: 1; transform: scale(1.1); }
        .modal-species { color: #8fd081; margin: 4px 0 0 0; font-style: italic; }
        
        .modal-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; }
        .detail-box { 
          background: #1f2937; padding: 12px; border-radius: 8px; border: 1px solid #374151;
          display: flex; flex-direction: column; 
        }
        .detail-box label { font-size: 10px; color: #9ca3af; letter-spacing: 1px; margin-bottom: 4px; }
        .detail-box span { font-weight: 600; color: #e5e7eb; }
        .detail-box small { font-size: 11px; color: #6b7280; margin-top: 2px; }

        .modal-alerts { 
          background: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; 
          padding: 12px; border-radius: 8px; margin-bottom: 24px; 
        }
        .modal-alerts h4 { color: #ef4444; margin: 0 0 8px 0; font-size: 12px; }
        .modal-alerts ul { padding-left: 16px; margin: 0; color: #fca5a5; font-size: 13px; }

        .modal-actions { display: flex; gap: 12px; }
        .btn--wide { flex: 1; justify-content: center; }
        .edit-row { display: flex; gap: 8px; }
        .modal-input {
          background: #374151; border: 1px solid #4b5563; color: white;
          padding: 4px 8px; border-radius: 4px; font-family: inherit;
        }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; }}
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; }}
      
        /* NEW STYLES FOR CAMERA */
        .modal-icon-wrapper { position: relative; width: 80px; height: 80px; }
        .modal-icon {
          width: 100%; height: 100%; background: #1f2937; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          border: 1px solid #374151; overflow: hidden;
        }
        .camera-btn {
          position: absolute; bottom: -5px; right: -5px;
          background: #3b82f6; color: white; border-radius: 50%;
          width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;
          cursor: pointer; border: 2px solid #111827; font-size: 14px;
        }
        .camera-btn:hover { transform: scale(1.1); }
        .edit-column { display: flex; flex-direction: column; gap: 8px; align-items: flex-start; }
        .water-bar-container {
          width: 100%; 
          height: 10px; 
          background: #111827; /* Deepest background color */
          border-radius: 6px; 
          overflow: hidden;
          border: 1px solid #374151;
        }
        .water-bar-fill {
          height: 100%; 
          border-radius: 4px; 
          transition: width 1s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.5s ease;
        }
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

// --- SUB-COMPONENT: The User's "My Garden" Dashboard ---
// --- SUB-COMPONENT: The User's "My Garden" Dashboard ---
function GardenDashboard({ user }) {
  const [garden, setGarden] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlant, setSelectedPlant] = useState(null); 
  const [searchParams] = useSearchParams(); 
  const { weather, loading: weatherLoading } = useContext(WeatherContext);

  // 🟢 NEW: Dashboard States
  const [activeTab, setActiveTab] = useState("overview"); // 'overview' | 'plants'
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

  async function handleWater(id) {
    try {
      await GardenAPI.logAction(id, "water");
      const updatedList = await GardenAPI.list(); 
      setGarden(updatedList);
      if (selectedPlant && selectedPlant._id === id) {
        const updatedItem = updatedList.find((i) => i._id === id);
        setSelectedPlant(updatedItem);
      }
    } catch (err) {
      alert("Failed to log watering");
    }
  }

  // 🟢 NEW: Quick Water wrapper for the dashboard buttons
  async function handleQuickWater(e, id) {
    e.stopPropagation();
    setActionLoading(id);
    await handleWater(id);
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

  // 🟢 NEW: Process Data for Bento Boxes & Alerts
  let totalAlerts = 0;
  let thirstyPlants = [];
  
  const processedGarden = garden.map(item => {
    const plantInfo = item.plant_id || {};
    const cleanPlantInfo = {
      ...plantInfo,
      ecological_descriptors: {
        ...plantInfo.ecological_descriptors,
        temperature_range: plantInfo.ecological_descriptors?.temperature_range?.toString(),
      },
    };
    const healthReport = analyzePlantHealth(cleanPlantInfo, weather, item);
    
    if (healthReport.alerts && healthReport.alerts.length > 0) {
      totalAlerts += healthReport.alerts.length;
      if (healthReport.health === "THIRSTY" || healthReport.next_actions?.water_in === "Now") {
        thirstyPlants.push({ ...item, healthReport, cleanPlantInfo });
      }
    }
    return { ...item, healthReport, cleanPlantInfo };
  });

  return (
    <div className="dashboard-container">
      {/* --- RENDER THE MODAL --- */}
      {selectedPlant && (
        <PlantModal
          plant={selectedPlant}
          weather={weather}
          onClose={() => setSelectedPlant(null)}
          onUpdate={handleUpdate}
          onWater={handleWater}
          onRemove={handleRemove}
        />
      )}

      <div className="dashboard-header" style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: '24px' }}>
        <h2 className="hero__title" style={{ fontSize: "2rem", marginBottom: "8px", textTransform: 'none' }}>
          Welcome back, {user.email.split("@")[0]} 👋
        </h2>
        <p className="hero__text" style={{ maxWidth: "600px", margin: "0 0 24px 0", color: "#94a3b8" }}>
          Here is what is happening in your garden today.
        </p>
      </div>

      {/* --- 🟢 BENTO BOX STATS --- */}
      <div className="dashboard-bento">
        <div className="bento-stat bento-stat--green">
          <span className="bento-icon">🌱</span>
          <div className="bento-info">
            <strong>{garden.length}</strong>
            <span>Total Plants</span>
          </div>
        </div>
        
        <div className="bento-stat bento-stat--blue">
          <span className="bento-icon">🌤️</span>
          <div className="bento-info">
            <strong>{weatherLoading || !weather ? "--" : `${Math.round(weather.main.temp)}°C`}</strong>
            <span>{weather ? weather.weather[0].main : "Weather"}</span>
          </div>
        </div>

        <div className={`bento-stat ${totalAlerts > 0 ? 'bento-stat--orange' : 'bento-stat--perfect'}`}>
          <span className="bento-icon">{totalAlerts > 0 ? '⚠️' : '✅'}</span>
          <div className="bento-info">
            <strong style={{ color: totalAlerts > 0 ? '#fbbf24' : '#34d399' }}>
              {totalAlerts > 0 ? `${totalAlerts} Alerts` : 'All Good'}
            </strong>
            <span>Garden Status</span>
          </div>
        </div>
      </div>

      {/* --- 🟢 TABBED NAVIGATION --- */}
      <div className="dashboard-tabs">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Needs Attention {thirstyPlants.length > 0 && <span className="tab-badge">{thirstyPlants.length}</span>}
        </button>
        <button 
          className={`tab-btn ${activeTab === 'plants' ? 'active' : ''}`}
          onClick={() => setActiveTab('plants')}
        >
          All My Plants
        </button>
      </div>

      {loading && <p className="loading">Loading your garden...</p>}
      {error && <p className="error">{error}</p>}

      {/* --- 🟢 TAB CONTENT: OVERVIEW (Urgent Actions) --- */}
      {!loading && !error && activeTab === "overview" && (
        <section className="tab-content">
          {thirstyPlants.length === 0 ? (
            <div className="empty-state">
              <span style={{fontSize: "40px"}}>✨</span>
              <p style={{ marginTop: '16px', fontSize: '14px', color: 'var(--pure-white)' }}>Your garden is thriving!</p>
              <p style={{ textTransform: 'none' }}>No plants need immediate watering or attention right now.</p>
            </div>
          ) : (
            <div className="urgent-list">
              <h3 className="urgent-title" style={{ color: 'var(--pure-white)', fontFamily: "'Inter', sans-serif", fontSize: '16px', marginBottom: '16px' }}>
                💧 Quick Actions Required
              </h3>
              <div className="garden-grid">
                {thirstyPlants.map(item => (
                  <div key={item._id} className="quick-action-card" onClick={() => setSelectedPlant(item)}>
                    <div className="quick-info">
                      <h4>{item.nickname || item.cleanPlantInfo.common_name?.[0]}</h4>
                      <span className="last-watered">Last: {formatLastWatered(item.last_watered)}</span>
                    </div>
                    <button 
                      className="btn btn--small btn--blue" 
                      onClick={(e) => handleQuickWater(e, item._id)}
                      disabled={actionLoading === item._id}
                      style={{ height: 'fit-content', alignSelf: 'center' }}
                    >
                      {actionLoading === item._id ? "..." : "WATER NOW"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* --- 🟢 TAB CONTENT: ALL PLANTS (Your original grid) --- */}
      {!loading && !error && activeTab === "plants" && (
        <section className="tab-content">
           {garden.length === 0 ? (
             <div className="empty-state">
               <p>Your garden is currently empty.</p>
               <Link to="/plants" className="btn btn--primary" style={{marginTop: "12px"}}>+ Add New Plant</Link>
             </div>
           ) : (
             <div className="garden-grid">
               {processedGarden.map(item => {
                 const { cleanPlantInfo, healthReport } = item;
                 const commonName = cleanPlantInfo.common_name
                   ? Array.isArray(cleanPlantInfo.common_name) ? cleanPlantInfo.common_name[0] : cleanPlantInfo.common_name
                   : "Unknown Plant";

                 let statusColor = "var(--leaf-green)";
                 if (healthReport.health === "THIRSTY") statusColor = "var(--weather-blue)";
                 if (healthReport.health === "NEEDS ATTENTION") statusColor = "#fbbf24";
                 if (healthReport.health === "TOO HOT!" || healthReport.health === "TOO COLD!") statusColor = "#ef4444";

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
                     <div className="garden-card__stats" style={{ borderColor: statusColor }}>
                       <div className="stat">
                         <small>STATUS:</small>
                         <strong style={{ color: statusColor }}>{healthReport.health}</strong>
                       </div>
                     </div>
                     {healthReport.alerts?.length > 0 && (
                       <ul className="card-alerts-list">
                         {healthReport.alerts?.map((alert, idx) => (<li key={idx}>▸ {alert}</li>))}
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
