// frontend/src/components/PlantForm.js
import { useEffect, useState } from 'react';

export default function PlantForm({
  // Make initial explicit nullable; don't construct a new object here
  initial = null,
  onSubmit,
  submitting,
}) {
  // Initialize state lazily ONCE. If no initial, start with blanks.
  const [form, setForm] = useState(() => (
    initial ?? { name: '', species: '', description: '' }
  ));
  const [errors, setErrors] = useState({});

  // Only sync from props when editing and a real initial is provided.
  useEffect(() => {
    if (initial) {
      setForm(initial);
    }
  }, [initial]);

  function setField(k, v) {
    setForm(prev => ({ ...prev, [k]: v }));
  }

  function validate() {
    const e = {};
    if (!form.name?.trim()) e.name = 'Name is required';
    if (!form.species?.trim()) e.species = 'Species is required';
    if (!form.description?.trim()) e.description = 'Description is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit?.({
      name: (form.name ?? '').trim(),
      species: (form.species ?? '').trim(),
      description: (form.description ?? '').trim(),
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        <div>Name</div>
        <input
          type="text"
          value={form.name ?? ''}
          onChange={e => setField('name', e.target.value)}
          placeholder="e.g., Fiddle Leaf Fig"
        />
        {errors.name && <small className="error">{errors.name}</small>}
      </label>

      <label>
        <div>Species</div>
        <input
          type="text"
          value={form.species ?? ''}
          onChange={e => setField('species', e.target.value)}
          placeholder="e.g., Ficus lyrata"
        />
        {errors.species && <small className="error">{errors.species}</small>}
      </label>

      <label>
        <div>Description / Care Notes</div>
        <textarea
          value={form.description ?? ''}
          onChange={e => setField('description', e.target.value)}
          placeholder="Light, watering, notes…"
        />
        {errors.description && <small className="error">{errors.description}</small>}
      </label>

      <div className="row">
        <button className="btn" type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  );
}
