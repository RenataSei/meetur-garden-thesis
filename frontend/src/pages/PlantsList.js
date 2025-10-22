import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlantsAPI } from '../api';
import PlantCard from '../components/PlantCard';

export default function PlantsList() {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  async function load() {
    try {
      const data = await PlantsAPI.list();
      setPlants(data);
    } catch (e) {
      setErr(e.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id) {
    if (!window.confirm('Delete this plant?')) return;
    try {
      await PlantsAPI.delete(id);
      setPlants((list) => list.filter((p) => p._id !== id));
    } catch (e) {
      alert(e.message || 'Delete failed');
    }
  }

  return (
    <div className="container">
      <div className="header">
        <h2>Your Garden</h2>
        <Link className="btn brand" to="/plants/new">Add Plant</Link>
      </div>

      {loading && <p>Loading...</p>}
      {err && <p className="error">{err}</p>}

      {!loading && !err && plants.length === 0 && (
        <div className="empty">No plants yet. Click Add Plant to create one.</div>
      )}

      {!loading && !err && plants.length > 0 && (
        <div className="grid">
          {plants.map((p) => (
            <PlantCard key={p._id} plant={p} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
