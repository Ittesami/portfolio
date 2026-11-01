import { NextResponse } from "next/server";
import { requireDb } from "@/lib/mongodb";
import { isAdmin, unauthorised } from "@/lib/auth";
import {
  addDays,
  exerciseHistory,
  getFitnessProfile,
  isDate,
  weekDates,
  weekStartOf,
  workoutToClient,
  workoutTotals,
} from "@/lib/fitness";

export const dynamic = "force-dynamic";

// GET /api/admin/fitness/overview?week=YYYY-MM-DD (any day in the week)
// Everything the fitness page needs for one week, plus progress over the last 8 weeks.
export async function GET(request) {
  if (!isAdmin(request)) return unauthorised();
  const week = request.nextUrl.searchParams.get("week") ?? "";
  if (!isDate(week)) return NextResponse.json({ error: "week must be YYYY-MM-DD." }, { status: 400 });

  const db = await requireDb();
  const weekStart = weekStartOf(week);
  const since = addDays(weekStart, -7 * 7);
  const weekEnd = addDays(weekStart, 6);

  const [profile, plan, recent, bodyweights] = await Promise.all([
    getFitnessProfile(db),
    db.collection("fitnessPlans").findOne({ _id: weekStart }),
    db.collection("workouts").find({ date: { $gte: since, $lte: weekEnd } }).sort({ date: -1, createdAt: -1 }).toArray(),
    db.collection("bodyweights").find({}).sort({ _id: -1 }).limit(30).toArray(),
  ]);
  const allTime = await db.collection("workouts").find({}).project({ date: 1, entries: 1 }).toArray();

  const weeks = Array.from({ length: 8 }, (_, i) => {
    const start = addDays(weekStart, -7 * (7 - i));
    const end = addDays(start, 6);
    return { weekStart: start, ...workoutTotals(recent.filter((w) => w.date >= start && w.date <= end)) };
  });

  return NextResponse.json({
    weekStart,
    dates: weekDates(weekStart),
    profile,
    plan: plan ? { ...plan, weekStart: plan._id, _id: undefined } : null,
    weekWorkouts: recent.filter((w) => w.date >= weekStart && w.date <= weekEnd).map(workoutToClient),
    recentWorkouts: recent.slice(0, 20).map(workoutToClient),
    weeks,
    bests: exerciseHistory(allTime).slice(0, 12),
    bodyweights: bodyweights.map((b) => ({ date: b._id, kg: b.kg })),
    claudeReady: Boolean(process.env.ANTHROPIC_API_KEY),
  });
}
