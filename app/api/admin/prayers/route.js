import { NextResponse } from "next/server";
import { requireDb } from "@/lib/mongodb";
import { isAdmin, unauthorised } from "@/lib/auth";
import {
  PRAYERS,
  STATUSES,
  METHODS,
  addDays,
  cleanLog,
  fetchTimings,
  getPrayerSettings,
  isFriday,
} from "@/lib/prayers";

export const dynamic = "force-dynamic";
const DATE = /^\d{4}-\d{2}-\d{2}$/;

// GET /api/admin/prayers?date=YYYY-MM-DD
// -> times for that day, what you've logged, and the 7 days ending on it.
export async function GET(request) {
  if (!isAdmin(request)) return unauthorised();
  const date = request.nextUrl.searchParams.get("date") ?? "";
  if (!DATE.test(date)) return NextResponse.json({ error: "Date must be YYYY-MM-DD." }, { status: 400 });

  const db = await requireDb();
  const settings = await getPrayerSettings(db);
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(date, i - 6));
  const logs = await db
    .collection("prayers")
    .find({ _id: { $in: weekDates } })
    .toArray();
  const byDate = new Map(logs.map((l) => [l._id, cleanLog(l)]));

  let timing = null;
  let timingError = "";
  try {
    timing = await fetchTimings(date, settings);
  } catch (err) {
    timingError = err.message;
  }

  return NextResponse.json({
    date,
    friday: isFriday(date),
    settings,
    methods: METHODS,
    times: timing?.times ?? null,
    hijri: timing?.hijri ?? "",
    timezone: timing?.timezone ?? "",
    timingError,
    log: byDate.get(date) ?? {},
    week: weekDates.map((d) => ({ date: d, friday: isFriday(d), log: byDate.get(d) ?? {} })),
  });
}

// PUT /api/admin/prayers  { date, prayer, status }  (status null clears it)
export async function PUT(request) {
  if (!isAdmin(request)) return unauthorised();
  const body = await request.json().catch(() => ({}));
  const { date, prayer } = body;
  const status = body.status ?? null;
  if (!DATE.test(date ?? "")) return NextResponse.json({ error: "Date must be YYYY-MM-DD." }, { status: 400 });
  if (!PRAYERS.includes(prayer)) return NextResponse.json({ error: "Unknown prayer." }, { status: 400 });
  if (status !== null && !STATUSES.includes(status))
    return NextResponse.json({ error: "Unknown status." }, { status: 400 });

  const db = await requireDb();
  const update = status
    ? { $set: { [prayer]: status, updatedAt: new Date() } }
    : { $unset: { [prayer]: "" }, $set: { updatedAt: new Date() } };
  const doc = await db
    .collection("prayers")
    .findOneAndUpdate({ _id: date }, update, { upsert: true, returnDocument: "after" });
  return NextResponse.json({ date, log: cleanLog(doc) });
}
