import { Link } from "react-router-dom"; 
import { useSidebar } from "../contexts/SidebarContext";

export default function SidebarMenu() {
  const { isOpen, close } = useSidebar();

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
    }
    .drawer-title {
      font-size: 18px;
      font-weight: 700;
      letter-spacing: 0.5px;
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
          <div className="drawer-title">Menu</div>
        </div>

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
          {/* Brand link matching navbar styling */}
          <a href="/" className="footer-brand" onClick={(e) => { e.preventDefault(); close(); }}>
            <span className="footer-meetur">MEETUR</span>
            <span className="footer-garden">GARDEN</span>
          </a>
        </div>
      </aside>

      {/* Close button fixed in same coordinates as hamburger */}
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
