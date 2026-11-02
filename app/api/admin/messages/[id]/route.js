import { NextResponse } from "next/server";
import { requireDb } from "@/lib/mongodb";
import { isAdmin, unauthorised } from "@/lib/auth";
import { messageToClient, parseId } from "@/lib/messages";

const notFound = () => NextResponse.json({ error: "Message not found." }, { status: 404 });

// PATCH { read: boolean }
export async function PATCH(request, { params }) {
  if (!isAdmin(request)) return unauthorised();
  const _id = parseId((await params).id);
  if (!_id) return notFound();
  const body = await request.json().catch(() => ({}));
  if (typeof body?.read !== "boolean") return NextResponse.json({ error: "read must be true or false." }, { status: 400 });

  const updated = await (await requireDb())
    .collection("messages")
    .findOneAndUpdate({ _id }, { $set: { read: body.read } }, { returnDocument: "after" });
  if (!updated) return notFound();
  return NextResponse.json({ message: messageToClient(updated) });
}

// DELETE: removes the message for good.
export async function DELETE(request, { params }) {
  if (!isAdmin(request)) return unauthorised();
  const _id = parseId((await params).id);
  if (!_id) return notFound();
  const { deletedCount } = await (await requireDb()).collection("messages").deleteOne({ _id });
  if (!deletedCount) return notFound();
  return NextResponse.json({ ok: true });
}
