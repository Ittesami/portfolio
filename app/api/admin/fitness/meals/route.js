import { NextResponse } from "next/server";
import { requireDb } from "@/lib/mongodb";
import { isAdmin, unauthorised } from "@/lib/auth";
import { isDate, mealToClient, parseMeal } from "@/lib/daily-logs";

export const dynamic = "force-dynamic";

// GET ?date=YYYY-MM-DD -> that day's meals, by time
// GET ?from=YYYY-MM-DD&to=YYYY-MM-DD -> every meal in that range (for the analytics)
export async function GET(request) {
  if (!isAdmin(request)) return unauthorised();
  const q = request.nextUrl.searchParams;
  const date = q.get("date");
  let filter;
  if (date !== null) {
    if (!isDate(date)) return NextResponse.json({ error: "date must be YYYY-MM-DD." }, { status: 400 });
    filter = { date };
  } else {
    const from = q.get("from") ?? "";
    const to = q.get("to") ?? "";
    if (!isDate(from) || !isDate(to) || from > to) return NextResponse.json({ error: "Give date, or from and to (YYYY-MM-DD)." }, { status: 400 });
    filter = { date: { $gte: from, $lte: to } };
  }
  const docs = await (await requireDb()).collection("meals").find(filter).sort({ date: 1, time: 1, createdAt: 1 }).limit(2000).toArray();
  return NextResponse.json({ meals: docs.map(mealToClient) });
}

// POST { date, time, text, kcal?, protein? }
export async function POST(request) {
  if (!isAdmin(request)) return unauthorised();
  const { data, error } = parseMeal(await request.json().catch(() => ({})));
  if (error) return NextResponse.json({ error }, { status: 400 });
  const doc = { ...data, createdAt: new Date() };
  const { insertedId } = await (await requireDb()).collection("meals").insertOne(doc);
  return NextResponse.json({ meal: mealToClient({ _id: insertedId, ...doc }) }, { status: 201 });
}
