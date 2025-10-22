import SidebarMenu from '../components/SidebarMenu';
import { Link } from 'react-router-dom';

export default function Home(){
  return (
    <div className="app-grid">
      <section>
        <div className="card" style={{background:'#fff'}}>
          <h2>Welcome to Meet-Ur Garden</h2>
          <p className="muted">Manage your plants and keep your garden organized.</p>
          <Link className="btn" to="/plants">Go to Garden</Link>
        </div>
      </section>
      <SidebarMenu />
    </div>
  );
}
