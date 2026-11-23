"use client";

import { useCallback, useEffect, useState } from "react";
import { api, prettyDate, shiftDate, todayStr } from "../api";
import Spinner from "../Spinner";
import ClassForm from "./ClassForm";
import SessionRow from "./SessionRow";
import { WEEKDAYS_LONG, classStudents, classTitle, endOfNextMonth, hours, isUnmarked, mondayOf, nowStampLocal, shortDate, slotText, studentsById } from "./shared";

const VIEW_KEY = "teaching-view";
const VIEWS = [
  ["week", "This week"],
  ["students", "Students"],
  ["classes", "Classes"],
];

// ---------------------------------------------------------------- This week

function ExtraForm({ classes, byId, defaultDate, onAdded, onCancel }) {
  const [form, setForm] = useState({ classId: classes[0]?.id ?? "", date: defaultDate, time: "17:00", minutes: 60, topic: "" });
  const [state, setState] = useState({ busy: false, error: "" });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  return (
    <form
      className="form tile"
      onSubmit={async (e) => {
        e.preventDefault();
        setState({ busy: true, error: "" });
        try {
          const { session } = await api("/api/admin/teaching/sessions", { method: "POST", body: { ...form, minutes: Number(form.minutes) } });
          onAdded(session);
        } catch (err) {
          setState({ busy: false, error: err.message });
        }
      }}
    >
      <p className="label">One-off class</p>
      <label>
        Class
        <select value={form.classId} onChange={set("classId")} required>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {classTitle(c, byId)}
            </option>
          ))}
        </select>
      </label>
      <div className="row three">
        <label>
          Date
          <input type="date" value={form.date} onChange={set("date")} required />
        </label>
        <label>
          Time
          <input type="time" value={form.time} onChange={set("time")} required />
        </label>
        <label>
          Length
          <select value={form.minutes} onChange={set("minutes")}>
            {[30, 45, 60, 75, 90, 120].map((m) => (
              <option key={m} value={m}>
                {m} min
              </option>
            ))}
          </select>
        </label>
      </div>
      <label>
        <span className="field-label">
          What you'll teach <span className="opt">optional</span>
        </span>
        <input value={form.topic} onChange={set("topic")} maxLength={300} />
      </label>
      <div className="form-foot">
        <button className="btn primary" type="submit" disabled={state.busy} aria-busy={state.busy}>
          {state.busy && <Spinner />} Add class
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

