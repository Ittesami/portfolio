import { NextResponse } from "next/server";
import { requireDb } from "@/lib/mongodb";
import { isAdmin, unauthorised } from "@/lib/auth";
import { listExercises, parseId, parseWorkout, workoutToClient } from "@/lib/fitness";

// PUT: replaces a logged workout (same body as POST /api/admin/fitness/workouts).
export async function PUT(request, { params }) {
  if (!isAdmin(request)) return unauthorised();
  const _id = parseId((await params).id);
  if (!_id) return NextResponse.json({ error: "Workout not found." }, { status: 404 });

  const db = await requireDb();
  const byId = new Map((await listExercises(db)).map((e) => [e.id, e]));
  const { data, error } = parseWorkout(await request.json().catch(() => ({})), byId);
  if (error) return NextResponse.json({ error }, { status: 400 });

  const updated = await db
    .collection("workouts")
    .findOneAndUpdate({ _id }, { $set: { ...data, updatedAt: new Date() } }, { returnDocument: "after" });
  if (!updated) return NextResponse.json({ error: "Workout not found." }, { status: 404 });
  return NextResponse.json({ workout: workoutToClient(updated) });
}

export async function DELETE(request, { params }) {
  if (!isAdmin(request)) return unauthorised();
  const _id = parseId((await params).id);
  if (!_id) return NextResponse.json({ error: "Workout not found." }, { status: 404 });
  const { deletedCount } = await (await requireDb()).collection("workouts").deleteOne({ _id });
  if (!deletedCount) return NextResponse.json({ error: "Workout not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
