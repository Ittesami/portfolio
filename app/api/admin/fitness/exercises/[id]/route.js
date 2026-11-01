import { NextResponse } from "next/server";
import { requireDb } from "@/lib/mongodb";
import { isAdmin, unauthorised } from "@/lib/auth";

// DELETE: removes a custom exercise you added. Built-in ones stay, and so do
// past workouts that used it (they keep their own copy of the name).
export async function DELETE(request, { params }) {
  if (!isAdmin(request)) return unauthorised();
  const { id } = await params;
  const db = await requireDb();
  const doc = await db.collection("exercises").findOne({ _id: id });
  if (!doc) return NextResponse.json({ error: "Exercise not found." }, { status: 404 });
  if (!doc.custom) return NextResponse.json({ error: "Built-in exercises can't be deleted." }, { status: 400 });
  await db.collection("exercises").deleteOne({ _id: id });
  return NextResponse.json({ ok: true });
}
