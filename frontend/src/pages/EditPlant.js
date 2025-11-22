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
  const [isEditing, setIsEditing] = useState(false); // preview first, then edit

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
          Tip: The URL should look like{" "}
          <code>/plants/671a6fe2d08d1b3a9c0b9e12/edit</code>, not{" "}
          <code>/plants/:id/edit</code>.
        </div>
      </div>
    );

  if (!initial) {
    return (
      <div style={{ padding: 16 }}>
        No data found for this plant.
        <div style={{ marginTop: 12 }}>
          <button onClick={() => navigate("/plants")}>Back to list</button>
        </div>
      </div>
    );
  }

  // Simple helper to display values nicely in preview mode
  function renderValue(value) {
    if (Array.isArray(value)) {
      return value.join(", ");
    }
    if (value === null || value === undefined) {
      return "";
    }
    if (typeof value === "object") {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  }

  // Keys you probably do not want to show in preview
  const hiddenKeys = ["_id", "__v"];

  return (
    <div style={{ padding: "20px 16px" }}>
      {!isEditing ? (
        // ================= PREVIEW MODE =================
        <div>
          <h1 style={{ marginBottom: 4 }}>Plant Preview</h1>
          <p style={{ marginTop: 0, marginBottom: 16, color: "#64748b" }}>
            Below is the stored data for this plant. Click Edit to modify.
          </p>

          <div
            style={{
              border: "1px solid #1f2933",
              borderRadius: 8,
              padding: 16,
              background: "#020617",
              color: "#e5e5e5",
              maxWidth: 900,
            }}
          >
            {Object.entries(initial)
              .filter(([key]) => !hiddenKeys.includes(key))
              .map(([key, value]) => (
                <div
                  key={key}
                  style={{
                    marginBottom: 12,
                    borderBottom: "1px solid #111827",
                    paddingBottom: 8,
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "#9ca3af",
                      marginBottom: 4,
                    }}
                  >
                    {key.replace(/_/g, " ")}
                  </div>
                  <div style={{ whiteSpace: "pre-wrap", fontSize: 14 }}>
                    {renderValue(value) || <span style={{ color: "#6b7280" }}>No data</span>}
                  </div>
                </div>
              ))}
          </div>

          <div style={{ marginTop: 20, display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              style={{
                padding: "8px 16px",
                borderRadius: 6,
                border: "none",
                background:
                  "linear-gradient(to right, #22c55e, #16a34a)",
                color: "white",
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => navigate("/plants")}
              style={{
                padding: "8px 16px",
                borderRadius: 6,
                border: "1px solid #4b5563",
                background: "transparent",
                color: "#e5e7eb",
                cursor: "pointer",
              }}
            >
              Back
            </button>
          </div>
        </div>
      ) : (
        // ================= EDIT MODE (EXISTING FORM) =================
        <PlantForm
          mode="edit"
          title="Plant"
          sub="Update the fields then save"
          simpleLayout={true}
          initialData={initial}
          onCancel={() => navigate("/plants")}
          onSubmit={handleUpdate}
        />
      )}
    </div>
  );
}
