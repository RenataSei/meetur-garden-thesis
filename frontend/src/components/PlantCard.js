import { Link } from "react-router-dom";
import "./PlantCard.css";

export default function PlantCard({
  plant,
  onDelete,
  userRole,
  onAddToGarden,
}) {
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
      {/* 🟢 NEW: Clean Image Wrapper without inline CSS hacks */}
      {plant.image_url ? (
        <div className="plant-card__image-wrapper">
          <img src={plant.image_url} alt={displayName} />
        </div>
      ) : (
        <div className="plant-card__image-placeholder">
          <span>🌿</span>
        </div>
      )}

      {/* 🟢 NEW: Content Body Wrapper */}
      <div className="plant-card__body">
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

          {/* 2. "Add to Garden" Button */}
          {userRole !== "admin" && (
            <button
              type="button"
              className="btn plant-card__btn-add"
              onClick={onAddToGarden}
            >
              + Garden
            </button>
          )}

          {/* 3. Delete Button - ONLY visible to Admins */}
          {userRole === "admin" && (
            <button
              type="button"
              className="btn plant-card__btn-danger"
              onClick={() => {
                if (window.confirm("Are you sure you want to delete this plant?")) {
                  onDelete(plant._id);
                }
              }}
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </article>
  );
}