// frontend/src/pages/NewPlant.js
import { useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import PlantForm from "../components/PlantForm";
import { PlantsAPI } from "../api";
import "./NewPlant.css";

export default function NewPlant() {
  const nav = useNavigate();

  const initial = useMemo(
    () => ({ name: "", species: "", description: "" }),
    []
  );

  return (
    <main className="new">
      {/* floating accents */}
      <span className="bubble bubble--green" />
      <span className="bubble bubble--blue" />
      <span className="bubble bubble--purple" />

      <header className="new__header">
        <div className="header__left">
          <Link to="/plants" className="btn btn--ghost">
            ← Back
          </Link>
        </div>
      </header>

      <section className="new__content">
        <h2 className="new__title">Add Plant</h2>
        <p className="new__subtitle">
          Create a new plant record with its name, species, and notes.
        </p>

        <div className="new__formcard">
          <PlantForm
            initial={initial}
            submitText="Create"
            onSubmit={async (values) => {
              await PlantsAPI.create(values);
              nav("/plants");
            }}
          />
        </div>
      </section>
    </main>
  );
}
