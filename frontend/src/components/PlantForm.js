// PlantForm.js
import { useEffect, useState } from 'react';

export default function PlantForm({ initial = null, onSubmit, submitting }){
  const [form, setForm] = useState(() => (
    initial ?? { name: '', species: '', description: '' }
  ));

  useEffect(() => {
    if (initial){
      setForm({
        name: initial.name ?? '',
        species: initial.species ?? '',
        description: initial.description ?? '',
      });
    }
  }, [initial]);

  function handleChange(e){
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e){
    e.preventDefault();
    onSubmit?.(form);
  }

  return (
    <form onSubmit={handleSubmit} className="card">
      <input
        name="name"
        placeholder="Plant Name"
        value={form.name}
        onChange={handleChange}
      />
      <input
        name="species"
        placeholder="Species"
        value={form.species}
        onChange={handleChange}
      />
      <textarea
        name="description"
        placeholder="Description"
        value={form.description}
        onChange={handleChange}
        rows={5}
      />
      <button className="btn" disabled={submitting}>
        {submitting ? 'Saving…' : 'Save'}
      </button>
    </form>
  );
}
