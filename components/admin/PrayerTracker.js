"use client";

import { useCallback, useEffect, useState } from "react";
import LoadingLink from "@/components/LoadingLink";
import { api, nowHHMM, prettyDate, shiftDate, todayStr } from "./api";
import Spinner from "./Spinner";

const PRAYERS = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
const NAMES = { fajr: "Fajr", dhuhr: "Dhuhr", asr: "Asr", maghrib: "Maghrib", isha: "Isha" };
const STATUS = [
  { key: "ontime", label: "On time" },
  { key: "late", label: "Late" },
  { key: "missed", label: "Missed" },
];

const nameFor = (p, friday) => (p === "dhuhr" && friday ? "Jumu'ah" : NAMES[p]);

function minutesUntil(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  const now = new Date();
  return h * 60 + m - (now.getHours() * 60 + now.getMinutes());
}

function inWords(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
}

function NextPrayer({ times, friday }) {
  const [, tick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => tick((n) => n + 1), 30000);
    return () => clearInterval(t);
  }, []);
  const next = PRAYERS.find((p) => minutesUntil(times[p]) > 0);
  if (!next) return <p className="next-prayer muted">All of today's prayer times have passed.</p>;
  return (
    <p className="next-prayer">
      Next: <strong>{nameFor(next, friday)}</strong> at {times[next]} · in {inWords(minutesUntil(times[next]))}
    </p>
  );
}

