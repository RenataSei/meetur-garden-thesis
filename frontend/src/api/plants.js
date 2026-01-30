// src/api/plants.js
// Thin wrapper around PlantsAPI so all plant requests use the same auth logic

import { PlantsAPI } from "../api";

// --- 1. Get All Plants ---
export async function getAllPlants() {
  // This is not currently used by your pages, but we keep it for completeness
  return PlantsAPI.list();
}

// --- 2. Create Plant ---
export async function createPlant(payload) {
  return PlantsAPI.create(payload);
}

// --- 3. Get Single Plant ---
export async function getPlant(id) {
  return PlantsAPI.get(id);
}

// --- 4. Update Plant ---
export async function updatePlant(id, payload) {
  return PlantsAPI.update(id, payload);
}

// --- 5. Delete Plant ---
export async function deletePlant(id) {
  return PlantsAPI.delete(id);
}
