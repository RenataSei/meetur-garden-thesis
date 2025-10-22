// EditPlant.js
import { useEffect, useState } from 'react';
import PlantForm from '../components/PlantForm';
import { PlantsAPI } from '../api';
import { useNavigate, useParams } from 'react-router-dom';
import SidebarMenu from '../components/SidebarMenu';

export default function EditPlant() {
  const { id } = useParams();
  const [plant, setPlant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    PlantsAPI.get(id)
      .then(setPlant)
      .catch(e => setError(e.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(values){
    try{
      setSubmitting(true);
      await PlantsAPI.update(id, values); // PATCH to backend
      navigate(`/plants/${id}`);
    }catch(e){
      setError(e.message || 'Update failed');
    }finally{
      setSubmitting(false);
    }
  }

  return (
    <div className="app-grid">
      <section>
        <h1 style={{marginTop:0}}>Edit Plant</h1>
        {loading && <p>Loading…</p>}
        {error && <p className="error">{error}</p>}
        {plant && (
          <PlantForm
            key={plant._id}
            initial={plant}
            onSubmit={handleSubmit}
            submitting={submitting}
          />
        )}
      </section>

      <SidebarMenu />
    </div>
  );
}
