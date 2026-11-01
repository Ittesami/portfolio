import { NextResponse } from "next/server";
import { requireDb } from "@/lib/mongodb";
import { isAdmin, unauthorised } from "@/lib/auth";
import { listExercises, parseWorkout, workoutToClient } from "@/lib/fitness";

// POST { date, notes, entries: [{ exerciseId, sets: [{ reps, weight } | { seconds, distance }] }] }
export async function POST(request) {
  if (!isAdmin(request)) return unauthorised();
  const db = await requireDb();
  const byId = new Map((await listExercises(db)).map((e) => [e.id, e]));
  const { data, error } = parseWorkout(await request.json().catch(() => ({})), byId);
  if (error) return NextResponse.json({ error }, { status: 400 });

  const doc = { ...data, createdAt: new Date() };
  const { insertedId } = await db.collection("workouts").insertOne(doc);
  return NextResponse.json({ workout: workoutToClient({ _id: insertedId, ...doc }) }, { status: 201 });
}
