import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { PlantsAPI } from "../api";
import "./PlantDetail.css";

export default function PlantDetail() {
  const { id } = useParams();
  const [plant, setPlant] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    PlantsAPI.get(id)
      .then(setPlant)
      .catch((e) => setErr(e.message || "Not found"));
  }, [id]);

  return (
    <main className="detail">
      {/* floating accents */}
      <span className="bubble bubble--green" />
      <span className="bubble bubble--blue" />
      <span className="bubble bubble--purple" />

      <header className="detail__header">
        <Link to="/plants" className="btn btn--ghost">
          ← Back
        </Link>
        <span className="badge">Detail</span>
      </header>

      <section className="detail__content">
        {err && <p className="error">{err}</p>}
        {!plant && !err && <p className="loading">Loading...</p>}

        {plant && (
          <>
            <h2 className="detail__title">{plant.name}</h2>
            <p className="detail__species">
              <b>Species:</b> {plant.species}
            </p>
            <p className="detail__desc">{plant.description}</p>

            <div className="detail__actions">
              <Link
                className="btn btn--primary"
                to={`/plants/${plant._id}/edit`}
              >
                Edit Plant
              </Link>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
