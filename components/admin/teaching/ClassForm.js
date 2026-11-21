"use client";

import { useState } from "react";
import Spinner from "../Spinner";
import { WEEKDAYS_LONG } from "./shared";

const LENGTHS = [30, 45, 60, 75, 90, 120];

// Add or edit a class: who, what, which days and times, and from when to when.
export default function ClassForm({ initial, students, submitLabel, onSubmit, onCancel }) {
  const [form, setForm] = useState(initial);
  const [state, setState] = useState({ busy: false, error: "" });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setSlot = (i, k, v) => setForm((f) => ({ ...f, slots: f.slots.map((s, j) => (j === i ? { ...s, [k]: v } : s)) }));
  const choices = students.filter((s) => s.active || form.studentIds.includes(s.id));

  async function submit(e) {
    e.preventDefault();
    setState({ busy: true, error: "" });
    try {
      await onSubmit({
        ...form,
        slots: form.slots.map((s) => ({ weekday: Number(s.weekday), time: s.time, minutes: Number(s.minutes) })),
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
      </fieldset>

      <div className="row">
        <label>
          From
          <input type="date" value={form.startDate} onChange={set("startDate")} required />
        </label>
        <label>
          Until
          <input type="date" value={form.endDate} onChange={set("endDate")} min={form.startDate} required />
        </label>
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
