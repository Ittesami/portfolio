import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { requireDb } from "@/lib/mongodb";
import { isAdmin, unauthorised } from "@/lib/auth";
import { buildSessions, parseExtra, parseId, parseRegularId, parseSessionUpdate, weekdayOf } from "@/lib/teaching";

// The session as the client sees it, after a change.
async function sessionOut(db, id) {
  const reg = parseRegularId(id);
  if (reg) {
    const cls = await db.collection("teachClasses").findOne({ _id: parseId(reg.classId) });
    const recs = await db.collection("teachSessions").find({ date: reg.date }).toArray();
    return buildSessions([cls], recs, reg.date, reg.date).find((s) => s.id === id) ?? null;
  }
  const rec = await db.collection("teachSessions").findOne({ _id: parseId(id) });
  const cls = rec && (await db.collection("teachClasses").findOne({ _id: parseId(rec.classId) }));
  return cls ? buildSessions([cls], [rec], rec.date, rec.date).find((s) => s.id === id) ?? null : null;
}

// POST { classId, date, time, minutes, topic? } -> an extra one-off class
export async function POST(request) {
  if (!isAdmin(request)) return unauthorised();
  const { data, error } = parseExtra(await request.json().catch(() => ({})));
  if (error) return NextResponse.json({ error }, { status: 400 });
  const db = await requireDb();
  if (!(await db.collection("teachClasses").findOne({ _id: parseId(data.classId) }))) {
    return NextResponse.json({ error: "Class not found." }, { status: 404 });
  }
  const _id = new ObjectId();
  await db.collection("teachSessions").insertOne({ _id, kind: "extra", status: "scheduled", notes: "", ...data, createdAt: new Date() });
  return NextResponse.json({ session: await sessionOut(db, String(_id)) }, { status: 201 });
}

// PUT { id, status?, topic?, notes?, rescheduleTo?: { date, time } } -> records what happened.
// Rescheduling creates (or moves) a make-up class at the new time; changing the status
// away from "rescheduled" removes that make-up class.
export async function PUT(request) {
  if (!isAdmin(request)) return unauthorised();
  const body = await request.json().catch(() => ({}));
  const id = String(body?.id ?? "");
  const { data, error } = parseSessionUpdate(body);
  if (error) return NextResponse.json({ error }, { status: 400 });
  const db = await requireDb();
  const col = db.collection("teachSessions");

  // Find the session: a regular one must match its class's timetable; others must exist.
  const reg = parseRegularId(id);
  let current;
  let minutes;
  if (reg) {
    const cls = await db.collection("teachClasses").findOne({ _id: parseId(reg.classId) });
    const slot = cls?.slots.find((s) => s.weekday === weekdayOf(reg.date) && s.time === reg.time);
    if (!slot || reg.date < cls.startDate || reg.date > cls.endDate) return NextResponse.json({ error: "That class isn't on the timetable." }, { status: 404 });
    current = (await col.findOne({ _id: id })) ?? { _id: id, kind: "regular", classId: reg.classId, date: reg.date, time: reg.time };
    minutes = slot.minutes;
  } else {
    current = parseId(id) && (await col.findOne({ _id: parseId(id) }));
    if (!current) return NextResponse.json({ error: "Session not found." }, { status: 404 });
    minutes = current.minutes;
  }
  if (data.status === "rescheduled" && current.kind === "makeup") {
    return NextResponse.json({ error: "Move this make-up class by rescheduling the original one." }, { status: 400 });
  }

  const set = { ...data, updatedAt: new Date() };
  const unset = {};
  if (data.status === "rescheduled") {
    const to = data.rescheduledTo;
    if (current.makeupId) {
      await col.updateOne({ _id: current.makeupId }, { $set: { date: to.date, time: to.time } });
    } else {
      const makeupId = new ObjectId();
      await col.insertOne({ _id: makeupId, kind: "makeup", classId: current.classId, date: to.date, time: to.time, minutes, fromId: current._id, status: "scheduled", topic: "", notes: "", createdAt: new Date() });
      set.makeupId = makeupId;
    }
  } else if (data.status && current.makeupId) {
    await col.deleteOne({ _id: current.makeupId });
    unset.makeupId = "";
    unset.rescheduledTo = "";
  }

  const { _id, ...base } = current;
  for (const k of Object.keys(unset)) delete base[k]; // a field can't be set and unset at once
  await col.updateOne(
    { _id: current._id },
    { $set: { ...base, ...set }, ...(Object.keys(unset).length ? { $unset: unset } : {}) },
    { upsert: true },
  );
  return NextResponse.json({ session: await sessionOut(db, id) });
}
