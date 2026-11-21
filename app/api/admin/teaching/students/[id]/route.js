import { NextResponse } from "next/server";
import { requireDb } from "@/lib/mongodb";
import { isAdmin, unauthorised } from "@/lib/auth";
import { parseId, parseStudent, studentToClient } from "@/lib/teaching";

const notFound = () => NextResponse.json({ error: "Student not found." }, { status: 404 });

// PATCH { name?, level?, notes?, active? }
export async function PATCH(request, { params }) {
  if (!isAdmin(request)) return unauthorised();
  const _id = parseId((await params).id);
  if (!_id) return notFound();
  const { data, error } = parseStudent(await request.json().catch(() => ({})), true);
  if (error) return NextResponse.json({ error }, { status: 400 });
  const updated = await (await requireDb())
    .collection("teachStudents")
    .findOneAndUpdate({ _id }, { $set: { ...data, updatedAt: new Date() } }, { returnDocument: "after" });
  if (!updated) return notFound();
  return NextResponse.json({ student: studentToClient(updated) });
}

// DELETE -> removes the student and takes them out of their classes. Classes left with
// nobody in them are kept (with their history) so you can reassign or delete them.
export async function DELETE(request, { params }) {
  if (!isAdmin(request)) return unauthorised();
  const id = (await params).id;
  const _id = parseId(id);
  if (!_id) return notFound();
  const db = await requireDb();
  const { deletedCount } = await db.collection("teachStudents").deleteOne({ _id });
  if (!deletedCount) return notFound();
  await db.collection("teachClasses").updateMany({ studentIds: id }, { $pull: { studentIds: id } });
  return NextResponse.json({ ok: true });
}
