import { NextResponse } from "next/server";
import { requireDb } from "@/lib/mongodb";
import { isAdmin, unauthorised } from "@/lib/auth";
import { isDate, overlapFilter, parseSleepSession, sleepToClient } from "@/lib/daily-logs";

export const dynamic = "force-dynamic";

const describe = (s) => (s.end ? `${s.start.slice(11)}–${s.end.slice(11)}` : s.start.slice(11));

// GET ?since=YYYY-MM-DD -> sessions you woke up from on or after that date, newest first,
// plus the one you're asleep in right now (if any)
export async function GET(request) {
  if (!isAdmin(request)) return unauthorised();
  const since = request.nextUrl.searchParams.get("since") ?? "";
  if (!isDate(since)) return NextResponse.json({ error: "since must be YYYY-MM-DD." }, { status: 400 });
  const col = (await requireDb()).collection("sleepSessions");
  const [done, open] = await Promise.all([
    col.find({ day: { $gte: since } }).sort({ start: -1 }).limit(200).toArray(),
    col.findOne({ end: null }),
  ]);
  return NextResponse.json({ sessions: done.map(sleepToClient), open: open ? sleepToClient(open) : null });
}

// POST { start, end? (omit = asleep now), quality?, note? }
export async function POST(request) {
  if (!isAdmin(request)) return unauthorised();
  const { data, error } = parseSleepSession(await request.json().catch(() => ({})));
  if (error) return NextResponse.json({ error }, { status: 400 });
  const col = (await requireDb()).collection("sleepSessions");
  const clash = await col.findOne(overlapFilter(data));
  if (clash) {
    const error = clash.end
      ? `That overlaps with another sleep (${describe(clash)}).`
      : `You're already marked as asleep since ${describe(clash)}. Tap "I'm awake" first.`;
    return NextResponse.json({ error }, { status: 409 });
  }
  const doc = { ...data, createdAt: new Date() };
  const { insertedId } = await col.insertOne(doc);
  return NextResponse.json({ session: sleepToClient({ _id: insertedId, ...doc }) }, { status: 201 });
}
