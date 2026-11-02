"use client";

import { useEffect, useState } from "react";
import { api, nowStamp, prettyDate, shiftDate, shiftStamp, todayStr } from "../api";
import Spinner from "../Spinner";

// Sleep is logged as sessions: tap "Going to sleep" and "I'm awake", or add one
// afterwards. Any number a day (a night plus a nap is fine), and bedtimes after
// midnight just work because every time carries its own date. A session counts
// toward the day you woke up.

const hours = (mins) => `${Math.floor(mins / 60)}h ${String(mins % 60).padStart(2, "0")}m`;
const QUALITY = ["", "Awful", "Poor", "OK", "Good", "Great"];
const NAP_MINUTES = 3 * 60;
const time = (stamp) => stamp.slice(11);
const shortDay = (date) => prettyDate(date, { weekday: "short", day: "numeric", month: "short" });

function minutesBetween(start, end) {
  if (!start || !end) return null;
  return Math.round((new Date(`${end}:00`) - new Date(`${start}:00`)) / 60000);
}

// "23:40" when it's the same day as the wake-up, "Sun 23:40" when it isn't.
function startLabel(s) {
  const date = s.start.slice(0, 10);
  return date === s.day ? time(s.start) : `${prettyDate(date, { weekday: "short" })} ${time(s.start)}`;
}

function QualityChips({ value, onPick, disabled }) {
  return (
    <div className="seg quality-seg" role="group" aria-label="How well did you sleep?">
      {[1, 2, 3, 4, 5].map((q) => (
        <button
          key={q}
          type="button"
          className={`seg-btn${Number(value) === q ? " on" : ""}`}
          aria-pressed={Number(value) === q}
          disabled={disabled}
          onClick={() => onPick(Number(value) === q ? null : q)}
        >
          {QUALITY[q]}
        </button>
      ))}
    </div>
  );
}

// Add a past sleep, or edit one. initial: { start, end, quality, note }.
function SessionForm({ initial, submitLabel, onSubmit, onCancel }) {
  const [form, setForm] = useState(initial);
  const [state, setState] = useState({ busy: false, error: "" });
  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setState({ busy: false, error: "" });
  };
  const mins = minutesBetween(form.start, form.end);
  const max = nowStamp();

  async function submit(e) {
    e.preventDefault();
    setState({ busy: true, error: "" });
    try {
      await onSubmit(form);
    } catch (err) {
      setState({ busy: false, error: err.message });
    }
  }

  return (
    <form className="form sleep-form" onSubmit={submit}>
      <div className="sleep-form-row">
        <label>
          Fell asleep
          <input type="datetime-local" value={form.start} onChange={set("start")} max={max} required />
        </label>
        <label>
          Woke up
          <input type="datetime-local" value={form.end} onChange={set("end")} min={form.start} max={max} required />
        </label>
      </div>
      <p className={`small ${mins !== null && mins <= 0 ? "form-status err" : "muted"}`}>
        {mins === null
          ? " "
          : mins <= 0
            ? "Waking up has to come after falling asleep. Check the dates."
            : `${hours(mins)}${mins < NAP_MINUTES ? " · counts as a nap" : ""} · counts toward ${shortDay(form.end.slice(0, 10))}`}
      </p>
      <div className="field-block">
        <span className="field-label">
          How well did you sleep? <span className="opt">optional</span>
        </span>
        <QualityChips value={form.quality} onPick={(q) => setForm((f) => ({ ...f, quality: q }))} />
      </div>
      <label>
        <span className="field-label">
          Note <span className="opt">optional</span>
        </span>
        <input value={form.note ?? ""} onChange={set("note")} maxLength={500} placeholder="Late coffee, woke up at 3am…" />
      </label>
      <div className="form-foot">
        <button className="btn primary" type="submit" disabled={state.busy} aria-busy={state.busy}>
          {state.busy && <Spinner />}
          {state.busy ? "Saving…" : submitLabel}
        </button>
        <button className="btn" type="button" onClick={onCancel}>
          Cancel
        </button>
        {state.error && <p className="form-status err">{state.error}</p>}
      </div>
    </form>
  );
}

