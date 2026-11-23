import { ObjectId } from "mongodb";

// Teaching tracker: who you teach, when, and what happened in each class.
//   teachStudents { name, level, notes, active, createdAt }
//   teachClasses  { title, studentIds: [id], subject, startDate, endDate ("YYYY-MM-DD", or null = ongoing),
//                   schedule: [{ from: date, slots: [{ weekday 0-6 (Sun-Sat), time "HH:MM", minutes }] }],
//                   slots (the latest schedule's slots), notes, createdAt }
//                   A time change adds a schedule entry from a date; earlier weeks keep their old times.
//   teachSessions only what you've recorded; regular sessions are worked out from the slots.
//     Regular: _id "<classId>_<date>_<HHMM>", kind "regular", classId, date, time
//     Extra / make-up: ObjectId, kind "extra" | "makeup", classId, date, time, minutes, fromId (make-up)
//     All: status, topic, notes, rescheduledTo { date, time } and makeupId (on a rescheduled session)

export const STATUSES = ["scheduled", "attended", "cancelled", "rescheduled"];
export const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
export const isDate = (v) => typeof v === "string" && DATE.test(v) && !Number.isNaN(Date.parse(`${v}T00:00:00Z`));
export const isTime = (v) => typeof v === "string" && TIME.test(v);
export const parseId = (id) => (ObjectId.isValid(id) ? new ObjectId(id) : null);

