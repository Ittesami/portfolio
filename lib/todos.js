import { ObjectId } from "mongodb";

// Todos: { title, notes, dueDate: "YYYY-MM-DD" | "", dueTime: "HH:MM" | "", done, doneAt, createdAt }
// Dates and times are stored as plain local strings so they don't shift with time zones.

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

export function toClient(doc) {
  const { _id, ...rest } = doc;
  return { id: String(_id), ...rest };
}

// Validates a create (partial = false) or update (partial = true) body.
// Returns { data } or { error }.
export function parseTodo(body, partial = false) {
  const data = {};
  if (!partial || "title" in body) {
    const title = String(body.title ?? "").trim();
    if (!title) return { error: "Give the task a title." };
    if (title.length > 200) return { error: "Keep the title under 200 characters." };
    data.title = title;
  }
  if (!partial || "notes" in body) {
    const notes = String(body.notes ?? "").trim();
    if (notes.length > 2000) return { error: "Keep notes under 2000 characters." };
    data.notes = notes;
  }
  if (!partial || "dueDate" in body) {
    const dueDate = String(body.dueDate ?? "");
    if (dueDate && !DATE.test(dueDate)) return { error: "Date must be YYYY-MM-DD." };
    data.dueDate = dueDate;
  }
  if (!partial || "dueTime" in body) {
    const dueTime = String(body.dueTime ?? "");
    if (dueTime && !TIME.test(dueTime)) return { error: "Time must be HH:MM." };
    data.dueTime = dueTime;
  }
  if (data.dueTime && data.dueDate === "") return { error: "Pick a date to go with the time." };
  if (partial && "done" in body) {
    data.done = Boolean(body.done);
    data.doneAt = data.done ? new Date() : null;
  }
  return { data };
}

export function parseId(id) {
  return ObjectId.isValid(id) ? new ObjectId(id) : null;
}

// Open tasks first, ordered by due date/time (undated last), then done tasks newest first.
export function sortTodos(list) {
  const due = (t) => (t.dueDate ? `${t.dueDate}T${t.dueTime || "23:59"}` : "9999");
  return [...list].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    if (a.done) return new Date(b.doneAt ?? 0) - new Date(a.doneAt ?? 0);
    return due(a).localeCompare(due(b)) || new Date(a.createdAt) - new Date(b.createdAt);
  });
}
