import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { PlantsAPI } from "../api";
import "./PlantDetail.css";

// helper to show values nicely in the preview section
function renderValue(value) {
  if (Array.isArray(value)) {
    return value.join(", ");
  }
  if (value === null || value === undefined) {
    return "";
  }
  if (typeof value === "object") {
    return JSON.stringify(value, null, 2);
  }
  return String(value);
}

// keys we do not want to show in the preview list
const hiddenKeys = ["_id", "__v"];

export default function PlantDetail() {
  const { id } = useParams();
  const [plant, setPlant] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    PlantsAPI.get(id)
      .then((data) => {
        setPlant(data);
        setErr("");
      })
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
            {/* TOP CARD (your Picture 2) */}
            <h2 className="detail__title">
              {plant.common_name && plant.common_name.length > 0
                ? plant.common_name[0]
                : plant.name || "Untitled plant"}
            </h2>

            <p className="detail__species">
              <b>Species:</b>{" "}
              {plant.scientific_name || plant.species || "Not set"}
            </p>

            {plant.description && (
              <p className="detail__desc">{plant.description}</p>
            )}

            {/* PREVIEW CONTENT (your old Picture 1) */}
            <div
              style={{
                marginTop: 24,
                border: "1px solid #1f2933",
                borderRadius: 8,
                padding: 16,
                background: "#020617",
                color: "#e5e5e5",
                maxWidth: 900,
              }}
            >
              {Object.entries(plant)
                .filter(([key]) => !hiddenKeys.includes(key))
                .map(([key, value]) => (
                  <div
                    key={key}
                    style={{
                      marginBottom: 12,
                      borderBottom: "1px solid #111827",
                      paddingBottom: 8,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 12,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        color: "#9ca3af",
                        marginBottom: 4,
                      }}
                    >
                      {key.replace(/_/g, " ")}
                    </div>
                    <div
                      style={{ whiteSpace: "pre-wrap", fontSize: 14 }}
                    >
                      {renderValue(value) || (
                        <span style={{ color: "#6b7280" }}>No data</span>
                      )}
                    </div>
                  </div>
                ))}
            </div>

            {/* ACTIONS */}
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
