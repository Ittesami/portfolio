import { NextResponse } from "next/server";
import { requireDb } from "@/lib/mongodb";
import { isAdmin, unauthorised } from "@/lib/auth";
import { classToClient, parseClass, unknownStudents } from "@/lib/teaching";

// POST { title?, subject?, studentIds, slots: [{ weekday, time, minutes }], startDate, endDate, notes? }
export async function POST(request) {
  if (!isAdmin(request)) return unauthorised();
  const { data, error } = parseClass(await request.json().catch(() => ({})));
  if (error) return NextResponse.json({ error }, { status: 400 });
  const db = await requireDb();
  if (await unknownStudents(db, data.studentIds)) return NextResponse.json({ error: "Unknown student." }, { status: 400 });
  const doc = { ...data, createdAt: new Date() };
  const { insertedId } = await db.collection("teachClasses").insertOne(doc);
  return NextResponse.json({ class: classToClient({ _id: insertedId, ...doc }) }, { status: 201 });
}
