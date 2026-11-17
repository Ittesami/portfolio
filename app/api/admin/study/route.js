import { NextResponse } from "next/server";
import { requireDb } from "@/lib/mongodb";
import { isAdmin, unauthorised } from "@/lib/auth";
import { allItems, courseSummary, listCourses, parseCourseFields, progressMap, slugify } from "@/lib/study";

export const dynamic = "force-dynamic";

// GET -> every course with its totals, plus what you finished in the last 60 days
export async function GET(request) {
  if (!isAdmin(request)) return unauthorised();
  const db = await requireDb();
  const [courses, progress] = await Promise.all([listCourses(db), progressMap(db)]);

  const titles = {};
  for (const c of courses) for (const i of allItems(c)) titles[`${c._id}:${i.id}`] = i.title;
  const since = Date.now() - 60 * 24 * 3600 * 1000;
  const recent = [];
  for (const [course, items] of Object.entries(progress)) {
    for (const [item, p] of Object.entries(items)) {
      if (p.status === "done" && p.doneAt && Date.parse(p.doneAt) >= since && titles[`${course}:${item}`]) {
        recent.push({ course, item, title: titles[`${course}:${item}`], doneAt: p.doneAt });
      }
    }
  }
  recent.sort((a, b) => b.doneAt.localeCompare(a.doneAt));

  return NextResponse.json({
    courses: courses.map((c) => ({
      slug: c._id,
      title: c.title,
      short: c.short ?? "",
      accent: c.accent ?? "blue",
      builtIn: Boolean(c.builtIn),
      modules: c.modules.length,
      ...courseSummary(c, progress[c._id]),
    })),
    recent,
  });
}

// POST { title, short?, accent? } -> a new, empty course with one module
export async function POST(request) {
  if (!isAdmin(request)) return unauthorised();
  const { data, error } = parseCourseFields(await request.json().catch(() => ({})));
  if (error) return NextResponse.json({ error }, { status: 400 });
  const db = await requireDb();
  const col = db.collection("studyCourses");
  let slug = slugify(data.title);
  for (let n = 2; await col.findOne({ _id: slug }, { projection: { _id: 1 } }); n++) slug = `${slugify(data.title)}-${n}`;
  const last = await col.find({}).sort({ order: -1 }).limit(1).toArray();
  const doc = { _id: slug, ...data, order: (last[0]?.order ?? 0) + 1, builtIn: false, modules: [{ id: "module-1", title: "Getting started", items: [] }], createdAt: new Date() };
  await col.insertOne(doc);
  return NextResponse.json({ slug }, { status: 201 });
}
