// src/api/plants.js
export const API_BASE = "/api/plants";

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

export async function createPlant(payload) {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "omit",
    body: JSON.stringify(payload),
  });
  return jsonOrThrow(res);
}

export async function getPlant(id) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "GET",
    credentials: "omit",
  });
  return jsonOrThrow(res);
}

export async function updatePlant(id, payload) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "omit",
    body: JSON.stringify(payload),
  });
  return jsonOrThrow(res);
}
