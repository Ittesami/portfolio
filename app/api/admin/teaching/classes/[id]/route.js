import { NextResponse } from "next/server";
import { requireDb } from "@/lib/mongodb";
import { isAdmin, unauthorised } from "@/lib/auth";
import { classToClient, nextSchedule, parseClass, parseId, unknownStudents } from "@/lib/teaching";

const notFound = () => NextResponse.json({ error: "Class not found." }, { status: 404 });

// PUT { the whole class, as for POST, plus changeFrom? } -> replaces its details. New days or
// times apply from changeFrom (earlier weeks keep their old times); without it they replace
// the old times everywhere. Recorded sessions are kept.
export async function PUT(request, { params }) {
  if (!isAdmin(request)) return unauthorised();
  const _id = parseId((await params).id);
  if (!_id) return notFound();
  const { data, changeFrom, error } = parseClass(await request.json().catch(() => ({})));
  if (error) return NextResponse.json({ error }, { status: 400 });
  const db = await requireDb();
  if (await unknownStudents(db, data.studentIds)) return NextResponse.json({ error: "Unknown student." }, { status: 400 });
  const existing = await db.collection("teachClasses").findOne({ _id });
  if (!existing) return notFound();
  const schedule = nextSchedule(existing, data, changeFrom);
  const updated = await db
    .collection("teachClasses")
    .findOneAndUpdate({ _id }, { $set: { ...data, schedule, updatedAt: new Date() } }, { returnDocument: "after" });
  if (!updated) return notFound();
  return NextResponse.json({ class: classToClient(updated) });
}

// DELETE -> removes the class and everything recorded for it.
export async function DELETE(request, { params }) {
  if (!isAdmin(request)) return unauthorised();
  const id = (await params).id;
  const _id = parseId(id);
  if (!_id) return notFound();
  const db = await requireDb();
  const { deletedCount } = await db.collection("teachClasses").deleteOne({ _id });
  if (!deletedCount) return notFound();
  await db.collection("teachSessions").deleteMany({ classId: id });
  return NextResponse.json({ ok: true });
}
