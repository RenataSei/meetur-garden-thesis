// src/components/PlantForm.js
import { useEffect, useMemo, useState } from "react";

/**
 * Form aligned with backend plantSchema.
 * UPDATED: Now includes 'genus_name' required by the CreatePlant controller.
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
  background: linear-gradient(90deg, rgba(153,246,228,.05), rgba(94,234,212,.04));
}
.plant-form-card header h1 {
  font-size: 20px;
  letter-spacing: .06em;
  text-transform: uppercase;
  margin: 0 0 4px;
}
.plant-form-card header .sub {
  font-size: 13px;
  opacity: .85;
}
.plant-form-card header .small {
  font-size: 11px;
  opacity: .7;
}
.plant-form-card form {
  padding: 18px 18px 20px;
}
.grid-2 {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
  gap: 18px;
}
.grid-1 {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 18px;
}
.section {
  background: radial-gradient(circle at top left, rgba(148, 163, 184, .28), rgba(15,23,42,.96));
  border-radius: 14px;
  border: 1px solid rgba(148,163,184,.35);
  padding: 14px 14px 10px;
  box-shadow: inset 0 0 0 1px rgba(15,23,42,.9);
}
.section + .section {
  margin-top: 14px;
}
.section-title-row {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 8px;
}
.section-title {
  font-size: 13px;
  letter-spacing: .18em;
  text-transform: uppercase;
  opacity: .8;
}
.section-tag {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(15,23,42,.8);
  border: 1px solid rgba(148,163,184,.55);
}
.fields {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 10px;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.field:last-child { margin-bottom: 0; }
.label-row { display: flex; align-items: center; justify-content: space-between; }
.label-row label { font-size: 14px; }
.req { font-size: 11px; opacity: .75; }

input[type="text"], textarea, select {
  width: 100%;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,.16);
  padding: 10px 12px;
  background: rgba(12,20,32,.70);
  color: #e9f0ff;
  outline: none;
}
input[type="text"]:focus, textarea:focus, select:focus {
  border-color: rgba(120,180,255,.55);
  box-shadow: 0 0 0 3px rgba(120,180,255,.18);
}
textarea { min-height: 90px; resize: vertical; }

/* Compact textareas */
.ta-sm { min-height: 60px; }

