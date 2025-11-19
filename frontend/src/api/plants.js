// src/api/plants.js
export const API_BASE = "/api/plants";

// Helper function to handle errors and parsing
async function jsonOrThrow(res) {
  const raw = await res.text().catch(() => "");
  if (!res.ok) {
    const msg = raw || `Request failed with ${res.status}`;
    throw new Error(msg);
  }
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// --- 1. Get ALL Plants (Added this) ---
export async function getAllPlants() {
  const res = await fetch(API_BASE, {
    method: "GET",
    credentials: "omit",
  });
  return jsonOrThrow(res);
}

// --- 2. Create Plant ---
export async function createPlant(payload) {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "omit",
    body: JSON.stringify(payload),
  });
  return jsonOrThrow(res);
}

// --- 3. Get Single Plant ---
export async function getPlant(id) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "GET",
    credentials: "omit",
  });
  return jsonOrThrow(res);
}

// --- 4. Update Plant (FIXED: Changed PUT to PATCH) ---
export async function updatePlant(id, payload) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "PATCH", // <--- IMPORTANT: Must match your backend route!
    headers: { "Content-Type": "application/json" },
    credentials: "omit",
    body: JSON.stringify(payload),
  });
  return jsonOrThrow(res);
}

// --- 5. Delete Plant (Added this) ---
export async function deletePlant(id) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "DELETE",
    credentials: "omit",
  });
  return jsonOrThrow(res);
}