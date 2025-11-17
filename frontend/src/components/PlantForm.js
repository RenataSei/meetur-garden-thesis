// src/components/PlantForm.js
import { useEffect, useMemo, useState } from "react";

/**
 * All fields required except other_notes (shown only if checkbox is ticked).
 * Compact textareas for long-text fields.
 * "Other Notes" is now centered for a more balanced visual layout.
 */

const styles = `
.plant-form-card {
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,.10);
  background: rgba(7, 14, 24, .35);
  backdrop-filter: saturate(140%) blur(6px);
  box-shadow: 0 18px 50px rgba(0,0,0,.35);
  overflow: hidden;
}
.plant-form-card header {
  padding: 16px 18px;
  display: flex; align-items: center; justify-content: space-between;
  border-bottom: 1px solid rgba(255,255,255,.10);
  background: linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,0));
}
.plant-form-card h1 { font-size: 18px; margin: 0; letter-spacing: .2px; }
.plant-form-card .sub { font-size: 13px; opacity: .85; }
.plant-form-content { padding: 16px; max-height: 70vh; overflow: auto; }
.form-grid { display: grid; gap: 12px; }
@media (min-width: 860px) {
  .form-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

.field { display: grid; gap: 6px; margin-bottom: 10px; }
.field:last-child { margin-bottom: 0; }
.label-row { display: flex; align-items: center; justify-content: space-between; }
.label-row label { font-size: 14px; }
.req { font-size: 11px; opacity: .75; }

input[type="text"], textarea {
  width: 100%;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,.16);
  padding: 10px 12px;
  background: rgba(12,20,32,.70);
  color: #e9f0ff;
  outline: none;
}
input[type="text"]:focus, textarea:focus {
  border-color: rgba(120,180,255,.55);
  box-shadow: 0 0 0 3px rgba(120,180,255,.18);
}
textarea { min-height: 90px; resize: vertical; }

/* Compact textarea style */
textarea.ta-sm {
  min-height: 64px;
  padding: 8px 10px;
  line-height: 1.25;
  font-size: 14px;
}

/* Centered “Other Notes” styling */
.other-notes-section {
  grid-column: span 2;
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
.other-notes-inner {
  width: 100%;
  max-width: 70%;
  text-align: center;
}
@media (max-width: 860px) {
  .other-notes-inner { max-width: 100%; }
}

.footer {
  padding: 12px 16px;
  border-top: 1px solid rgba(255,255,255,.10);
  background: linear-gradient(0deg, rgba(255,255,255,.06), rgba(255,255,255,0));
  display: flex; gap: 10px; justify-content: flex-end;
}
.btn {
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,.16);
  padding: 10px 14px;
  background: rgba(12,20,32,.70);
  color: #e9f0ff; cursor: pointer;
}
.btn:hover { filter: brightness(1.05); }
.btn.primary { background: linear-gradient(180deg, #6bd18a, #8fd081); color: #07141b; border: none; }
.error { color: #ff8c8c; font-size: 12px; }
.helper { font-size: 12px; opacity: .8; }
.checkbox-row { display: flex; align-items: center; gap: 8px; justify-content: center; }
.locked { opacity: .55; pointer-events: none; }
.small { font-size: 12px; opacity: .9; }
`;

const fields = [
  ["Genus Name", "genus_name", false],
  ["Common Name", "common_name", false],
  ["Scientific Name", "scientific_name", false],
  ["Family", "family", false],
  ["Description", "description", true],
  ["Height", "height", false],
  ["Maintenance Level", "maintenance_level", false],
  ["Life Cycle", "life_cycle", false],
  ["Flower Descriptors", "flower_descriptors", true],
  ["Color", "color", false],
  ["Flower Inflorescence", "flower_inflorescence", false],
  ["Value", "value", false],
  ["Bloom Time", "bloom_time", false],
  ["Ecological Descriptors", "ecological_descriptors", true],
  ["Luminance Level", "luminance_level", false],
  ["pH Level", "pH_level", false],
  ["Humidity Level", "humidity_level", false],
  ["Water Frequency", "water_frequency", false],
  ["Temperature Range", "temperature_range", false],
  ["Pests Diseases Notes", "pests_diseases_notes", true],
  ["Propagation Notes", "propagation_notes", true],
  ["Invasive Species Notes", "invasive_species_notes", true],
  ["Conservation Status Notes", "conservation_status_notes", true],
  ["Local Permits Notes", "local_permits_notes", true],
];

const OPTIONAL_KEY = "other_notes";
const COMPACT_TA = new Set([
  "description",
  "flower_descriptors",
  "ecological_descriptors",
  "pests_diseases_notes",
  "propagation_notes",
  "invasive_species_notes",
  "conservation_status_notes",
  "local_permits_notes",
  OPTIONAL_KEY,
]);

