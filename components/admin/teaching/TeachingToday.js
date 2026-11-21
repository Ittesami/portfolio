"use client";

import { useCallback, useEffect, useState } from "react";
import LoadingLink from "@/components/LoadingLink";
import Icon from "@/components/Icon";
import { api, todayStr } from "../api";
import SessionRow from "./SessionRow";
import { nowStampLocal, studentsById } from "./shared";

// Today page card: today's classes with quick "attended / cancelled" buttons.
// Renders nothing until you've set up at least one class.
export default function TeachingToday() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const t = todayStr();
    try {
      setData(await api(`/api/admin/teaching?from=${t}&to=${t}`));
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (error)
    return (
      <div className="tile dash-card">
        <p className="label">Teaching today</p>
        <p role="status" className="form-status err">
          {error}
        </p>
      </div>
    );
  if (!data) return null;
  if (!data.classes.length) return null;

  const byId = studentsById(data.students);
  const classById = Object.fromEntries(data.classes.map((c) => [c.id, c]));
  const now = nowStampLocal();

  return (
    <div className="tile dash-card teach-today">
      <Icon name="cap" />
      <p className="label">Teaching today</p>
      {data.sessions.length === 0 ? (
        <p className="muted">No classes today.</p>
      ) : (
        <ul className="session-list">
          {data.sessions.map((s) => (
            <SessionRow
              key={s.id}
              session={s}
              cls={classById[s.classId]}
              byId={byId}
              now={now}
              compact
              onChange={(next) => setData((d) => ({ ...d, sessions: d.sessions.map((x) => (x.id === next.id ? next : x)) }))}
              onRemoved={(id) => setData((d) => ({ ...d, sessions: d.sessions.filter((x) => x.id !== id) }))}
              onReload={load}
            />
          ))}
        </ul>
      )}
      <LoadingLink className="text-btn see-all" href="/admin/teaching">
        Open timetable
      </LoadingLink>
    </div>
  );
}
