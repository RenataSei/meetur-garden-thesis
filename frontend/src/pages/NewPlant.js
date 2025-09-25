// NewPlant.js

import { useState } from 'react';
import { PlantsAPI } from '../api';

export default function NewPlant() {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const newPlant = { name, type, description };

    try {
      const data = await PlantsAPI.create(newPlant);  // Sending data to the API to create a new plant
      console.log('Plant created:', data);
      // Optionally redirect or reset form
    } catch (e) {
      setError('Failed to create plant');
    }
  };

  return (
    <div className="new-plant-form">
      <h2>Add New Plant</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Plant Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Plant Type"
          value={type}
          onChange={(e) => setType(e.target.value)}
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button type="submit">Add Plant</button>
      </form>
    </div>
  );
}