.footer {
  margin-top: 18px;
  padding-top: 14px;
  border-top: 1px solid rgba(148,163,184,.35);
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
.btn {
  min-width: 112px;
  padding: 8px 16px;
  border-radius: 10px;
  border: 1px solid rgba(148,163,184,.7);
  background: rgba(15,23,42,.9);
  color: #e5edff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}
.btn[disabled] {
  opacity: .55;
  cursor: default;
}
.btn:hover { filter: brightness(1.05); }
.btn.primary { background: linear-gradient(180deg, #6bd18a, #8fd081); color: #07141b; border: none; }
.error { color: #ff8c8c; font-size: 12px; }
.helper { font-size: 12px; opacity: .8; }
.small { font-size: 12px; opacity: .9; }
.section-title {
  grid-column: 1 / -1;
  font-size: 13px;
  letter-spacing: .18em;
  text-transform: uppercase;
  opacity: .8;
}
@media (max-width: 900px) {
  .grid-2 {
    grid-template-columns: minmax(0, 1fr);
  }
}
`;

// Field definitions, grouped visually in the form layout
const fields = [
  // Basic info
  ["Genus Name", "genus_name", false], // ADDED
  ["Common Name(s)", "common_name", false],
  ["Scientific Name", "scientific_name", false],
  ["Family", "family", false],
  ["Description", "description", true],
  ["Height (cm)", "height", false],
  ["Maintenance Level", "maintenance_level", false],
  ["Life Cycle", "life_cycle", false],

  // Flower descriptors
  ["Color", "color", false],
  ["Flower Inflorescence", "flower_inflorescence", false],
  ["Value", "value", false],
  ["Bloom Time", "bloom_time", false],

  // Ecological descriptors
  ["Luminance Level", "luminance_level", false],
  ["pH Level", "pH_level", false],
  ["Humidity Level", "humidity_level", false],
  ["Water Frequency", "water_frequency", false],
  ["Temperature Range", "temperature_range", false],

  // Other notes (optional)
  ["Pests Diseases Notes", "pests_diseases_notes", true],
  ["Propagation Notes", "propagation_notes", true],
  ["Invasive Species Notes", "invasive_species_notes", true],
  ["Conservation Status Notes", "conservation_status_notes", true],
  ["Local Permits Notes", "local_permits_notes", true],
];

// Keys that are required according to the backend schema
const REQUIRED_KEYS = new Set([
  "genus_name", // ADDED
  "common_name",
  "scientific_name",
  "family",
  "description",
  "height",
  "maintenance_level",
  "life_cycle",
  "color",
  "flower_inflorescence",
  "value",
  "bloom_time",
  "luminance_level",
  "pH_level",
  "humidity_level",
  "water_frequency",
  "temperature_range",
]);

// Fields that should be rendered as dropdowns with predefined options
const SELECT_OPTIONS = {
  maintenance_level: ["Low", "Moderate", "High"],
  life_cycle: ["Annual", "Biennial", "Perennial"],
  humidity_level: ["Low", "Moderate", "High"],
  conservation_status_notes: [
    "Least concern",
    "Near threatened",
    "Vulnerable",
    "Endangered",
    "Critically endangered",
    "Extinct in the wild",
  ],
};

// Textareas that should be compact
const COMPACT_TA = new Set([
  "description",
  "pests_diseases_notes",
  "propagation_notes",
  "invasive_species_notes",
  "conservation_status_notes",
  "local_permits_notes",
]);

function parseCommonNames(raw) {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export default function PlantForm({
  mode = "create",
  initialData = null,
  onCancel,
  onSubmit,
  title = "Plant",
  sub = "Please complete all required fields",
  simpleLayout = false, // kept for compatibility
}) {
  const blank = useMemo(() => {
    const obj = {};
    fields.forEach(([, k]) => {
      obj[k] = "";
    });
    return obj;
  }, []);

  const [data, setData] = useState(blank);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!initialData) return;

    const next = { ...blank };

    // Basic mapping
    next.genus_name = initialData.genus_name || "";
    next.common_name = Array.isArray(initialData.common_name)
      ? initialData.common_name.join(", ")
      : initialData.common_name || "";
    next.scientific_name = initialData.scientific_name || "";
    next.family = initialData.family || "";
    next.description = initialData.description || "";
    next.height =
      initialData.height === 0 || initialData.height
        ? String(initialData.height)
        : "";

    next.maintenance_level = initialData.maintenance_level || "";
    next.life_cycle = initialData.life_cycle || "";

    // Flower descriptors
    const flower = initialData.flower_descriptors || {};
    next.color = flower.color || "";
    next.flower_inflorescence = flower.flower_inflorescence || "";
    next.value = flower.value || "";
    next.bloom_time = flower.bloom_time || "";

    // Ecological descriptors
    const eco = initialData.ecological_descriptors || {};
    next.luminance_level = eco.luminance_level || "";
    next.pH_level = eco.pH_level || "";
    next.humidity_level = eco.humidity_level || "";
    next.water_frequency = eco.water_frequency || "";
    next.temperature_range = eco.temperature_range || "";

    // Other notes
    const notes = initialData.other_notes || {};
    next.pests_diseases_notes = notes.pests_diseases_notes || "";
    next.propagation_notes = notes.propagation_notes || "";
    next.invasive_species_notes = notes.invasive_species_notes || "";
    next.conservation_status_notes = notes.conservation_status_notes || "";
    next.local_permits_notes = notes.local_permits_notes || "";

    setData(next);
  }, [initialData, blank]);

  function setField(key, value) {
    setData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  }

  function validate() {
    const errs = {};

    for (const [label, key] of fields) {
      const required = REQUIRED_KEYS.has(key);
      let value = data[key];

      if (typeof value === "string") {
        value = value.trim();
      }

      if (required && (!value && value !== 0)) {
        errs[key] = `${label} is required`;
        continue;
      }

      if (key === "height") {
        if (value && Number.isNaN(Number(value))) {
          errs[key] = "Height must be a number";
        }
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    try {
      setBusy(true);

      const heightRaw = data.height.trim();
      const heightNum =
        heightRaw === "" ? 0 : Number.isNaN(Number(heightRaw)) ? 0 : Number(heightRaw);

      const flower_descriptors = {
        color: data.color.trim(),
        flower_inflorescence: data.flower_inflorescence.trim(),
        value: data.value.trim(),
        bloom_time: data.bloom_time.trim(),
      };

      const ecological_descriptors = {
        luminance_level: data.luminance_level.trim(),
        pH_level: data.pH_level.trim(),
        humidity_level: data.humidity_level.trim(),
        water_frequency: data.water_frequency.trim(),
        temperature_range: data.temperature_range.trim(),
      };

      const other_notes = {
        pests_diseases_notes: data.pests_diseases_notes.trim(),
        propagation_notes: data.propagation_notes.trim(),
        invasive_species_notes: data.invasive_species_notes.trim(),
        conservation_status_notes: data.conservation_status_notes.trim(),
        local_permits_notes: data.local_permits_notes.trim(),
      };

      const payload = {
        genus_name: data.genus_name.trim(),
        common_name: parseCommonNames(data.common_name),
        scientific_name: data.scientific_name.trim(),
        family: data.family.trim(),
        description: data.description.trim(),
        height: heightNum,
        maintenance_level: data.maintenance_level.trim(),
        life_cycle: data.life_cycle.trim(),
        flower_descriptors,
        ecological_descriptors,
        other_notes,
      };

      await onSubmit(payload);
    } catch (err) {
      alert(err.message || "Save failed");
    } finally {
      setBusy(false);
    }
  }

  function renderField(key) {
    const fieldDef = fields.find((f) => f[1] === key);
    if (!fieldDef) return null;
    const [label, , multiDefault] = fieldDef;
    const isTextArea = multiDefault;
    const isCompact = isTextArea && COMPACT_TA.has(key);
    const isRequired = REQUIRED_KEYS.has(key);

    let placeholder = `Enter ${label.toLowerCase()}`;
    if (key === "common_name") {
      placeholder = "Enter common name(s), separated by commas";
    } else if (key === "height") {
      placeholder = "Enter height in centimeters";
    }

    return (
      <div className="field" key={key}>
        <div className="label-row">
          <label htmlFor={key}>{label}</label>
          {isRequired && <span className="req">required</span>}
        </div>
        {isTextArea ? (
          <textarea
            id={key}
            className={isCompact ? "ta-sm" : ""}
            value={data[key]}
            onChange={(e) => setField(key, e.target.value)}
            placeholder={placeholder}
          />
        ) : SELECT_OPTIONS[key] ? (
          <select
            id={key}
            value={data[key]}
            onChange={(e) => setField(key, e.target.value)}
          >
            <option value="">Select {label.toLowerCase()}</option>
            {SELECT_OPTIONS[key].map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        ) : (
          <input
            id={key}
            type="text"
            value={data[key]}
            onChange={(e) => setField(key, e.target.value)}
            placeholder={placeholder}
          />
        )}
        {errors[key] ? (
          <div className="error">{errors[key]}</div>
        ) : (
          <div className="helper"></div>
        )}
      </div>
    );
  }

  return (
    <div>
      <style>{styles}</style>
      <form className="plant-form-card" onSubmit={handleSubmit} noValidate>
        <header>
          <div>
            <h1>{mode === "edit" ? `Edit ${title}` : `Create ${title}`}</h1>
            <div className="sub">{sub}</div>
          </div>
          <div className="small">Fields marked as required must be filled</div>
        </header>

        <div className={simpleLayout ? "grid-1" : "grid-2"}>
          <div className="section">
            <div className="section-title-row">
              <div className="section-title">Basic information</div>
              <div className="section-tag">Identity</div>
            </div>
            <div className="fields">
              {[
                "genus_name",
                "common_name",
                "scientific_name",
                "family",
                "description",
                "height",
                "maintenance_level",
                "life_cycle",
              ].map((key) => renderField(key))}
            </div>
          </div>

          <div className="section">
            <div className="section-title-row">
              <div className="section-title">Flower descriptors</div>
              <div className="section-tag">Structure</div>
            </div>
            <div className="fields">
              {["color", "flower_inflorescence", "value", "bloom_time"].map(
                (key) => renderField(key)
              )}
            </div>
          </div>
        </div>

        <div className={simpleLayout ? "grid-1" : "grid-2"}>
          <div className="section">
            <div className="section-title-row">
              <div className="section-title">Ecological descriptors</div>
              <div className="section-tag">Environment</div>
            </div>
            <div className="fields">
              {[
                "luminance_level",
                "pH_level",
                "humidity_level",
                "water_frequency",
                "temperature_range",
              ].map((key) => renderField(key))}
            </div>
          </div>

          <div className="section">
            <div className="section-title-row">
              <div className="section-title">Other notes</div>
              <div className="section-tag">Additional</div>
            </div>
            <div className="fields">
              {[
                "pests_diseases_notes",
                "propagation_notes",
                "invasive_species_notes",
                "conservation_status_notes",
                "local_permits_notes",
              ].map((key) => renderField(key))}
            </div>
          </div>
        </div>

        <div className="footer">
          {onCancel && (
            <button
              type="button"
              className="btn"
              onClick={onCancel}
              disabled={busy}
            >
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
