// frontend/src/pages/EditPlant.js
import { useEffect, useState } from 'react';
import PlantForm from '../components/PlantForm';
import { PlantsAPI } from '../api';
import { useNavigate, useParams } from 'react-router-dom';

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
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(values) {
    try {
      setSubmitting(true);
      await PlantsAPI.update(id, values);
      navigate(`/plants/${id}`);
    } catch (e) {
      alert(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p>Loading…</p>;
  if (error) return <p className="error">{error}</p>;
  if (!plant) return <p>Not found.</p>;

  return (
    <section>
      <h1>Edit Plant</h1>
      {/* key ensures remount if id changes */}
      <PlantForm key={plant._id} initial={plant} onSubmit={handleSubmit} submitting={submitting} />
    </section>
  );
}
