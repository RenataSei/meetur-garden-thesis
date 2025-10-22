import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="nav">
      {/* Left brand only. No Main Menu on the right. */}
      <Link className="brand" to="/">
        MEETUR <span>GARDEN</span>
      </Link>
    </nav>
  );
}
