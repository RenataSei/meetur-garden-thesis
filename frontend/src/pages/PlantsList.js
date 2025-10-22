// PlantsList.js
import { useEffect, useState } from 'react';
import PlantCard from '../components/PlantCard';
import { PlantsAPI } from '../api';
import SidebarMenu from '../components/SidebarMenu';
import { Link } from 'react-router-dom';

export default function PlantsList() {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    try {
      setLoading(true);
      const data = await PlantsAPI.list();
      setPlants(data);
      setError('');
    } catch (e) {
      setError(e.message || 'Failed to load plants');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id){
    try{
      await PlantsAPI.delete(id);
      setPlants(plants => plants.filter(p => p._id !== id));
    }catch(e){
      alert(e.message || 'Delete failed');
    }
  }

  return (
    <div className="app-grid">
      <section>
        <div className="row" style={{justifyContent:'space-between', marginBottom:10}}>
          <h2 style={{margin:0}}>Garden</h2>
          <Link className="btn" to="/plants/new" style={{boxShadow:'var(--shadow)'}}>Add Plant</Link>
        </div>

        {loading && <p>Loading…</p>}
        {error && <p>{error}</p>}

        <div className="plant-grid">
          {plants.map(plant => (
            <PlantCard key={plant._id} plant={plant} onDelete={handleDelete} />
          ))}
        </div>
      </section>

      <SidebarMenu />
    </div>
  );
}
