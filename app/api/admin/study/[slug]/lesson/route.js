import { NextResponse } from "next/server";
import { requireDb } from "@/lib/mongodb";
import { isAdmin, unauthorised } from "@/lib/auth";
import { allItems, ensureStudyCourses, progressMap } from "@/lib/study";
import { STUDY_NOTES } from "@/lib/study/notes.generated";

export const dynamic = "force-dynamic";

// GET ?item=... -> one item's lesson notes, your progress on it, the rest of its module
// (so you can go straight to the problems) and the previous/next lessons that have notes.
export async function GET(request, { params }) {
  if (!isAdmin(request)) return unauthorised();
  const slug = (await params).slug;
  const itemId = request.nextUrl.searchParams.get("item") ?? "";
  const db = await requireDb();
  await ensureStudyCourses(db);
  const course = await db.collection("studyCourses").findOne({ _id: slug });
  if (!course) return NextResponse.json({ error: "Course not found." }, { status: 404 });
  const mod = course.modules.find((m) => m.items.some((i) => i.id === itemId));
  if (!mod) return NextResponse.json({ error: "That lesson isn't in this course." }, { status: 404 });
  const item = mod.items.find((i) => i.id === itemId);

  const notes = STUDY_NOTES[slug] ?? {};
  const progress = await progressMap(db, slug);
  const withNotes = allItems(course).filter((i) => notes[i.id]);
  const at = withNotes.findIndex((i) => i.id === itemId);
  const brief = (i) => (i ? { id: i.id, title: i.title } : null);

  return NextResponse.json({
    course: { slug, title: course.title, accent: course.accent ?? "blue" },
    module: {
      id: mod.id,
      title: mod.title,
      items: mod.items.map((i) => ({ ...i, hasNotes: Boolean(notes[i.id]), status: progress[i.id]?.status ?? "todo" })),
    },
    item,
    content: notes[itemId] ?? null,
    progress: progress[itemId] ?? null,
    prev: at > 0 ? brief(withNotes[at - 1]) : null,
    next: at >= 0 ? brief(withNotes[at + 1]) : null,
    position: at >= 0 ? { n: at + 1, of: withNotes.length } : null,
  });
}