// The top card: one tap when you go to bed, one when you wake up.
function NowCard({ open, justWoke, onStart, onWake, onCancelOpen, onRate, onAddPast, setOpenStart }) {
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [now, setNow] = useState(nowStamp());
  const [editStart, setEditStart] = useState(false);

  useEffect(() => {
    if (!open) return;
    const t = setInterval(() => setNow(nowStamp()), 30000);
    return () => clearInterval(t);
  }, [open]);

  async function run(kind, fn) {
    setBusy(kind);
    setError("");
    try {
      await fn();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  }

  if (open) {
    const mins = Math.max(0, minutesBetween(open.start, now));
    return (
      <div className="tile sleep-now asleep">
        <p className="label">Asleep since</p>
        <p className="sleep-now-big">
          {startLabel({ ...open, day: now.slice(0, 10) })} <span className="muted">· {hours(mins)} so far</span>
        </p>
        {editStart ? (
          <form
            className="form inline-form"
            onSubmit={(e) => {
              e.preventDefault();
              run("start", async () => {
                await setOpenStart(e.currentTarget.elements.start.value);
                setEditStart(false);
              });
            }}
          >
            <input name="start" type="datetime-local" defaultValue={open.start} max={nowStamp()} required aria-label="Fell asleep at" />
            <button className="btn small" type="submit" disabled={Boolean(busy)} aria-busy={busy === "start"}>
              {busy === "start" && <Spinner />} Save
            </button>
            <button className="text-btn" type="button" onClick={() => setEditStart(false)}>
              Cancel
            </button>
          </form>
        ) : (
          <div className="form-foot">
            <button
              className="btn primary big-btn"
              type="button"
              disabled={Boolean(busy)}
              aria-busy={busy === "wake"}
              onClick={() => run("wake", onWake)}
            >
              {busy === "wake" && <Spinner />}
              I&apos;m awake
            </button>
            <button className="btn small" type="button" onClick={() => setEditStart(true)}>
              Change start time
            </button>
            <button className="text-btn" type="button" disabled={Boolean(busy)} onClick={() => run("cancel", onCancelOpen)}>
              {busy === "cancel" && <Spinner />} Tapped by mistake
            </button>
          </div>
        )}
        {error && <p className="form-status err">{error}</p>}
      </div>
    );
  }

  return (
    <div className="tile sleep-now">
      {justWoke ? (
        <>
          <p className="label">Just woke up</p>
          <p className="sleep-now-big">
            You slept {hours(justWoke.minutes)}
            {justWoke.minutes < NAP_MINUTES ? " (a nap)" : ""}. How was it?
          </p>
          <QualityChips value={justWoke.quality} disabled={busy === "rate"} onPick={(q) => run("rate", () => onRate(q))} />
        </>
      ) : (
        <>
          <p className="label">Awake</p>
          <p className="muted small">Tap when you go to bed and again when you wake up. Naps count too.</p>
        </>
      )}
      <div className="form-foot">
        <button
          className="btn primary big-btn"
          type="button"
          disabled={Boolean(busy)}
          aria-busy={busy === "sleep"}
          onClick={() => run("sleep", onStart)}
        >
          {busy === "sleep" && <Spinner />}
          Going to sleep
        </button>
        <button className="btn" type="button" onClick={onAddPast}>
          + Add a past sleep
        </button>
      </div>
      {error && <p className="form-status err">{error}</p>}
    </div>
  );
}

function SessionRow({ s, onSaved, onDeleted }) {
  const [editing, setEditing] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (editing) {
    return (
      <li className="sleep-session editing">
        <SessionForm
          initial={{ start: s.start, end: s.end, quality: s.quality, note: s.note }}
          submitLabel="Save"
          onCancel={() => setEditing(false)}
          onSubmit={async (form) => {
            const { session } = await api(`/api/admin/fitness/sleep/${s.id}`, { method: "PATCH", body: form });
            onSaved(session);
            setEditing(false);
          }}
        />
      </li>
    );
  }

  return (
    <li className="sleep-session">
      <span className="sleep-times">
        {startLabel(s)} → {time(s.end)}
      </span>
      <span className="small sleep-hours">{hours(s.minutes)}</span>
      <span className="muted small sleep-detail">
        {s.minutes < NAP_MINUTES ? "Nap" : "Sleep"}
        {s.quality ? ` · ${QUALITY[s.quality]}` : ""}
        {s.note ? ` · ${s.note}` : ""}
      </span>
      <span className="todo-actions">
        {confirm ? (
          <>
            <button
              type="button"
              className="text-btn danger"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  await api(`/api/admin/fitness/sleep/${s.id}`, { method: "DELETE" });
                  onDeleted(s.id);
                } catch (err) {
                  setError(err.message);
                  setBusy(false);
                }
              }}
            >
              {busy && <Spinner />} Delete
            </button>
            <button type="button" className="text-btn" onClick={() => setConfirm(false)}>
              Keep
            </button>
          </>
        ) : (
          <>
            <button type="button" className="text-btn" onClick={() => setEditing(true)}>
              Edit
            </button>
            <button type="button" className="text-btn" onClick={() => setConfirm(true)}>
              Delete
            </button>
          </>
        )}
      </span>
      {error && <p className="form-status err">{error}</p>}
    </li>
  );
}

