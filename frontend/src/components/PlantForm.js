import { useEffect, useState } from 'react';

export default function PlantForm({ initial = { name: '', species: '', description: '' }, onSubmit, submitText = 'Save' }) {
  const [values, setValues] = useState(initial);
  const [err, setErr] = useState('');

  useEffect(() => setValues(initial), [initial]);

  return (
    <form
      className="form"
      onSubmit={async (e) => {
        e.preventDefault();
        setErr('');
        try {
          await onSubmit(values);
        } catch (e) {
          setErr(e.message || 'Failed');
        }
      }}
    >
      {err && <div className="error">{err}</div>}

      <label>Name</label>
      <input
        className="input"
        value={values.name}
        onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
        required
      />

      <label>Species</label>
      <input
        className="input"
        value={values.species}
        onChange={(e) => setValues((v) => ({ ...v, species: e.target.value }))}
        required
      />

      <label>Description</label>
      <textarea
        className="textarea"
        rows={6}
        value={values.description}
        onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
        required
      />

      <div className="row">
        <button className="btn brand" type="submit">{submitText}</button>
      </div>
    </form>
  );
}
