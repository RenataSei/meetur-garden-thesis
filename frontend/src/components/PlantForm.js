// src/components/PlantForm.js
import { useEffect, useMemo, useState } from "react";

/**
 * Form aligned with backend plantSchema:
 * - common_name: [String]
 * - scientific_name: String
 * - family: String
 * - description: String
 * - height: Number (centimeters)
 * - maintenance_level: String
 * - life_cycle: String
 * - flower_descriptors: { color, flower_inflorescence, value, bloom_time }
 * - ecological_descriptors: {
 *     luminance_level,
 *     pH_level,
 *     humidity_level,
 *     water_frequency,
 *     temperature_range
 *   }
 * - other_notes (all optional, behind checkbox): {
 *     pests_diseases_notes,
 *     propagation_notes,
 *     invasive_species_notes,
 *     conservation_status_notes,
 *     local_permits_notes
 *   }
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
.small { font-size: 12px; opacity: .9; }
.section-title {
  grid-column: 1 / -1;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: .12em;
  opacity: .75;
  margin-top: 4px;
}
.checkbox-row {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 4px 0 8px;
  font-size: 13px;
}
`;

// [label, key, isMultiline]
const fields = [
  // Basic info
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
  const [otherEnabled, setOtherEnabled] = useState(false);

  // Flatten initialData from backend schema for edit mode
  useEffect(() => {
    if (!initialData) return;

    const next = { ...blank };

    next.common_name = Array.isArray(initialData.common_name)
      ? initialData.common_name.join(", ")
      : initialData.common_name || "";

    next.scientific_name = initialData.scientific_name || "";
    next.family = initialData.family || "";
    next.description = initialData.description || "";
    next.height =
      initialData.height !== undefined && initialData.height !== null
        ? String(initialData.height)
        : "";

    next.maintenance_level = initialData.maintenance_level || "";
    next.life_cycle = initialData.life_cycle || "";

    const fd = initialData.flower_descriptors || {};
    next.color = fd.color || "";
    next.flower_inflorescence = fd.flower_inflorescence || "";
    next.value = fd.value || "";
    next.bloom_time = fd.bloom_time || "";

    const ed = initialData.ecological_descriptors || {};
    next.luminance_level = ed.luminance_level || "";
    next.pH_level = ed.pH_level || "";
    next.humidity_level = ed.humidity_level || "";
    next.water_frequency = ed.water_frequency || "";
    next.temperature_range = ed.temperature_range || "";

    const on = initialData.other_notes || {};
    next.pests_diseases_notes = on.pests_diseases_notes || "";
    next.propagation_notes = on.propagation_notes || "";
    next.invasive_species_notes = on.invasive_species_notes || "";
    next.conservation_status_notes = on.conservation_status_notes || "";
    next.local_permits_notes = on.local_permits_notes || "";

    const hasOther =
      (on.pests_diseases_notes && on.pests_diseases_notes.trim().length > 0) ||
      (on.propagation_notes && on.propagation_notes.trim().length > 0) ||
      (on.invasive_species_notes && on.invasive_species_notes.trim().length > 0) ||
      (on.conservation_status_notes && on.conservation_status_notes.trim().length > 0) ||
      (on.local_permits_notes && on.local_permits_notes.trim().length > 0);

    setData(next);
    setOtherEnabled(hasOther);
  }, [initialData, blank]);

  function setField(key, value) {
    setData((d) => ({ ...d, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  }

  function validate() {
    const next = {};

    REQUIRED_KEYS.forEach((key) => {
      const value = data[key];
      if (!value || !String(value).trim()) {
        next[key] = "Required";
      }
    });

    // Extra validation for common_name
    const cnList = parseCommonNames(data.common_name);
    if (cnList.length === 0) {
      next.common_name = "Enter at least one common name (comma separated if multiple)";
    }

    // Height as number in centimeters
    if (!next.height) {
      const num = Number(data.height);
      if (Number.isNaN(num)) {
        next.height = "Height must be a number in centimeters";
      }
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    try {
      setBusy(true);

      const commonNames = parseCommonNames(data.common_name);
      const heightNum = data.height ? Number(data.height) : undefined;

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

      const other_notes = {};
      if (otherEnabled) {
        if (data.pests_diseases_notes.trim()) {
          other_notes.pests_diseases_notes = data.pests_diseases_notes.trim();
        }
        if (data.propagation_notes.trim()) {
          other_notes.propagation_notes = data.propagation_notes.trim();
        }
        if (data.invasive_species_notes.trim()) {
          other_notes.invasive_species_notes = data.invasive_species_notes.trim();
        }
        if (data.conservation_status_notes.trim()) {
          other_notes.conservation_status_notes = data.conservation_status_notes.trim();
        }
        if (data.local_permits_notes.trim()) {
          other_notes.local_permits_notes = data.local_permits_notes.trim();
        }
      }

      const payload = {
        common_name: commonNames,
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

        <div className="plant-form-content">
          <div className="form-grid">
            <div className="section-title">Basic Information</div>
            {[
              "common_name",
              "scientific_name",
              "family",
              "description",
              "height",
              "maintenance_level",
              "life_cycle",
            ].map((key) => renderField(key))}

            <div className="section-title">Flower Descriptors</div>
            {["color", "flower_inflorescence", "value", "bloom_time"].map((key) =>
              renderField(key)
            )}

            <div className="section-title">Ecological Descriptors</div>
            {[
              "luminance_level",
              "pH_level",
              "humidity_level",
              "water_frequency",
              "temperature_range",
            ].map((key) => renderField(key))}

            <div className="section-title">Other Notes (Optional)</div>
            <div className="checkbox-row">
              <input
                id="toggle-other-notes"
                type="checkbox"
                checked={otherEnabled}
                onChange={(e) => setOtherEnabled(e.target.checked)}
              />
              <label htmlFor="toggle-other-notes">
                Enable and show Other Notes fields
              </label>
            </div>

            {otherEnabled &&
              [
                "pests_diseases_notes",
                "propagation_notes",
                "invasive_species_notes",
                "conservation_status_notes",
                "local_permits_notes",
              ].map((key) => renderField(key))}
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
