import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="container">
      <div className="header">
        <h2>Welcome</h2>
        <Link className="btn brand" to="/plants">Manage Garden</Link>
      </div>
      <p>Track and manage your plants with simple create, read, update, and delete actions.</p>
    </div>
  );
}
