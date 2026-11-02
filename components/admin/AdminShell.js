"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import LoadingLink from "@/components/LoadingLink";
import Icon from "@/components/Icon";
import Spinner from "./Spinner";
import { MESSAGES_CHANGED } from "./MessageList";

const NAV = [
  { href: "/admin", label: "Today" },
  { href: "/admin/todos", label: "To-do" },
  { href: "/admin/prayers", label: "Prayers" },
  { href: "/admin/fitness", label: "Fitness" },
  { href: "/admin/travel", label: "Travel" },
  { href: "/admin/photos", label: "Photos" },
  { href: "/admin/messages", label: "Messages" },
];

export default function AdminShell({ children }) {
  const path = usePathname();
  const [leaving, setLeaving] = useState(false);
  const [unread, setUnread] = useState(0);

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

  async function logout() {
    setLeaving(true);
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => {});
    window.location.href = "/admin/login";
  }

  return (
    <div className="wrap admin">
      <header className="admin-bar">
        <LoadingLink className="mark" href="/admin">
          Daily
          <i />
        </LoadingLink>
        <nav aria-label="Admin">
          <ul>
            {NAV.map((n) => (
              <li key={n.href}>
                <LoadingLink href={n.href} aria-current={path === n.href ? "page" : undefined}>
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
            <Icon name="arrow" size={14} /> Site
          </LoadingLink>
          <button className="btn small" type="button" onClick={logout} disabled={leaving} aria-busy={leaving}>
            {leaving && <Spinner />}
            Log out
          </button>
        </div>
      </header>
      <main className="admin-main">{children}</main>
    </div>
  );
}
