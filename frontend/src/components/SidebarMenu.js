import { NavLink } from 'react-router-dom';
import { useEffect, useRef } from 'react';

const linkClass = ({ isActive }) =>
  ['menu-btn', isActive ? 'active' : ''].filter(Boolean).join(' ');

export default function SidebarMenu({ open, onClose }) {
  const drawerRef = useRef(null);

  // Close with Esc key
  useEffect(() => {
    function handleKey(e) { if (e.key === 'Escape') onClose?.(); }
    if (open) window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  // Click outside to close
  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) onClose?.();
  }

  // Overlay
  const overlay = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.5)',
    opacity: 1,
    transition: 'opacity 0.25s ease',
    zIndex: 50
  };

  // Drawer from right
  const drawer = {
    position: 'fixed',
    top: 0,
    right: 0,
    height: '100vh',
    width: 280,
    background: '#0d1117',
    borderLeft: '1px solid #2b3543',
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    transform: open ? 'translateX(0)' : 'translateX(100%)',
    transition: 'transform 0.25s ease',
    zIndex: 51
  };

  const title = { fontWeight: 800, marginBottom: 8, fontSize: 16 };
  const closeBtn = {
    alignSelf: 'flex-end',
    width: 36,
    height: 36,
    borderRadius: 8,
    border: '1px solid #2b3543',
    background: '#111827',
    color: 'inherit',
    cursor: 'pointer',
    marginBottom: 8,
    fontSize: 18,
    fontWeight: 700
  };

  const btn = {
    display: 'block',
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid #2b3543',
    textDecoration: 'none',
    color: 'inherit'
  };
  const active = { background: '#0d2215', borderColor: '#164e2f' };

  return (
    <div role="presentation" style={overlay} onMouseDown={handleOverlayClick}>
      <aside
        ref={drawerRef}
        aria-hidden={!open}
        aria-label="Sidebar menu"
        style={drawer}
      >
        <button aria-label="Close menu" onClick={onClose} style={closeBtn}>×</button>
        <div style={title}>Main Menu</div>

        <NavLink
          to="/plants"
          className={linkClass}
          style={({ isActive }) => ({ ...btn, ...(isActive ? active : {}) })}
          onClick={onClose}
        >
          Manage Garden
        </NavLink>
        <NavLink
          to="/settings"
          className={linkClass}
          style={({ isActive }) => ({ ...btn, ...(isActive ? active : {}) })}
          onClick={onClose}
        >
          Settings
        </NavLink>
        <NavLink
          to="/profile"
          className={linkClass}
          style={({ isActive }) => ({ ...btn, ...(isActive ? active : {}) })}
          onClick={onClose}
        >
          View Profile
        </NavLink>
      </aside>
    </div>
  );
}
