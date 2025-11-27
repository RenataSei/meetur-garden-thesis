// src/components/PlantForm.js
import { useEffect, useMemo, useState } from "react";

/**
 * Form aligned with backend plantSchema.
 * Visual design updated to a light, clean layout similar to picture 1.
 */

const styles = `
.plant-form-page {
  width: 100%;
  min-height: 100vh;
  padding: 32px 16px 48px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: radial-gradient(circle at top, #e8ffe8 0, #f8fffb 45%, #ffffff 100%);
}

/* Hero header (big title like screenshot 1) */
.plant-form-hero {
  text-align: center;
  margin-bottom: 24px;
  max-width: 900px;
}
.plant-form-hero-title {
  font-size: 2.6rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #16c45b;
  margin: 0 0 8px;
}
.plant-form-hero-sub {
  font-size: 1rem;
  color: #4b5563;
  margin: 0 0 4px;
}
.plant-form-hero-small {
  font-size: 0.85rem;
  color: #9ca3af;
  margin: 0;
}

/* Main white card */
.plant-form-card {
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
  border-radius: 32px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.08);
  padding: 32px 40px 28px;
  box-sizing: border-box;
}

/* Layout for the sections */
.grid-2 {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
  gap: 28px;
  margin-top: 8px;
}
.grid-1 {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 28px;
  margin-top: 8px;
}

/* Section styling (BASIC INFORMATION, FLOWER DESCRIPTORS, etc.) */
.section {
  border-radius: 18px;
  padding: 16px 0 6px;
}
.section + .section {
  margin-top: 12px;
}

.section-title-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 8px;
}
.section-title {
  font-size: 0.8rem;
  letter-spacing: 0.20em;
  text-transform: uppercase;
  color: #9ca3af;
}
.section-tag {
  font-size: 0.75rem;
  padding: 3px 10px;
  border-radius: 999px;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  color: #6b7280;
}
.section-body {
  border-top: 1px solid #e5e7eb;
  padding-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* Field rows: label on left, input on right */
.field-row {
  display: grid;
  grid-template-columns: 210px minmax(0, 1fr);
  gap: 12px 24px;
  align-items: flex-start;
}
.field-label {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.field-label label {
  font-size: 0.92rem;
  font-weight: 600;
  color: #4b5563;
}
.field-req {
  font-size: 0.75rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #9ca3af;
}
.field-control {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* Inputs, selects, textareas */
input[type="text"],
textarea,
select {
  width: 100%;
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  padding: 9px 14px;
  background: #f9fafb;
  color: #111827;
  outline: none;
  font-size: 0.95rem;
  box-sizing: border-box;
  transition: border-color 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease;
}
textarea {
  border-radius: 16px;
  min-height: 80px;
  resize: vertical;
}
.ta-sm {
  min-height: 60px;
}
input[type="text"]::placeholder,
textarea::placeholder {
  color: #9ca3af;
}
input[type="text"]:focus,
textarea:focus,
select:focus {
  border-color: #16c45b;
  background-color: #ffffff;
  box-shadow: 0 0 0 1px rgba(22, 196, 91, 0.35);
}

/* Helper and error text */
.field-helper {
  font-size: 0.8rem;
  color: #9ca3af;
  min-height: 16px;
}
.field-error {
  font-size: 0.8rem;
  color: #b91c1c;
  min-height: 16px;
}

/* Footer buttons */
.footer {
  margin-top: 22px;
  padding-top: 14px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
.btn {
  min-width: 112px;
  padding: 9px 18px;
  border-radius: 999px;
  border: 1px solid #d1d5db;
  background: #f9fafb;
  color: #111827;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.1s ease, box-shadow 0.1s ease, background-color 0.1s ease, filter 0.1s ease;
}
.btn[disabled] {
  opacity: 0.55;
  cursor: default;
}
.btn:hover:not([disabled]) {
  filter: brightness(1.02);
  box-shadow: 0 8px 18px rgba(148, 163, 184, 0.4);
}
.btn.primary {
  border: none;
  background: linear-gradient(135deg, #16c45b, #22c55e);
  color: #ffffff;
  box-shadow: 0 14px 30px rgba(22, 196, 91, 0.35);
}
.btn.primary:hover:not([disabled]) {
  transform: translateY(-1px);
  box-shadow: 0 18px 40px rgba(22, 196, 91, 0.45);
}
.btn.primary:active:not([disabled]) {
  transform: translateY(0);
  box-shadow: 0 10px 25px rgba(22, 196, 91, 0.3);
}

/* Responsive tweaks */
@media (max-width: 900px) {
  .grid-2 {
    grid-template-columns: minmax(0, 1fr);
  }
  .plant-form-card {
    padding: 24px 18px 22px;
  }
}
@media (max-width: 640px) {
  .plant-form-page {
    padding: 24px 10px 40px;
  }
  .plant-form-hero-title {
    font-size: 2.1rem;
  }
  .field-row {
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

    const hasError = !!errors[key];

    return (
      <div className="field-row" key={key}>
        <div className="field-label">
          <label htmlFor={key}>{label}</label>
          {isRequired && <span className="field-req">Required</span>}
        </div>
        <div className="field-control">
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
          {hasError ? (
            <div className="field-error">{errors[key]}</div>
          ) : (
            <div className="field-helper"></div>
          )}
        </div>
      </div>
    );
  }

  const heroTitle = mode === "edit" ? `Edit ${title}` : `Create ${title}`;

  return (
    <div className="plant-form-page">
      <style>{styles}</style>

      <div className="plant-form-hero">
        <h1 className="plant-form-hero-title">{heroTitle}</h1>
        <p className="plant-form-hero-sub">{sub}</p>
        <p className="plant-form-hero-small">
          Fields marked as required must be filled
        </p>
      </div>

      <form className="plant-form-card" onSubmit={handleSubmit} noValidate>
        {/* Basic info + Flower descriptors */}
        <div className={simpleLayout ? "grid-1" : "grid-2"}>
          <div className="section">
            <div className="section-title-row">
              <div className="section-title">Basic information</div>
            </div>
            <div className="section-body">
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
            </div>
            <div className="section-body">
              {["color", "flower_inflorescence", "value", "bloom_time"].map(
                (key) => renderField(key)
              )}
            </div>
          </div>
        </div>

        {/* Ecological descriptors + Other notes */}
        <div className={simpleLayout ? "grid-1" : "grid-2"}>
          <div className="section">
            <div className="section-title-row">
              <div className="section-title">Ecological descriptors</div>
            </div>
            <div className="section-body">
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
            </div>
            <div className="section-body">
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
            {busy
              ? "Saving..."
              : mode === "edit"
              ? "Save Changes"
              : "Create Plant"}
          </button>
        </div>
      </form>
    </div>
  );
}
