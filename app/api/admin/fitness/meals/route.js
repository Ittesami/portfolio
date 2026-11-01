import { NextResponse } from "next/server";
import { requireDb } from "@/lib/mongodb";
import { isAdmin, unauthorised } from "@/lib/auth";
import { isDate, mealToClient, parseMeal } from "@/lib/daily-logs";

export const dynamic = "force-dynamic";

// GET ?date=YYYY-MM-DD -> that day's meals, by time
export async function GET(request) {
  if (!isAdmin(request)) return unauthorised();
  const date = request.nextUrl.searchParams.get("date") ?? "";
  if (!isDate(date)) return NextResponse.json({ error: "date must be YYYY-MM-DD." }, { status: 400 });
  const docs = await (await requireDb()).collection("meals").find({ date }).sort({ time: 1, createdAt: 1 }).toArray();
  return NextResponse.json({ meals: docs.map(mealToClient) });
}

// POST { date, time, text }
export async function POST(request) {
  if (!isAdmin(request)) return unauthorised();
  const { data, error } = parseMeal(await request.json().catch(() => ({})));
  if (error) return NextResponse.json({ error }, { status: 400 });
  const doc = { ...data, createdAt: new Date() };
  const { insertedId } = await (await requireDb()).collection("meals").insertOne(doc);
  return NextResponse.json({ meal: mealToClient({ _id: insertedId, ...doc }) }, { status: 201 });
}
