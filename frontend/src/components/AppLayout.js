import HamburgerButton from "./HamburgerButton";
import SidebarMenu from "./SidebarMenu";

export default function AppLayout({ children }) {
  const styles = `
    :root {
      --fab-top: 16px;
      --fab-right: 16px;
      --fab-size: 42px;
    }

    .app-shell { min-height: 100dvh; background:#0b1220; color:#e5e7eb; }
    .app-content { max-width:1200px; margin:0 auto; padding:72px 16px 24px; }

    /* Brand: MEETUR (white) + GARDEN (green) */
    .brand-slot {
      position: fixed;
      top: var(--fab-top);
      left: 16px;
      z-index: 1100;
    }
    .brand-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      text-decoration: none;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
      padding: 2px 4px;
      border-radius: 6px;
      transition: transform .12s ease, filter .12s ease;
    }
    .brand-link:hover { transform: translateY(-1px); filter: brightness(1.05); }
    .brand-word {
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: .06em;
      line-height: 1;
      text-shadow: 0 1px 0 rgba(0,0,0,.25);
    }
    .brand-meetur {
      color: #e5e7eb; /* white/gray */
      font-size: 20px;
    }
    .brand-garden {
      color: #34d399; /* emerald 400 */
      font-size: 20px;
      text-shadow: 0 0 10px rgba(52,211,153,.25);
    }

    /* keeps layout for notched devices too */
    @supports(padding:max(0px)) {
      .brand-slot { left: max(16px, env(safe-area-inset-left)); }
    }
  `;

  return (
    <>
      <style>{styles}</style>

      <div className="app-shell">
        {/* Upper-left brand */}
        <div className="brand-slot">
          <a href="/" className="brand-link" aria-label="Go to Home">
            <span className="brand-word brand-meetur">MEETUR</span>
            <span className="brand-word brand-garden">GARDEN</span>
          </a>
        </div>

        {/* Upper-right hamburger and the global drawer */}
        <HamburgerButton />
        <SidebarMenu />

        <main className="app-content">{children}</main>
      </div>
    </>
  );
}
