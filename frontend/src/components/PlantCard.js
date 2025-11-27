import { Link } from "react-router-dom";
import "./PlantCard.css";

export default function PlantCard({ plant, onDelete }) {
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
        <Link className="btn plant-card__btn" to={`/plants/${plant._id}`}>
          Open
        </Link>

        <button
          type="button"
          className="btn danger plant-card__btn-danger"
          onClick={() => onDelete(plant._id)}
        >
          Delete
        </button>
      </div>
    </article>
  );
}
