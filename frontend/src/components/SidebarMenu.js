import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom"; 
import { useSidebar } from "../contexts/SidebarContext";
import { WeatherContext } from "../contexts/WeatherContext";
import { GardenAPI } from "../api";
import { analyzePlantHealth } from "../utils/careEngine";
import { AuthContext } from "../contexts/AuthContext";

export default function SidebarMenu() {
  const { isOpen, close } = useSidebar();
  
  // --- NEW: STATE FOR ALERTS ---
  const { weather } = useContext(WeatherContext);
  const [garden, setGarden] = useState([]);
  const { user } = useContext(AuthContext);

  // Fetch the garden data whenever the sidebar opens so alerts are fresh
  useEffect(() => {
    if (isOpen && user && weather) {
      GardenAPI.list()
        .then(data => setGarden(data))
        .catch(err => console.error("Failed to fetch garden for alerts", err));
    }
  }, [isOpen, user, weather]); // <--- Added user and weather here

  // --- NEW: CALCULATE ALERTS ---
  const allAlerts = garden.reduce((acc, item) => {
    const plantInfo = item.plant_id || {};
    const healthReport = analyzePlantHealth(plantInfo, weather, item);
    const plantAlerts = healthReport.alerts.map(alert => ({
      nickname: item.nickname,
      message: alert
    }));
    return [...acc, ...plantAlerts];
  }, []);

  console.log("DEBUG NOTIFICATIONS:", { weatherLoaded: !!weather, gardenCount: garden.length, totalAlerts: allAlerts.length });

  const styles = `
    /* Overlay fade smoother */
    .drawer-overlay {
      position: fixed; inset: 0;
      background: rgba(0,0,0,.45);
      opacity: 0; pointer-events: none;
      transition: opacity .35s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 1000;
    }
    .drawer-overlay.open { opacity: 1; pointer-events: auto; }

    /* Drawer panel smoother slide */
    .drawer-panel {
      position: fixed; top: 0; right: 0; height: 100vh;
      width: min(88vw, 340px);
      background: #111827; color: #e5e7eb;
      transform: translateX(100%);
      transition: transform .38s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 1001;
      display: flex; flex-direction: column;
      box-shadow: -16px 0 40px rgba(0,0,0,.25);
    }
    .drawer-panel.open { transform: translateX(0%); }

    /* Header */
    .drawer-header {
      padding: 24px 24px 16px 24px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .drawer-title {
      font-size: 18px;
      font-weight: 700;
      letter-spacing: 0.5px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    /* --- NEW: ALERT STYLES --- */
    .alert-badge {
      background: #ef4444;
      color: white;
      font-size: 12px;
      padding: 2px 8px;
      border-radius: 12px;
      font-weight: bold;
    }
    .alerts-container {
      padding: 16px 20px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    .alerts-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .alert-item {
      font-size: 13px;
      background: rgba(239, 68, 68, 0.1);
      padding: 10px;
      border-left: 3px solid #ef4444;
      border-radius: 4px;
    }

    /* Menu list */
    .menu-list {
      padding: 10px 32px 20px 20px;
      display: grid;
      gap: 10px;
    }

    .menu-btn {
      display: block;
      text-decoration: none;
      color: #f3f4f6;
      background: linear-gradient(180deg, #1f2937, #111827);
      padding: 12px 16px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 15px;
      border: 1px solid rgba(255,255,255,0.07);
      box-shadow: 0 6px 18px rgba(0,0,0,.2), inset 0 1px 0 rgba(255,255,255,.04);
      transition:
        transform .25s ease,
        background .3s ease,
        box-shadow .3s ease,
        border-color .3s ease;
    }
    .menu-btn:hover {
      background: linear-gradient(180deg, #243042, #162232);
      transform: translateY(-2px);
      border-color: rgba(255,255,255,0.12);
      box-shadow: 0 12px 26px rgba(0,0,0,.28), inset 0 1px 0 rgba(255,255,255,.06);
    }
    .menu-btn:active {
      transform: translateY(0);
      box-shadow: 0 6px 18px rgba(0,0,0,.2);
    }

    /* Footer styled exactly like the navbar brand */
    .drawer-footer {
      margin-top: auto;
      padding: 12px 20px 16px 20px;
      border-top: 1px solid rgba(255,255,255,0.08);
      text-align: center;
    }
    .footer-brand {
      display: inline-flex;
      align-items: baseline;
      justify-content: center;
      gap: 6px;
      user-select: none;
      text-decoration: none;
      font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
      text-transform: uppercase;
      letter-spacing: .12em;
      font-weight: 800;
      line-height: 1;
      transition: transform .15s ease, opacity .2s ease;
    }
    .footer-brand:hover { transform: translateY(-1px); }
    .footer-meetur {
      color: #f9fafb;
      font-size: 16px;
      text-shadow: 0 1px 0 rgba(0,0,0,.25);
    }
    .footer-garden {
      color: #8fd081;
      font-size: 16px;
      text-shadow: 0 0 10px rgba(143,208,129,.25);
      margin-left: 4px;
    }

    /* Close button */
    .drawer-close-fixed {
      position: fixed;
      top: 16px;
      right: 32px;
      z-index: 1002;
      width: 42px;
      height: 42px;
      border: none;
      border-radius: 12px;
      background: #1f2937;
      color: #fff;
      display: grid;
      place-items: center;
      box-shadow: 0 8px 24px rgba(0,0,0,.15);
      cursor: pointer;
      opacity: 0;
      pointer-events: none;
      transform: scale(0.9);
      transition:
        opacity .35s cubic-bezier(0.4, 0, 0.2, 1),
        transform .35s cubic-bezier(0.4, 0, 0.2, 1),
        box-shadow .3s ease,
        background .3s ease;
    }
    .drawer-close-fixed.visible {
      opacity: 1;
      transform: scale(1);
      pointer-events: auto;
    }
    .drawer-close-fixed:hover {
      transform: scale(1.05);
      box-shadow: 0 10px 30px rgba(0,0,0,.22);
    }
    .close-icon {
      font-size: 18px;
      line-height: 1;
      user-select: none;
    }
  `;

  return (
    <>
      <style>{styles}</style>

      <div
        className={`drawer-overlay ${isOpen ? "open" : ""}`}
        onClick={close}
        aria-hidden="true"
      />

      <aside
        className={`drawer-panel ${isOpen ? "open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Sidebar menu"
      >
        <div className="drawer-header">
          <div className="drawer-title">
            Menu
            {/* RED BADGE SHOWS TOTAL ALERTS */}
            {allAlerts.length > 0 && (
              <span className="alert-badge">{allAlerts.length} Alerts</span>
            )}
          </div>
        </div>

        {/* --- NEW: THE NOTIFICATION CENTER --- */}
        {allAlerts.length > 0 && (
          <div className="alerts-container">
            <h4 style={{ margin: '0 0 10px 0', fontSize: '11px', color: '#ef4444', textTransform: 'uppercase' }}>
              ⚠️ Immediate Action Required
            </h4>
            <ul className="alerts-list">
              {allAlerts.map((alert, idx) => (
                <li key={idx} className="alert-item">
                  <strong style={{ color: '#8fd081' }}>[{alert.nickname}]</strong><br/>
                  {alert.message}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* FRIEND'S ORIGINAL NAVIGATION LINKS */}
        <nav className="menu-list" onClick={close}>
          <Link className="menu-btn" to="/plants">
            Manage Garden
          </Link>
          <Link className="menu-btn" to="/settings">
            Settings
          </Link>
          <Link className="menu-btn" to="/profile">
            View Profile
          </Link>
          <Link className="menu-btn" to="/logout">
            Logout
          </Link>
        </nav>

        <div className="drawer-footer">
          <a href="/" className="footer-brand" onClick={(e) => { e.preventDefault(); close(); }}>
            <span className="footer-meetur">MEETUR</span>
            <span className="footer-garden">GARDEN</span>
          </a>
        </div>
      </aside>

      <button
        className={`drawer-close-fixed ${isOpen ? "visible" : ""}`}
        onClick={close}
        aria-label="Close menu"
        type="button"
      >
        <span className="close-icon">✕</span>
      </button>
    </>
  );
}