// api.js

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:4000/api';

export const PlantsAPI = {
  // Fetch all plants
  list: async () => {
    const response = await fetch(`${API_BASE}/plants`);
    if (!response.ok) {
      throw new Error('Failed to fetch plants');
    }
    return await response.json();
  },

  // Create a new plant
  create: async (plantData) => {
    const response = await fetch(`${API_BASE}/plants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(plantData),
    });
    if (!response.ok) {
      throw new Error('Failed to create plant');
    }
    return await response.json();
  }
};