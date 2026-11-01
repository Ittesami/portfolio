import { ObjectId } from "mongodb";
import { CATEGORIES, EQUIPMENT, EXERCISES, slugify } from "./exercise-library";

// Fitness tracking. Collections:
//   exercises     { _id: slug, name, category, equipment, type: "strength"|"timed", custom }
//   workouts      { date, entries: [{ exerciseId, name, type, sets }], notes, createdAt }
//                   strength sets: { reps, weight }   timed sets: { seconds, distance }
//   bodyweights   { _id: "YYYY-MM-DD", kg }
//   fitnessPlans  { _id: weekStart (a Monday), ... } written by Claude or by hand
//   settings      _id "fitness": your profile, read by the weekly planner

const DATE = /^\d{4}-\d{2}-\d{2}$/;

export const DEFAULT_PROFILE = {
  heightCm: 175,
  weightKg: 58,
  goal: "Bulk up: gain weight and muscle",
  experience: "Beginner",
  equipment: "Full gym",
  daysPerWeek: 4,
  notes: "",
};

// ---------- dates (plain YYYY-MM-DD strings, no time zone shifts) ----------

export function addDays(date, n) {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function weekStartOf(date) {
  const day = new Date(`${date}T12:00:00Z`).getUTCDay(); // 0 = Sunday
  return addDays(date, day === 0 ? -6 : 1 - day);
}

export function weekDates(weekStart) {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
}

export function isDate(v) {
  return typeof v === "string" && DATE.test(v);
}

// ---------- exercise library ----------

// Adds any built-in exercises that are missing. Never touches existing or custom ones.
export async function ensureExerciseLibrary(db) {
  const col = db.collection("exercises");
  if ((await col.estimatedDocumentCount()) >= EXERCISES.length) return;
  await col.bulkWrite(
    EXERCISES.map((e) => ({
      updateOne: { filter: { _id: e._id }, update: { $setOnInsert: { ...e, createdAt: new Date() } }, upsert: true },
    })),
  );
}

export async function listExercises(db) {
  await ensureExerciseLibrary(db);
  const docs = await db.collection("exercises").find({}).toArray();
  return docs
    .map(({ _id, name, category, equipment, type, custom }) => ({ id: _id, name, category, equipment, type, custom }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function parseExercise(body) {
  const name = String(body?.name ?? "").trim().replace(/\s+/g, " ");
  if (!name || name.length > 80) return { error: "Give the exercise a name (up to 80 characters)." };
  const category = CATEGORIES.includes(body?.category) ? body.category : null;
  if (!category) return { error: "Pick a muscle group." };
  const equipment = EQUIPMENT.includes(body?.equipment) ? body.equipment : "Other";
  const type = body?.type === "timed" ? "timed" : "strength";
  const id = slugify(name);
  if (!id) return { error: "Use letters or numbers in the name." };
  return { data: { _id: id, name, category, equipment, type, custom: true } };
}

// ---------- workouts ----------

const num = (v) => (v === "" || v === null || v === undefined ? null : Number(v));

// Validates a workout body. Exercise details are looked up from the library so
// the stored name and type always match it.
export function parseWorkout(body, exercisesById) {
  if (!isDate(body?.date)) return { error: "Pick a date." };
  const notes = String(body?.notes ?? "").trim();
  if (notes.length > 2000) return { error: "Keep notes under 2000 characters." };
  if (!Array.isArray(body?.entries) || body.entries.length === 0) return { error: "Add at least one exercise." };
  if (body.entries.length > 40) return { error: "That's a lot of exercises. Split it into two workouts." };

  const entries = [];
  for (const raw of body.entries) {
    const ex = exercisesById.get(raw?.exerciseId);
    if (!ex) return { error: "One of the exercises isn't in your library any more." };
    if (!Array.isArray(raw.sets) || raw.sets.length === 0) return { error: `Add at least one set for ${ex.name}.` };
    if (raw.sets.length > 30) return { error: `Too many sets for ${ex.name}.` };

    const sets = [];
    for (const s of raw.sets) {
      if (ex.type === "timed") {
        const seconds = num(s?.seconds);
        const distance = num(s?.distance);
        if (!Number.isFinite(seconds) || seconds <= 0 || seconds > 24 * 3600)
          return { error: `Enter a time for every set of ${ex.name}.` };
        if (distance !== null && (!Number.isFinite(distance) || distance < 0 || distance > 500))
          return { error: `Check the distance for ${ex.name}.` };
        sets.push({ seconds: Math.round(seconds), distance });
      } else {
        const reps = num(s?.reps);
        const weight = num(s?.weight);
        if (!Number.isInteger(reps) || reps <= 0 || reps > 1000) return { error: `Enter reps for every set of ${ex.name}.` };
        if (weight !== null && (!Number.isFinite(weight) || weight < 0 || weight > 1000))
          return { error: `Check the weight for ${ex.name}.` };
        sets.push({ reps, weight });
      }
    }
    entries.push({ exerciseId: ex.id, name: ex.name, type: ex.type, category: ex.category, sets });
  }
  return { data: { date: body.date, notes, entries } };
}

export function workoutToClient({ _id, ...rest }) {
  return { id: String(_id), ...rest };
}

export function parseId(id) {
  return ObjectId.isValid(id) ? new ObjectId(id) : null;
}

// ---------- progress ----------

export function workoutTotals(workouts) {
  let sets = 0;
  let volume = 0; // kg lifted: reps x weight, summed
  let seconds = 0;
  for (const w of workouts) {
    for (const e of w.entries) {
      for (const s of e.sets) {
        sets++;
        if (e.type === "timed") seconds += s.seconds;
        else volume += s.reps * (s.weight ?? 0);
      }
    }
  }
  return { sessions: workouts.length, sets, volume: Math.round(volume), minutes: Math.round(seconds / 60) };
}

// Best set per strength exercise (heaviest weight, then most reps at it) and
// the most recent session's sets, for the planner and the progress view.
export function exerciseHistory(workouts) {
  const byExercise = new Map();
  const sorted = [...workouts].sort((a, b) => a.date.localeCompare(b.date));
  for (const w of sorted) {
    for (const e of w.entries) {
      const h = byExercise.get(e.exerciseId) ?? { exerciseId: e.exerciseId, name: e.name, type: e.type, sessions: 0, best: null };
      h.sessions++;
      h.lastDate = w.date;
      h.lastSets = e.sets;
      for (const s of e.sets) {
        if (e.type === "timed") {
          if (!h.best || s.seconds > h.best.seconds) h.best = { ...s, date: w.date };
        } else {
          const better =
            !h.best || (s.weight ?? 0) > (h.best.weight ?? 0) || ((s.weight ?? 0) === (h.best.weight ?? 0) && s.reps > h.best.reps);
          if (better) h.best = { ...s, date: w.date };
        }
      }
      byExercise.set(e.exerciseId, h);
    }
  }
  return [...byExercise.values()].sort((a, b) => b.lastDate.localeCompare(a.lastDate));
}

export async function getFitnessProfile(db) {
  const doc = await db.collection("settings").findOne({ _id: "fitness" });
  const { _id, ...rest } = doc ?? {};
  return { ...DEFAULT_PROFILE, ...rest };
}

export function parseProfile(body) {
  const heightCm = Number(body?.heightCm);
  const weightKg = Number(body?.weightKg);
  const daysPerWeek = Number(body?.daysPerWeek);
  if (!(heightCm >= 100 && heightCm <= 250)) return { error: "Height should be between 100 and 250 cm." };
  if (!(weightKg >= 30 && weightKg <= 300)) return { error: "Weight should be between 30 and 300 kg." };
  if (!Number.isInteger(daysPerWeek) || daysPerWeek < 1 || daysPerWeek > 7)
    return { error: "Training days should be 1 to 7." };
  const text = (k, max) => String(body?.[k] ?? "").trim().slice(0, max);
  return {
    data: {
      heightCm,
      weightKg,
      daysPerWeek,
      goal: text("goal", 200) || DEFAULT_PROFILE.goal,
      experience: text("experience", 100) || DEFAULT_PROFILE.experience,
      equipment: text("equipment", 200) || DEFAULT_PROFILE.equipment,
      notes: text("notes", 1000),
    },
  };
}
