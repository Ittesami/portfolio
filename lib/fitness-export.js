import { addDays, getFitnessProfile, weekStartOf } from "./fitness";
import { mealNumbers } from "./food-estimate";
import { nutritionTargets } from "./nutrition";

// Everything the fitness tracker knows for a date range, as JSON or as Markdown
// you can paste into an AI chat to get a new plan. Read-only.

const r = (n) => Math.round(n);
const hours = (mins) => `${Math.floor(mins / 60)}h ${String(mins % 60).padStart(2, "0")}m`;
const weekday = (date) => new Date(`${date}T12:00:00Z`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });

function fmtSet(type, s) {
  if (type === "timed") {
    const t = s.seconds < 60 ? `${s.seconds} s` : `${Math.round((s.seconds / 60) * 10) / 10} min`;
    return `${t}${s.distance ? ` (${s.distance} km)` : ""}`;
  }
  return s.weight ? `${s.reps}×${s.weight} kg` : `${s.reps} reps`;
}

export async function buildExport(db, { from, to }) {
  const [profile, workouts, meals, sleep, bodyweights, plans] = await Promise.all([
    getFitnessProfile(db),
    db.collection("workouts").find({ date: { $gte: from, $lte: to } }).sort({ date: 1, createdAt: 1 }).toArray(),
    db.collection("meals").find({ date: { $gte: from, $lte: to } }).sort({ date: 1, time: 1 }).toArray(),
    db.collection("sleepSessions").find({ day: { $gte: from, $lte: to } }).sort({ start: 1 }).toArray(),
    db.collection("bodyweights").find({}).sort({ _id: 1 }).toArray(),
    db.collection("fitnessPlans").find({ _id: { $gte: weekStartOf(from), $lte: weekStartOf(to) } }).sort({ _id: 1 }).toArray(),
  ]);
  const targets = nutritionTargets(profile);
  const dates = [];
  for (let d = from; d <= to; d = addDays(d, 1)) dates.push(d);

  const food = dates.map((date) => {
    const list = meals
      .filter((m) => m.date === date)
      .map((m) => {
        const n = mealNumbers(m);
        return { time: m.time, text: m.text, kcal: n ? r(n.kcal) : null, protein: n ? r(n.p) : null, estimated: n ? !n.manual : null };
      });
    const known = list.filter((m) => m.kcal !== null);
    const all = meals.filter((m) => m.date === date).map(mealNumbers).filter(Boolean);
    return {
      date,
      meals: list,
      total: list.length ? { kcal: r(all.reduce((a, n) => a + n.kcal, 0)), protein: r(all.reduce((a, n) => a + n.p, 0)), carbs: r(all.reduce((a, n) => a + n.c, 0)), fat: r(all.reduce((a, n) => a + n.f, 0)) } : null,
      unestimated: list.length - known.length,
    };
  });

  const sleepDays = dates.map((date) => {
    const list = sleep.filter((s) => s.day === date).map((s) => ({ start: s.start, end: s.end, minutes: s.minutes, quality: s.quality ?? null, note: s.note || "" }));
    return { date, sessions: list, totalMinutes: list.reduce((a, s) => a + s.minutes, 0) };
  });

  const loggedFood = food.filter((d) => d.total);
  const loggedSleep = sleepDays.filter((d) => d.sessions.length);
  const weights = bodyweights.map((b) => ({ date: b._id, kg: b.kg }));
  const inRange = weights.filter((w) => w.date >= from && w.date <= to);

  return {
    generated: new Date().toISOString(),
    range: { from, to, days: dates.length },
    profile: { ...profile, _id: undefined },
    dailyTargets: { kcal: targets.kcal, protein: targets.protein, carbs: targets.carbs, fat: targets.fat, maintenanceKcal: targets.maintenance },
    summary: {
      workouts: workouts.length,
      foodDaysLogged: loggedFood.length,
      avgKcal: loggedFood.length ? r(loggedFood.reduce((a, d) => a + d.total.kcal, 0) / loggedFood.length) : null,
      avgProtein: loggedFood.length ? r(loggedFood.reduce((a, d) => a + d.total.protein, 0) / loggedFood.length) : null,
      sleepDaysLogged: loggedSleep.length,
      avgSleepMinutes: loggedSleep.length ? r(loggedSleep.reduce((a, d) => a + d.totalMinutes, 0) / loggedSleep.length) : null,
      latestWeight: weights.at(-1) ?? null,
    },
    workouts: workouts.map((w) => ({
      date: w.date,
      notes: w.notes || "",
      exercises: w.entries.map((e) => ({ name: e.name, type: e.type, sets: e.sets.map((s) => fmtSet(e.type, s)) })),
    })),
    food,
    sleep: sleepDays,
    bodyweight: inRange.length ? inRange : weights.slice(-3),
    plans: plans.map((p) => ({
      weekStart: p._id,
      days: p.days.map((d) => ({
        date: d.date,
        title: d.title,
        rest: d.rest,
        exercises: d.exercises.map((x) => `${x.name}: ${x.sets} × ${x.target}${x.load ? ` @ ${x.load}` : ""}`),
        food: d.food || "",
        sleep: d.bed || "",
      })),
    })),
  };
}

