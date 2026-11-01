import { NextResponse } from "next/server";
import { requireDb } from "@/lib/mongodb";
import { isAdmin, unauthorised } from "@/lib/auth";
import { mealToClient, parseId, parseMeal } from "@/lib/daily-logs";

// PUT { date, time, text }
export async function PUT(request, { params }) {
  if (!isAdmin(request)) return unauthorised();
  const _id = parseId((await params).id);
  if (!_id) return NextResponse.json({ error: "Entry not found." }, { status: 404 });
  const { data, error } = parseMeal(await request.json().catch(() => ({})));
  if (error) return NextResponse.json({ error }, { status: 400 });
  const updated = await (await requireDb())
    .collection("meals")
    .findOneAndUpdate({ _id }, { $set: { ...data, updatedAt: new Date() } }, { returnDocument: "after" });
  if (!updated) return NextResponse.json({ error: "Entry not found." }, { status: 404 });
  return NextResponse.json({ meal: mealToClient(updated) });
}

export async function DELETE(request, { params }) {
  if (!isAdmin(request)) return unauthorised();
  const _id = parseId((await params).id);
  if (!_id) return NextResponse.json({ error: "Entry not found." }, { status: 404 });
  const { deletedCount } = await (await requireDb()).collection("meals").deleteOne({ _id });
  if (!deletedCount) return NextResponse.json({ error: "Entry not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
