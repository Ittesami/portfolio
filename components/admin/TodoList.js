"use client";

import { useEffect, useMemo, useState } from "react";
import LoadingLink from "@/components/LoadingLink";
import { api, nowHHMM, prettyDate, shiftDate, todayStr } from "./api";
import Spinner from "./Spinner";

const FILTERS = [
  { key: "open", label: "Open" },
  { key: "today", label: "Today" },
  { key: "upcoming", label: "Upcoming" },
  { key: "nodate", label: "No date" },
  { key: "done", label: "Done" },
];

function dueInfo(t, today) {
  if (!t.dueDate) return null;
  const late = !t.done && (t.dueDate < today || (t.dueDate === today && t.dueTime && t.dueTime < nowHHMM()));
  let label;
  if (t.dueDate === today) label = "Today";
  else if (t.dueDate === shiftDate(today, 1)) label = "Tomorrow";
  else if (t.dueDate === shiftDate(today, -1)) label = "Yesterday";
  else label = prettyDate(t.dueDate, { weekday: "short", day: "numeric", month: "short" });
  return { label: t.dueTime ? `${label}, ${t.dueTime}` : label, late };
}

function matches(t, filter, today) {
  if (filter === "done") return t.done;
  if (t.done) return false;
  if (filter === "today") return Boolean(t.dueDate) && t.dueDate <= today;
  if (filter === "upcoming") return Boolean(t.dueDate) && t.dueDate > today;
  if (filter === "nodate") return !t.dueDate;
  return true;
}

function sortTodos(list) {
  const due = (t) => (t.dueDate ? `${t.dueDate}T${t.dueTime || "23:59"}` : "9999");
  return [...list].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    if (a.done) return new Date(b.doneAt ?? 0) - new Date(a.doneAt ?? 0);
    return due(a).localeCompare(due(b)) || new Date(a.createdAt) - new Date(b.createdAt);
  });
}

function TodoForm({ initial, submitLabel, busyLabel, onSubmit, onCancel, compact }) {
  const [form, setForm] = useState(initial);
  const [showNotes, setShowNotes] = useState(Boolean(initial.notes));
  const [state, setState] = useState({ busy: false, error: "" });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    if (!form.title.trim()) return setState({ busy: false, error: "Give the task a title." });
    if (form.dueTime && !form.dueDate) return setState({ busy: false, error: "Pick a date to go with the time." });
    setState({ busy: true, error: "" });
    try {
      await onSubmit(form);
      setState({ busy: false, error: "" });
      if (!onCancel) {
        setForm(initial);
        setShowNotes(false);
      }
    } catch (err) {
      setState({ busy: false, error: err.message });
    }
  }

  return (
    <form className="form todo-form" onSubmit={submit}>
      <input
        className="todo-title-input"
        value={form.title}
        onChange={set("title")}
        placeholder="Add a task"
        maxLength={200}
        aria-label="Task title"
      />
      <div className="todo-form-row">
        <label>
          <span className="field-label">Date <span className="opt">optional</span></span>
          <input type="date" value={form.dueDate} onChange={set("dueDate")} />
        </label>
        <label>
          <span className="field-label">Time <span className="opt">optional</span></span>
          <input type="time" value={form.dueTime} onChange={set("dueTime")} />
        </label>
      </div>
      {!compact &&
        (showNotes ? (
          <label>
            Notes
            <textarea value={form.notes} onChange={set("notes")} maxLength={2000} />
          </label>
        ) : (
          <button type="button" className="text-btn" onClick={() => setShowNotes(true)}>
            + Add notes
          </button>
        ))}
      <div className="form-foot">
        <button className="btn primary" type="submit" disabled={state.busy} aria-busy={state.busy}>
          {state.busy && <Spinner />}
          {state.busy ? busyLabel : submitLabel}
        </button>
        {onCancel && (
          <button className="btn" type="button" onClick={onCancel}>
            Cancel
          </button>
        )}
        {state.error && <p className="form-status err">{state.error}</p>}
      </div>
    </form>
  );
}

