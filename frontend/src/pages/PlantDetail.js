import { useEffect, useState } from 'react';
import { PlantsAPI } from '../api';
import { Link, useParams } from 'react-router-dom';

export default function PlantDetail() {
  const { id } = useParams();
  const [plant, setPlant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    PlantsAPI.get(id)
      .then(setPlant)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p>Loading…</p>;
  if (error) return <p className="error">{error}</p>;
  if (!plant) return <p>Not found.</p>;

  return (
    <article className="prose">
      <h1>{plant.name}</h1>
      <p className="muted">{plant.species}</p>
      <p>{plant.description}</p>
      <div className="row gap">
        <Link className="btn" to={`/plants/${plant._id}/edit`}>Edit</Link>
        <Link className="btn secondary" to="/plants">Back to list</Link>
      </div>
    </article>
  );
}
