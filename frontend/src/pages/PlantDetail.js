import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PlantsAPI } from '../api';

export default function PlantDetail() {
  const { id } = useParams();
  const [plant, setPlant] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    PlantsAPI.get(id).then(setPlant).catch((e) => setErr(e.message || 'Not found'));
  }, [id]);

  return (
    <div className="container">
      <div className="header">
        <Link className="btn" to="/plants">Back</Link>
        <span className="badge">Detail</span>
      </div>

      {err && <p className="error">{err}</p>}
      {!plant && !err && <p>Loading...</p>}

      {plant && (
        <>
          <h2>{plant.name}</h2>
          <p><b>Species: </b>{plant.species}</p>
          <p>{plant.description}</p>
          <div className="row">
            <Link className="btn brand" to={`/plants/${plant._id}/edit`}>Edit</Link>
          </div>
        </>
      )}
    </div>
  );
}
