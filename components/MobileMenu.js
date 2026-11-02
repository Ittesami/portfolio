"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import LoadingLink from "@/components/LoadingLink";

// Phone-only navigation: a burger button that opens a drawer from the right.
// Closes on Escape, on the backdrop, on any link and on page change; while open,
// the page behind doesn't scroll and Tab stays inside the drawer.
export default function MobileMenu({ links, home, name }) {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const button = useRef(null);
  const drawer = useRef(null);
  const wasOpen = useRef(false);

  useEffect(() => setOpen(false), [path]);

  useEffect(() => {
    if (!open) {
      // Give focus back to the burger, but not on first load.
      if (wasOpen.current) button.current?.focus();
      wasOpen.current = false;
      return;
    }
    wasOpen.current = true;
    const root = document.documentElement;
    const before = root.style.overflow;
    root.style.overflow = "hidden";
    drawer.current?.querySelector("a, button")?.focus();

    function onKey(e) {
      if (e.key === "Escape") return setOpen(false);
      if (e.key !== "Tab") return;
      const items = [...drawer.current.querySelectorAll("a, button")];
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    // Back on a wide screen: the drawer isn't shown there, so close it.
    const wide = window.matchMedia("(min-width: 621px)");
    const onWide = (e) => e.matches && setOpen(false);
    document.addEventListener("keydown", onKey);
    wide.addEventListener("change", onWide);
    return () => {
      root.style.overflow = before;
      document.removeEventListener("keydown", onKey);
      wide.removeEventListener("change", onWide);
    };
  }, [open]);

  const close = () => setOpen(false);
  const current = (href) => (href === path ? "page" : undefined);

  return (
    <>
      <button
        ref={button}
        type="button"
        className="burger"
        aria-label="Open menu"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen(true)}
      >
        <span />
        <span />
        <span />
      </button>

      <div className={`menu-backdrop${open ? " open" : ""}`} onClick={close} aria-hidden="true" />
      <div
        ref={drawer}
        id="mobile-menu"
        className={`menu-drawer${open ? " open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        inert={!open}
      >
        <div className="menu-top">
          {home ? (
            <a className="mark" href="#top" onClick={close}>
              {name}
              <i />
            </a>
          ) : (
            <LoadingLink className="mark" href="/" onClick={close}>
              {name}
              <i />
            </LoadingLink>
          )}
          <button type="button" className="menu-close" aria-label="Close menu" onClick={close}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
        <nav aria-label="Mobile">
          <ul className="menu-links">
            {home && (
              <li>
                <a href="#top" onClick={close}>
                  Home
                </a>
              </li>
            )}
            {!home && (
              <li>
                <LoadingLink href="/" onClick={close}>
                  Home
                </LoadingLink>
              </li>
            )}
            {links.map(([href, label]) => (
              <li key={href}>
                {home && href === "/#contact" ? (
                  <a href="#contact" onClick={close}>
                    {label}
                  </a>
                ) : (
                  <LoadingLink href={href} aria-current={current(href)} onClick={close}>
                    {label}
                  </LoadingLink>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}
