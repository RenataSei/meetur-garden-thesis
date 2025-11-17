// src/pages/NewPlant.js
import { useNavigate } from "react-router-dom";
import PlantForm from "../components/PlantForm";
import { createPlant } from "../api/plants";

export default function NewPlant() {
  const navigate = useNavigate();

  async function handleCreate(payload) {
    await createPlant(payload);
    navigate("/plants"); // adjust if your list route differs
  }

  return (
    <div style={{ padding: "20px 16px" }}>
      <PlantForm
        mode="create"
        title="Plant"
        sub="Fill in all required fields"
        simpleLayout={true}          // flat, compact, centered 'Other Notes'
        onCancel={() => navigate("/plants")}
        onSubmit={handleCreate}
      />
    </div>
  );
}
