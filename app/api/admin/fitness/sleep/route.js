import { NextResponse } from "next/server";
import { requireDb } from "@/lib/mongodb";
import { isAdmin, unauthorised } from "@/lib/auth";
import { isDate, parseSleep, sleepToClient } from "@/lib/daily-logs";

export const dynamic = "force-dynamic";

// GET -> the last 30 nights, newest first
export async function GET(request) {
  if (!isAdmin(request)) return unauthorised();
  const docs = await (await requireDb()).collection("sleep").find({}).sort({ _id: -1 }).limit(30).toArray();
  return NextResponse.json({ nights: docs.map(sleepToClient) });
}

// PUT { date (morning you woke), bedtime, wakeTime, quality?, note? } -> one entry per night
export async function PUT(request) {
  if (!isAdmin(request)) return unauthorised();
  const { data, error } = parseSleep(await request.json().catch(() => ({})));
  if (error) return NextResponse.json({ error }, { status: 400 });
  const { _id, ...fields } = data;
  await (await requireDb()).collection("sleep").updateOne({ _id }, { $set: { ...fields, updatedAt: new Date() } }, { upsert: true });
  return NextResponse.json({ night: sleepToClient(data) });
}

// DELETE ?date=YYYY-MM-DD
export async function DELETE(request) {
  if (!isAdmin(request)) return unauthorised();
  const date = request.nextUrl.searchParams.get("date") ?? "";
  if (!isDate(date)) return NextResponse.json({ error: "date must be YYYY-MM-DD." }, { status: 400 });
  await (await requireDb()).collection("sleep").deleteOne({ _id: date });
  return NextResponse.json({ ok: true });
}
