import { ObjectId } from "mongodb";

// Food and sleep logs for the fitness tracker.
//   meals   { date: "YYYY-MM-DD", time: "HH:MM", text, createdAt }   what you ate, when
//   sleep   { _id: "YYYY-MM-DD" (the morning you woke up), bedtime: "HH:MM",
//             wakeTime: "HH:MM", quality: 1-5 | null, note }

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
  return { data: { date: body.date, time, text } };
}

export function mealToClient({ _id, ...rest }) {
  return { id: String(_id), ...rest };
}

export function parseId(id) {
  return ObjectId.isValid(id) ? new ObjectId(id) : null;
}

// Minutes slept between bedtime and wake time, crossing midnight if needed.
export function sleepMinutes(bedtime, wakeTime) {
  const toMin = (t) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
  let mins = toMin(wakeTime) - toMin(bedtime);
  if (mins <= 0) mins += 24 * 60;
  return mins;
}

export function parseSleep(body) {
  if (!isDate(body?.date)) return { error: "Pick the morning you woke up." };
  const bedtime = String(body?.bedtime ?? "");
  const wakeTime = String(body?.wakeTime ?? "");
  if (!TIME.test(bedtime)) return { error: "Enter when you went to sleep." };
  if (!TIME.test(wakeTime)) return { error: "Enter when you woke up." };
  const minutes = sleepMinutes(bedtime, wakeTime);
  if (minutes > 18 * 60) return { error: "That's over 18 hours. Check the times." };
  const q = body?.quality === "" || body?.quality == null ? null : Number(body.quality);
  if (q !== null && !(Number.isInteger(q) && q >= 1 && q <= 5)) return { error: "Quality should be 1 to 5." };
  const note = String(body?.note ?? "").trim();
  if (note.length > 500) return { error: "Keep the note under 500 characters." };
  return { data: { _id: body.date, bedtime, wakeTime, minutes, quality: q, note } };
}

export function sleepToClient({ _id, ...rest }) {
  return { date: _id, ...rest };
}
