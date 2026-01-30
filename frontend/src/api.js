// src/api.js

// Base URL for your backend.
// With your current setup this will be "/api" and CRA proxy will forward it.
export const API_BASE = process.env.REACT_APP_API_BASE || "/api";
const API_URL = "https://meetur-garden-thesis.onrender.com/api";
// Helper: read token from localStorage and build Authorization header
function getAuthHeaders() {
  const stored = localStorage.getItem("user");
  if (!stored) return {};

  try {
    const parsed = JSON.parse(stored);
    if (!parsed || !parsed.token) {
      return {};
    }

    return { Authorization: `Bearer ${parsed.token}` };
  } catch (err) {
    console.error("Failed to parse user from localStorage", err);
    return {};
  }
}

// Common response handler
async function handle(res) {
  const ct = res.headers.get("content-type") || "";

  if (!res.ok) {
    if (ct.includes("application/json")) {
      const data = await res.json().catch(() => ({}));
      const msg = data?.error || JSON.stringify(data) || `HTTP ${res.status}`;
      throw new Error(msg);
    } else {
      const text = await res.text();
      throw new Error(
        `Non JSON response (status ${res.status}): ${text.slice(0, 200)}`
      );
    }
  }

  if (ct.includes("application/json")) {
    return res.json();
  }

  return res.text();
}

// ---------------------------------------------------
// PLANTS API – all routes are protected by requireAuth
// ---------------------------------------------------

export const PlantsAPI = {
  // GET /api/plants
  // Optional: accept filters as query params later
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    const url = qs ? `${API_BASE}/plants?${qs}` : `${API_BASE}/plants`;

    return fetch(url, {
      headers: {
        ...getAuthHeaders()
      }
    })
      .then(handle)
      .then((data) => {
        // Backend returns { count, plants }
        if (data && Array.isArray(data.plants)) {
          return data.plants;
        }
        // If backend ever changes to return a bare array, still work
        if (Array.isArray(data)) return data;
        return [];
      });
  },

  // GET /api/plants/:id
  get: (id) =>
    fetch(`${API_BASE}/plants/${id}`, {
      headers: {
        ...getAuthHeaders()
      }
    }).then(handle),

  // POST /api/plants
  create: (payload) =>
    fetch(`${API_BASE}/plants`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders()
      },
      body: JSON.stringify(payload)
    }).then(handle),

  // PATCH /api/plants/:id
  update: (id, payload) =>
    fetch(`${API_BASE}/plants/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders()
      },
      body: JSON.stringify(payload)
    }).then(handle),

  // DELETE /api/plants/:id
  delete: (id) =>
    fetch(`${API_BASE}/plants/${id}`, {
      method: "DELETE",
      headers: {
        ...getAuthHeaders()
      }
    }).then(handle)
};

// ---------------------------------------------------
// GENERA API (optional helper if you use it later)
// ---------------------------------------------------

export const GeneraAPI = {
  // GET /api/genera
  list: () => fetch(`${API_BASE}/genera`).then(handle),

  // GET /api/genera/:name
  get: (name) =>
    fetch(`${API_BASE}/genera/${encodeURIComponent(name)}`).then(handle)
};

// ---------------------------------------------------
// WEATHER API (optional helper if you use it later)
// ---------------------------------------------------

export const WeatherAPI = {
  // GET /api/weather?city=Manila or other params
  get: (params) => {
    const queryString = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/weather?${queryString}`).then(handle);
  }
};

// ---------------------------------------------------
// GARDEN API (NEW - REQUIRED FOR THESIS)
// ---------------------------------------------------

export const GardenAPI = {
  // GET /api/garden - List user's plants
  list: () => 
    fetch(`${API_BASE}/garden`, { 
      headers: { ...getAuthHeaders() } 
    }).then(handle),
  
  // POST /api/garden - Add plant to garden
  add: (plant_id, nickname) => 
    fetch(`${API_BASE}/garden`, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders()
      },
      body: JSON.stringify({ plant_id, nickname })
    }).then(handle),

  // DELETE /api/garden/:id - Remove from garden
  // Note: 'id' here is the GARDEN ITEM ID, not the Plant ID
  remove: (id) => 
    fetch(`${API_BASE}/garden/${id}`, { 
      method: 'DELETE',
      headers: { ...getAuthHeaders() } 
    }).then(handle),

  // PATCH /api/garden/:id/action - Log care (water/sun)
  logAction: (id, action) => 
    fetch(`${API_BASE}/garden/${id}/action`, {
      method: 'PATCH',
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders()
      },
      body: JSON.stringify({ action })
    }).then(handle)
};
