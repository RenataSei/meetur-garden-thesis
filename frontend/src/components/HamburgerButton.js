import { useState, useEffect, useContext } from "react";
import { useSidebar } from "../contexts/SidebarContext";
import { WeatherContext } from "../contexts/WeatherContext";
import { AuthContext } from "../contexts/AuthContext";
import { GardenAPI } from "../api";
import { analyzePlantHealth } from "../utils/careEngine";

export default function HamburgerButton() {
  const { toggle, isOpen } = useSidebar();

  const { weather } = useContext(WeatherContext);
  const { user } = useContext(AuthContext);
  const [garden, setGarden] = useState([]);

  useEffect(() => {
    // Only fetch if user and weather exist
    if (user && weather) {
      // 500ms SAFETY DELAY to fix race condition on refresh
      const timer = setTimeout(() => {
        GardenAPI.list()
          .then(data => setGarden(data))
          .catch(err => console.error(err));
      }, 500); 

      return () => clearTimeout(timer);
    }
  }, [user, weather]);

  // Calculate Alerts
  const allAlerts = garden.reduce((acc, item) => {
    const plantInfo = item.plant_id || {};
    const healthReport = analyzePlantHealth(plantInfo, weather, item);
    return [...acc, ...healthReport.alerts];
  }, []);

  const styles = `
    .hamburger-wrap {
      position: fixed; top: 16px; right: 16px; z-index: 1002; transition: opacity .15s ease;
    }
    .hamburger-wrap.hidden { opacity: 0; pointer-events: none; }
    .hamburger {
      width: 44px; height: 44px; border-radius: 12px;
      border: 1px solid rgba(255,255,255,0.1); background: #0d1117;
      display: inline-flex; align-items: center; justify-content: center;
      cursor: pointer; box-shadow: 0 6px 24px rgba(0,0,0,.22);
      transition: transform .12s ease, background .2s ease, border-color .2s ease;
      position: relative;
    }
    .hamburger:hover { background: #101826; border-color: rgba(255,255,255,0.2); }
    .hamburger:active { transform: scale(.96); }

    .hamburger .lines { width: 22px; height: 16px; position: relative; }
    .hamburger .line {
      position: absolute; left: 0; right: 0;
      height: 2px; border-radius: 2px; background: #e5e7eb;
      transition: transform .2s ease, opacity .2s ease, top .2s ease;
    }
    .hamburger .line:nth-child(1) { top: 0; }
    .hamburger .line:nth-child(2) { top: 7px; }
    .hamburger .line:nth-child(3) { top: 14px; }
    .hamburger.open .line:nth-child(1) { top: 7px; transform: rotate(45deg); }
    .hamburger.open .line:nth-child(2) { opacity: 0; }
    .hamburger.open .line:nth-child(3) { top: 7px; transform: rotate(-45deg); }

    .alert-dot {
      position: absolute; top: -4px; right: -4px;
      background: #ef4444; color: white;
      font-size: 10px; font-weight: bold; height: 18px; min-width: 18px;
      border-radius: 9px; display: flex; align-items: center; justify-content: center;
      padding: 0 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.4);
      border: 2px solid #0d1117; pointer-events: none;
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className={`hamburger-wrap ${isOpen ? "hidden" : ""}`}>
        <button
          type="button" aria-label="Open menu"
          className={`hamburger ${isOpen ? "open" : ""}`}
          onClick={toggle}
        >
          <div className="lines">
            <span className="line" />
            <span className="line" />
            <span className="line" />
          </div>

          {/* RED BADGE */}
          {allAlerts.length > 0 && (
            <div className="alert-dot">{allAlerts.length}</div>
          )}
        </button>
      </div>
    </>
  );
}