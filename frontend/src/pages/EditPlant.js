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

  const idLooksInvalid = useMemo(() => {
    if (!id) return true;
    if (id === ":id") return true;
    if (id.includes(":")) return true;
    return false;
  }, [id]);

  useEffect(() => {
    if (idLooksInvalid) {
      setLoading(false);
      setErr("No plant id provided. Please open this page from the Edit button in the plant list.");
      return;
    }

    let alive = true;
    (async () => {
      try {
        const item = await getPlant(id);
        if (alive) setInitial(item);
      } catch (e) {
        setErr(e.message || "Failed to load plant");
      } finally {
        if (alive) setLoading(false);
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

  if (loading) return <div style={{ padding: 16 }}>Loading...</div>;
  if (err)
    return (
      <div style={{ padding: 16, color: "#ff8c8c" }}>
        {err}
        <div style={{ marginTop: 8 }}>
          Tip: The URL should look like <code>/plants/671a6fe2d08d1b3a9c0b9e12/edit</code>, not{" "}
          <code>/plants/:id/edit</code>.
        </div>
      </div>
    );

  return (
    <div style={{ padding: "20px 16px" }}>
      <PlantForm
        mode="edit"
        title="Plant"
        sub="Update the fields then save"
        simpleLayout={true}         // now same flat aesthetic layout
        initialData={initial}
        onCancel={() => navigate("/plants")}
        onSubmit={handleUpdate}
      />
    </div>
  );
}
