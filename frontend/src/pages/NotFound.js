import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section>
      <h1>404</h1>
      <p>Page not found.</p>
      <Link className="btn" to="/">Go home</Link>
    </section>
  );
}
