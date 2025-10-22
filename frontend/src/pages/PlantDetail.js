import { useEffect, useState } from 'react';
import { PlantsAPI } from '../api';
import { Link, useParams } from 'react-router-dom';
import SidebarMenu from '../components/SidebarMenu';

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

  return (
    <div className="app-grid">
      <section className="prose">
        {loading && <p>Loading…</p>}
        {error && <p className="error">{error}</p>}
        {!loading && !plant && <p>Not found.</p>}

        {plant && (
          <>
            <h1>{plant.name}</h1>
            <p className="muted">{plant.species}</p>
            <p>{plant.description}</p>
            <div className="row gap">
              <Link className="btn info" to={`/plants/${plant._id}/edit`}>Edit</Link>
              <Link className="btn secondary" to="/plants">Back to list</Link>
            </div>
          </>
        )}
      </section>

      <SidebarMenu />
    </div>
  );
}