function WeekView({ data, week, setWeek, today, onSessions, reload, goTo }) {
  const [adding, setAdding] = useState(false);
  const byId = studentsById(data.students);
  const classById = Object.fromEntries(data.classes.map((c) => [c.id, c]));
  const now = nowStampLocal();
  const sessions = data.sessions;
  const count = (st) => sessions.filter((s) => s.status === st).length;
  const unmarked = sessions.filter((s) => isUnmarked(s, now)).length;
  const taught = sessions.filter((s) => s.status === "attended").reduce((a, s) => a + s.minutes, 0);
  const dates = [...new Set(sessions.map((s) => s.date))];
  const update = (next) => onSessions((list) => list.map((x) => (x.id === next.id ? next : x)));

  if (!data.classes.length) {
    return (
      <div className="tile empty-state">
        <p className="big">No classes yet</p>
        <p className="muted">Add your students, then a class with its days and times. Every class until its end date appears here automatically.</p>
        <div className="form-foot">
          <button type="button" className="btn primary" onClick={() => goTo(data.students.length ? "classes" : "students")}>
            {data.students.length ? "Add a class" : "Add a student"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="week-nav tile">
        <button type="button" className="btn small" onClick={() => setWeek(shiftDate(week, -7))} aria-label="Previous week">
          ←
        </button>
        <div className="week-label">
          <p className="big">
            {prettyDate(week, { day: "numeric", month: "short" })} – {prettyDate(shiftDate(week, 6), { day: "numeric", month: "short" })}
          </p>
          {week !== mondayOf(today) && (
            <button type="button" className="text-btn" onClick={() => setWeek(mondayOf(today))}>
              Back to this week
            </button>
          )}
        </div>
        <button type="button" className="btn small" onClick={() => setWeek(shiftDate(week, 7))} aria-label="Next week">
          →
        </button>
      </div>

      <div className="teach-stats" aria-label="This week">
        <div>
          <strong>{sessions.length}</strong>
          <span>classes</span>
        </div>
        <div>
          <strong>{count("attended")}</strong>
          <span>attended</span>
        </div>
        <div>
          <strong>{count("cancelled")}</strong>
          <span>cancelled</span>
        </div>
        <div>
          <strong>{count("rescheduled")}</strong>
          <span>rescheduled</span>
        </div>
        <div className={unmarked ? "warn" : ""}>
          <strong>{unmarked}</strong>
          <span>not marked</span>
        </div>
        <div>
          <strong>{hours(taught)}</strong>
          <span>taught</span>
        </div>
      </div>

      <div className="row section-row">
        <h2 className="section-title">Timetable</h2>
        {!adding && (
          <button type="button" className="btn small" onClick={() => setAdding(true)}>
            + One-off class
          </button>
        )}
      </div>
      {adding && (
        <ExtraForm
          classes={data.classes}
          byId={byId}
          defaultDate={week <= today && today <= shiftDate(week, 6) ? today : week}
          onCancel={() => setAdding(false)}
          onAdded={() => {
            setAdding(false);
            reload();
          }}
        />
      )}

      {dates.length === 0 ? (
        <p className="empty">No classes this week.</p>
      ) : (
        <div className="teach-days">
          {dates.map((d) => (
            <section key={d} className="teach-day" aria-labelledby={`day-${d}`}>
              <h3 id={`day-${d}`} className={`teach-day-head${d === today ? " today" : ""}`}>
                {prettyDate(d, { weekday: "long", day: "numeric", month: "long" })}
                {d === today && <span className="badge accent">Today</span>}
              </h3>
              <ul className="tile session-list">
                {sessions
                  .filter((s) => s.date === d)
                  .map((s) => (
                    <SessionRow
                      key={s.id}
                      session={s}
                      cls={classById[s.classId]}
                      byId={byId}
                      now={now}
                      onChange={update}
                      onRemoved={(id) => onSessions((list) => list.filter((x) => x.id !== id))}
                      onReload={reload}
                    />
                  ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </>
  );
}

// ---------------------------------------------------------------- Students

function StudentForm({ initial, submitLabel, onSubmit, onCancel }) {
  const [form, setForm] = useState(initial);
  const [state, setState] = useState({ busy: false, error: "" });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  return (
    <form
      className="form"
      onSubmit={async (e) => {
        e.preventDefault();
        setState({ busy: true, error: "" });
        try {
          await onSubmit(form);
        } catch (err) {
          setState({ busy: false, error: err.message });
        }
      }}
    >
      <div className="row">
        <label>
          Name
          <input value={form.name} onChange={set("name")} maxLength={80} required autoFocus />
        </label>
        <label>
          <span className="field-label">
            Level or subject <span className="opt">optional</span>
          </span>
          <input value={form.level} onChange={set("level")} maxLength={80} placeholder="A Level Maths" />
        </label>
      </div>
      <label>
        <span className="field-label">
          Notes <span className="opt">optional</span>
        </span>
        <input value={form.notes} onChange={set("notes")} maxLength={500} placeholder="Exam board, parent's contact, goals" />
      </label>
      <div className="form-foot">
        <button className="btn primary" type="submit" disabled={state.busy} aria-busy={state.busy}>
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

function StudentCard({ student, classes, history, onSaved, onDeleted }) {
  const [editing, setEditing] = useState(false);
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const mine = classes.filter((c) => c.studentIds.includes(student.id));
  const done = history.filter((s) => mine.some((c) => c.id === s.classId));
  const n = (st) => done.filter((s) => s.status === st).length;
  const last = [...done].reverse().find((s) => s.status === "attended");
  const url = `/api/admin/teaching/students/${student.id}`;

  async function run(kind, fn) {
    setBusy(kind);
    setError("");
    try {
      await fn();
    } catch (err) {
      setError(err.message);
      setBusy("");
    }
  }

  if (editing) {
    return (
      <li className="tile editing">
        <StudentForm
          initial={{ name: student.name, level: student.level, notes: student.notes }}
          submitLabel="Save"
          onCancel={() => setEditing(false)}
          onSubmit={async (form) => {
            const { student: next } = await api(url, { method: "PATCH", body: form });
            onSaved(next);
            setEditing(false);
          }}
        />
      </li>
    );
  }

  return (
    <li className={`tile student-card${student.active ? "" : " archived"}`}>
      <div className="row">
        <div>
          <h3 className="student-name">
            {student.name}
            {!student.active && <span className="badge">Archived</span>}
          </h3>
          {student.level && <p className="muted small">{student.level}</p>}
        </div>
      </div>
      <p className="small">
        <strong>{n("attended")}</strong> attended · <strong>{n("cancelled")}</strong> cancelled · <strong>{n("rescheduled")}</strong> rescheduled
      </p>
      {last?.topic && (
        <p className="small">
          <span className="muted">Last taught ({shortDate(last.date)}):</span> {last.topic}
        </p>
      )}
      <p className="muted small">{mine.length ? mine.map((c) => c.slots.map(slotText).join(", ")).join(" · ") : "Not in any class"}</p>
      {student.notes && <p className="muted small">{student.notes}</p>}

      {open && (
        <ul className="history">
          {done.length === 0 ? (
            <li className="muted small">No classes yet.</li>
          ) : (
            [...done]
              .reverse()
              .slice(0, 40)
              .map((s) => (
                <li key={s.id}>
                  <span className="history-date">{shortDate(s.date)}</span>
                  <span className={`history-status ${s.status}`}>{s.status === "scheduled" ? "Not marked" : s.status[0].toUpperCase() + s.status.slice(1)}</span>
                  <span className="history-topic">{s.topic || <span className="muted">–</span>}</span>
                </li>
              ))
          )}
        </ul>
      )}

      <div className="form-foot">
        <button type="button" className="text-btn" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          {open ? "Hide history" : "History"}
        </button>
        <button type="button" className="text-btn" onClick={() => setEditing(true)}>
          Edit
        </button>
        <button
          type="button"
          className="text-btn"
          disabled={Boolean(busy)}
          onClick={() =>
            run("archive", async () => {
              const { student: next } = await api(url, { method: "PATCH", body: { active: !student.active } });
              onSaved(next);
              setBusy("");
            })
          }
        >
          {busy === "archive" && <Spinner />} {student.active ? "Archive" : "Unarchive"}
        </button>
        {confirm ? (
          <>
            <button
              type="button"
              className="btn small danger"
              disabled={Boolean(busy)}
              onClick={() =>
                run("delete", async () => {
                  await api(url, { method: "DELETE" });
                  onDeleted(student.id);
                })
              }
            >
              {busy === "delete" && <Spinner />} Delete student
            </button>
            <button type="button" className="text-btn" onClick={() => setConfirm(false)}>
              Keep
            </button>
          </>
        ) : (
          <button type="button" className="text-btn danger" onClick={() => setConfirm(true)}>
            Delete
          </button>
        )}
      </div>
      {error && (
        <p role="status" className="form-status err">
          {error}
        </p>
      )}
    </li>
  );
}

function StudentsView({ data, setData, today }) {
  const [adding, setAdding] = useState(false);
  const [history, setHistory] = useState(null);
  const [error, setError] = useState("");

  // History: every class from the earliest start date (at most ~13 months back) up to today.
  useEffect(() => {
    const starts = data.classes.map((c) => c.startDate).sort();
    const floor = shiftDate(today, -399);
    const from = starts[0] && starts[0] > floor ? starts[0] : floor;
    if (!starts.length || from > today) return setHistory([]);
    api(`/api/admin/teaching?from=${from}&to=${today}`)
      .then((d) => setHistory(d.sessions))
      .catch((err) => setError(err.message));
  }, [data.classes, today]);

  const students = data.students;
  return (
    <>
      <div className="row section-row">
        <h2 className="section-title">
          {students.filter((s) => s.active).length} active student{students.filter((s) => s.active).length === 1 ? "" : "s"}
        </h2>
        {!adding && (
          <button type="button" className="btn small primary" onClick={() => setAdding(true)}>
            + Add student
          </button>
        )}
      </div>
      {adding && (
        <div className="tile">
          <StudentForm
            initial={{ name: "", level: "", notes: "" }}
            submitLabel="Add student"
            onCancel={() => setAdding(false)}
            onSubmit={async (form) => {
              const { student } = await api("/api/admin/teaching/students", { method: "POST", body: form });
              setData((d) => ({ ...d, students: [...d.students, student] }));
              setAdding(false);
            }}
          />
        </div>
      )}
      {error && (
        <p role="status" className="form-status err">
          {error}
        </p>
      )}
      {students.length === 0 && !adding ? (
        <p className="empty">No students yet. Add the people you teach.</p>
      ) : history === null ? (
        <div className="inline-loading" role="status" aria-label="Loading history">
          <span className="spinner" />
        </div>
      ) : (
        <ul className="student-list">
          {students.map((s) => (
            <StudentCard
              key={`${s.id}:${s.name}:${s.level}:${s.notes}:${s.active}`}
              student={s}
              classes={data.classes}
              history={history}
              onSaved={(next) => setData((d) => ({ ...d, students: d.students.map((x) => (x.id === next.id ? next : x)) }))}
              onDeleted={(id) =>
                setData((d) => ({
                  ...d,
                  students: d.students.filter((x) => x.id !== id),
                  classes: d.classes.map((c) => ({ ...c, studentIds: c.studentIds.filter((x) => x !== id) })),
                }))
              }
            />
          ))}
        </ul>
      )}
    </>
  );
}

// ---------------------------------------------------------------- Classes

function ClassCard({ cls, students, byId, today, onSaved, onDeleted }) {
  const [editing, setEditing] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const url = `/api/admin/teaching/classes/${cls.id}`;
  const ended = Boolean(cls.endDate) && cls.endDate < today;
  const endingSoon = Boolean(cls.endDate) && !ended && cls.endDate <= shiftDate(today, 14);
  const current = slotsOn(cls, today);
  const upcoming = cls.schedule.filter((e) => e.from > today);
  const put = async (body) => {
    const { class: next } = await api(url, { method: "PUT", body });
    onSaved(next);
  };

  if (editing) {
    return (
      <li className="tile editing">
        <ClassForm
          initial={{ title: cls.title, subject: cls.subject, studentIds: cls.studentIds, slots: cls.slots, startDate: cls.startDate, endDate: cls.endDate, notes: cls.notes, defaultEnd: endOfNextMonth(today) }}
          students={students}
          today={today}
          editing
          submitLabel="Save class"
          onCancel={() => setEditing(false)}
          onSubmit={async (form) => {
            await put(form);
            setEditing(false);
          }}
        />
      </li>
    );
  }

  return (
    <li className={`tile class-card${ended ? " ended" : ""}`}>
      <div className="row">
        <h3 className="class-name">{classTitle(cls, byId)}</h3>
        {ended ? <span className="badge">Ended</span> : endingSoon ? <span className="badge warn">Ends {shortDate(cls.endDate)}</span> : null}
      </div>
      <p className="muted small">{[cls.subject, cls.title ? classStudents(cls, byId) : ""].filter(Boolean).join(" · ") || "No students"}</p>
      <ul className="slot-chips">
        {current.map((s) => (
          <li key={`${s.weekday}-${s.time}`}>{slotText(s)}</li>
        ))}
      </ul>
      {upcoming.map((e) => (
        <p key={e.from} className="small">
          <span className="badge accent">From {shortDate(e.from)}</span> {e.slots.map(slotText).join(", ")}
        </p>
      ))}
      <p className="small">
        {cls.endDate ? `${shortDate(cls.startDate)} – ${shortDate(cls.endDate)}` : `${cls.startDate > today ? "Starts" : "Since"} ${shortDate(cls.startDate)} · until you change it`}
      </p>
      {cls.notes && <p className="muted small">{cls.notes}</p>}
      <div className="form-foot">
        <button type="button" className="text-btn" onClick={() => setEditing(true)}>
          Edit
        </button>
        {(ended || endingSoon) && (
          <button
            type="button"
            className="btn small"
            disabled={Boolean(busy)}
            aria-busy={busy === "extend"}
            onClick={async () => {
              setBusy("extend");
              setError("");
              try {
                await put({ ...cls, endDate: endOfNextMonth(cls.endDate > today ? cls.endDate : today) });
              } catch (err) {
                setError(err.message);
              }
              setBusy("");
            }}
          >
            {busy === "extend" && <Spinner />} Extend to end of next month
          </button>
        )}
        {(ended || endingSoon) && (
          <button
            type="button"
            className="text-btn"
            disabled={Boolean(busy)}
            onClick={async () => {
              setBusy("ongoing");
              setError("");
              try {
                await put({ ...cls, endDate: null });
              } catch (err) {
                setError(err.message);
              }
              setBusy("");
            }}
          >
            {busy === "ongoing" && <Spinner />} Keep it going
          </button>
        )}
        {confirm ? (
          <>
            <button
              type="button"
              className="btn small danger"
              disabled={Boolean(busy)}
              onClick={async () => {
                setBusy("delete");
                try {
                  await api(url, { method: "DELETE" });
                  onDeleted(cls.id);
                } catch (err) {
                  setError(err.message);
                  setBusy("");
                }
              }}
            >
              {busy === "delete" && <Spinner />} Delete class and its history
            </button>
            <button type="button" className="text-btn" onClick={() => setConfirm(false)}>
              Keep
            </button>
          </>
        ) : (
          <button type="button" className="text-btn danger" onClick={() => setConfirm(true)}>
            Delete
          </button>
        )}
      </div>
      {error && (
        <p role="status" className="form-status err">
          {error}
        </p>
      )}
    </li>
  );
}

// The days and times a class runs on a date (its schedule entry for that date). A class that
// hasn't started yet shows its first schedule.
function slotsOn(cls, date) {
  let slots = cls.schedule[0].slots;
  for (const e of cls.schedule) if (e.from <= date) slots = e.slots;
  return slots;
}

const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

// Your regular week at a glance: every running class, by weekday and time.
function WeeklyTimetable({ classes, byId, today }) {
  const rows = WEEK_ORDER.map((wd) => ({
    wd,
    items: classes
      .flatMap((c) => slotsOn(c, today).filter((s) => s.weekday === wd).map((s) => ({ c, s })))
      .sort((a, b) => a.s.time.localeCompare(b.s.time)),
  }));
  const total = rows.reduce((a, r) => a + r.items.length, 0);
  const minutes = rows.reduce((a, r) => a + r.items.reduce((m, i) => m + i.s.minutes, 0), 0);
  const end = (time, mins) => {
    const [h, m] = time.split(":").map(Number);
    const t = h * 60 + m + mins;
    return `${String(Math.floor(t / 60) % 24).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
  };
  return (
    <section className="tile week-table" aria-labelledby="week-table-title">
      <div className="row">
        <h2 id="week-table-title" className="section-title">
          Regular week
        </h2>
        <p className="muted small">
          {total} class{total === 1 ? "" : "es"} · {hours(minutes)}
        </p>
      </div>
      <ul className="week-rows">
        {rows.map(({ wd, items }) => (
          <li key={wd} className={items.length ? "" : "free"}>
            <span className="week-day">{WEEKDAYS_LONG[wd]}</span>
            {items.length ? (
              <ul className="week-items">
                {items.map(({ c, s }) => (
                  <li key={`${c.id}-${s.time}`}>
                    <span className="week-time">
                      {s.time}–{end(s.time, s.minutes)}
                    </span>{" "}
                    <strong>{classTitle(c, byId)}</strong>
                    {c.subject && <span className="muted"> · {c.subject}</span>}
                  </li>
                ))}
              </ul>
            ) : (
              <span className="muted small">Free</span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function ClassesView({ data, setData, today, goTo }) {
  const [adding, setAdding] = useState(false);
  const byId = studentsById(data.students);
  const active = data.classes.filter((c) => !c.endDate || c.endDate >= today);
  const ended = data.classes.filter((c) => c.endDate && c.endDate < today);
  const card = (c) => (
    <ClassCard
      key={`${c.id}:${JSON.stringify(c)}`}
      cls={c}
      students={data.students}
      byId={byId}
      today={today}
      onSaved={(next) => setData((d) => ({ ...d, classes: d.classes.map((x) => (x.id === next.id ? next : x)) }))}
      onDeleted={(id) => setData((d) => ({ ...d, classes: d.classes.filter((x) => x.id !== id) }))}
    />
  );
  return (
    <>
      <div className="row section-row">
        <h2 className="section-title">
          {active.length} running class{active.length === 1 ? "" : "es"}
        </h2>
        {!adding && (
          <button type="button" className="btn small primary" onClick={() => (data.students.length ? setAdding(true) : goTo("students"))}>
            {data.students.length ? "+ Add class" : "Add a student first"}
          </button>
        )}
      </div>
      {adding && (
        <div className="tile">
          <ClassForm
            initial={{ title: "", subject: "", studentIds: [], slots: [{ weekday: new Date(`${today}T12:00:00`).getDay(), time: "17:00", minutes: 60 }], startDate: today, endDate: null, defaultEnd: endOfNextMonth(today), notes: "" }}
            students={data.students}
            today={today}
            submitLabel="Add class"
            onCancel={() => setAdding(false)}
            onSubmit={async (form) => {
              const { class: cls } = await api("/api/admin/teaching/classes", { method: "POST", body: form });
              setData((d) => ({ ...d, classes: [...d.classes, cls] }));
              setAdding(false);
            }}
          />
        </div>
      )}
      {data.classes.length === 0 && !adding && <p className="empty">No classes yet.</p>}
      {active.length > 0 && <WeeklyTimetable classes={active} byId={byId} today={today} />}
      {active.length > 0 && <ul className="class-list">{active.map(card)}</ul>}
      {ended.length > 0 && (
        <>
          <h2 className="section-title">Ended</h2>
          <ul className="class-list">{ended.map(card)}</ul>
        </>
      )}
    </>
  );
}

// ---------------------------------------------------------------- Page

export default function TeachingTracker() {
  const [today, setToday] = useState("");
  const [week, setWeek] = useState("");
  const [view, setView] = useState("week");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async (w) => {
    try {
      setData(await api(`/api/admin/teaching?from=${w}&to=${shiftDate(w, 6)}`));
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    const t = todayStr();
    setToday(t);
    setWeek(mondayOf(t));
    try {
      const saved = localStorage.getItem(VIEW_KEY);
      if (VIEWS.some(([k]) => k === saved)) setView(saved);
    } catch {}
  }, []);

  useEffect(() => {
    if (week) load(week);
  }, [week, load]);

  function switchView(next) {
    // Students and classes may have changed elsewhere, so refresh the timetable.
    if (next === "week" && view !== "week" && week) load(week);
    setView(next);
    try {
      localStorage.setItem(VIEW_KEY, next);
    } catch {}
  }

  return (
    <div className="teaching">
      <div className="view-switch three" role="tablist" aria-label="Teaching view">
        {VIEWS.map(([key, label]) => (
          <button key={key} type="button" role="tab" aria-selected={view === key} className={view === key ? "on" : ""} onClick={() => switchView(key)}>
            {label}
          </button>
        ))}
      </div>
      {error && (
        <p role="status" className="form-status err">
          {error}
        </p>
      )}
      {!data || !today ? (
        !error && (
          <div className="inline-loading" role="status" aria-label="Loading">
            <span className="spinner" />
          </div>
        )
      ) : view === "week" ? (
        <WeekView
          data={data}
          week={week}
          setWeek={setWeek}
          today={today}
          onSessions={(fn) => setData((d) => ({ ...d, sessions: fn(d.sessions) }))}
          reload={() => load(week)}
          goTo={switchView}
        />
      ) : view === "students" ? (
        <StudentsView data={data} setData={setData} today={today} />
      ) : (
        <ClassesView data={data} setData={setData} today={today} goTo={switchView} />
      )}
    </div>
  );
}
