// src/pages/EditPlant.js
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PlantForm from "../components/PlantForm";
import { getPlant, updatePlant } from "../api/plants";

export default function EditPlant() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initial, setInitial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Basic guard in case user goes directly to /plants/:id/edit without a valid id
  const idLooksInvalid = useMemo(() => {
    if (!id) return true;
    if (id === ":id") return true;
    if (id.includes(":")) return true;
    return false;
  }, [id]);

  useEffect(() => {
    if (idLooksInvalid) {
      setLoading(false);
      setErr(
        "No plant id provided. Please open this page from the Edit button in the plant list."
      );
      return;
    }

    let alive = true;

    (async () => {
      try {
        const item = await getPlant(id);
        if (alive) {
          setInitial(item);
          setErr("");
        }
      } catch (e) {
        if (alive) {
          setErr(e.message || "Failed to load plant");
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    })();

    return () => {
      alive = false;
    };
  }, [idLooksInvalid, id]);

  async function handleUpdate(payload) {
    await updatePlant(id, payload);
    navigate("/plants");
  }

  if (loading) {
    return <div style={{ padding: 16 }}>Loading...</div>;
  }

  if (err) {
    return (
      <div style={{ padding: 16, color: "red" }}>
        {err}
      </div>
    );
  }

  if (!initial) {
    return (
      <div style={{ padding: 16 }}>
        Plant not found.
      </div>
    );
  }

  // Directly show the edit form (no more preview here)
  return (
    <div style={{ padding: "20px 16px" }}>
      <h1 style={{ marginBottom: 12 }}>Edit Plant</h1>
      <PlantForm
        mode="edit"
        title="Plant"
        sub="Update the fields then save"
        simpleLayout={true}
        initialData={initial}
        onCancel={() => navigate("/plants")}
        onSubmit={handleUpdate}
      />
    </div>
  );
}