export function addDays(date, n) {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
export const weekdayOf = (date) => new Date(`${date}T12:00:00Z`).getUTCDay();
export const daysBetween = (a, b) => Math.round((Date.parse(`${b}T12:00:00Z`) - Date.parse(`${a}T12:00:00Z`)) / 86400000);

// Regular sessions have a predictable id, so a class's timetable needs no stored rows.
export const regularId = (classId, date, time) => `${classId}_${date}_${time.replace(":", "")}`;
export function parseRegularId(id) {
  const m = /^([0-9a-f]{24})_(\d{4}-\d{2}-\d{2})_(\d{2})(\d{2})$/.exec(String(id));
  return m ? { classId: m[1], date: m[2], time: `${m[3]}:${m[4]}` } : null;
}

const clean = (v, max) => String(v ?? "").trim().slice(0, max);

export function parseStudent(body, partial = false) {
  const data = {};
  if (!partial || "name" in body) {
    data.name = clean(body.name, 80);
    if (!data.name) return { error: "Enter the student's name." };
  }
  if (!partial || "level" in body) data.level = clean(body.level, 80);
  if (!partial || "notes" in body) data.notes = clean(body.notes, 500);
  if ("active" in body) data.active = body.active !== false;
  else if (!partial) data.active = true;
  return { data };
}

export function parseClass(body) {
  const studentIds = [...new Set((Array.isArray(body?.studentIds) ? body.studentIds : []).map(String))];
  if (!studentIds.length) return { error: "Pick at least one student." };
  if (studentIds.some((id) => !ObjectId.isValid(id))) return { error: "Unknown student." };
  const slots = (Array.isArray(body?.slots) ? body.slots : []).map((s) => ({
    weekday: Number(s?.weekday),
    time: String(s?.time ?? ""),
    minutes: Number(s?.minutes),
  }));
  if (!slots.length) return { error: "Add at least one day and time." };
  if (slots.length > 14) return { error: "That's a lot of slots. Keep it to 14." };
  for (const s of slots) {
    if (!Number.isInteger(s.weekday) || s.weekday < 0 || s.weekday > 6) return { error: "Pick a day for every slot." };
    if (!isTime(s.time)) return { error: "Enter a start time for every slot." };
    if (!Number.isInteger(s.minutes) || s.minutes < 15 || s.minutes > 300) return { error: "Class length should be 15 to 300 minutes." };
  }
  const keys = slots.map((s) => `${s.weekday}-${s.time}`);
  if (new Set(keys).size !== keys.length) return { error: "Two slots are on the same day and time." };
  slots.sort((a, b) => a.weekday - b.weekday || a.time.localeCompare(b.time));
  if (!isDate(body?.startDate)) return { error: "Pick a start date." };
  const endDate = body?.endDate ? body.endDate : null; // null: runs until you change it
  if (endDate !== null) {
    if (!isDate(endDate)) return { error: "Pick an end date, or make the class ongoing." };
    if (endDate < body.startDate) return { error: "The end date is before the start date." };
    if (daysBetween(body.startDate, endDate) > 730) return { error: "Keep a dated class to two years or less, or make it ongoing." };
  }
  const changeFrom = body?.changeFrom ? body.changeFrom : null;
  if (changeFrom !== null && !isDate(changeFrom)) return { error: "Pick the date the new times start." };
  return {
    data: {
      title: clean(body.title, 100),
      subject: clean(body.subject, 80),
      studentIds,
      slots,
      startDate: body.startDate,
      endDate,
      notes: clean(body.notes, 500),
    },
    changeFrom,
  };
}

const sameSlots = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// The class's schedule history (classes saved before schedules existed have only slots).
export const scheduleOf = (cls) => (cls.schedule?.length ? cls.schedule : [{ from: cls.startDate, slots: cls.slots ?? [] }]);

// The schedule after an edit. New times apply from changeFrom, so earlier weeks keep their
// old times; without changeFrom (or on/before the start date) they replace the old times.
export function nextSchedule(existing, data, changeFrom) {
  const old = existing ? scheduleOf(existing) : [];
  if (old.length && sameSlots(old[old.length - 1].slots, data.slots)) {
    return old.map((e, i) => (i === 0 ? { ...e, from: data.startDate } : e));
  }
  if (!old.length || !changeFrom || changeFrom <= data.startDate) return [{ from: data.startDate, slots: data.slots }];
  const kept = old.filter((e) => e.from < changeFrom);
  if (!kept.length) return [{ from: data.startDate, slots: data.slots }];
  kept[0] = { ...kept[0], from: data.startDate };
  return [...kept, { from: changeFrom, slots: data.slots }];
}

// What you record about one session. Returns only the fields present.
export function parseSessionUpdate(body) {
  const data = {};
  if ("status" in body) {
    if (!STATUSES.includes(body.status)) return { error: "Unknown status." };
    data.status = body.status;
  }
  if ("topic" in body) data.topic = clean(body.topic, 300);
  if ("notes" in body) data.notes = clean(body.notes, 1000);
  if (data.status === "rescheduled") {
    const to = body.rescheduleTo ?? {};
    if (!isDate(to.date) || !isTime(to.time)) return { error: "Pick the new date and time." };
    data.rescheduledTo = { date: to.date, time: to.time };
  }
  return { data };
}

export function parseExtra(body) {
  if (!ObjectId.isValid(String(body?.classId ?? ""))) return { error: "Pick a class." };
  if (!isDate(body?.date) || !isTime(body?.time)) return { error: "Pick a date and time." };
  const minutes = Number(body?.minutes);
  if (!Number.isInteger(minutes) || minutes < 15 || minutes > 300) return { error: "Class length should be 15 to 300 minutes." };
  return { data: { classId: String(body.classId), date: body.date, time: body.time, minutes, topic: clean(body.topic, 300) } };
}

const endOf = (time, minutes) => {
  const [h, m] = time.split(":").map(Number);
  const t = h * 60 + m + minutes;
  return `${String(Math.floor(t / 60) % 24).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
};

function toClient(rec, cls, extra = {}) {
  const minutes = rec.minutes ?? extra.minutes ?? 60;
  return {
    id: String(rec._id),
    classId: String(rec.classId ?? cls?._id),
    date: rec.date,
    time: rec.time,
    end: endOf(rec.time, minutes),
    minutes,
    kind: rec.kind ?? "regular",
    status: rec.status ?? "scheduled",
    topic: rec.topic ?? "",
    notes: rec.notes ?? "",
    rescheduledTo: rec.rescheduledTo ?? null,
    fromId: rec.fromId ? String(rec.fromId) : null,
  };
}

// Every session between from and to (inclusive): the timetable from each class's slots,
// merged with what you've recorded, plus extra and make-up classes. Sorted by date and time.
export function buildSessions(classes, records, from, to) {
  const byId = new Map(records.map((r) => [String(r._id), r]));
  const out = [];
  for (const cls of classes) {
    const start = cls.startDate > from ? cls.startDate : from;
    const end = cls.endDate && cls.endDate < to ? cls.endDate : to;
    const schedule = scheduleOf(cls);
    for (let d = start; d <= end; d = addDays(d, 1)) {
      const wd = weekdayOf(d);
      let slots = schedule[0].slots;
      for (const e of schedule) if (e.from <= d) slots = e.slots;
      for (const slot of slots) {
        if (slot.weekday !== wd) continue;
        const id = regularId(String(cls._id), d, slot.time);
        const rec = byId.get(id) ?? { _id: id, date: d, time: slot.time };
        out.push(toClient({ ...rec, kind: "regular" }, cls, { minutes: slot.minutes }));
      }
    }
  }
  const classIds = new Set(classes.map((c) => String(c._id)));
  for (const r of records) {
    if (r.kind === "regular" || !classIds.has(String(r.classId))) continue;
    if (r.date >= from && r.date <= to) out.push(toClient(r));
  }
  return out.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
}

// True when any of the ids isn't a student.
export async function unknownStudents(db, ids) {
  const found = await db.collection("teachStudents").countDocuments({ _id: { $in: ids.map(parseId) } });
  return found !== ids.length;
}

export function studentToClient({ _id, createdAt, ...rest }) {
  return { id: String(_id), name: rest.name, level: rest.level ?? "", notes: rest.notes ?? "", active: rest.active !== false };
}

export function classToClient({ _id, createdAt, updatedAt, ...rest }) {
  const schedule = scheduleOf(rest);
  return { id: String(_id), ...rest, endDate: rest.endDate ?? null, schedule, slots: schedule[schedule.length - 1].slots };
}
