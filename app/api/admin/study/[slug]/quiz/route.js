import { NextResponse } from "next/server";
import { requireDb } from "@/lib/mongodb";
import { isAdmin, unauthorised } from "@/lib/auth";
import { QUIZ_PASS, allItems, gradeQuiz, progressToClient, publicQuestion, quizQuestions } from "@/lib/study";

export const dynamic = "force-dynamic";

async function practiceItem(db, slug, itemId) {
  const course = await db.collection("studyCourses").findOne({ _id: slug });
  const item = course && allItems(course).find((i) => i.id === itemId);
  return item?.type === "practice" && item.quiz ? item : null;
}

// GET ?item=... -> the questions for a practice item, without answers, plus your last attempts
export async function GET(request, { params }) {
  if (!isAdmin(request)) return unauthorised();
  const slug = (await params).slug;
  const itemId = request.nextUrl.searchParams.get("item") ?? "";
  const db = await requireDb();
  const item = await practiceItem(db, slug, itemId);
  if (!item) return NextResponse.json({ error: "That practice quiz wasn't found." }, { status: 404 });
  const attempts = await db.collection("quizAttempts").find({ course: slug, item: itemId }).sort({ at: -1 }).limit(5).toArray();
  return NextResponse.json({
    questions: quizQuestions(item.quiz).map(publicQuestion),
    pass: QUIZ_PASS,
    attempts: attempts.map((a) => ({ at: a.at.toISOString(), total: a.total, correct: a.correct })),
  });
}

// POST { item, answers: { [questionId]: ["A", ...] } } -> marked results; saves the attempt
// and updates the item's score (done once your best reaches the pass mark)
export async function POST(request, { params }) {
  if (!isAdmin(request)) return unauthorised();
  const slug = (await params).slug;
  const body = await request.json().catch(() => ({}));
  const db = await requireDb();
  const item = await practiceItem(db, slug, body.item);
  if (!item) return NextResponse.json({ error: "That practice quiz wasn't found." }, { status: 404 });
  const graded = gradeQuiz(item.quiz, body.answers);
  if (!graded?.total) return NextResponse.json({ error: "Answer at least one question." }, { status: 400 });

  const at = new Date();
  await db.collection("quizAttempts").insertOne({
    course: slug,
    item: item.id,
    at,
    total: graded.total,
    correct: graded.correct,
    wrong: graded.results.filter((r) => !r.correct).map((r) => r.id),
  });

  const col = db.collection("studyProgress");
  const _id = `${slug}:${item.id}`;
  const current = (await col.findOne({ _id })) ?? {};
  const best = Math.max(current.best ?? 0, graded.score);
  const status = best >= QUIZ_PASS ? "done" : "doing";
  const next = {
    ...current,
    course: slug,
    item: item.id,
    status,
    score: graded.score,
    best,
    attempts: (current.attempts ?? 0) + 1,
    doneAt: status === "done" ? current.doneAt ?? at : null,
    updatedAt: at,
  };
  const { _id: _ignored, ...fields } = next;
  await col.updateOne({ _id }, { $set: fields }, { upsert: true });

  return NextResponse.json({ ...graded, pass: QUIZ_PASS, progress: progressToClient(next) });
}
