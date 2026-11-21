"use client";

import { useState } from "react";
import { api } from "../api";
import Spinner from "../Spinner";
import { STATUS_LABEL, classStudents, classTitle, isUnmarked, shortDate } from "./shared";

// One class on the timetable: quick actions (attended / cancel / reschedule), what you
// taught, notes, and the full editor. onChange(session) after a save; onRemoved(id) when an
// extra class is deleted; onReload() when a change affects other days (make-up classes).
export default function SessionRow({ session: s, cls, byId, now, compact = false, onChange, onRemoved, onReload }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(null);
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState({ text: "", error: false });
  const [confirm, setConfirm] = useState(false);

  const unmarked = isUnmarked(s, now);
  const title = classTitle(cls, byId);
  const who = cls?.title ? classStudents(cls, byId) : "";

  function openEditor(status = s.status) {
    setForm({
      status,
      topic: s.topic,
      notes: s.notes,
      date: s.rescheduledTo?.date ?? s.date,
      time: s.rescheduledTo?.time ?? s.time,
    });
    setMsg({ text: "", error: false });
    setOpen(true);
  }

  async function run(kind, fn, ok) {
    setBusy(kind);
    setMsg({ text: "", error: false });
    try {
      await fn();
      if (ok) setMsg({ text: ok, error: false });
    } catch (err) {
      setMsg({ text: err.message, error: true });
    } finally {
      setBusy("");
    }
  }

  const put = async (body) => {
    const { session } = await api("/api/admin/teaching/sessions", { method: "PUT", body: { id: s.id, ...body } });
    onChange(session);
    // Rescheduling adds, moves or removes a make-up class on another day.
    if ("status" in body && (body.status === "rescheduled" || s.status === "rescheduled")) onReload?.();
    return session;
  };

  const save = () =>
    run(
      "save",
      async () => {
        const body = { status: form.status, topic: form.topic, notes: form.notes };
        if (form.status === "rescheduled") body.rescheduleTo = { date: form.date, time: form.time };
        await put(body);
        setOpen(false);
      },
      "Saved",
    );

  const statusBadge =
    s.status === "attended" ? (
      <span className="badge success">Attended</span>
    ) : s.status === "cancelled" ? (
      <span className="badge danger">Cancelled</span>
    ) : s.status === "rescheduled" ? (
      <span className="badge warn">Moved to {s.rescheduledTo ? `${shortDate(s.rescheduledTo.date)} ${s.rescheduledTo.time}` : "another day"}</span>
    ) : unmarked ? (
      <span className="badge warn">Not marked</span>
    ) : null;

  return (
    <li className={`session status-${s.status}${unmarked ? " unmarked" : ""}`}>
      <div className="session-main">
        <div className="session-time">
          <strong>{s.time}</strong>
          <span className="muted">{s.end}</span>
        </div>
        <div className="session-text">
          <p className="session-title">
            {title}
            {s.kind === "makeup" && <span className="chip-mini">Make-up</span>}
            {s.kind === "extra" && <span className="chip-mini">Extra</span>}
          </p>
          <p className="muted small">
            {[cls?.subject, who, compact ? null : `${s.minutes} min`].filter(Boolean).join(" · ")}
          </p>
          {s.topic && (
            <p className="session-topic small">
              <span className="muted">Taught:</span> {s.topic}
            </p>
          )}
          {statusBadge && <div className="session-badges">{statusBadge}</div>}
        </div>
      </div>

      {!open && (
        <div className="session-actions">
          {s.status === "scheduled" && (
            <>
              <button
                type="button"
                className="btn small primary"
                disabled={Boolean(busy)}
                aria-busy={busy === "attended"}
                onClick={() =>
                  run("attended", async () => {
                    const next = await put({ status: "attended" });
                    // Ask what was taught straight away.
                    setForm({ status: "attended", topic: next.topic, notes: next.notes, date: next.date, time: next.time });
                    setOpen(true);
                  })
                }
              >
                {busy === "attended" ? <Spinner /> : "✓"} Attended
              </button>
              <button type="button" className="btn small" disabled={Boolean(busy)} aria-busy={busy === "cancel"} onClick={() => run("cancel", () => put({ status: "cancelled" }), "Marked as cancelled")}>
                {busy === "cancel" && <Spinner />} Cancelled
              </button>
              {s.kind !== "makeup" && (
                <button type="button" className="btn small" disabled={Boolean(busy)} onClick={() => openEditor("rescheduled")}>
                  Reschedule
                </button>
              )}
            </>
          )}
          <button type="button" className="text-btn" onClick={() => openEditor()} aria-expanded={false}>
            {s.status === "scheduled" ? "Details" : "Edit"}
          </button>
        </div>
      )}

      {open && form && (
        <form
          className="form session-editor"
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
        >
          <div className="field-block">
            <span className="field-label">What happened</span>
            <div className="seg session-status" role="group" aria-label="Status">
              {["scheduled", "attended", "cancelled", "rescheduled"]
                .filter((k) => !(k === "rescheduled" && s.kind === "makeup"))
                .map((k) => (
                  <button key={k} type="button" className={`seg-btn${form.status === k ? " on" : ""}`} aria-pressed={form.status === k} onClick={() => setForm((f) => ({ ...f, status: k }))}>
                    {STATUS_LABEL[k]}
                  </button>
                ))}
            </div>
          </div>
          {form.status === "rescheduled" && (
            <div className="row">
              <label>
                New date
                <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} required />
              </label>
              <label>
                New time
                <input type="time" value={form.time} onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))} required />
              </label>
            </div>
          )}
          <label>
            <span className="field-label">
              What you taught <span className="opt">optional</span>
            </span>
            <input value={form.topic} onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))} maxLength={300} placeholder="Quadratics: completing the square" autoFocus={form.status === "attended"} />
          </label>
          <label>
            <span className="field-label">
              Notes <span className="opt">optional</span>
            </span>
            <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} maxLength={1000} rows={2} placeholder="Homework set, what to revisit, why it was cancelled" />
          </label>
          <div className="form-foot">
            <button type="submit" className="btn primary" disabled={Boolean(busy)} aria-busy={busy === "save"}>
              {busy === "save" && <Spinner />} Save
            </button>
            <button type="button" className="btn" onClick={() => setOpen(false)}>
              Close
            </button>
            {s.kind === "extra" &&
              (confirm ? (
                <>
                  <button
                    type="button"
                    className="btn danger"
                    disabled={Boolean(busy)}
                    onClick={() =>
                      run("delete", async () => {
                        await api(`/api/admin/teaching/sessions/${encodeURIComponent(s.id)}`, { method: "DELETE" });
                        onRemoved?.(s.id);
                      })
                    }
                  >
                    {busy === "delete" && <Spinner />} Delete this class
                  </button>
                  <button type="button" className="text-btn" onClick={() => setConfirm(false)}>
                    Keep
                  </button>
                </>
              ) : (
                <button type="button" className="text-btn danger" onClick={() => setConfirm(true)}>
                  Delete
                </button>
              ))}
          </div>
        </form>
      )}
      {msg.text && (
        <p role="status" className={`form-status${msg.error ? " err" : ""}`}>
          {msg.text}
        </p>
      )}
    </li>
  );
}