export default function PlantForm({
  mode = "create",
  initialData = null,
  onCancel,
  onSubmit,
  title = "Plant",
  sub = "Please complete all required fields",
  simpleLayout = false,
}) {
  const blank = useMemo(() => {
    const obj = {};
    fields.forEach(([, k]) => (obj[k] = ""));
    obj[OPTIONAL_KEY] = "";
    return obj;
  }, []);

  const [data, setData] = useState(blank);
  const [otherEnabled, setOtherEnabled] = useState(false);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (initialData) {
      const merged = { ...blank, ...initialData };
      setData(merged);
      setOtherEnabled(Boolean(merged[OPTIONAL_KEY]?.trim().length));
    }
  }, [initialData, blank]);

  function setField(key, value) {
    setData((d) => ({ ...d, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  }

  function validate() {
    const next = {};
    fields.forEach(([, key]) => {
      if (!data[key]?.trim()) next[key] = "Required";
    });
    if (otherEnabled && !data[OPTIONAL_KEY]?.trim()) {
      next[OPTIONAL_KEY] = "Please enter a note or untick the checkbox";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    try {
      setBusy(true);
      const payload = { ...data };
      if (!otherEnabled) payload[OPTIONAL_KEY] = "";
      await onSubmit(payload);
    } catch (err) {
      alert(err.message || "Save failed");
    } finally {
      setBusy(false);
    }
  }

  function renderField(key) {
    const [label, , multiDefault] = fields.find((f) => f[1] === key);
    const isTextArea = multiDefault;
    const isCompact = isTextArea && COMPACT_TA.has(key);
    return (
      <div className="field" key={key}>
        <div className="label-row">
          <label htmlFor={key}>{label}</label>
          <span className="req">required</span>
        </div>
        {isTextArea ? (
          <textarea
            id={key}
            className={isCompact ? "ta-sm" : ""}
            value={data[key]}
            onChange={(e) => setField(key, e.target.value)}
            placeholder={`Enter ${label.toLowerCase()}`}
          />
        ) : (
          <input
            id={key}
            type="text"
            value={data[key]}
            onChange={(e) => setField(key, e.target.value)}
            placeholder={`Enter ${label.toLowerCase()}`}
          />
        )}
        {errors[key] ? <div className="error">{errors[key]}</div> : <div className="helper"></div>}
      </div>
    );
  }

  const flatOrder = [
    "genus_name",
    "common_name",
    "scientific_name",
    "family",
    "description",
    "height",
    "maintenance_level",
    "life_cycle",
    "water_frequency",
    "humidity_level",
    "luminance_level",
    "pH_level",
    "temperature_range",
    "bloom_time",
    "value",
    "flower_descriptors",
    "color",
    "flower_inflorescence",
    "ecological_descriptors",
    "pests_diseases_notes",
    "propagation_notes",
    "invasive_species_notes",
    "conservation_status_notes",
    "local_permits_notes",
  ];

  return (
    <div>
      <style>{styles}</style>
      <form className="plant-form-card" onSubmit={handleSubmit} noValidate>
        <header>
          <div>
            <h1>{mode === "edit" ? `Edit ${title}` : `Create ${title}`}</h1>
            <div className="sub">{sub}</div>
          </div>
          <div className="small">All fields required except Other Notes</div>
        </header>

        <div className="plant-form-content">
          <div className="form-grid">
            {flatOrder.map((key) => renderField(key))}

            {/* Centered Other Notes */}
            <div className="other-notes-section">
              <div className="other-notes-inner">
                <div className="label-row" style={{ justifyContent: "center" }}>
                  <label htmlFor={OPTIONAL_KEY} style={{ fontWeight: 500 }}>
                    Other Notes
                  </label>
                </div>
                <div className="checkbox-row" style={{ marginBottom: 6 }}>
                  <input
                    id="toggle-other"
                    type="checkbox"
                    checked={otherEnabled}
                    onChange={(e) => setOtherEnabled(e.target.checked)}
                  />
                  <label htmlFor="toggle-other" className="small">
                    Enable Other Notes
                  </label>
                </div>
                <div className={otherEnabled ? "" : "locked"}>
                  <textarea
                    id={OPTIONAL_KEY}
                    className="ta-sm"
                    value={data[OPTIONAL_KEY]}
                    onChange={(e) => setField(OPTIONAL_KEY, e.target.value)}
                    placeholder="Enter other notes (optional)"
                    disabled={!otherEnabled}
                  />
                </div>
                {errors[OPTIONAL_KEY] ? (
                  <div className="error">{errors[OPTIONAL_KEY]}</div>
                ) : (
                  <div className="helper"></div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="footer">
          {onCancel && (
            <button type="button" className="btn" onClick={onCancel} disabled={busy}>
              Cancel
            </button>
          )}
          <button type="submit" className="btn primary" disabled={busy}>
            {busy ? "Saving..." : mode === "edit" ? "Save Changes" : "Create Plant"}
          </button>
        </div>
      </form>
    </div>
  );
}
