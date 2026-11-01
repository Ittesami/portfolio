import { NextResponse } from "next/server";
import { requireDb } from "@/lib/mongodb";
import { isAdmin, unauthorised } from "@/lib/auth";
import { CoachError, generateWeeklyPlan } from "@/lib/fitness-coach";
import { addDays, exerciseHistory, getFitnessProfile, isDate, listExercises, weekStartOf } from "@/lib/fitness";

// Claude takes a minute or two with a full plan.
export const maxDuration = 300;

// POST { week: "YYYY-MM-DD" (any day in the week), today: "YYYY-MM-DD" }
// Reviews the last 4 weeks of workouts, last week's food log and the last 2 weeks of
// sleep, then writes the plan for that week.
// Replaces any existing plan for the week.
export async function POST(request) {
  if (!isAdmin(request)) return unauthorised();
  const body = await request.json().catch(() => ({}));
  if (!isDate(body?.week)) return NextResponse.json({ error: "week must be YYYY-MM-DD." }, { status: 400 });
  const weekStart = weekStartOf(body.week);
  const today = isDate(body?.today) ? body.today : new Date().toISOString().slice(0, 10);

  const db = await requireDb();
  const since = addDays(weekStart, -28);
  const [profile, exercises, workouts, allTime, previousPlan, bodyweights, meals, sleep] = await Promise.all([
    getFitnessProfile(db),
    listExercises(db),
    db.collection("workouts").find({ date: { $gte: since, $lt: weekStart } }).sort({ date: 1 }).toArray(),
    db.collection("workouts").find({ date: { $lt: weekStart } }).project({ date: 1, entries: 1 }).toArray(),
    db.collection("fitnessPlans").findOne({ _id: addDays(weekStart, -7) }),
    db.collection("bodyweights").find({}).sort({ _id: -1 }).limit(8).toArray(),
    db.collection("meals").find({ date: { $gte: addDays(weekStart, -7), $lt: weekStart } }).sort({ date: 1, time: 1 }).toArray(),
    db.collection("sleep").find({ _id: { $gte: addDays(weekStart, -14), $lt: weekStart } }).sort({ _id: 1 }).toArray(),
  ]);

  let plan;
  try {
    plan = await generateWeeklyPlan({
      weekStart,
      today,
      profile,
      exercises,
      workouts,
      history: exerciseHistory(allTime),
      previousPlan,
      bodyweights: bodyweights.map((b) => ({ date: b._id, kg: b.kg })),
      meals,
      sleep,
    });
  } catch (err) {
    if (err instanceof CoachError) return NextResponse.json({ error: err.message }, { status: 502 });
    console.error("[fitness] plan generation failed:", err);
    return NextResponse.json({ error: "Couldn't generate the plan. Try again." }, { status: 500 });
  }

  const { usage, ...rest } = plan;
  const doc = { ...rest, source: "claude", createdAt: new Date() };
  await db.collection("fitnessPlans").replaceOne({ _id: weekStart }, doc, { upsert: true });
  return NextResponse.json({ plan: { ...doc, weekStart } });
}
