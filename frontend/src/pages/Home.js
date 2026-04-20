// "Post-Defense" update. Version 1.1 of meeturgarden system 

import { useEffect, useState, useContext } from "react";
import { analyzePlantHealth } from "../utils/careEngine";
import { Link, useSearchParams } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { WeatherContext } from "../contexts/WeatherContext";
import { GardenAPI } from "../api";
import "./Home.css";

// Banner imports
import banner1 from "../assets/Banner1.jpg";
import banner2 from "../assets/Banner2.jpg";
import banner3 from "../assets/Banner3.jpg";
import banner4 from "../assets/Banner4.jpg";

// Product imports
import product1 from "../assets/Product1.jpg";
import product2 from "../assets/Product2.jpg";
import product3 from "../assets/Product3.jpg";
import product4 from "../assets/Product4.jpg";

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
  
  // 🟢 NEW: State for the dynamic engine inputs
  const [newPlacement, setNewPlacement] = useState(plant.placement || "Indoor");
  const [newPotType, setNewPotType] = useState(plant.potType || "Plastic/Ceramic");
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
    // 🟢 NEW: Save placement and pot type
    if (newPlacement) payload.placement = newPlacement;
    if (newPotType) payload.potType = newPotType;

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
    if (file.size > 5 * 1024 * 1024) {
      alert("Please choose an image smaller than 5MB");
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

          <div className="modal-title-box" style={{ flex: 1 }}>
            {isEditing ? (
              <div className="edit-column" style={{ width: "100%" }}>
                <input
                  type="text"
                  value={newNick}
                  onChange={(e) => setNewNick(e.target.value)}
                  className="modal-input"
                  placeholder="Nickname..."
                  style={{ width: "100%", boxSizing: "border-box" }}
                />
                
                {/* 🟢 NEW: Edit Environment Options */}
                <select 
                  className="modal-input" 
                  value={newPlacement} 
                  onChange={(e) => setNewPlacement(e.target.value)}
                  style={{ width: "100%", boxSizing: "border-box", appearance: "auto" }}
                >
                  <option value="Indoor">🏠 Indoor Plant</option>
                  <option value="Outdoor">🌤️ Outdoor Plant</option>
                </select>

                <select 
                  className="modal-input" 
                  value={newPotType} 
                  onChange={(e) => setNewPotType(e.target.value)}
                  style={{ width: "100%", boxSizing: "border-box", appearance: "auto" }}
                >
                  <option value="Plastic/Ceramic">🪣 Plastic/Ceramic Pot</option>
                  <option value="Terra Cotta">🪴 Terra Cotta Pot (Dries Faster)</option>
                </select>

                <button
                  onClick={handleSave}
                  className="btn btn--small btn--green"
                  style={{ width: "100%" }}
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
            {!isEditing && (
              <p className="modal-species">
                {plantInfo.common_name?.[0] || "Unknown Species"}
              </p>
            )}
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

          {/* 🟢 NEW: Display Environment Attributes */}
          {!isEditing && (
            <div className="detail-box" style={{ gridColumn: "1 / -1", borderLeft: "3px solid #8b5cf6" }}>
              <label>ENVIRONMENT & POT TYPE</label>
              <span style={{ fontSize: "14px", color: "#e2e8f0", marginTop: "4px" }}>
                {plant.placement === "Outdoor" ? "🌤️ Outdoor" : "🏠 Indoor"} • {plant.potType === "Terra Cotta" ? "🪴 Terra Cotta" : "🪣 Plastic/Ceramic"}
              </span>
            </div>
          )}

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
        .modal-content { background: #111827; border: 2px solid #374151; width: 90%; max-width: 500px; border-radius: 16px; padding: 24px; position: relative; box-shadow: 0 20px 50px rgba(0,0,0,0.5); animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); max-height: 90vh; overflow-y: auto; }
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
        .modal-input { background: #374151; border: 1px solid #4b5563; color: white; padding: 6px 10px; border-radius: 4px; font-family: inherit; margin-bottom: 4px;}
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; }}
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; }}
        .modal-icon-wrapper { position: relative; width: 80px; height: 80px; flex-shrink: 0; }
        .camera-btn { position: absolute; bottom: -5px; right: -5px; background: #3b82f6; color: white; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; cursor: pointer; border: 2px solid #111827; font-size: 14px; }
        .edit-column { display: flex; flex-direction: column; gap: 6px; align-items: flex-start; }
        .water-bar-container { width: 100%; height: 10px; background: #111827; border-radius: 6px; overflow: hidden; border: 1px solid #374151; }
        .water-bar-fill { height: 100%; border-radius: 4px; transition: width 1s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.5s ease; }
        `}
      </style>
    </div>
  );
}

// --- SUB-COMPONENT: The Weather Detail & Forecast Modal ---
function WeatherModal({ weather, forecast, onClose }) {
  if (!weather) return null;

  let impactTip =
    "Conditions are generally mild. Standard watering schedules apply.";
  if (weather.main.temp > 32)
    impactTip = "It's very hot! Outdoor soil will dry out much faster today.";
  else if (weather.main.temp < 15)
    impactTip = "Cooler temperatures today. Be careful not to overwater.";
  else if (weather.weather[0].main.includes("Rain"))
    impactTip = "Rain is expected! Great for outdoor plants. Nature will handle the watering.";

  const dailyData = [];
  if (forecast && forecast.list) {
    const seenDays = new Set();
    forecast.list.forEach((slot) => {
      const date = new Date(slot.dt * 1000);
      const dayStr = date.toLocaleDateString("en-US", { weekday: "short" });
      if (!seenDays.has(dayStr) && seenDays.size < 5) {
        seenDays.add(dayStr);
        dailyData.push({
          day: dayStr,
          temp: Math.round(slot.main.temp),
          icon: slot.weather[0].main.includes("Rain")
            ? "🌧️"
            : slot.weather[0].main.includes("Cloud")
              ? "⛅"
              : "☀️",
        });
      }
    });
  }

  const maxTemp =
    dailyData.length > 0 ? Math.max(...dailyData.map((d) => d.temp)) : 40;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "550px" }}
      >
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>

        <div className="modal-header" style={{ marginBottom: "16px" }}>
          <div className="modal-icon-wrapper">
            <div className="modal-icon" style={{ fontSize: "40px" }}>
              {weather.weather[0].main.includes("Rain")
                ? "🌧️"
                : weather.weather[0].main.includes("Cloud")
                  ? "⛅"
                  : "☀️"}
            </div>
          </div>
          <div className="modal-title-box">
            <h2 className="modal-title">Local Weather</h2>
            <p className="modal-species" style={{ color: "#38bdf8" }}>
              {weather.name}
            </p>
          </div>
        </div>

        <div className="modal-grid">
          <div className="detail-box">
            <label>CONDITION</label>
            <strong style={{ textTransform: "capitalize", color: "#f8fafc" }}>
              {weather.weather[0].description}
            </strong>
          </div>
          <div className="detail-box">
            <label>FEELS LIKE</label>
            <span>{Math.round(weather.main.feels_like)}°C</span>
          </div>

          <div
            className="detail-box"
            style={{ gridColumn: "1 / -1", borderLeft: "3px solid #38bdf8" }}
          >
            <label>CARE ENGINE IMPACT</label>
            <span
              style={{
                fontSize: "13px",
                color: "#e2e8f0",
                lineHeight: "1.5",
                marginTop: "6px",
                display: "block",
              }}
            >
              {impactTip}
            </span>
          </div>

          {dailyData.length > 0 && (
            <div
              className="detail-box"
              style={{
                gridColumn: "1 / -1",
                padding: "16px",
                background: "#0b1220",
              }}
            >
              <label style={{ marginBottom: "16px", display: "block" }}>
                5-DAY FORECAST
              </label>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                  height: "120px",
                  gap: "8px",
                }}
              >
                {dailyData.map((day, idx) => {
                  const barHeight = `${(day.temp / maxTemp) * 100}%`;
                  const isHot = day.temp > 30;
                  const barColor = isHot ? "#ef4444" : "#38bdf8";

                  return (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        flex: 1,
                      }}
                    >
                      <span style={{ fontSize: "14px", marginBottom: "8px" }}>
                        {day.icon}
                      </span>

                      <div
                        style={{
                          width: "100%",
                          maxWidth: "30px",
                          height: "80px",
                          display: "flex",
                          alignItems: "flex-end",
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid #334155",
                          borderBottom: "none",
                        }}
                      >
                        <div
                          style={{
                            width: "100%",
                            height: barHeight,
                            background: barColor,
                            borderTop: "2px solid #fff",
                            transition: "height 0.5s ease-out",
                          }}
                        />
                      </div>

                      <strong
                        style={{
                          fontSize: "12px",
                          marginTop: "8px",
                          color: "#f8fafc",
                        }}
                      >
                        {day.temp}°
                      </strong>
                      <small
                        style={{
                          fontSize: "9px",
                          color: "#9ca3af",
                          fontFamily: "'Press Start 2P', cursive",
                          marginTop: "4px",
                        }}
                      >
                        {day.day}
                      </small>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 🟢 --- MARKETING & SHOP DATA ---
const CAROUSEL_IMAGES = [
  { url: banner1, title: "Welcome to Meet-Ur Garden", sub: "Discover the perfect addition to your home sanctuary." },
  { url: banner2, title: "Expert Plant Care", sub: "Track, learn, and grow alongside our community." },
  { url: banner3, title: "Premium Supplies", sub: "Everything you need to keep your plants thriving." },
  { url: banner4, title: "Join the Green Revolution", sub: "Your plant parent journey starts here." }
];

const PRODUCTS = [
  { id: 1, title: "Plants", desc: "A variety of healthy, well-cared-for plants for your home.", img: product1 },
  { id: 2, title: "Premium Pots", desc: "Ceramic, terracotta, and self-watering planters.", img: product2 },
  { id: 3, title: "Fertilizers", desc: "Organic and synthetic nutrients for explosive growth.", img: product3 },
  { id: 4, title: "Pot Mediums", desc: "Aroid mixes, coco coir, and nutrient-rich soil.", img: product4 }
];

const marketingStyles = `
  .carousel-container { position: relative; width: 100%; height: 450px; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.4); margin-bottom: 48px; }
  .carousel-track { display: flex; height: 100%; transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1); }
  .carousel-slide { min-width: 100%; height: 100%; position: relative; }
  .carousel-slide img { width: 100%; height: 100%; object-fit: cover; filter: brightness(0.7); }
  .carousel-caption { position: absolute; bottom: 40px; left: 40px; color: white; text-shadow: 0 4px 12px rgba(0,0,0,0.8); }
  .carousel-caption h2 { font-size: 2.5rem; font-weight: 800; margin: 0 0 8px 0; color: #34d399; }
  .carousel-caption p { font-size: 1.1rem; margin: 0; color: #e5e7eb; }
  .carousel-btn { position: absolute; top: 50%; transform: translateY(-50%); background: rgba(15, 23, 42, 0.6); color: white; border: none; width: 48px; height: 48px; border-radius: 50%; font-size: 20px; cursor: pointer; backdrop-filter: blur(4px); transition: background 0.2s; display: flex; align-items: center; justify-content: center; z-index: 10; }
  .carousel-btn:hover { background: rgba(52, 211, 153, 0.8); }
  .btn-left { left: 16px; }
  .btn-right { right: 16px; }

  .featured-products { margin-top: 16px; margin-bottom: 64px; }
  .section-header { margin-bottom: 32px; text-align: center; }
  .section-header h3 { font-size: 2rem; color: #f3f4f6; margin: 0 0 8px 0; }
  .section-header p { color: #9ca3af; margin: 0; font-size: 1.1rem; }
  .products-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px; }
  .product-card { background: #1f2937; border: 1px solid #374151; border-radius: 16px; overflow: hidden; transition: transform 0.2s ease, box-shadow 0.2s ease; cursor: pointer; display: flex; flex-direction: column; }
  .product-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0,0,0,0.3); border-color: #34d399; }
  .product-image { width: 100%; height: 200px; object-fit: cover; }
  .product-info { padding: 20px; text-align: center; flex: 1; display: flex; flex-direction: column; justify-content: center; }
  .product-title { font-size: 1.2rem; font-weight: bold; color: #f3f4f6; margin: 0 0 8px 0; }
  .product-desc { font-size: 0.9rem; color: #9ca3af; margin: 0; line-height: 1.4; }

  .garden-footer { margin-top: 64px; padding-top: 32px; border-top: 1px dashed #374151; display: flex; flex-wrap: wrap; justify-content: space-between; gap: 24px; color: #9ca3af; }
  .footer-brand h4 { font-size: 1.4rem; color: #f3f4f6; margin: 0 0 8px 0; font-weight: 800; letter-spacing: 1px; }
  .footer-brand span { color: #34d399; }
  .footer-details { display: flex; flex-direction: column; gap: 8px; font-size: 0.95rem; }
  .footer-link { color: #34d399; text-decoration: none; transition: opacity 0.2s; }
  .footer-link:hover { opacity: 0.8; text-decoration: underline; }

  @media (max-width: 768px) {
    .carousel-container { height: 350px; } 
    .carousel-caption { bottom: 24px; left: 24px; right: 24px; text-align: center; }
    .carousel-caption h2 { font-size: 1.5rem; }
    .carousel-caption p { font-size: 0.9rem; }
    .carousel-btn { width: 36px; height: 36px; font-size: 16px; } 
    .garden-footer { flex-direction: column; text-align: center; align-items: center; }
  }
`;

// 🟢 --- SUB-COMPONENT: The Carousel & Shop Showcase ---
function MarketingShowcase() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === CAROUSEL_IMAGES.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev === CAROUSEL_IMAGES.length - 1 ? 0 : prev + 1));
  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? CAROUSEL_IMAGES.length - 1 : prev - 1));

  return (
    <>
      <style>{marketingStyles}</style>

      {/* CAROUSEL */}
      <section className="carousel-container">
        <div 
          className="carousel-track" 
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {CAROUSEL_IMAGES.map((img, idx) => (
            <div className="carousel-slide" key={idx}>
              <img src={img.url} alt={img.title} />
              <div className="carousel-caption">
                <h2>{img.title}</h2>
                <p>{img.sub}</p>
              </div>
            </div>
          ))}
        </div>
        <button className="carousel-btn btn-left" onClick={prevSlide}>❮</button>
        <button className="carousel-btn btn-right" onClick={nextSlide}>❯</button>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="featured-products">
        <div className="section-header">
          <h3>Featured Products</h3>
          <p>Everything you need for your indoor jungle.</p>
        </div>
        
        <div className="products-grid">
          {PRODUCTS.map((product) => (
            <div className="product-card" key={product.id}>
              <img src={product.img} alt={product.title} className="product-image" />
              <div className="product-info">
                <h4 className="product-title">{product.title}</h4>
                <p className="product-desc">{product.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

// --- SUB-COMPONENT: The User's "My Garden" Dashboard ---
function GardenDashboard({ user }) {
  const [garden, setGarden] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [searchParams] = useSearchParams();
  const {
    weather,
    forecast,
    loading: weatherLoading,
  } = useContext(WeatherContext);
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
      {showWeatherModal && weather && (
        <WeatherModal
          weather={weather}
          forecast={forecast}
          onClose={() => setShowWeatherModal(false)}
        />
      )}

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

      <div className="dashboard-bento">
        <div className="bento-stat bento-stat--green">
          <span className="bento-icon">🌱</span>
          <div className="bento-info">
            <strong>{garden.length}</strong>
            <span>Total Plants</span>
          </div>
        </div>

        <div
          className="bento-stat bento-stat--blue"
          onClick={() => setShowWeatherModal(true)}
          style={{ cursor: "pointer" }}
        >
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

      {!loading && !error && activeTab === "overview" && (
        <section className="tab-content">
          {attentionPlants.length === 0 ? (
            <div className="empty-state">
              <span style={{ fontSize: "40px" }}>✨</span>
              <p
                style={{
                  marginTop: "16px",
                  fontSize: "14px",
                  color: "white",
                }}
              >
                Your garden is thriving!
              </p>
              <p style={{ textTransform: "none", color: "#9ca3af" }}>
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
                        {/* 🟢 NEW: Add tiny icon to show if it's indoors/outdoors */}
                        <span style={{ fontSize: "14px", marginLeft: "6px" }}>
                          {item.placement === "Outdoor" ? "🌤️" : "🏠"}
                        </span>
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

                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        alignSelf: "center",
                        flexWrap: "wrap",
                        justifyContent: "flex-end",
                        marginTop: "12px",
                      }}
                    >
                      {(item.healthReport.health === "THIRSTY" ||
                        item.healthReport.next_actions?.water_in === "Now") && (
                        <button
                          className="btn btn--small btn--blue"
                          disabled={actionLoading === item._id}
                          onClick={(e) =>
                            handleQuickAction(e, item._id, "water")
                          }
                        >
                          WATER 💧
                        </button>
                      )}

                      {item.healthReport.health === "TOO HOT!" && (
                        <>
                          <button
                            className="btn btn--small btn--blue"
                            disabled={actionLoading === item._id}
                            onClick={(e) =>
                              handleQuickAction(e, item._id, "mist")
                            }
                          >
                            MIST 🌬️
                          </button>
                          <button
                            className="btn btn--small"
                            style={{
                              background: "#fbbf24",
                              color: "#0f172a",
                              border: "none",
                            }}
                            disabled={actionLoading === item._id}
                            onClick={(e) =>
                              handleQuickAction(e, item._id, "move_shade")
                            }
                          >
                            SHADE ⛅
                          </button>
                        </>
                      )}

                      {item.healthReport.health === "TOO COLD!" && (
                        <button
                          className="btn btn--small"
                          style={{
                            background: "#ef4444",
                            color: "white",
                            border: "none",
                          }}
                          disabled={actionLoading === item._id}
                          onClick={(e) =>
                            handleQuickAction(e, item._id, "move_inside")
                          }
                        >
                          INSIDE 🏠
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

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
                      <h3>
                        {item.nickname}
                        {/* 🟢 NEW: Add tiny icon to show if it's indoors/outdoors */}
                        <span style={{ fontSize: "14px", marginLeft: "6px" }}>
                          {item.placement === "Outdoor" ? "🌤️" : "🏠"}
                        </span>
                      </h3>
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

// --- SUB-COMPONENT: The Notification Bell ---
function NotificationCenter({ user }) {
  const [garden, setGarden] = useState([]);
  const { weather } = useContext(WeatherContext);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (user && weather) {
      GardenAPI.list().then(setGarden).catch(console.error);
    }
  }, [user, weather]);

  const allAlerts = garden.reduce((acc, item) => {
    const plantInfo = item.plant_id || {};
    const cleanPlantInfo = {
      ...plantInfo,
      ecological_descriptors: {
        ...plantInfo.ecological_descriptors,
        temperature_range: plantInfo.ecological_descriptors?.temperature_range?.toString(),
      },
    };
    const healthReport = analyzePlantHealth(cleanPlantInfo, weather, item);
    const plantAlerts = (healthReport.alerts || []).map(alert => ({
      nickname: item.nickname || "Plant",
      message: alert
    }));
    return [...acc, ...plantAlerts];
  }, []);

  return (
    <div className="notification-wrapper">
      <button className="btn-bell" onClick={() => setIsOpen(!isOpen)}>
        🔔
        {allAlerts.length > 0 && <span className="bell-badge">{allAlerts.length}</span>}
      </button>

      {isOpen && (
        <>
          <div className="dropdown-overlay" onClick={() => setIsOpen(false)} />
          <div className="notification-dropdown">
            <div className="alerts-container" style={{
              background: allAlerts.length > 0 ? 'rgba(239, 68, 68, 0.05)' : 'rgba(143, 208, 129, 0.05)'
            }}>
              {allAlerts.length > 0 ? (
                <>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '11px', color: '#ef4444', textTransform: 'uppercase', fontFamily: "'Inter', sans-serif", fontWeight: 'bold' }}>
                    ⚠️ Immediate Action Required
                  </h4>
                  <ul className="alerts-list">
                    {allAlerts.map((alert, idx) => (
                      <li key={idx} className="alert-item">
                        <strong style={{ color: '#8fd081' }}>[{alert.nickname}]</strong><br/>
                        {alert.message}
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8fd081', fontSize: '13px', fontWeight: '600', fontFamily: "'Inter', sans-serif" }}>
                  <span style={{ fontSize: '16px' }}>✅</span>
                  <span>Garden Status: Optimal</span>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// --- MAIN COMPONENT ---
export default function Home() {
  const { user } = useContext(AuthContext);

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
        <nav style={{ display: "flex", gap: "10px", alignItems: "center" }}>
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

          {user && <NotificationCenter user={user} />}
          
        </nav>
      </header>

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
          Welcome back, {user?.email?.split("@")[0]} 👋
        </h2>
        <p
          className="hero__text"
          style={{ maxWidth: "600px", margin: "0 0 24px 0", color: "#94a3b8" }}
        >
          Here is what is happening in your garden today.
        </p>
      </div>
      
      {/* 🟢 1. ALWAYS SHOW THE CAROUSEL AND SHOP AT THE TOP */}
      <MarketingShowcase />

      {/* 🟢 3. SHOW THE DASHBOARD */}
      {user && <GardenDashboard user={user} />}

      {/* 🟢 4. THE FOOTER */}
      <footer className="garden-footer">
        <div className="footer-brand">
          <h4>MEETUR <span>GARDEN</span></h4>
          <p style={{ margin: 0, maxWidth: "300px" }}>
            Cultivating a greener community, one leaf at a time. Track, learn, and grow with us.
          </p>
        </div>

        <div className="footer-details">
          <strong>Visit Us</strong>
          <span>📍 Km 44, Emilio Aguinaldo Highway, Bypass, Brgy. Tubuan 2, Silang, Cavite , Silang, PH</span>
          <span>📞 +63 921 531 1819 </span>
          <a 
            href="https://web.facebook.com/Dhoies.Garden2" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="footer-link"
          >
            📘 Follow us on Facebook
          </a>
        </div>
      </footer>
    </main>
  );
}