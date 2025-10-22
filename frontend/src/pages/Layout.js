import { Outlet } from 'react-router-dom';

export default function Layout(){
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-title">MEET-UR GARDEN</div>
        <div className="app-menu-label">Main Menu</div>
      </header>

      <main className="app-main">
        <div className="app-panel">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
