import { NextResponse } from "next/server";
import { requireDb } from "@/lib/mongodb";
import { isAdmin, unauthorised } from "@/lib/auth";
import { listExercises, parseExercise } from "@/lib/fitness";
import { CATEGORIES, EQUIPMENT } from "@/lib/exercise-library";

export const dynamic = "force-dynamic";

export async function GET(request) {
  if (!isAdmin(request)) return unauthorised();
  return NextResponse.json({
    exercises: await listExercises(await requireDb()),
    categories: CATEGORIES,
    equipment: EQUIPMENT,
  });
}

// POST { name, category, equipment, type } -> adds a custom exercise
export async function POST(request) {
  if (!isAdmin(request)) return unauthorised();
  const { data, error } = parseExercise(await request.json().catch(() => ({})));
  if (error) return NextResponse.json({ error }, { status: 400 });

  const db = await requireDb();
  const clash = await db.collection("exercises").findOne({ _id: data._id });
  if (clash) return NextResponse.json({ error: `"${clash.name}" is already in your library.` }, { status: 409 });
  await db.collection("exercises").insertOne({ ...data, createdAt: new Date() });
  const { _id, ...rest } = data;
  return NextResponse.json({ exercise: { id: _id, ...rest } }, { status: 201 });
}
