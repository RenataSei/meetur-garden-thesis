import { useSidebar } from "../context/SidebarContext";

export default function HamburgerButton() {
  const { toggle, isOpen } = useSidebar();

  const styles = `
    .hamburger-wrap {
      position: fixed;
      top: 16px;
      right: 16px;
      z-index: 1002;
      transition: opacity .15s ease;
    }
    .hamburger-wrap.hidden {
      opacity: 0;
      pointer-events: none;
    }
    .hamburger-btn {
      width: 42px; height: 42px;
      border-radius: 12px; border: none;
      background: #1f2937; color: #fff;
      display: grid; place-items: center;
      box-shadow: 0 8px 24px rgba(0,0,0,.15);
      cursor: pointer;
      transition: transform .15s ease, box-shadow .2s ease, background .2s ease;
    }
    .hamburger-btn:hover { transform: translateY(-1px); box-shadow: 0 10px 30px rgba(0,0,0,.22); }
    .hamburger-icon { position: relative; width: 22px; height: 16px; }
    .hamburger-icon span { position: absolute; left: 0; right: 0; height: 2px; background: #fff; border-radius: 2px; transition: transform .2s ease, opacity .2s ease, top .2s ease; }
    .hamburger-icon span:nth-child(1){ top:0; } .hamburger-icon span:nth-child(2){ top:7px; } .hamburger-icon span:nth-child(3){ top:14px; }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className={`hamburger-wrap ${isOpen ? "hidden" : ""}`}>
        <button
          className="hamburger-btn"
          aria-label="Open menu"
          aria-expanded={isOpen ? "true" : "false"}
          onClick={toggle}
          type="button"
        >
          <div className="hamburger-icon" aria-hidden="true">
            <span></span><span></span><span></span>
          </div>
        </button>
      </div>
    </>
  );
}
