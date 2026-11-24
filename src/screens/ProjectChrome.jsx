import { useEffect, useRef, useState } from "react";
import KaiLogo from "./KaiLogo.jsx";

// Closes a menu on Escape or a press outside it. Put the returned ref on the element that wraps
// both the menu and the button that opens it.
export function useDismiss(open, close) {
  const ref = useRef(null);
  const latest = useRef(close);
  latest.current = close;
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === "Escape") latest.current(); };
    const onPress = (e) => { if (ref.current && !ref.current.contains(e.target)) latest.current(); };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPress);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPress);
    };
  }, [open]);
  return ref;
}

// Inside a project, the logo leads back to the project list.
export function HomeLogo({ vm, size = "md", className = "" }) {
  if (!vm.inProject) return <KaiLogo size={size} className={className} />;
  return (
    <button className={`logo-btn ${className}`} type="button" onClick={vm.toProjects} aria-label="Your projects">
      <KaiLogo size={size} />
    </button>
  );
}

export function SaveStatus({ vm }) {
  if (!vm.inProject || !vm.saveLabel) return null;
  return (
    <span className="save-status" role="status" title={vm.saveError || undefined} data-state={vm.saveError ? "error" : undefined}>
      {vm.saveLabel === "Saved" && (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      )}
      {vm.saveLabel}
    </span>
  );
}

export function AccountMenu({ vm }) {
  const [open, setOpen] = useState(false);
  const menu = useDismiss(open, () => setOpen(false));
  return (
    <div className="relative" ref={menu}>
      <button className="icon-btn icon-btn--round" type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-haspopup="menu" aria-label="Account">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
        </svg>
      </button>
      {open && (
        <div className="menu menu--end account-menu" role="menu">
          <span className="account-menu__email">{vm.userEmail}</span>
          {vm.inProject && <button className="menu__item" type="button" role="menuitem" onClick={vm.toProjects}>Your projects</button>}
          <button className="menu__item" type="button" role="menuitem" onClick={vm.logOut}>Log out</button>
        </div>
      )}
    </div>
  );
}
