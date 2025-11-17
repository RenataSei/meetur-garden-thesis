import { Link } from 'react-router-dom';

export default function PlantCard({ plant, onDelete }) {
  return (
    <div className="card">
      <h3>{plant.name}</h3>
      <p>{plant.species}</p>
      <p>{(plant.description || '').slice(0, 140)}</p>
      <div className="row">
        <Link className="btn" to={`/plants/${plant._id}`}>Open</Link>
        <button className="btn danger" onClick={() => onDelete(plant._id)}>Delete</button>
      </div>
    </div>
  );
}
