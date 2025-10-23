import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import PlantForm from "../components/PlantForm";
import { PlantsAPI } from "../api";
import "./EditPlant.css";

export default function EditPlant() {
  const { id } = useParams();
  const nav = useNavigate();
  const [plant, setPlant] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    PlantsAPI.get(id)
      .then(setPlant)
      .catch((e) => setErr(e.message || "Not found"));
  }, [id]);

  return (
    <main className="edit">
      {/* floating accents */}
      <span className="bubble bubble--green" />
      <span className="bubble bubble--blue" />
      <span className="bubble bubble--purple" />

      <header className="edit__header">
        <div className="header__left">
          <Link to={`/plants/${id}`} className="btn btn--ghost">
            ← Back
          </Link>
        </div>
        <span className="badge">Edit</span>
      </header>

      <section className="edit__content">
        {err && <p className="error">{err}</p>}
        {!plant && !err && <p className="loading">Loading...</p>}

        {plant && (
          <>
            <h2 className="edit__title">Edit Plant</h2>
            <p className="edit__subtitle">
              Update your plant’s details and keep your garden organized.
            </p>

            <div className="edit__formcard">
              <PlantForm
                initial={plant}
                submitText="Save Changes"
                onSubmit={async (values) => {
                  await PlantsAPI.update(id, values);
                  nav(`/plants/${id}`);
                }}
              />
            </div>
          </>
        )}
      </section>
    </main>
  );
}
