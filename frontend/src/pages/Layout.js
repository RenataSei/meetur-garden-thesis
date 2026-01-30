import { useState, useCallback, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import SidebarMenu from '../components/SidebarMenu';

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const openMenu = useCallback(() => setMenuOpen(true), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const toggleMenu = useCallback(() => setMenuOpen(v => !v), []);

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    const original = document.body.style.overflow;
    if (menuOpen) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = original; };
  }, [menuOpen]);

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateRows: 'auto 1fr' }}>
      <Navbar onMenuClick={toggleMenu} />
      <div style={{ padding: 16 }}>
        <main>
          <Outlet />
        </main>
      </div>

      {/* Sidebar rendered only when open to avoid any overlay issues */}
      {menuOpen && <SidebarMenu open={menuOpen} onClose={closeMenu} />}
    </div>
  );
}