function Settings({ settings, methods, onSaved }) {
  const [form, setForm] = useState(settings);
  const [state, setState] = useState({ busy: false, error: "", ok: false });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function save(e) {
    e.preventDefault();
    setState({ busy: true, error: "", ok: false });
    try {
      await api("/api/admin/prayers/settings", { method: "PUT", body: form });
      setState({ busy: false, error: "", ok: true });
      onSaved();
    } catch (err) {
      setState({ busy: false, error: err.message, ok: false });
    }
  }

  return (
    <details className="tile prayer-settings">
      <summary>Location and calculation method</summary>
      <form className="form" onSubmit={save}>
        <div className="row">
          <label>
            City
            <input value={form.city} onChange={set("city")} maxLength={80} />
          </label>
          <label>
            Country
            <input value={form.country} onChange={set("country")} maxLength={80} />
          </label>
        </div>
        <div className="row">
          <label>
            Method
            <select value={form.method} onChange={set("method")}>
              {methods.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Asr time
            <select value={form.school} onChange={set("school")}>
              <option value={0}>Standard (Shafi'i, Maliki, Hanbali)</option>
              <option value={1}>Hanafi</option>
            </select>
          </label>
        </div>
        <div className="form-foot">
          <button className="btn" type="submit" disabled={state.busy} aria-busy={state.busy}>
            {state.busy && <Spinner />}
            {state.busy ? "Saving…" : "Save"}
          </button>
          {state.ok && <p className="form-status">Saved</p>}
          {state.error && <p className="form-status err">{state.error}</p>}
        </div>
      </form>
    </details>
  );
}

function Week({ week, selected, onPick, today }) {
  const totals = { ontime: 0, late: 0, missed: 0 };
  for (const d of week) for (const p of PRAYERS) if (d.log[p]) totals[d.log[p]]++;
  const logged = totals.ontime + totals.late + totals.missed;

  return (
    <div className="tile prayer-week">
      <div className="row">
        <p className="label">Last 7 days</p>
        <p className="muted small">
          {logged ? `${totals.ontime} on time · ${totals.late} late · ${totals.missed} missed` : "Nothing logged yet"}
        </p>
      </div>
      <div className="week-grid" role="table" aria-label="Prayers over the last 7 days">
        <div role="row" className="week-row head">
          <span role="columnheader" />
          {week.map((d) => (
            <button
              key={d.date}
              type="button"
              role="columnheader"
              className={`week-day${d.date === selected ? " on" : ""}`}
              onClick={() => onPick(d.date)}
              disabled={d.date > today}
            >
              {prettyDate(d.date, { weekday: "narrow" })}
              <small>{d.date.slice(8)}</small>
            </button>
          ))}
        </div>
        {PRAYERS.map((p) => (
          <div role="row" className="week-row" key={p}>
            <span role="rowheader" className="week-name">
              {NAMES[p]}
            </span>
            {week.map((d) => (
              <span
                role="cell"
                key={d.date}
                className={`dot ${d.log[p] ?? "none"}`}
                title={`${nameFor(p, d.friday)}, ${d.date}: ${STATUS.find((s) => s.key === d.log[p])?.label ?? "not logged"}`}
              />
            ))}
          </div>
        ))}
      </div>
      <p className="legend muted small">
        <span className="dot ontime" /> On time <span className="dot late" /> Late <span className="dot missed" /> Missed
      </p>
    </div>
  );
}

export default function PrayerTracker({ compact = false }) {
  const [today, setToday] = useState("");
  const [date, setDate] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(""); // "prayer:status" being saved

  const load = useCallback(async (d) => {
    setError("");
    try {
      setData(await api(`/api/admin/prayers?date=${d}`));
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    const t = todayStr();
    setToday(t);
    setDate(t);
  }, []);

  useEffect(() => {
    if (date) load(date);
  }, [date, load]);

  async function mark(prayer, status) {
    const next = data.log[prayer] === status ? null : status;
    setSaving(`${prayer}:${status}`);
    setError("");
    try {
      const { log } = await api("/api/admin/prayers", { method: "PUT", body: { date, prayer, status: next } });
      setData((d) => ({ ...d, log, week: d.week.map((w) => (w.date === date ? { ...w, log } : w)) }));
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving("");
    }
  }

  const loading = !data || data.date !== date;

  return (
    <div className="prayers">
      <div className="tile prayer-day">
        <div className="prayer-head">
          <div>
            <p className="label">{date === today ? "Today" : date < today ? "Past day" : "Upcoming"}</p>
            <p className="big">{date && prettyDate(date)}</p>
            <p className="muted small">
              {data?.hijri}
              {data?.settings && ` · ${data.settings.city}`}
            </p>
          </div>
          {!compact && (
            <div className="day-nav">
              <button type="button" className="btn small" onClick={() => setDate(shiftDate(date, -1))} aria-label="Previous day">
                ←
              </button>
              <button type="button" className="btn small" onClick={() => setDate(today)} disabled={date === today}>
                Today
              </button>
              <button
                type="button"
                className="btn small"
                onClick={() => setDate(shiftDate(date, 1))}
                disabled={date >= today}
                aria-label="Next day"
              >
                →
              </button>
            </div>
          )}
        </div>

        {!loading && data.times && date === today && <NextPrayer times={data.times} friday={data.friday} />}
        {!loading && data.timingError && <p className="form-status err">Prayer times unavailable: {data.timingError}</p>}
        {error && <p className="form-status err">{error}</p>}

        {loading ? (
          <div className="inline-loading" role="status" aria-label="Loading prayers">
            <span className="spinner" />
          </div>
        ) : (
          <ul className="prayer-list">
            {PRAYERS.map((p) => (
              <li key={p} className={`prayer ${data.log[p] ?? ""}`}>
                <div className="prayer-name">
                  <strong>{nameFor(p, data.friday)}</strong>
                  {data.times && (
                    <span className="muted small">
                      {data.times[p]}
                      {p === "fajr" && ` · sunrise ${data.times.sunrise}`}
                    </span>
                  )}
                </div>
                <div className="seg" role="group" aria-label={`${nameFor(p, data.friday)} status`}>
                  {STATUS.map((s) => {
                    const busy = saving === `${p}:${s.key}`;
                    return (
                      <button
                        key={s.key}
                        type="button"
                        className={`seg-btn ${s.key}${data.log[p] === s.key ? " on" : ""}`}
                        aria-pressed={data.log[p] === s.key}
                        onClick={() => mark(p, s.key)}
                        disabled={Boolean(saving)}
                        aria-busy={busy}
                      >
                        {busy && <Spinner />}
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </li>
            ))}
          </ul>
        )}
        {!loading && data.friday && (
          <p className="muted small">Jumu'ah is shown at Dhuhr time; your mosque's khutbah time may differ.</p>
        )}
        {compact && (
          <LoadingLink className="see-all" href="/admin/prayers">
            History and settings →
          </LoadingLink>
        )}
      </div>

      {!compact && data && !loading && (
        <>
          <Week week={data.week} selected={date} today={today} onPick={setDate} />
          <Settings
            key={JSON.stringify(data.settings)}
            settings={data.settings}
            methods={data.methods}
            onSaved={() => load(date)}
          />
        </>
      )}
    </div>
  );
}
