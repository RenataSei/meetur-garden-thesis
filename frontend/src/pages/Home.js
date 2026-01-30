import { useEffect, useState, useContext } from "react";
import { analyzePlantHealth } from "../utils/careEngine";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { WeatherContext } from "../contexts/WeatherContext";
import { GardenAPI } from "../api";
import "./Home.css";

// --- HELPER: FORMAT DATE ---
function formatLastWatered(dateString) {
  if (!dateString) return "Never watered";
  const date = new Date(dateString);
  return date.toLocaleString('en-US', { 
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' 
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

// --- SUB-COMPONENT: The Plant Detail Modal ---
function PlantModal({ plant, weather, onClose, onUpdate, onWater, onRemove }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newNick, setNewNick] = useState(plant.nickname);

  const [newImage, setNewImage] = useState(""); 
  const [uploading, setUploading] = useState(false);

  // Analyze health again for the modal details
  const plantInfo = plant.plant_id || {};
  const healthReport = analyzePlantHealth(plantInfo, weather, plant);

  // Determine which image to show:
  const displayImage = newImage || plant.custom_image || plantInfo.image_url || null;

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
        <button className="modal-close" onClick={onClose}>✕</button>
        
        {/* HEADER */}
        <div className="modal-header">
           <div className="modal-icon-wrapper">
             <div className="modal-icon">
               {displayImage ? (
                 <img src={displayImage} alt="Plant" style={{width:'100%', height:'100%', objectFit:'cover'}} />
               ) : (
                 <span style={{fontSize:'40px'}}>🌿</span>
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
                 <button onClick={handleSave} className="btn btn--small btn--green">Save Changes</button>
               </div>
             ) : (
               <h2 className="modal-title">
                 {plant.nickname} 
                 <button className="edit-icon" onClick={() => setIsEditing(true)}>✏️</button>
               </h2>
             )}
             <p className="modal-species">{plantInfo.common_name?.[0] || "Unknown Species"}</p>
           </div>
        </div>

        {/* DETAILS GRID */}
        <div className="modal-grid">
           <div className="detail-box">
             <label>HEALTH STATUS</label>
             <strong style={{color: healthReport.health === "OPTIMAL" ? '#8fd081' : '#ef4444'}}>
               {healthReport.health}
             </strong>
           </div>
           <div className="detail-box">
             <label>LAST WATERED</label>
             <span>{formatLastWatered(plant.last_watered)}</span>
           </div>
           <div className="detail-box">
              <label>CURRENT WEATHER</label>
              <span>{weather ? `${Math.round(weather.main.temp)}°C` : '--'}</span>
           </div>
           <div className="detail-box">
              <label>IDEAL CONDITIONS</label>
              <small>Temp: {plantInfo.ecological_descriptors?.temperature_range || 'N/A'}</small>
           </div>
        </div>

        <div className="modal-actions">
           <button onClick={() => onWater(plant._id)} className="btn btn--blue btn--wide">Water Plant 💧</button>
           <button onClick={() => { if(window.confirm('Delete this plant?')) onRemove(plant._id, plant.nickname); }} className="btn btn--danger btn--wide">Remove 🗑️</button>
        </div>
      </div>

      <style>{`
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
      `}</style>
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
          <Link to="/login" className="btn btn--primary">Login to Start</Link>
          <Link to="/register" className="btn btn--secondary">Register</Link>
        </div>

        <form className="hero__search" onSubmit={handleSearchSubmit}>
          <div className="hero__search-row">
            <input type="text" name="query" className="hero__search-input" placeholder="SEARCH PLANTS..." />
            <select name="field" className="hero__search-select" defaultValue="none">
              <option value="none">ANY FIELD</option>
              <option value="family">FAMILY</option>
              <option value="genus">GENUS NAME</option>
            </select>
            <button type="submit" className="btn btn--primary hero__search-btn">SEARCH</button>
          </div>
        </form>
      </section>
      <section className="features">
        <article className="card"><div className="card__icon card__icon--green" /><h3 className="card__title">Quick Entries</h3></article>
        <article className="card"><div className="card__icon card__icon--blue" /><h3 className="card__title">Smart Views</h3></article>
        <article className="card"><div className="card__icon card__icon--purple" /><h3 className="card__title">Safe Changes</h3></article>
      </section>
    </>
  );
}

// --- SUB-COMPONENT: The User's "My Garden" Dashboard ---
function GardenDashboard({ user }) {
  const [garden, setGarden] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlant, setSelectedPlant] = useState(null); // <--- NEW STATE FOR MODAL

  const { weather, loading: weatherLoading } = useContext(WeatherContext);
  
  async function loadGarden() {
    try {
      const data = await GardenAPI.list();
      setGarden(data);
    } catch (err) { setError("Could not load your garden."); } finally { setLoading(false); }
  }

  useEffect(() => { loadGarden(); }, []);

  // Updated Remove: Closes modal if open
  async function handleRemove(id, name) {
    // Confirmation handled inside button usually, but safe double check
    try {
      await GardenAPI.remove(id);
      setGarden((prev) => prev.filter((item) => item._id !== id));
      setSelectedPlant(null); // Close modal
    } catch (err) { alert("Failed to remove plant"); }
  }

  // Updated Water: Refreshes data
  async function handleWater(id) {
    try {
      await GardenAPI.logAction(id, "water");
      const updatedList = await GardenAPI.list(); // Re-fetch to get new date
      setGarden(updatedList);
      
      // Update the modal data if it's open
      if (selectedPlant && selectedPlant._id === id) {
         const updatedItem = updatedList.find(i => i._id === id);
         setSelectedPlant(updatedItem);
      }
    } catch (err) { alert("Failed to log watering"); }
  }

  // NEW: Update Nickname
  async function handleUpdate(id, payload) {
    try {
      await GardenAPI.update(id, payload);
      const updatedList = await GardenAPI.list();
      setGarden(updatedList);
      
      // Update local modal state immediately
      if (selectedPlant && selectedPlant._id === id) {
        const updatedItem = updatedList.find(i => i._id === id);
        setSelectedPlant(updatedItem);
      }
    } catch (err) { alert("Failed to update plant"); }
  }

  return (
    <div className="dashboard-container">
      {/* --- RENDER THE MODAL IF A PLANT IS SELECTED --- */}
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

      <div className="dashboard-header">
        <h2 className="hero__title" style={{ fontSize: "2rem", marginBottom: "10px" }}>My Garden 🌿</h2>
        <p className="hero__text" style={{ maxWidth: "600px", margin: "0 auto 30px", textAlign: "center" }}>
          Welcome back, {user.email.split("@")[0]}! Tap a plant to see details.
        </p>

        {/* WEATHER WIDGET */}
        <div style={{
            background: "var(--bg-deep)", border: "3px solid var(--weather-blue)",
            padding: "10px 15px", display: "inline-flex", alignItems: "center", gap: "15px",
            boxShadow: "4px 4px 0 rgba(0,0,0,0.5)", marginBottom: "20px",
          }}>
          {weatherLoading || !weather ? (
            <span style={{ fontSize: "10px", color: "#cbd5e1" }}>LOADING WEATHER...</span>
          ) : (
            <>
              <span style={{ fontSize: "24px" }}>{weather.weather[0].main.includes("Rain") ? "🌧️" : "☀️"}</span>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: "12px", color: "var(--weather-blue)" }}>{weather.name}</div>
                <div style={{ fontSize: "10px", color: "#cbd5e1", marginTop: "4px" }}>
                  Temp: {Math.round(weather.main.temp)}°C | Hum: {weather.main.humidity}%
                </div>
              </div>
            </>
          )}
        </div>
        <br />
        <Link to="/plants" className="btn btn--primary">+ Add New Plant</Link>
      </div>

      {loading && <p className="loading">Loading your garden...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && garden.length === 0 && (
        <div className="empty-state"><p>Your garden is currently empty.</p></div>
      )}

      {!loading && !error && garden.length > 0 && (
       <div className="garden-grid">
         {garden.map((item) => {
           const plantInfo = item.plant_id || {}; 
           const commonName = plantInfo.common_name 
             ? (Array.isArray(plantInfo.common_name) ? plantInfo.common_name[0] : plantInfo.common_name) 
             : "Unknown Plant";

           const healthReport = analyzePlantHealth(plantInfo, weather, item);
           let statusColor = "var(--leaf-green)"; 
           if (healthReport.health === "THIRSTY") statusColor = "var(--weather-blue)"; 
           if (healthReport.health === "NEEDS ATTENTION") statusColor = "#fbbf24"; 
           if (healthReport.health === "TOO HOT!" || healthReport.health === "TOO COLD!") statusColor = "#ef4444"; 

           return (
             <div 
               key={item._id} 
               className="garden-card" 
               style={{ borderColor: statusColor, cursor: 'pointer' }}
               onClick={() => setSelectedPlant(item)} // <--- CLICK TO OPEN MODAL
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

               {healthReport.alerts.length > 0 && (
                 <ul style={{ 
                   listStyle: 'none', padding: '8px', margin: 0, 
                   background: 'rgba(0,0,0,0.5)', border: '1px solid #334155',
                   fontSize: '8px', color: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '4px'
                 }}>
                   {healthReport.alerts.map((alert, idx) => <li key={idx}>▸ {alert}</li>)}
                 </ul>
               )}

               <div className="garden-card__actions">
                 {/* Prevent bubbling so clicking WATER doesn't open the modal */}
                 <button 
                   onClick={(e) => { e.stopPropagation(); handleWater(item._id); }} 
                   className="btn btn--small btn--blue"
                 >
                   WATER 💧
                 </button>
                 <button 
                   onClick={(e) => { e.stopPropagation(); handleRemove(item._id, item.nickname); }} 
                   className="btn btn--small btn--danger"
                 >
                   REMOVE
                 </button>
               </div>
             </div>
           );
         })}
       </div>
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
        <div className="brand"><div className="brand__dot" /><h1 className="brand__name">Meet-Ur Garden</h1></div>
        <nav style={{ display: "flex", gap: "10px" }}>
          <Link to="/plants" className="btn btn--ghost">All Plants</Link>
          {user && <Link to="/logout" className="btn btn--ghost">Logout</Link>}
        </nav>
      </header>
      {user ? <GardenDashboard user={user} /> : <LandingView handleSearchSubmit={handleSearchSubmit} />}
      <footer className="home__footer"><small>© {new Date().getFullYear()} Meet-Ur Garden</small></footer>
    </main>
  );
}