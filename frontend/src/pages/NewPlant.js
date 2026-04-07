// src/pages/NewPlant.js
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PlantForm from "../components/PlantForm";
import { createPlant } from "../api/plants";
import { PlantsAPI } from "../api";

export default function NewPlant() {
  const navigate = useNavigate();
  const [dbFamilies, setDbFamilies] = useState([]);
  const [isAddingNewFamily, setIsAddingNewFamily] = useState(false);

  useEffect(() => {
    PlantsAPI.getFamilies()
      .then(data => setDbFamilies(data))
      .catch(err => console.error("Failed to load families", err));
  }, []);

  async function handleCreate(payload) {
    try {
      await createPlant(payload);
      navigate("/plants"); // go back to Manage Garden list
    } catch (err) {
      // Show backend message, for example "Access denied. Admins only."
      alert(err.message || "Failed to create plant");
    }
  }

  return (
    <div style={{ padding: "20px 16px" }}>
      <PlantForm
        mode="create"
        title="Plant"
        sub="Fill in all required fields"
        simpleLayout={true}
        onCancel={() => navigate("/plants")}
        onSubmit={handleCreate}
      />
    </div>
  );
}
