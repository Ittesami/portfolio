"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import LoadingLink from "@/components/LoadingLink";
import Icon from "@/components/Icon";
import Spinner from "./Spinner";

const NAV = [
  { href: "/admin", label: "Today" },
  { href: "/admin/todos", label: "To-do" },
  { href: "/admin/prayers", label: "Prayers" },
  { href: "/admin/fitness", label: "Fitness" },
  { href: "/admin/photos", label: "Photos" },
];

export default function AdminShell({ children }) {
  const path = usePathname();
  const [leaving, setLeaving] = useState(false);

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
