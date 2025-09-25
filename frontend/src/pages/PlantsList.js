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

  useEffect(() => {
    load();  // Fetch data when the component mounts
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="plants-list">
      {plants.map((plant) => (
        <PlantCard key={plant._id} plant={plant} />
      ))}
    </div>
  );
}
