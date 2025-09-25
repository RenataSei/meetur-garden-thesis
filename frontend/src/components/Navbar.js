// Navbar.js

import { NavLink } from 'react-router-dom';

export default function Navbar() {
  return (
    <header className="navbar">
      <nav>
        <NavLink to="/" className="brand">Meetur Garden</NavLink>
        <div className="links">
          <NavLink to="/plants">Plants</NavLink>
          <NavLink to="/plants/new" className="btn">Add Plant</NavLink>
        </div>
      </nav>
    </header>
  );
}
