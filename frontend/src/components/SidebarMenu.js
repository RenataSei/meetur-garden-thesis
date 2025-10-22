import { Link } from 'react-router-dom';

export default function SidebarMenu(){
  return (
    <aside className="sidebar">
      <Link className="menu-btn" to="/plants">Manage Garden</Link>
      <Link className="menu-btn" to="/settings">Settings</Link>
      <Link className="menu-btn" to="/profile">View Profile</Link>
    </aside>
  );
}
