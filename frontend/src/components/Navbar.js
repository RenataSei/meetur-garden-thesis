import { Link } from 'react-router-dom';

export default function Navbar({ onMenuClick }) {
  const bar = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 16px',
    borderBottom: '1px solid #2b3543',
    position: 'sticky',
    top: 0,
    background: 'rgba(11,13,16,0.85)',
    backdropFilter: 'blur(6px)',
    zIndex: 60   // higher than any overlay when closed
  };

  const brand = {
    textDecoration: 'none',
    color: 'inherit',
    fontWeight: 800,
    letterSpacing: 0.5,
    fontSize: 18
  };

  const button = {
    width: 42,
    height: 42,
    borderRadius: 10,
    border: '1px solid #2b3543',
    background: '#0d1117',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'background 0.2s, transform 0.1s'
  };

  const container = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: 16
  };

  const line = {
    width: 22,
    height: 2.5,
    borderRadius: 2,
    background: '#e6edf3',
    transition: 'all 0.2s ease'
  };

  return (
    <nav className="nav" style={bar}>
      <Link className="brand" to="/" style={brand}>
        MEETUR<span style={{ color: '#4ade80' }}>GARDEN</span>
      </Link>

      <button
        aria-label="Open menu"
        onClick={onMenuClick}
        style={button}
        onMouseEnter={e => (e.currentTarget.style.background = '#111b24')}
        onMouseLeave={e => (e.currentTarget.style.background = '#0d1117')}
        onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.95)')}
        onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
      >
        <div style={container}>
          <span style={line}></span>
          <span style={line}></span>
          <span style={line}></span>
        </div>
      </button>
    </nav>
  );
}
