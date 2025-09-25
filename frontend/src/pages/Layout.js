import Navbar from '../components/Navbar';
import { Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="layout">
      <Navbar />
      <main className="container">
        <Outlet />
      </main>
      <footer className="footer">© {new Date().getFullYear()} Meetur Garden Thesis</footer>
    </div>
  );
}