function TodoItem({ todo, today, onChange, onRemove }) {
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState("");
  const due = dueInfo(todo, today);

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

  const toggle = () =>
    run("toggle", async () => {
      const { todo: t } = await api(`/api/admin/todos/${todo.id}`, { method: "PATCH", body: { done: !todo.done } });
      onChange(t);
    });

  const remove = () =>
    run("delete", async () => {
      await api(`/api/admin/todos/${todo.id}`, { method: "DELETE" });
      onRemove(todo.id);
    });

  if (editing) {
    return (
      <li className="todo editing">
        <TodoForm
          initial={{ title: todo.title, notes: todo.notes ?? "", dueDate: todo.dueDate ?? "", dueTime: todo.dueTime ?? "" }}
          submitLabel="Save"
          busyLabel="Saving…"
          onCancel={() => setEditing(false)}
          onSubmit={async (form) => {
            const { todo: t } = await api(`/api/admin/todos/${todo.id}`, { method: "PATCH", body: form });
            onChange(t);
            setEditing(false);
          }}
        />
      </li>
    );
  }

  return (
    <li className={`todo${todo.done ? " done" : ""}`}>
      <button
        type="button"
        className="check"
        onClick={toggle}
        disabled={busy === "toggle"}
        aria-pressed={todo.done}
        aria-label={todo.done ? `Mark "${todo.title}" as not done` : `Mark "${todo.title}" as done`}
      >
        {busy === "toggle" ? <Spinner /> : todo.done ? "✓" : ""}
      </button>
      <div className="todo-body">
        <p className="todo-title">{todo.title}</p>
        {todo.notes && <p className="todo-notes">{todo.notes}</p>}
        {due && <span className={`due${due.late ? " late" : ""}`}>{due.late ? `Overdue · ${due.label}` : due.label}</span>}
        {error && <p className="form-status err">{error}</p>}
      </div>
      <div className="todo-actions">
        {confirmDelete ? (
          <>
            <button type="button" className="text-btn danger" onClick={remove} disabled={busy === "delete"}>
              {busy === "delete" && <Spinner />} Delete
            </button>
            <button type="button" className="text-btn" onClick={() => setConfirmDelete(false)}>
              Keep
            </button>
          </>
        ) : (
          <>
            <button type="button" className="text-btn" onClick={() => setEditing(true)}>
              Edit
            </button>
            <button type="button" className="text-btn" onClick={() => setConfirmDelete(true)}>
              Delete
            </button>
          </>
        )}
      </div>
    </li>
  );
}

export default function TodoList({ compact = false }) {
  const [todos, setTodos] = useState(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState(compact ? "today" : "open");
  const [today, setToday] = useState("");

  useEffect(() => {
    setToday(todayStr());
    api("/api/admin/todos")
      .then((d) => setTodos(d.todos))
      .catch((err) => setError(err.message));
  }, []);

  const counts = useMemo(() => {
    const c = {};
    for (const f of FILTERS) c[f.key] = (todos ?? []).filter((t) => matches(t, f.key, today)).length;
    return c;
  }, [todos, today]);

  const shown = sortTodos((todos ?? []).filter((t) => matches(t, filter, today)));
  const update = (t) => setTodos((list) => list.map((x) => (x.id === t.id ? t : x)));
  const remove = (id) => setTodos((list) => list.filter((x) => x.id !== id));

  async function add(form) {
    const { todo } = await api("/api/admin/todos", { method: "POST", body: form });
    setTodos((list) => [...list, todo]);
  }

  return (
    <div className="todo-list">
      <TodoForm
        compact={compact}
        initial={{ title: "", notes: "", dueDate: compact ? today : "", dueTime: "" }}
        submitLabel="Add task"
        busyLabel="Adding…"
        onSubmit={add}
        key={today}
      />

      {!compact && (
        <div className="filters" role="tablist" aria-label="Filter tasks">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              role="tab"
              aria-selected={filter === f.key}
              className={`chip-btn${filter === f.key ? " on" : ""}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label} <span className="count">{counts[f.key]}</span>
            </button>
          ))}
        </div>
      )}

      {error && <p className="form-status err">{error}</p>}
      {todos === null && !error && (
        <div className="inline-loading" role="status" aria-label="Loading tasks">
          <span className="spinner" />
        </div>
      )}
      {todos && shown.length === 0 && (
        <p className="empty muted">
          {compact ? "Nothing due today or overdue." : filter === "done" ? "No finished tasks yet." : "Nothing here. Add a task above."}
        </p>
      )}
      {shown.length > 0 && (
        <ul className="todos">
          {shown.map((t) => (
            <TodoItem key={t.id} todo={t} today={today} onChange={update} onRemove={remove} />
          ))}
        </ul>
      )}
      {compact && (
        <LoadingLink className="see-all" href="/admin/todos">
          All tasks →
        </LoadingLink>
      )}
    </div>
  );
}
