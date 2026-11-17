import { NextResponse } from "next/server";
import { requireDb } from "@/lib/mongodb";
import { isAdmin, unauthorised } from "@/lib/auth";
import { STATUSES, allItems, progressToClient } from "@/lib/study";

// PUT { item, status?: "todo" | "doing" | "done", note?, score? (0-100, for exams) }
// "todo" with no note or score clears the item.
export async function PUT(request, { params }) {
  if (!isAdmin(request)) return unauthorised();
  const slug = (await params).slug;
  const db = await requireDb();
  const course = await db.collection("studyCourses").findOne({ _id: slug });
  if (!course) return NextResponse.json({ error: "Course not found." }, { status: 404 });
  const body = await request.json().catch(() => ({}));
  const item = allItems(course).find((i) => i.id === body.item);
  if (!item) return NextResponse.json({ error: "That item isn't in this course." }, { status: 400 });

  const _id = `${slug}:${item.id}`;
  const col = db.collection("studyProgress");
  const current = (await col.findOne({ _id })) ?? { status: "todo" };
  const next = { ...current };

  if ("status" in body) {
    if (!STATUSES.includes(body.status)) return NextResponse.json({ error: "Status must be todo, doing or done." }, { status: 400 });
    next.status = body.status;
  }
  if ("note" in body) next.note = String(body.note ?? "").trim().slice(0, 2000);
  if ("score" in body) {
    if (body.score === null || body.score === "") next.score = null;
    else {
      const s = Number(body.score);
      if (!Number.isFinite(s) || s < 0 || s > 100) return NextResponse.json({ error: "Score should be 0 to 100 (%)." }, { status: 400 });
      next.score = Math.round(s);
      next.best = Math.max(next.best ?? 0, next.score);
      // Recording an exam score means you took it.
      if (!("status" in body)) next.status = "done";
    }
  }
  if (next.status === "done" && current.status !== "done") next.doneAt = new Date();
  if (next.status !== "done") next.doneAt = null;

  if (next.status === "todo" && !next.note && next.score == null && !next.attempts) {
    await col.deleteOne({ _id });
    return NextResponse.json({ progress: null });
  }
  const { _id: _ignored, ...fields } = next;
  await col.updateOne({ _id }, { $set: { ...fields, course: slug, item: item.id, updatedAt: new Date() } }, { upsert: true });
  return NextResponse.json({ progress: progressToClient({ ...next, updatedAt: new Date() }) });
}
