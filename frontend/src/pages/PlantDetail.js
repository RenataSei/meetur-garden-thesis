import { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { PlantsAPI, GardenAPI } from "../api";
import { AuthContext } from "../contexts/AuthContext";
import "./PlantDetail.css";

export default function PlantDetail() {
  const { id } = useParams();
  const [plant, setPlant] = useState(null);
  const [err, setErr] = useState("");
  const { user } = useContext(AuthContext);

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
    } catch (e) {
      alert(e.message || "Failed to add to garden");
    }
  }

  const loading = !plant && !err;

  // Safe helpers
  const flower = plant?.flower_descriptors || {};
  const ecology = plant?.ecological_descriptors || {};
  const notes = plant?.other_notes || {};
  const commonNames = Array.isArray(plant?.common_name) ? plant.common_name : [];
  
  const primaryName = commonNames[0] || "Unnamed plant";
  const altNames = commonNames.slice(1);

  if (loading) return <main className="detail"><p className="detail__loading">Loading plant details...</p></main>;
  if (err) return <main className="detail"><p className="detail__error">{err}</p></main>;
  if (!plant) return null;

  return (
    <main className="detail">
      {/* --- HERO SECTION --- */}
      <section className="detail__hero">
        <div className="hero__image-container">
          {plant.image_url ? (
            <img src={plant.image_url} alt={primaryName} className="hero__image" />
          ) : (
            <div className="hero__image-placeholder">🌿</div>
          )}
        </div>
        
        <div className="hero__info">
          <div className="hero__badges">
             {plant.maintenance_level && <span className="badge badge--green">{plant.maintenance_level} Maintenance</span>}
             {plant.life_cycle && <span className="badge badge--blue">{plant.life_cycle}</span>}
          </div>
          
          <h1 className="hero__title">{primaryName}</h1>
          <p className="hero__species"><i>{plant.scientific_name || "Unknown species"}</i></p>
          
          {plant.family && <p className="hero__family"><strong>Family:</strong> {plant.family} | <strong>Genus:</strong> {plant.genus_name || "N/A"}</p>}
          
          {altNames.length > 0 && (
            <p className="hero__alt-names">Also known as: {altNames.join(", ")}</p>
          )}

          {/* Add to garden button is prominent in the hero */}
          {user?.role !== 'admin' && (
             <button onClick={handleAddToGarden} className="btn btn--primary hero__add-btn">
               + Add to My Garden
             </button>
          )}
          
          {/* Admin Edit Button */}
          {user?.role === "admin" && (
            <Link className="btn btn--secondary hero__add-btn" to={`/plants/${plant._id}/edit`}>
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
        
        {/* ECOLOGY CARD */}
        <div className="bento-card">
          <h3 className="bento-card__title">🌍 Ecological Needs</h3>
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
              <span className="bento-icon">🌡️</span>
              <div>
                <strong>Temperature</strong>
                <span>{ecology.temperature_range || "Not specified"}</span>
              </div>
            </li>
            <li>
              <span className="bento-icon">🌫️</span>
              <div>
                <strong>Humidity</strong>
                <span>{ecology.humidity_level || "Not specified"}</span>
              </div>
            </li>
            <li>
              <span className="bento-icon">🧪</span>
              <div>
                <strong>Soil pH</strong>
                <span>{ecology.pH_level || "Not specified"}</span>
              </div>
            </li>
          </ul>
        </div>

        {/* FLOWER CARD */}
        <div className="bento-card">
          <h3 className="bento-card__title">🌸 Flower Details</h3>
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
                <span>{flower.flower_inflorescence || "Not specified"}</span>
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
            <li>
              <span className="bento-icon">📏</span>
              <div>
                <strong>Plant Height</strong>
                <span>{plant.height != null ? `${plant.height} cm` : "Not specified"}</span>
              </div>
            </li>
          </ul>
        </div>

        {/* NOTES CARD (Full width if notes exist) */}
        {(notes.pests_diseases_notes || notes.propagation_notes || notes.invasive_species_notes || notes.conservation_status_notes || notes.local_permits_notes) && (
          <div className="bento-card bento-card--full">
            <h3 className="bento-card__title">📝 Additional Notes</h3>
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
              {notes.local_permits_notes && (
                <div className="note-item">
                  <strong>📄 Permits</strong>
                  <p>{notes.local_permits_notes}</p>
                </div>
              )}
            </div>
          </div>
        )}

      </section>
    </main>
  );
}