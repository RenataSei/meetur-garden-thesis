// frontend/src/api.js
const API_BASE = process.env.REACT_APP_API_BASE || '/api';

async function handle(res) {
  const ct = res.headers.get('content-type') || '';
  if (!res.ok) {
    // Prefer JSON error if available
    if (ct.includes('application/json')) {
      const data = await res.json().catch(() => ({}));
      const msg = data?.error || JSON.stringify(data) || `HTTP ${res.status}`;
      throw new Error(msg);
    } else {
      const text = await res.text();
      // surface first part so you can see if you got an HTML page
      throw new Error(`Non-JSON response (status ${res.status}): ${text.slice(0, 200)}`);
    }
  }
  if (ct.includes('application/json')) {
    return res.json();
  } else {
    const text = await res.text();
    throw new Error(`Expected JSON but got non-JSON: ${text.slice(0, 200)}`);
  }
}

export const PlantsAPI = {
  list: () => fetch(`${API_BASE}/plants`).then(handle),
  get: (id) => fetch(`${API_BASE}/plants/${id}`).then(handle),
  create: (payload) =>
    fetch(`${API_BASE}/plants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(handle),
  update: (id, payload) =>
    fetch(`${API_BASE}/plants/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(handle),
  delete: (id) =>
    fetch(`${API_BASE}/plants/${id}`, { method: 'DELETE' }).then(handle)
};
