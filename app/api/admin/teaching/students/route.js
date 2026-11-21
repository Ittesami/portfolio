import { NextResponse } from "next/server";
import { requireDb } from "@/lib/mongodb";
import { isAdmin, unauthorised } from "@/lib/auth";
import { parseStudent, studentToClient } from "@/lib/teaching";

// POST { name, level?, notes? }
export async function POST(request) {
  if (!isAdmin(request)) return unauthorised();
  const { data, error } = parseStudent(await request.json().catch(() => ({})));
  if (error) return NextResponse.json({ error }, { status: 400 });
  const doc = { ...data, createdAt: new Date() };
  const { insertedId } = await (await requireDb()).collection("teachStudents").insertOne(doc);
  return NextResponse.json({ student: studentToClient({ _id: insertedId, ...doc }) }, { status: 201 });
}
