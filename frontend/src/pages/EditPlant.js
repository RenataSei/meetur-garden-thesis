import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import PlantForm from '../components/PlantForm';
import { PlantsAPI } from '../api';

export default function EditPlant() {
  const { id } = useParams();
  const nav = useNavigate();
  const [plant, setPlant] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    PlantsAPI.get(id).then(setPlant).catch((e) => setErr(e.message || 'Not found'));
  }, [id]);

  return (
    <div className="container">
      <div className="header">
        <Link className="btn" to={`/plants/${id}`}>Back</Link>
        <span className="badge">Edit</span>
      </div>

      {err && <p className="error">{err}</p>}
      {!plant && !err && <p>Loading...</p>}

      {plant && (
        <>
          <h2>Edit Plant</h2>
          <PlantForm
            initial={plant}
            submitText="Save changes"
            onSubmit={async (values) => {
              await PlantsAPI.update(id, values);
              nav(`/plants/${id}`);
            }}
          />
        </>
      )}
    </div>
  );
}
