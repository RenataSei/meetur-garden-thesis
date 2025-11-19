import { Link } from 'react-router-dom';

export default function PlantCard({ plant, onDelete }) {
  // Safe access for the common name (since it's an array)
  // We take the first name in the list, or fallback if empty
  const displayName = plant.common_name && plant.common_name.length > 0 
    ? plant.common_name[0] 
    : "Unnamed Plant";

  return (
    <div className="card">
      {/* FIXED: Use the variable we defined above */}
      <h3>{displayName}</h3>
      
      {/* FIXED: Use 'scientific_name' instead of 'species' */}
      <p><i>{plant.scientific_name}</i></p>
      
      {/* Description is fine, but good to keep the safe check */}
      <p>{(plant.description || '').slice(0, 100)}...</p>
      
      <div className="row">
        <Link className="btn" to={`/plants/${plant._id}`}>Open</Link>
        <button className="btn danger" onClick={() => onDelete(plant._id)}>Delete</button>
      </div>
    </div>
  );
}