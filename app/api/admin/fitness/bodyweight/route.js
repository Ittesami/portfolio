import { NextResponse } from "next/server";
import { requireDb } from "@/lib/mongodb";
import { isAdmin, unauthorised } from "@/lib/auth";
import { isDate } from "@/lib/fitness";

// PUT { date, kg }: records your weight for a day (one entry per day).
// Also updates the weight in your fitness profile when it's the latest entry.
export async function PUT(request) {
  if (!isAdmin(request)) return unauthorised();
  const body = await request.json().catch(() => ({}));
  const kg = Number(body?.kg);
  if (!isDate(body?.date)) return NextResponse.json({ error: "Pick a date." }, { status: 400 });
  if (!(kg >= 30 && kg <= 300)) return NextResponse.json({ error: "Weight should be between 30 and 300 kg." }, { status: 400 });

  const db = await requireDb();
  const rounded = Math.round(kg * 10) / 10;
  await db.collection("bodyweights").updateOne({ _id: body.date }, { $set: { kg: rounded, updatedAt: new Date() } }, { upsert: true });
  const latest = await db.collection("bodyweights").find({}).sort({ _id: -1 }).limit(1).next();
  if (latest?._id === body.date) {
    await db.collection("settings").updateOne({ _id: "fitness" }, { $set: { weightKg: rounded } }, { upsert: true });
  }
  return NextResponse.json({ date: body.date, kg: rounded });
}

// DELETE ?date=YYYY-MM-DD
export async function DELETE(request) {
  if (!isAdmin(request)) return unauthorised();
  const date = request.nextUrl.searchParams.get("date");
  if (!isDate(date)) return NextResponse.json({ error: "Pick a date." }, { status: 400 });
  await (await requireDb()).collection("bodyweights").deleteOne({ _id: date });
  return NextResponse.json({ ok: true });
}
