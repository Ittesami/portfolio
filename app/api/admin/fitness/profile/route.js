import { NextResponse } from "next/server";
import { requireDb } from "@/lib/mongodb";
import { isAdmin, unauthorised } from "@/lib/auth";
import { parseProfile } from "@/lib/fitness";

// PUT { heightCm, weightKg, goal, experience, equipment, daysPerWeek, notes }
// What the weekly planner knows about you.
export async function PUT(request) {
  if (!isAdmin(request)) return unauthorised();
  const { data, error } = parseProfile(await request.json().catch(() => ({})));
  if (error) return NextResponse.json({ error }, { status: 400 });
  await (await requireDb()).collection("settings").updateOne({ _id: "fitness" }, { $set: data }, { upsert: true });
  return NextResponse.json({ profile: data });
}
