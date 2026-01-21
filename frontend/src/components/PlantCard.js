import { Link } from "react-router-dom";
import "./PlantCard.css";

export default function PlantCard({ plant, onDelete, userRole, onAddToGarden }) {
  // common name in API is an array, use first value if available
  const displayName =
    plant.common_name && plant.common_name.length > 0
      ? plant.common_name[0]
      : "Unnamed Plant";

  const scientificName = plant.scientific_name || "Unknown species";

  // keep same behaviour as before - short preview plus "..."
  const previewDescription = `${(plant.description || "").slice(0, 100)}...`;

  return (
    <article className="plant-card">
      <header className="plant-card__header">
        <h3 className="plant-card__title">{displayName}</h3>

        <p className="plant-card__subtitle">
          <span className="plant-card__subtitle-label">Species:</span>{" "}
          <span className="plant-card__subtitle-text">
            <i>{scientificName}</i>
          </span>
        </p>
      </header>

      <p className="plant-card__description">{previewDescription}</p>

      <div className="plant-card__actions">
        {/* 1. Everyone can Open details */}
        <Link className="btn plant-card__btn" to={`/plants/${plant._id}`}>
          Open
        </Link>

        {/* 2. "Add to Garden" Button - Visible to everyone (Log in check handles the rest) */}
        {/* We generally hide this from admins to keep their UI clean, or show it if they want a garden too. 
            For now, let's show it for users who are NOT admins, or logged-in users. */}
        {userRole !== 'admin' && (
             <button
             type="button"
             className="btn plant-card__btn-add" // You might need to style this class green in CSS
             onClick={onAddToGarden}
             style={{ background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
           >
             + Garden
           </button>
        )}

        {/* 3. Delete Button - ONLY visible to Admins */}
        {userRole === 'admin' && (
          <button
            type="button"
            className="btn danger plant-card__btn-danger"
            onClick={() => onDelete(plant._id)}
          >
            Delete
          </button>
        )}
      </div>
    </article>
  );
}