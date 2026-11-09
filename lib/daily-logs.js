import { ObjectId } from "mongodb";

// Food and sleep logs for the fitness tracker.
//   meals   { date: "YYYY-MM-DD", time: "HH:MM", text, kcal?, protein?, createdAt }   what you ate, when.
//           kcal/protein are your own numbers; without them the Food tab estimates from
//           the text (lib/food-estimate.js).
//   sleepSessions { start: "YYYY-MM-DDTHH:MM", end: same or null (asleep now), minutes,
//                   day: "YYYY-MM-DD" (the date you woke up), quality: 1-5 | null, note }

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

export const isDate = (v) => typeof v === "string" && DATE.test(v);

export function parseMeal(body) {
  if (!isDate(body?.date)) return { error: "Pick a date." };
  const time = String(body?.time ?? "");
  if (!TIME.test(time)) return { error: "Enter the time you ate." };
  const text = String(body?.text ?? "").trim();
  if (!text) return { error: "Write what you had." };
  if (text.length > 1000) return { error: "Keep it under 1000 characters." };
  // Optional numbers of your own; empty clears them so the estimate is used again.
  const num = (v, max, label) => {
    if (v === "" || v == null) return { value: null };
    const n = Number(v);
    if (!Number.isFinite(n) || n < 0 || n > max) return { error: `${label} should be between 0 and ${max}.` };
    return { value: Math.round(n) };
  };
  const kcal = num(body?.kcal, 5000, "Calories");
  if (kcal.error) return { error: kcal.error };
  const protein = num(body?.protein, 400, "Protein");
  if (protein.error) return { error: protein.error };
  return { data: { date: body.date, time, text, kcal: kcal.value, protein: protein.value } };
}

export function mealToClient({ _id, ...rest }) {
  return { id: String(_id), ...rest };
}

export function parseId(id) {
  return ObjectId.isValid(id) ? new ObjectId(id) : null;
}

// Sleep is logged as sessions, so a night plus a nap (or two short sleeps) is easy.
// Times are local wall-clock strings, "YYYY-MM-DDTHH:MM", like the rest of the tracker.
// A session counts toward the day you woke up (the date of `end`). end: null means
// you're asleep right now (started with "Going to sleep").
const STAMP = /^\d{4}-\d{2}-\d{2}T([01]\d|2[0-3]):[0-5]\d$/;
export const isStamp = (v) => typeof v === "string" && STAMP.test(v);
const toMs = (stamp) => Date.parse(`${stamp}:00Z`);

export function minutesBetween(start, end) {
  return Math.round((toMs(end) - toMs(start)) / 60000);
}

// Validates a whole session (merge a PATCH onto the stored one first).
// Returns { data } or { error }.
export function parseSleepSession(body) {
  const start = String(body?.start ?? "");
  if (!isStamp(start)) return { error: "Enter when you fell asleep." };
  const end = body?.end == null || body.end === "" ? null : String(body.end);
  if (end !== null && !isStamp(end)) return { error: "Enter when you woke up." };
  let minutes = null;
  if (end) {
    minutes = minutesBetween(start, end);
    if (minutes <= 0) return { error: "Waking up has to come after falling asleep. Check the dates." };
    if (minutes > 18 * 60) return { error: "That's over 18 hours. Check the dates." };
  }
  const q = body?.quality === "" || body?.quality == null ? null : Number(body.quality);
  if (q !== null && !(Number.isInteger(q) && q >= 1 && q <= 5)) return { error: "Quality should be 1 to 5." };
  const note = String(body?.note ?? "").trim();
  if (note.length > 500) return { error: "Keep the note under 500 characters." };
  return { data: { start, end, minutes, day: end ? end.slice(0, 10) : null, quality: q, note } };
}

// Mongo filter for sessions that overlap [start, end) (end null = still asleep).
export function overlapFilter({ start, end }, excludeId) {
  const filter = end
    ? { start: { $lt: end }, $or: [{ end: null }, { end: { $gt: start } }] }
    : { $or: [{ end: null }, { start: { $lte: start }, end: { $gt: start } }] };
  return excludeId ? { ...filter, _id: { $ne: excludeId } } : filter;
}

export function sleepToClient({ _id, createdAt, updatedAt, ...rest }) {
  return { id: String(_id), ...rest };
}
