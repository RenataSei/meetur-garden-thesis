import { Link } from 'react-router-dom';

export default function PlantCard({ plant, onDelete }){
  const typeClass = (plant.species || '').toLowerCase();
  return (
    <article className="card">
      <h3>{plant.name}</h3>
      <p className="muted">
        {plant.species && <span className={`badge ${typeClass}`}>{plant.species}</span>}
      </p>
      <p>{plant.description}</p>
      <div className="row gap">
        <Link to={`/plants/${plant._id}`} className="btn">View</Link>
        <Link to={`/plants/${plant._id}/edit`} className="btn info">Edit</Link>
        <button className="btn danger" onClick={() => onDelete?.(plant._id)}>Delete</button>
      </div>
    </article>
  );
}
