"use client";

import { useState } from "react";
import Spinner from "../Spinner";
import { WEEKDAYS_LONG, shortDate } from "./shared";

const LENGTHS = [30, 45, 60, 75, 90, 120];

const normal = (slots) =>
  slots
    .map((s) => ({ weekday: Number(s.weekday), time: s.time, minutes: Number(s.minutes) }))
    .sort((a, b) => a.weekday - b.weekday || a.time.localeCompare(b.time));

// Add or edit a class: who, what, which days and times, and how long it runs (until you
// change it, or until a date). When editing a class that has already started, new days or
// times apply from a date you pick, so earlier weeks keep their old times.
export default function ClassForm({ initial, students, today, editing = false, submitLabel, onSubmit, onCancel }) {
  const [form, setForm] = useState({ ...initial, endDate: initial.endDate ?? "" });
  const [ongoing, setOngoing] = useState(!initial.endDate);
  const [changeFrom, setChangeFrom] = useState(today);
  const [state, setState] = useState({ busy: false, error: "" });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setSlot = (i, k, v) => setForm((f) => ({ ...f, slots: f.slots.map((s, j) => (j === i ? { ...s, [k]: v } : s)) }));
  const choices = students.filter((s) => s.active || form.studentIds.includes(s.id));
  const timesChanged = editing && JSON.stringify(normal(form.slots)) !== JSON.stringify(normal(initial.slots));
  const askWhen = timesChanged && initial.startDate < today;

  async function submit(e) {
    e.preventDefault();
    setState({ busy: true, error: "" });
    try {
      await onSubmit({
        ...form,
        endDate: ongoing ? null : form.endDate,
        changeFrom: askWhen ? changeFrom : null,
        slots: normal(form.slots),
      });
    } catch (err) {
      setState({ busy: false, error: err.message });
    }
  }

  return (
    <form className="form class-form" onSubmit={submit}>
      <fieldset className="field-block plain">
        <legend className="field-label">Students</legend>
        {choices.length === 0 ? (
          <p className="muted small">Add a student first (Students tab).</p>
        ) : (
          <div className="check-grid">
            {choices.map((s) => (
              <label key={s.id} className="check-pill">
                <input
                  type="checkbox"
                  checked={form.studentIds.includes(s.id)}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, studentIds: e.target.checked ? [...f.studentIds, s.id] : f.studentIds.filter((x) => x !== s.id) }))
                  }
                />
                <span>{s.name}</span>
              </label>
            ))}
          </div>
        )}
      </fieldset>
      <div className="row">
        <label>
          <span className="field-label">
            Subject <span className="opt">optional</span>
          </span>
          <input value={form.subject} onChange={set("subject")} maxLength={80} placeholder="A Level Maths" />
        </label>
        <label>
          <span className="field-label">
            Name <span className="opt">optional</span>
          </span>
          <input value={form.title} onChange={set("title")} maxLength={100} placeholder="Defaults to the students' names" />
        </label>
      </div>

      <fieldset className="field-block plain">
        <legend className="field-label">Days and times</legend>
        <ul className="slot-list">
          {form.slots.map((s, i) => (
            <li key={i} className="slot-row">
              <select value={s.weekday} onChange={(e) => setSlot(i, "weekday", e.target.value)} aria-label="Day">
                {WEEKDAYS_LONG.map((d, n) => (
                  <option key={d} value={n}>
                    {d}
                  </option>
                ))}
              </select>
              <input type="time" value={s.time} onChange={(e) => setSlot(i, "time", e.target.value)} required aria-label="Start time" />
              <select value={s.minutes} onChange={(e) => setSlot(i, "minutes", e.target.value)} aria-label="Length">
                {(LENGTHS.includes(Number(s.minutes)) ? LENGTHS : [...LENGTHS, Number(s.minutes)].sort((a, b) => a - b)).map((m) => (
                  <option key={m} value={m}>
                    {m} min
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="icon-btn"
                aria-label="Remove this day"
                disabled={form.slots.length === 1}
                onClick={() => setForm((f) => ({ ...f, slots: f.slots.filter((_, j) => j !== i) }))}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="text-btn"
          onClick={() => setForm((f) => ({ ...f, slots: [...f.slots, { ...f.slots[f.slots.length - 1] }] }))}
        >
          + Add another day
        </button>
        {askWhen && (
          <div className="change-from">
            <label>
              New times start on
              <input type="date" value={changeFrom} onChange={(e) => setChangeFrom(e.target.value)} min={initial.startDate} required />
            </label>
            <p className="muted small">
              Classes before this date keep their old times. To fix a mistake in every week, pick the class's start date ({shortDate(initial.startDate)}).
              For a single week, use Reschedule on that class instead.
            </p>
          </div>
        )}
      </fieldset>

      <fieldset className="field-block plain">
        <legend className="field-label">How long it runs</legend>
        <div className="seg" role="group" aria-label="How long it runs">
          <button type="button" className={`seg-btn${ongoing ? " on" : ""}`} aria-pressed={ongoing} onClick={() => setOngoing(true)}>
            Until I change it
          </button>
          <button
            type="button"
            className={`seg-btn${ongoing ? "" : " on"}`}
            aria-pressed={!ongoing}
            onClick={() => {
              setOngoing(false);
              setForm((f) => ({ ...f, endDate: f.endDate || initial.defaultEnd || f.startDate }));
            }}
          >
            Until a date
          </button>
        </div>
      </fieldset>
      <div className="row">
        <label>
          {ongoing ? "Starts" : "From"}
          <input type="date" value={form.startDate} onChange={set("startDate")} required />
        </label>
        {!ongoing && (
          <label>
            Until
            <input type="date" value={form.endDate} onChange={set("endDate")} min={form.startDate} required />
          </label>
        )}
      </div>
      <label>
        <span className="field-label">
          Notes <span className="opt">optional</span>
        </span>
        <input value={form.notes} onChange={set("notes")} maxLength={500} placeholder="Syllabus, exam date, where you teach" />
      </label>
      <div className="form-foot">
        <button className="btn primary" type="submit" disabled={state.busy || choices.length === 0} aria-busy={state.busy}>
          {state.busy && <Spinner />} {submitLabel}
        </button>
        <button className="btn" type="button" onClick={onCancel}>
          Cancel
        </button>
        {state.error && (
          <p role="status" className="form-status err">
            {state.error}
          </p>
        )}
      </div>
    </form>
  );
}
