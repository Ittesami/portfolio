import { NextResponse } from "next/server";
import { requireDb } from "@/lib/mongodb";
import { isAdmin, unauthorised } from "@/lib/auth";
import { classToClient, parseClass, parseId, unknownStudents } from "@/lib/teaching";

const notFound = () => NextResponse.json({ error: "Class not found." }, { status: 404 });

// PUT { the whole class, as for POST } -> replaces its details. Recorded sessions are kept.
export async function PUT(request, { params }) {
  if (!isAdmin(request)) return unauthorised();
  const _id = parseId((await params).id);
  if (!_id) return notFound();
  const { data, error } = parseClass(await request.json().catch(() => ({})));
  if (error) return NextResponse.json({ error }, { status: 400 });
  const db = await requireDb();
  if (await unknownStudents(db, data.studentIds)) return NextResponse.json({ error: "Unknown student." }, { status: 400 });
  const updated = await db
    .collection("teachClasses")
    .findOneAndUpdate({ _id }, { $set: { ...data, updatedAt: new Date() } }, { returnDocument: "after" });
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