export default function SleepTab() {
  const [sessions, setSessions] = useState(null);
  const [open, setOpen] = useState(null);
  const [justWoke, setJustWoke] = useState(null);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [today, setToday] = useState("");

  useEffect(() => {
    const t = todayStr();
    setToday(t);
    api(`/api/admin/fitness/sleep?since=${shiftDate(t, -13)}`)
      .then((d) => {
        setSessions(d.sessions);
        setOpen(d.open);
      })
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p className="form-status err">{error}</p>;
  if (!sessions || !today)
    return (
      <div className="inline-loading" role="status" aria-label="Loading sleep">
        <span className="spinner" />
      </div>
    );

  const sortNewest = (list) => [...list].sort((a, b) => b.start.localeCompare(a.start));
  const upsert = (session) => setSessions((list) => sortNewest([session, ...list.filter((x) => x.id !== session.id)]));

  // Totals per wake-up day, last 14 days.
  const days = Array.from({ length: 14 }, (_, i) => shiftDate(today, -i))
    .map((date) => {
      const list = sessions.filter((s) => s.day === date);
      return { date, list, total: list.reduce((a, s) => a + s.minutes, 0) };
    })
    .filter((d) => d.list.length > 0);
  const week = days.filter((d) => d.date > shiftDate(today, -7));
  const avg = week.length ? Math.round(week.reduce((a, d) => a + d.total, 0) / week.length) : null;
  const naps = week.reduce((a, d) => a + d.list.filter((s) => s.minutes < NAP_MINUTES).length, 0);
  const max = Math.max(9 * 60, ...days.map((d) => d.total));

  return (
    <>
      <section className="fit-section">
        <h2 className="section-title">Sleep</h2>
        <NowCard
          open={open}
          justWoke={justWoke}
          onStart={async () => {
            const { session } = await api("/api/admin/fitness/sleep", { method: "POST", body: { start: nowStamp() } });
            setJustWoke(null);
            setOpen(session);
          }}
          onWake={async () => {
            // If the start was set later than now (clock change, typo), wake a minute after it.
            const end = nowStamp() > open.start ? nowStamp() : shiftStamp(open.start, 1);
            const { session } = await api(`/api/admin/fitness/sleep/${open.id}`, { method: "PATCH", body: { end } });
            setOpen(null);
            setJustWoke(session);
            upsert(session);
          }}
          onCancelOpen={async () => {
            await api(`/api/admin/fitness/sleep/${open.id}`, { method: "DELETE" });
            setOpen(null);
          }}
          setOpenStart={async (start) => {
            const { session } = await api(`/api/admin/fitness/sleep/${open.id}`, { method: "PATCH", body: { start } });
            setOpen(session);
          }}
          onRate={async (quality) => {
            const { session } = await api(`/api/admin/fitness/sleep/${justWoke.id}`, { method: "PATCH", body: { quality } });
            setJustWoke(session);
            upsert(session);
          }}
          onAddPast={() => setAdding(true)}
        />
        {adding && (
          <div className="tile">
            <p className="label">Add a past sleep</p>
            <SessionForm
              initial={{ start: shiftStamp(nowStamp(), -8 * 60), end: nowStamp(), quality: null, note: "" }}
              submitLabel="Add sleep"
              onCancel={() => setAdding(false)}
              onSubmit={async (form) => {
                const { session } = await api("/api/admin/fitness/sleep", { method: "POST", body: form });
                upsert(session);
                setAdding(false);
              }}
            />
          </div>
        )}
      </section>

      <section className="fit-section">
        <h2 className="section-title">Last 7 days</h2>
        <div className="sleep-stats">
          <div className="tile">
            <p className="label">Average a day</p>
            <p className="macro-value">{avg ? hours(avg) : "–"}</p>
            <p className="muted small">All sleep that day, naps included. Aim for 7–9 hours.</p>
          </div>
          <div className="tile">
            <p className="label">Days logged</p>
            <p className="macro-value">
              {week.length} / 7 <span className="muted small">· {naps} {naps === 1 ? "nap" : "naps"}</span>
            </p>
            <p className="muted small">One long sleep at a regular time helps recovery more than several short ones.</p>
          </div>
        </div>
      </section>

      <section className="fit-section">
        <h2 className="section-title">By day</h2>
        {days.length === 0 ? (
          <p className="empty muted">No sleep logged in the last two weeks.</p>
        ) : (
          <ul className="sleep-days">
            {days.map((d) => (
              <li key={d.date} className="tile sleep-day">
                <div className="sleep-day-head">
                  <span className="label">{d.date === today ? "Today" : shortDay(d.date)}</span>
                  <span className="bar-track">
                    <span className={`bar ${d.total < 7 * 60 ? "short" : ""}`} style={{ width: `${(d.total / max) * 100}%` }} />
                  </span>
                  <strong className="small sleep-hours">{hours(d.total)}</strong>
                </div>
                <ul className="sleep-sessions">
                  {d.list.map((s) => (
                    <SessionRow
                      key={`${s.id}:${s.start}:${s.end}:${s.quality}:${s.note}`}
                      s={s}
                      onSaved={upsert}
                      onDeleted={(id) => setSessions((list) => list.filter((x) => x.id !== id))}
                    />
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
