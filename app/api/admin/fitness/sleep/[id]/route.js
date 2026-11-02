import { NextResponse } from "next/server";
import { requireDb } from "@/lib/mongodb";
import { isAdmin, unauthorised } from "@/lib/auth";
import { overlapFilter, parseId, parseSleepSession, sleepToClient } from "@/lib/daily-logs";

const notFound = () => NextResponse.json({ error: "That sleep wasn't found." }, { status: 404 });

// PATCH { start?, end?, quality?, note? } -> e.g. { end } for "I'm awake"
export async function PATCH(request, { params }) {
  if (!isAdmin(request)) return unauthorised();
  const _id = parseId((await params).id);
  if (!_id) return notFound();
  const col = (await requireDb()).collection("sleepSessions");
  const current = await col.findOne({ _id });
  if (!current) return notFound();

  const body = await request.json().catch(() => ({}));
  const pick = (k) => (k in body ? body[k] : current[k]);
  const { data, error } = parseSleepSession({ start: pick("start"), end: pick("end"), quality: pick("quality"), note: pick("note") });
  if (error) return NextResponse.json({ error }, { status: 400 });
  const clash = await col.findOne(overlapFilter(data, _id));
  if (clash) return NextResponse.json({ error: "That overlaps with another sleep you logged." }, { status: 409 });

  const updated = await col.findOneAndUpdate({ _id }, { $set: { ...data, updatedAt: new Date() } }, { returnDocument: "after" });
  return NextResponse.json({ session: sleepToClient(updated) });
}

export async function DELETE(request, { params }) {
  if (!isAdmin(request)) return unauthorised();
  const _id = parseId((await params).id);
  if (!_id) return notFound();
  const { deletedCount } = await (await requireDb()).collection("sleepSessions").deleteOne({ _id });
  if (!deletedCount) return notFound();
  return NextResponse.json({ ok: true });
}
