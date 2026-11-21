import { NextResponse } from "next/server";
import { requireDb } from "@/lib/mongodb";
import { isAdmin, unauthorised } from "@/lib/auth";
import { buildSessions, classToClient, daysBetween, isDate, studentToClient } from "@/lib/teaching";

export const dynamic = "force-dynamic";

// GET ?from=YYYY-MM-DD&to=YYYY-MM-DD -> students, classes, and every session in that range
// (at most 400 days), worked out from the class timetables plus what you've recorded.
export async function GET(request) {
  if (!isAdmin(request)) return unauthorised();
  const q = request.nextUrl.searchParams;
  const from = q.get("from") ?? "";
  const to = q.get("to") ?? "";
  if (!isDate(from) || !isDate(to) || to < from) return NextResponse.json({ error: "from and to must be YYYY-MM-DD." }, { status: 400 });
  if (daysBetween(from, to) > 400) return NextResponse.json({ error: "Ask for 400 days or less." }, { status: 400 });

  const db = await requireDb();
  const [students, classes, records] = await Promise.all([
    db.collection("teachStudents").find({}).sort({ active: -1, name: 1 }).toArray(),
    db.collection("teachClasses").find({}).sort({ createdAt: 1 }).toArray(),
    db.collection("teachSessions").find({ date: { $gte: from, $lte: to } }).toArray(),
  ]);
  return NextResponse.json({
    students: students.map(studentToClient),
    classes: classes.map(classToClient),
    sessions: buildSessions(classes, records, from, to),
  });
}
