import { useEffect, useState, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { PlantsAPI, GardenAPI } from "../api";
import { AuthContext } from "../contexts/AuthContext";
import { calculateWaterStat, calculateHumidityStat } from "../utils/statMapper";
import "./PlantDetail.css";

export default function PlantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plant, setPlant] = useState(null);
  const [err, setErr] = useState("");
  const { user } = useContext(AuthContext);

  // 🟢 NEW: Tab State
  const [activeTab, setActiveTab] = useState("ecology"); // ecology, flower, notes

  useEffect(() => {
    PlantsAPI.get(id)
      .then((data) => {
        setPlant(data);
        setErr("");
      })
      .catch((e) => {
        setPlant(null);
        setErr(e.message || "Plant not found");
      });
  }, [id]);

  async function handleAddToGarden() {
    if (!user) {
      alert("Please log in to add plants to your garden.");
      navigate("/login");
      return;
    }

    const defaultName = primaryName;
    const nickname = window.prompt(
      `Give your ${defaultName} a nickname:`,
      defaultName,
    );

    if (nickname === null) return;

    try {
      await GardenAPI.add(plant._id, nickname);
      alert(`🌱 Successfully added ${nickname} to your garden!`);
      navigate("/");
    } catch (e) {
      alert(e.message || "Failed to add to garden");
    }
  }

  const loading = !plant && !err;

  // Safe helpers
  const flower = plant?.flower_descriptors || {};
  const ecology = plant?.ecological_descriptors || {};
  const notes = plant?.other_notes || {};
  const commonNames = Array.isArray(plant?.common_name)
    ? plant.common_name
    : [];

  const primaryName = commonNames[0] || "Unnamed plant";
  const altNames = commonNames.slice(1);

  // Gamified "RPG Stat" calculations using the utility mapper
  const waterStat = calculateWaterStat(ecology.water_frequency);
  const humidityStat = calculateHumidityStat(ecology.humidity_level);

  return (
    <main className="detail">
      <div style={{ width: "100%", maxWidth: "960px", marginBottom: "16px" }}>
        <Link
          to="/plants"
          className="btn btn--secondary"
          style={{ fontSize: "12px" }}
        >
          ◀ BACK TO CATALOG
        </Link>
      </div>

      {/* --- HERO SECTION --- */}
      <section className="detail__hero">
        <div
          className="hero__image-container"
          style={{
            background: "transparent",
            border: "none",
            boxShadow: "none",
          }}
        >
          {plant.image_url ? (
            // 🟢 NEW: Added floating-img class
            <img
              src={plant.image_url}
              alt={primaryName}
              className="hero__image floating-img"
              style={{ objectFit: "contain" }}
            />
          ) : (
            <div className="hero__image-placeholder floating-img">🌿</div>
          )}
        </div>

        <div className="hero__info">
          <div className="hero__badges">
            {plant.maintenance_level && (
              <span className="badge badge--green">
                {plant.maintenance_level} Maintenance
              </span>
            )}
            {plant.life_cycle && (
              <span className="badge badge--blue">{plant.life_cycle}</span>
            )}
          </div>

          <h1 className="hero__title">{primaryName}</h1>
          <p className="hero__species">
            <i>{plant.scientific_name || "Unknown species"}</i>
          </p>

          {plant.family && (
            <p className="hero__family">
              <strong>Family:</strong> {plant.family} | <strong>Genus:</strong>{" "}
              {plant.genus_name || "N/A"}
            </p>
          )}

          {altNames.length > 0 && (
            <p className="hero__alt-names">
              Also known as: {altNames.join(", ")}
            </p>
          )}

          {user?.role !== "admin" && (
            <button
              onClick={handleAddToGarden}
              className="btn btn--primary hero__add-btn"
            >
              + Add to My Garden
            </button>
          )}

          {user?.role === "admin" && (
            <Link
              className="btn btn--secondary hero__add-btn"
              to={`/plants/${plant._id}/edit`}
            >
              ✏️ Edit Plant
            </Link>
          )}
        </div>
      </section>

      {/* --- DESCRIPTION --- */}
      {plant.description && (
        <section className="detail__description-card">
          <p>{plant.description}</p>
        </section>
      )}

      {/* --- BENTO GRID FOR STATS --- */}
      <section className="detail__bento-grid">
        {/* 🟢 NEW: RPG BASE STATS CARD */}
        <div className="bento-card">
          <h3 className="bento-card__title">📊 Base Stats</h3>

          <div className="stat-row">
            <span className="stat-label">WATER NEEDS</span>
            <div className="stat-bar-bg">
              <div
                className="stat-bar-fill"
                style={{ width: `${waterStat}%`, backgroundColor: "#38bdf8" }}
              ></div>
            </div>
          </div>

          <div className="stat-row">
            <span className="stat-label">HUMIDITY</span>
            <div className="stat-bar-bg">
              <div
                className="stat-bar-fill"
                style={{
                  width: `${humidityStat}%`,
                  backgroundColor: "#a855f7",
                }}
              ></div>
            </div>
          </div>

          <div className="stat-row">
            <span className="stat-label">TEMP RANGE</span>
            <span
              style={{ fontSize: "14px", fontWeight: "600", color: "#0f172a" }}
            >
              {ecology.temperature_range || "Unknown"}
            </span>
          </div>

          <div className="stat-row" style={{ marginTop: "16px" }}>
            <span className="stat-label">SOIL PH</span>
            <span
              style={{ fontSize: "14px", fontWeight: "600", color: "#0f172a" }}
            >
              {ecology.pH_level || "Standard"}
            </span>
          </div>
        </div>

        {/* 🟢 NEW: INTERACTIVE TERMINAL CARD */}
        <div className="bento-card">
          <div className="tabs-nav">
            <button
              className={`tab-btn ${activeTab === "ecology" ? "active" : ""}`}
              onClick={() => setActiveTab("ecology")}
            >
              ECOLOGY
            </button>
            <button
              className={`tab-btn ${activeTab === "flower" ? "active" : ""}`}
              onClick={() => setActiveTab("flower")}
            >
              FLOWER
            </button>
            <button
              className={`tab-btn ${activeTab === "notes" ? "active" : ""}`}
              onClick={() => setActiveTab("notes")}
            >
              NOTES
            </button>
          </div>

          <div className="tab-content animate-in">
            {/* ECOLOGY TAB */}
            {activeTab === "ecology" && (
              <ul className="bento-list">
                <li>
                  <span className="bento-icon">☀️</span>
                  <div>
                    <strong>Light</strong>
                    <span>{ecology.luminance_level || "Not specified"}</span>
                  </div>
                </li>
                <li>
                  <span className="bento-icon">💧</span>
                  <div>
                    <strong>Water</strong>
                    <span>{ecology.water_frequency || "Not specified"}</span>
                  </div>
                </li>
                <li>
                  <span className="bento-icon">📏</span>
                  <div>
                    <strong>Plant Height</strong>
                    <span>
                      {plant.height != null
                        ? `${plant.height} cm`
                        : "Not specified"}
                    </span>
                  </div>
                </li>
              </ul>
            )}

            {/* FLOWER TAB */}
            {activeTab === "flower" && (
              <ul className="bento-list">
                <li>
                  <span className="bento-icon">🎨</span>
                  <div>
                    <strong>Color</strong>
                    <span>{flower.color || "Not specified"}</span>
                  </div>
                </li>
                <li>
                  <span className="bento-icon">🌿</span>
                  <div>
                    <strong>Inflorescence</strong>
                    <span>
                      {flower.flower_inflorescence || "Not specified"}
                    </span>
                  </div>
                </li>
                <li>
                  <span className="bento-icon">⏱️</span>
                  <div>
                    <strong>Bloom Time</strong>
                    <span>{flower.bloom_time || "Not specified"}</span>
                  </div>
                </li>
                <li>
                  <span className="bento-icon">🐝</span>
                  <div>
                    <strong>Ecological Value</strong>
                    <span>{flower.value || "Not specified"}</span>
                  </div>
                </li>
              </ul>
            )}

            {/* NOTES TAB */}
            {activeTab === "notes" && (
              <div className="notes-grid">
                {notes.pests_diseases_notes && (
                  <div className="note-item">
                    <strong>🐛 Pests & Diseases</strong>
                    <p>{notes.pests_diseases_notes}</p>
                  </div>
                )}
                {notes.propagation_notes && (
                  <div className="note-item">
                    <strong>✂️ Propagation</strong>
                    <p>{notes.propagation_notes}</p>
                  </div>
                )}
                {notes.invasive_species_notes && (
                  <div className="note-item">
                    <strong>⚠️ Invasive Status</strong>
                    <p>{notes.invasive_species_notes}</p>
                  </div>
                )}
                {notes.conservation_status_notes && (
                  <div className="note-item">
                    <strong>🛡️ Conservation</strong>
                    <p>{notes.conservation_status_notes}</p>
                  </div>
                )}
                {!notes.pests_diseases_notes &&
                  !notes.propagation_notes &&
                  !notes.invasive_species_notes &&
                  !notes.conservation_status_notes && (
                    <p style={{ color: "#64748b", fontSize: "14px" }}>
                      No additional notes recorded.
                    </p>
                  )}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
