import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PlantsAPI } from "../api";
import PlantCard from "../components/PlantCard";
import "./PlantsList.css";

export default function PlantsList() {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  async function load() {
    try {
      const data = await PlantsAPI.list();
      setPlants(data);
    } catch (e) {
      setErr(e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id) {
    if (!window.confirm("Delete this plant?")) return;
    try {
      await PlantsAPI.delete(id);
      setPlants((list) => list.filter((p) => p._id !== id));
    } catch (e) {
      alert(e.message || "Delete failed");
    }
  }

  return (
    <main className="list">
      {/* floating accents */}
      <span className="bubble bubble--green" />
      <span className="bubble bubble--blue" />
      <span className="bubble bubble--purple" />

      <header className="list__header">
        <h2 className="list__title">Your Garden</h2>
        <Link className="btn btn--primary" to="/plants/new">
          + Add Plant
        </Link>
      </header>

      <section className="list__content">
        {loading && <p className="loading">Loading...</p>}
        {err && <p className="error">{err}</p>}

        {!loading && !err && plants.length === 0 && (
          <div className="empty">
            <p>No plants yet. Click <b>Add Plant</b> to create one.</p>
          </div>
        )}

        {!loading && !err && plants.length > 0 && (
          <div className="grid">
            {plants.map((p) => (
              <PlantCard key={p._id} plant={p} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
