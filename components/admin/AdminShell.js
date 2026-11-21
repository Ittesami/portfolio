"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import LoadingLink from "@/components/LoadingLink";
import Icon from "@/components/Icon";
import Spinner from "./Spinner";
import { MESSAGES_CHANGED } from "./MessageList";

const NAV = [
  { href: "/admin", label: "Today", icon: "home" },
  { href: "/admin/todos", label: "To-do", icon: "list" },
  { href: "/admin/prayers", label: "Prayers", icon: "moon" },
  { href: "/admin/fitness", label: "Fitness", icon: "dumbbell" },
  { href: "/admin/study", label: "Study", icon: "book" },
  { href: "/admin/teaching", label: "Teaching", icon: "cap" },
  { href: "/admin/travel", label: "Travel", icon: "globe" },
  { href: "/admin/photos", label: "Photos", icon: "camera" },
  { href: "/admin/messages", label: "Messages", icon: "mail" },
];
// Phones get a bottom tab bar with the sections used most; the rest live under "More".
const TABS = ["/admin", "/admin/todos", "/admin/fitness", "/admin/study"];

const isCurrent = (path, href) => path === href || (href !== "/admin" && path.startsWith(`${href}/`));

function MoreSheet({ open, onClose, path, unread, leaving, onLogout, returnFocus }) {
  const sheet = useRef(null);

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const before = root.style.overflow;
    root.style.overflow = "hidden";
    sheet.current?.querySelector("a, button")?.focus();
    const back = returnFocus.current;

    function onKey(e) {
      if (e.key === "Escape") return onClose();
      if (e.key !== "Tab") return;
      const items = [...sheet.current.querySelectorAll("a, button")];
      if (e.shiftKey && document.activeElement === items[0]) {
        e.preventDefault();
        items[items.length - 1].focus();
      } else if (!e.shiftKey && document.activeElement === items[items.length - 1]) {
        e.preventDefault();
        items[0].focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => {
      root.style.overflow = before;
      document.removeEventListener("keydown", onKey);
      back?.focus();
    };
  }, [open, onClose, returnFocus]);

  const more = NAV.filter((n) => !TABS.includes(n.href));
  return (
    <>
      <div className={`sheet-backdrop${open ? " open" : ""}`} onClick={onClose} aria-hidden="true" />
      <div ref={sheet} id="more-sheet" className={`sheet${open ? " open" : ""}`} role="dialog" aria-modal="true" aria-labelledby="more-title" inert={!open}>
        <div className="sheet-grip" aria-hidden="true" />
        <div className="sheet-head">
          <h2 id="more-title">More</h2>
          <button type="button" className="sheet-close" aria-label="Close" onClick={onClose}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
        <ul className="sheet-list">
          {more.map((n) => (
            <li key={n.href}>
              <LoadingLink className="sheet-link" href={n.href} aria-current={isCurrent(path, n.href) ? "page" : undefined} onClick={onClose}>
                <Icon name={n.icon} size={22} />
                {n.label}
                {n.href === "/admin/messages" && unread > 0 && (
                  <span className="nav-count" aria-label={`${unread} unread`}>
                    {unread}
                  </span>
                )}
              </LoadingLink>
            </li>
          ))}
        </ul>
        <div className="sheet-sep" />
        <ul className="sheet-list">
          <li>
            <LoadingLink className="sheet-link" href="/" onClick={onClose}>
              <Icon name="external" size={22} />
              View public site
            </LoadingLink>
          </li>
          <li>
            <button type="button" className="sheet-link" onClick={onLogout} disabled={leaving} aria-busy={leaving}>
              <Icon name="logout" size={22} />
              Log out
              {leaving && <Spinner />}
            </button>
          </li>
        </ul>
      </div>
    </>
  );
}

export default function AdminShell({ children }) {
  const path = usePathname();
  const [leaving, setLeaving] = useState(false);
  const [unread, setUnread] = useState(0);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreButton = useRef(null);
  const closeMore = useCallback(() => setMoreOpen(false), []);

  // Unread contact messages, refreshed on every page change and whenever the inbox changes.
  useEffect(() => {
    const refresh = () =>
      fetch("/api/admin/messages?count=1", { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => d && setUnread(d.unread))
        .catch(() => {});
    refresh();
    window.addEventListener(MESSAGES_CHANGED, refresh);
    return () => window.removeEventListener(MESSAGES_CHANGED, refresh);
  }, [path]);

  useEffect(() => setMoreOpen(false), [path]);

  async function logout() {
    setLeaving(true);
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => {});
    window.location.href = "/admin/login";
  }

  const moreActive = !moreOpen && NAV.some((n) => !TABS.includes(n.href) && isCurrent(path, n.href));

  return (
    <div className="wrap admin">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="admin-bar">
        <LoadingLink className="mark" href="/admin">
          Daily
          <i />
        </LoadingLink>
        <nav aria-label="Sections">
          <ul>
            {NAV.map((n) => (
              <li key={n.href}>
                <LoadingLink href={n.href} aria-current={isCurrent(path, n.href) ? "page" : undefined}>
                  {n.label}
                  {n.href === "/admin/messages" && unread > 0 && (
                    <span className="nav-count" aria-label={`${unread} unread`}>
                      {unread}
                    </span>
                  )}
                </LoadingLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="admin-actions">
          <LoadingLink className="btn small" href="/" title="View the public site">
            <Icon name="external" size={15} /> Site
          </LoadingLink>
          <button className="btn small" type="button" onClick={logout} disabled={leaving} aria-busy={leaving}>
            {leaving && <Spinner />}
            Log out
          </button>
        </div>
      </header>

      <main id="main" className="admin-main" tabIndex={-1}>
        {children}
      </main>

      <nav className="tabbar" aria-label="Sections">
        {TABS.map((href) => {
          const n = NAV.find((x) => x.href === href);
          return (
            <LoadingLink key={href} className="tab" href={href} aria-current={isCurrent(path, href) ? "page" : undefined}>
              <Icon name={n.icon} size={22} />
              {n.label}
            </LoadingLink>
          );
        })}
        <button
          ref={moreButton}
          type="button"
          className="tab"
          aria-haspopup="dialog"
          aria-expanded={moreOpen}
          aria-controls="more-sheet"
          aria-current={moreActive ? "page" : undefined}
          onClick={() => setMoreOpen(true)}
        >
          <Icon name="more" size={22} />
          More
          {unread > 0 && (
            <span className="tab-badge" aria-label={`${unread} unread messages`}>
              {unread}
            </span>
          )}
        </button>
      </nav>
      <MoreSheet
        open={moreOpen}
        onClose={closeMore}
        path={path}
        unread={unread}
        leaving={leaving}
        onLogout={logout}
        returnFocus={moreButton}
      />
    </div>
  );
}
