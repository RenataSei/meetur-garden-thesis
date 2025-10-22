const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:3000/api';

export const PlantsAPI = {
  // list all plants
  list: async () => {
    const response = await fetch(`${API_BASE}/plants`);
    if (!response.ok) throw new Error('Failed to fetch plants');
    return await response.json();
  },

  // get one plant
  get: async (id) => {
    const response = await fetch(`${API_BASE}/plants/${id}`);
    if (!response.ok) throw new Error('Failed to fetch plant');
    return await response.json();
  },

  // create a plant
  create: async (plantData) => {
    const response = await fetch(`${API_BASE}/plants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(plantData),
    });
    if (!response.ok) {
      const t = await response.text().catch(() => '');
      throw new Error(t || 'Failed to create plant');
    }
    return await response.json();
  },

  // update a plant
  update: async (id, plantData) => {
    const response = await fetch(`${API_BASE}/plants/${id}`, {
      method: 'PATCH', // matches backend
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(plantData),
    });
    if (!response.ok) {
      const t = await response.text().catch(() => '');
      throw new Error(t || 'Failed to update plant');
    }
    return await response.json();
  },

  // delete a plant
  delete: async (id) => {
    const response = await fetch(`${API_BASE}/plants/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete plant');
    return await response.json();
  }
};
