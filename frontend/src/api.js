const API_BASE = process.env.REACT_APP_API_BASE || '/api';

async function handle(res) {
  const ct = res.headers.get('content-type') || '';
  if (!res.ok) {
    // Prefer JSON error if available
    if (ct.includes('application/json')) {
      const data = await res.json().catch(() => ({}));
      // Your backend sends { error: "message" }, so we look for data.error
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

// --- PLANTS API ---
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
      method: 'PATCH', // Matches your backend!
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(handle),
  delete: (id) =>
    fetch(`${API_BASE}/plants/${id}`, { method: 'DELETE' }).then(handle)
};

// --- GENERA API (Added this) ---
export const GeneraAPI = {
  // GET /api/genera
  list: () => fetch(`${API_BASE}/genera`).then(handle),
  
  // GET /api/genera/:name (e.g., /api/genera/Anthurium)
  get: (name) => fetch(`${API_BASE}/genera/${name}`).then(handle)
};

// --- WEATHER API (Added this) ---
export const WeatherAPI = {
  // GET /api/weather?city=Manila OR /api/weather?lat=...&lon=...
  get: (params) => {
    // Create query string (e.g., ?city=Manila)
    const queryString = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/weather?${queryString}`).then(handle);
  }
};