import { createContext, useContext, useEffect, useState } from "react";

const SidebarContext = createContext();

export function SidebarProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen(v => !v);

  useEffect(() => {
    const body = document.body;

    // Remember previous inline styles so we can restore perfectly
    const prevOverflow = body.style.overflow;
    const prevPaddingRight = body.style.paddingRight;

    if (isOpen) {
      // Calculate the scrollbar width to prevent layout shift
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

      body.style.overflow = "hidden";
      if (scrollbarWidth > 0) {
        body.style.paddingRight = `${scrollbarWidth}px`;
      }
    } else {
      body.style.overflow = prevOverflow || "";
      body.style.paddingRight = prevPaddingRight || "";
    }

    return () => {
      body.style.overflow = prevOverflow || "";
      body.style.paddingRight = prevPaddingRight || "";
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const onKey = e => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <SidebarContext.Provider value={{ isOpen, open, close, toggle }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}
