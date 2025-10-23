import { NavLink } from "react-router-dom";

const linkClass = ({ isActive }) =>
  ["menu-btn", isActive ? "active" : ""].filter(Boolean).join(" ");

export default function SidebarMenu() {
  return (
    <aside className="sidebar">
      <NavLink className={linkClass} to="/plants">Manage Garden</NavLink>
      <NavLink className={linkClass} to="/settings">Settings</NavLink>
      <NavLink className={linkClass} to="/profile">View Profile</NavLink>
    </aside>
  );
}
