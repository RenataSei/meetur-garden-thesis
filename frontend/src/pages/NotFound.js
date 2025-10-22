import SidebarMenu from '../components/SidebarMenu';
import { Link } from 'react-router-dom';

export default function NotFound(){
  return (
    <div className="app-grid">
      <section>
        <div className="card" style={{background:'#fff'}}>
          <h2>Not found</h2>
          <p className="muted">The page you are looking for does not exist.</p>
          <Link className="btn" to="/plants">Back to Garden</Link>
        </div>
      </section>
      <SidebarMenu />
    </div>
  );
}
