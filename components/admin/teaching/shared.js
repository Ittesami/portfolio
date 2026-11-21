"use client";

import { prettyDate, shiftDate } from "../api";

export const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const WEEKDAYS_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Monday of the week a date falls in.
export function mondayOf(date) {
  const day = new Date(`${date}T12:00:00`).getDay();
  return shiftDate(date, -((day + 6) % 7));
}

// The last day of next month, the default end date for a new class.
export function endOfNextMonth(today) {
  const d = new Date(`${today}T12:00:00`);
  const last = new Date(d.getFullYear(), d.getMonth() + 2, 0, 12);
  return `${last.getFullYear()}-${String(last.getMonth() + 1).padStart(2, "0")}-${String(last.getDate()).padStart(2, "0")}`;
}

export const studentsById = (students) => Object.fromEntries(students.map((s) => [s.id, s]));

export function classTitle(cls, byId) {
  if (!cls) return "Class";
  if (cls.title) return cls.title;
  const names = cls.studentIds.map((id) => byId[id]?.name).filter(Boolean);
  return names.length ? names.join(", ") : "Class with no students";
}

export const classStudents = (cls, byId) => cls.studentIds.map((id) => byId[id]?.name).filter(Boolean).join(", ");

export const slotText = (s) => `${WEEKDAYS[s.weekday]} ${s.time} (${s.minutes} min)`;

export const shortDate = (d) => prettyDate(d, { weekday: "short", day: "numeric", month: "short" });

export const hours = (mins) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h ? `${h}h${m ? ` ${m}m` : ""}` : `${m}m`;
};

// A session counts as "not marked" once its end time has passed and nothing was recorded.
export function isUnmarked(s, now) {
  if (s.status !== "scheduled") return false;
  const endDate = s.end < s.time ? shiftDate(s.date, 1) : s.date; // ends after midnight
  return `${endDate}T${s.end}` < now;
}

export const nowStampLocal = () => {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

export const STATUS_LABEL = { scheduled: "Scheduled", attended: "Attended", cancelled: "Cancelled", rescheduled: "Rescheduled" };