// A ready-to-paste request for a new plan, followed by the data.
export function exportToMarkdown(data, { ask = true, notes = "" } = {}) {
  const { range, profile, dailyTargets: t, summary: s } = data;
  const nextDay = addDays(range.to, 1);
  const L = [];
  L.push(`# Fitness log: ${weekday(range.from)} to ${weekday(range.to)} (${range.days} days)`, "");

  if (ask) {
    L.push("## What I'd like from you", "");
    L.push(
      `I'm a beginner on a bulk. Using the data below, briefly review how this period went (training, food, sleep), then write my plan for the next 7 days, ${weekday(nextDay)} to ${weekday(addDays(nextDay, 6))}:`,
      "",
      `- **Workouts**: ${profile.daysPerWeek} gym days a week, ${profile.equipment.toLowerCase()}. For each exercise give sets × reps, the load, and rest. Base the loads on my logged sets: go up one step when I hit the top of the rep range on every set.`,
      "- **Food**: a simple daily menu with calories and protein per meal, close to my targets. I only eat meat, eggs, bread, rice, milk and fruit (no vegetables).",
      "- **Sleep**: a bedtime and an alarm time for each night.",
      "- Keep it short and easy to read on a phone.",
    );
    if (notes.trim()) L.push(`- ${notes.trim()}`);
    if (profile.notes?.trim()) L.push(`- My notes: ${profile.notes.trim()}`);
    L.push("");
  }

  L.push("## Me", "");
  L.push(`- ${profile.age ?? "?"} years, ${profile.heightCm} cm, ${s.latestWeight ? `${s.latestWeight.kg} kg (${weekday(s.latestWeight.date)})` : `${profile.weightKg} kg`}`);
  L.push(`- Goal: ${profile.goal}. Experience: ${profile.experience}. Equipment: ${profile.equipment}. ${profile.daysPerWeek} training days a week.`);
  L.push(`- Daily targets: ${t.kcal} kcal, ${t.protein} g protein, ${t.carbs} g carbs, ${t.fat} g fat (maintenance ≈ ${t.maintenanceKcal} kcal).`, "");

  L.push("## Summary", "");
  L.push(`- Workouts: ${s.workouts} in ${range.days} days.`);
  L.push(
    s.avgKcal !== null
      ? `- Food: ${s.foodDaysLogged} days logged, averaging ≈ ${s.avgKcal} kcal and ${s.avgProtein} g protein a day (estimated from what I wrote).`
      : "- Food: nothing logged.",
  );
  L.push(s.avgSleepMinutes !== null ? `- Sleep: ${s.sleepDaysLogged} days logged, averaging ${hours(s.avgSleepMinutes)} a day.` : "- Sleep: nothing logged.", "");

  L.push("## Workouts", "");
  if (!data.workouts.length) L.push("None logged.");
  for (const w of data.workouts) {
    L.push(`**${weekday(w.date)}**${w.notes ? ` · _${w.notes}_` : ""}`);
    for (const e of w.exercises) L.push(`- ${e.name}: ${e.sets.join(", ")}`);
    L.push("");
  }

  L.push("## Food (calories and protein are estimates)", "");
  L.push("| Day | kcal | Protein | Carbs | Fat | Meals |", "|---|---|---|---|---|---|");
  for (const d of data.food) {
    if (!d.total) L.push(`| ${weekday(d.date)} | – | – | – | – | not logged |`);
    else L.push(`| ${weekday(d.date)} | ${d.total.kcal} | ${d.total.protein} g | ${d.total.carbs} g | ${d.total.fat} g | ${d.meals.length} |`);
  }
  L.push("");
  for (const d of data.food.filter((x) => x.meals.length)) {
    L.push(`**${weekday(d.date)}**`);
    for (const m of d.meals) L.push(`- ${m.time} ${m.text}${m.kcal !== null ? ` (≈ ${m.kcal} kcal, ${m.protein} g protein${m.estimated ? "" : ", my own numbers"})` : " (no estimate)"}`);
    L.push("");
  }

  L.push("## Sleep", "");
  const slept = data.sleep.filter((d) => d.sessions.length);
  if (!slept.length) L.push("None logged.");
  for (const d of slept) {
    const parts = d.sessions.map((x) => `${x.start.slice(11)}→${x.end.slice(11)} (${hours(x.minutes)}${x.quality ? `, quality ${x.quality}/5` : ""}${x.note ? `, ${x.note}` : ""})`);
    L.push(`- ${weekday(d.date)}: ${hours(d.totalMinutes)} total · ${parts.join("; ")}`);
  }
  L.push("");

  L.push("## Body weight", "");
  L.push(data.bodyweight.length ? data.bodyweight.map((b) => `- ${weekday(b.date)}: ${b.kg} kg`).join("\n") : "None logged.", "");

  if (data.plans.length) {
    L.push("## The plan I was following", "");
    for (const p of data.plans) {
      for (const d of p.days.filter((x) => x.date >= range.from && x.date <= range.to)) {
        L.push(`**${weekday(d.date)} · ${d.title}**${d.food ? ` · Food: ${d.food}` : ""}${d.sleep ? ` · Sleep: ${d.sleep}` : ""}`);
        for (const x of d.exercises) L.push(`- ${x}`);
        L.push("");
      }
    }
  }
  return L.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
}
