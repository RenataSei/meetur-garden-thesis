// PlantsList.js

import { useEffect, useState } from 'react';
import PlantCard from '../components/PlantCard';
import { PlantsAPI } from '../api';

export default function PlantsList() {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load plants data from the backend
  async function load() {
    try {
      setLoading(true);
      const data = await PlantsAPI.list();  // Fetching plants from the API
      setPlants(data);
      setError('');
    } catch (e) {
      setError('Failed to load plants');
    } finally {
      setLoading(false);
    }
  }

  // Handle delete operation
  async function handleDelete(id) {
    try {
      await PlantsAPI.delete(id); // Call the API to delete the plant
      setPlants(plants.filter((plant) => plant._id !== id)); // Remove the deleted plant from state
    } catch (e) {
      setError('Failed to delete plant');
    }
  }

  useEffect(() => {
    load();  // Fetch data when the component mounts
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="plants-list">
      {plants.map((plant) => (
        <PlantCard 
          key={plant._id} 
          plant={plant} 
          onDelete={handleDelete}  // Pass the handleDelete function to the PlantCard component
        />
      ))}
    </div>
  );
}
