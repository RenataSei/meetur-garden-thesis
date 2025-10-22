import { useNavigate, Link } from 'react-router-dom';
import PlantForm from '../components/PlantForm';
import { PlantsAPI } from '../api';

export default function NewPlant() {
  const nav = useNavigate();

  return (
    <div className="container">
      <div className="header">
        <Link className="btn" to="/plants">Back</Link>
        <span className="badge">Create</span>
      </div>
      <h2>Add Plant</h2>
      <PlantForm
        submitText="Create"
        onSubmit={async (values) => {
          await PlantsAPI.create(values);
          nav('/plants');
        }}
      />
    </div>
  );
}
