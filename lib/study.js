import { BUILT_IN_COURSES } from "./study/courses";
import { AWS_CLF_QUESTIONS, AWS_CLF_TIPS } from "./study/aws-clf-questions";

// Study tracker: courses, what you've done in each, and in-app practice quizzes.
//   studyCourses  { _id: slug, title, short, accent, order, builtIn, modules: [{ id, title, note?, items: [...] }] }
//                 Item: { id, title, type, link?, difficulty?, detail?, quiz? } (see lib/study/courses.js)
//   studyProgress { _id: "course:item", course, item, status: "doing" | "done", note, score, best,
//                   attempts, updatedAt, doneAt }   (no document = not started)
//   quizAttempts  { course, item, at, total, correct, wrong: [questionId] }

export const ITEM_TYPES = ["lesson", "problem", "project", "task", "practice", "exam"];
export const STATUSES = ["todo", "doing", "done"];
export const ACCENTS = ["blue", "amber", "violet", "green", "rose"];
const DIFFICULTIES = ["Easy", "Medium", "Hard"];
// A practice quiz counts as done once you score this much (the exam guidance: 80%+).
export const QUIZ_PASS = 80;

const QUESTION_BANKS = { "aws-clf": { questions: AWS_CLF_QUESTIONS, tips: AWS_CLF_TIPS } };

// Adds the built-in courses the first time; never overwrites your edits.
export async function ensureStudyCourses(db) {
  const col = db.collection("studyCourses");
  if ((await col.countDocuments({ builtIn: true })) >= BUILT_IN_COURSES.length) return;
  await col.bulkWrite(
    BUILT_IN_COURSES.map((c) => ({
      updateOne: { filter: { _id: c._id }, update: { $setOnInsert: { ...c, builtIn: true, createdAt: new Date() } }, upsert: true },
    })),
  );
}

export async function listCourses(db) {
  await ensureStudyCourses(db);
  return db.collection("studyCourses").find({}).sort({ order: 1, createdAt: 1 }).toArray();
}

export const allItems = (course) => course.modules.flatMap((m) => m.items.map((i) => ({ ...i, module: m.id })));

// { [itemId]: progress } for one course, or for all when course is null.
export async function progressMap(db, course = null) {
  const docs = await db.collection("studyProgress").find(course ? { course } : {}).toArray();
  const map = {};
  for (const d of docs) {
    map[d.course] ??= {};
    map[d.course][d.item] = progressToClient(d);
  }
  return course ? map[course] ?? {} : map;
}

export function progressToClient(d) {
  return {
    status: d.status,
    note: d.note ?? "",
    score: d.score ?? null,
    best: d.best ?? null,
    attempts: d.attempts ?? 0,
    doneAt: d.doneAt ? new Date(d.doneAt).toISOString() : null,
    updatedAt: d.updatedAt ? new Date(d.updatedAt).toISOString() : null,
  };
}

// Totals for a course card: items done, in progress, and the first one not done yet.
export function courseSummary(course, progress = {}) {
  const items = allItems(course);
  const done = items.filter((i) => progress[i.id]?.status === "done").length;
  const doing = items.filter((i) => progress[i.id]?.status === "doing").length;
  const next = items.find((i) => progress[i.id]?.status === "doing") ?? items.find((i) => progress[i.id]?.status !== "done");
  const byType = {};
  for (const i of items) {
    byType[i.type] ??= { total: 0, done: 0 };
    byType[i.type].total++;
    if (progress[i.id]?.status === "done") byType[i.type].done++;
  }
  return { total: items.length, done, doing, byType, next: next ? { id: next.id, title: next.title, type: next.type } : null };
}

// ---------------------------------------------------------------- validation

const clean = (v, max) => String(v ?? "").trim().slice(0, max);

export function slugify(title) {
  return (
    clean(title, 80)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 48) || "course"
  );
}

export const newId = (prefix) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export function parseCourseFields(body, partial = false) {
  const data = {};
  if (!partial || "title" in body) {
    data.title = clean(body.title, 80);
    if (!data.title) return { error: "Give the course a name." };
  }
  if (!partial || "short" in body) data.short = clean(body.short, 200);
  if (!partial || "accent" in body) data.accent = ACCENTS.includes(body.accent) ? body.accent : "green";
  return { data };
}

export function parseItem(body) {
  const title = clean(body?.title, 200);
  if (!title) return { error: "Give the item a title." };
  const type = ITEM_TYPES.includes(body?.type) ? body.type : "lesson";
  if (type === "practice") return { error: "Practice quizzes come built in; add a lesson, problem, project, task or exam." };
  const link = clean(body?.link, 500);
  if (link && !/^https?:\/\/\S+$/i.test(link)) return { error: "The link must start with http:// or https://." };
  const difficulty = DIFFICULTIES.includes(body?.difficulty) ? body.difficulty : "";
  const detail = clean(body?.detail, 500);
  const item = { title, type };
  if (link) item.link = link;
  if (difficulty && type === "problem") item.difficulty = difficulty;
  if (detail) item.detail = detail;
  return { data: item };
}

// ---------------------------------------------------------------- quizzes

export function quizQuestions(quiz) {
  const bank = QUESTION_BANKS[quiz?.bank];
  if (!bank) return null;
  if (quiz.module) return bank.questions.filter((q) => q.module === quiz.module);
  const pool = [...bank.questions];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, quiz.random ?? 20);
}

// What the browser gets: no answers.
export const publicQuestion = ({ id, module, stem, options, answer }) => ({ id, module, stem, options, pick: answer.length });

// answers: { [questionId]: ["A", ...] }. Only ids from this quiz's bank are marked.
export function gradeQuiz(quiz, answers) {
  const bank = QUESTION_BANKS[quiz?.bank];
  if (!bank) return null;
  const byId = new Map(bank.questions.map((q) => [q.id, q]));
  const ids = Object.keys(answers ?? {}).filter((id) => byId.has(id) && (!quiz.module || byId.get(id).module === quiz.module));
  const results = ids.map((id) => {
    const q = byId.get(id);
    const chosen = [...new Set((Array.isArray(answers[id]) ? answers[id] : []).map(String))].sort();
    const correct = chosen.length === q.answer.length && q.answer.every((a) => chosen.includes(a));
    return { id, correct, chosen, answer: q.answer };
  });
  const right = results.filter((r) => r.correct).length;
  const modules = [...new Set(results.filter((r) => !r.correct).map((r) => byId.get(r.id).module))].sort((a, b) => a - b);
  return {
    total: results.length,
    correct: right,
    score: results.length ? Math.round((right / results.length) * 100) : 0,
    results,
    tips: modules.map((m) => ({ module: m, tip: bank.tips[m] })).filter((t) => t.tip),
  };
}
