// NewPlant.js
import { useState } from 'react';
import { PlantsAPI } from '../api';
import SidebarMenu from '../components/SidebarMenu';

export default function NewPlant() {
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newPlant = { name, species, description };

    try {
      await PlantsAPI.create(newPlant);
      window.location.href = '/plants';
    } catch (err) {
      setError(err.message || 'Failed to create plant');
    }
  };

  return (
    <div className="app-grid">
      <section>
        <h1 style={{marginTop:0}}>New Plant</h1>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit} className="card">
          <input
            placeholder="Plant Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            placeholder="Species"
            value={species}
            onChange={(e) => setSpecies(e.target.value)}
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
          />
          <button type="submit" className="btn">Add Plant</button>
        </form>
      </section>

      <SidebarMenu />
    </div>
  );
}
