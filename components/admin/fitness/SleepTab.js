"use client";

import { useEffect, useState } from "react";
import { api, prettyDate, shiftDate, todayStr } from "../api";
import Spinner from "../Spinner";

const hours = (mins) => `${Math.floor(mins / 60)}h ${String(mins % 60).padStart(2, "0")}m`;
const QUALITY = ["", "Awful", "Poor", "OK", "Good", "Great"];

function minutesBetween(bed, wake) {
  if (!bed || !wake) return null;
  const toMin = (t) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
  let m = toMin(wake) - toMin(bed);
  if (m <= 0) m += 24 * 60;
  return m;
}

function SleepForm({ initial, onSaved }) {
  const [form, setForm] = useState(initial);
  const [state, setState] = useState({ busy: false, error: "", ok: false });
  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setState({ busy: false, error: "", ok: false });
  };
  const mins = minutesBetween(form.bedtime, form.wakeTime);

  async function save(e) {
    e.preventDefault();
    setState({ busy: true, error: "", ok: false });
    try {
      const { night } = await api("/api/admin/fitness/sleep", { method: "PUT", body: form });
      setState({ busy: false, error: "", ok: true });
      onSaved(night);
    } catch (err) {
      setState({ busy: false, error: err.message, ok: false });
    }
  }

  return (
    <form className="form" onSubmit={save}>
      <div className="sleep-form-row">
        <label>
          Woke up on
          <input type="date" value={form.date} onChange={set("date")} max={todayStr()} />
        </label>
        <label>
          Went to sleep
          <input type="time" value={form.bedtime} onChange={set("bedtime")} required />
        </label>
        <label>
          Woke up
          <input type="time" value={form.wakeTime} onChange={set("wakeTime")} required />
        </label>
      </div>
      <fieldset className="radio-row quality-row">
        <legend>How well did you sleep?</legend>
        {[1, 2, 3, 4, 5].map((q) => (
          <label key={q}>
            <input type="radio" name="quality" value={q} checked={String(form.quality) === String(q)} onChange={set("quality")} />{" "}
            {QUALITY[q]}
          </label>
        ))}
      </fieldset>
      <label>
        <span className="field-label">
          Note <span className="opt">optional</span>
        </span>
        <input value={form.note} onChange={set("note")} maxLength={500} placeholder="Late coffee, woke up at 3am…" />
      </label>
      <div className="form-foot">
        <button className="btn primary" type="submit" disabled={state.busy} aria-busy={state.busy}>
          {state.busy && <Spinner />}
          {state.busy ? "Saving…" : "Save night"}
        </button>
        {mins !== null && <p className="muted small">That&apos;s {hours(mins)} of sleep.</p>}
        {state.ok && <p className="form-status">Saved</p>}
        {state.error && <p className="form-status err">{state.error}</p>}
      </div>
    </form>
  );
}

export default function SleepTab() {
  const [nights, setNights] = useState(null);
  const [error, setError] = useState("");
  const [today, setToday] = useState("");

  useEffect(() => {
    setToday(todayStr());
    api("/api/admin/fitness/sleep")
      .then((d) => setNights(d.nights))
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p className="form-status err">{error}</p>;
  if (!nights || !today)
    return (
      <div className="inline-loading" role="status" aria-label="Loading sleep">
        <span className="spinner" />
      </div>
    );

  const last = nights.find((n) => n.date === today);
  const week = nights.filter((n) => n.date > shiftDate(today, -7));
  const avg = week.length ? Math.round(week.reduce((a, n) => a + n.minutes, 0) / week.length) : null;
  const recent = nights.slice(0, 14);
  const max = Math.max(9 * 60, ...recent.map((n) => n.minutes));

  return (
    <>
      <section className="fit-section">
        <h2 className="section-title">Log last night</h2>
        <div className="tile">
          <SleepForm
            key={last ? `${last.date}:${last.bedtime}:${last.wakeTime}` : today}
            initial={{
              date: today,
              bedtime: last?.bedtime ?? "23:30",
              wakeTime: last?.wakeTime ?? "07:30",
              quality: last?.quality ?? "",
              note: last?.note ?? "",
            }}
            onSaved={(night) =>
              setNights((list) => [night, ...list.filter((n) => n.date !== night.date)].sort((a, b) => b.date.localeCompare(a.date)))
            }
          />
        </div>
      </section>

      <section className="fit-section">
        <h2 className="section-title">Last two weeks</h2>
        <div className="sleep-stats">
          <div className="tile">
            <p className="label">7-day average</p>
            <p className="macro-value">{avg ? hours(avg) : "–"}</p>
            <p className="muted small">Aim for 7–9 hours. Muscle is built while you recover.</p>
          </div>
          <div className="tile">
            <p className="label">Nights logged this week</p>
            <p className="macro-value">{week.length} / 7</p>
            <p className="muted small">Going to bed at the same time every night helps as much as total hours.</p>
          </div>
        </div>
        {recent.length === 0 ? (
          <p className="empty muted">No nights logged yet.</p>
        ) : (
          <ul className="tile sleep-list">
            {recent.map((n) => (
              <li key={n.date}>
                <span className="muted small">{prettyDate(n.date, { weekday: "short", day: "numeric", month: "short" })}</span>
                <span className="bar-track">
                  <span className={`bar ${n.minutes < 7 * 60 ? "short" : ""}`} style={{ width: `${(n.minutes / max) * 100}%` }} />
                </span>
                <span className="small sleep-hours">{hours(n.minutes)}</span>
                <span className="muted small sleep-detail">
                  {n.bedtime}–{n.wakeTime}
                  {n.quality ? ` · ${QUALITY[n.quality]}` : ""}
                  {n.note ? ` · ${n.note}` : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
