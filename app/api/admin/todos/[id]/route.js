import { NextResponse } from "next/server";
import { requireDb } from "@/lib/mongodb";
import { isAdmin, unauthorised } from "@/lib/auth";
import { parseId, parseTodo, toClient } from "@/lib/todos";

export async function PATCH(request, { params }) {
  if (!isAdmin(request)) return unauthorised();
  const _id = parseId((await params).id);
  if (!_id) return NextResponse.json({ error: "Task not found." }, { status: 404 });

  const body = await request.json().catch(() => ({}));
  const { data, error } = parseTodo(body, true);
  if (error) return NextResponse.json({ error }, { status: 400 });

  const db = await requireDb();
  const current = await db.collection("todos").findOne({ _id });
  if (!current) return NextResponse.json({ error: "Task not found." }, { status: 404 });
  // A time needs a date: reject a time with no date, and clear the time when the date is cleared.
  if (!(data.dueDate ?? current.dueDate)) {
    if (data.dueTime) return NextResponse.json({ error: "Pick a date to go with the time." }, { status: 400 });
    data.dueTime = "";
  }

  const updated = await db.collection("todos").findOneAndUpdate({ _id }, { $set: data }, { returnDocument: "after" });
  return NextResponse.json({ todo: toClient(updated) });
}

export async function DELETE(request, { params }) {
  if (!isAdmin(request)) return unauthorised();
  const _id = parseId((await params).id);
  if (!_id) return NextResponse.json({ error: "Task not found." }, { status: 404 });
  const { deletedCount } = await (await requireDb()).collection("todos").deleteOne({ _id });
  if (!deletedCount) return NextResponse.json({ error: "Task not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
