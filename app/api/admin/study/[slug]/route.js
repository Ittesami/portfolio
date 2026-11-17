import { NextResponse } from "next/server";
import { requireDb } from "@/lib/mongodb";
import { isAdmin, unauthorised } from "@/lib/auth";
import { ensureStudyCourses, newId, parseCourseFields, parseItem, progressMap } from "@/lib/study";
import { STUDY_NOTES } from "@/lib/study/notes.generated";

export const dynamic = "force-dynamic";

const notFound = () => NextResponse.json({ error: "Course not found." }, { status: 404 });
const bad = (error) => NextResponse.json({ error }, { status: 400 });

// Items with lesson notes (content/study/<course>/<item>.md) get hasNotes, so the
// course page can link them to their reading page.
function courseToClient(c) {
  const { _id, createdAt, ...rest } = c;
  const notes = STUDY_NOTES[_id] ?? {};
  const modules = rest.modules.map((m) => ({ ...m, items: m.items.map((i) => (notes[i.id] ? { ...i, hasNotes: true } : i)) }));
  return { slug: _id, ...rest, modules };
}

// GET -> the course with its modules and items, plus your progress on each item
export async function GET(request, { params }) {
  if (!isAdmin(request)) return unauthorised();
  const slug = (await params).slug;
  const db = await requireDb();
  await ensureStudyCourses(db);
  const course = await db.collection("studyCourses").findOne({ _id: slug });
  if (!course) return notFound();
  return NextResponse.json({ course: courseToClient(course), progress: await progressMap(db, slug) });
}

// PATCH { op, ... } -> edits the course. Ops:
//   course { title?, short?, accent? } · addModule { title } · updateModule { module, title, note? }
//   deleteModule { module } · addItem { module, item } · updateItem { module, itemId, item }
//   deleteItem { module, itemId } · moveItem { module, itemId, dir: -1 | 1 }
export async function PATCH(request, { params }) {
  if (!isAdmin(request)) return unauthorised();
  const slug = (await params).slug;
  const db = await requireDb();
  const col = db.collection("studyCourses");
  const course = await col.findOne({ _id: slug });
  if (!course) return notFound();
  const body = await request.json().catch(() => ({}));
  const modules = course.modules;
  const mod = () => modules.find((m) => m.id === body.module);
  let removedItems = [];

  switch (body.op) {
    case "course": {
      const { data, error } = parseCourseFields(body, true);
      if (error) return bad(error);
      await col.updateOne({ _id: slug }, { $set: { ...data, updatedAt: new Date() } });
      break;
    }
    case "addModule": {
      const title = String(body.title ?? "").trim().slice(0, 100);
      if (!title) return bad("Give the module a name.");
      modules.push({ id: newId("mod"), title, items: [] });
      break;
    }
    case "updateModule": {
      const m = mod();
      if (!m) return bad("That module doesn't exist.");
      const title = String(body.title ?? "").trim().slice(0, 100);
      if (!title) return bad("Give the module a name.");
      m.title = title;
      if ("note" in body) m.note = String(body.note ?? "").trim().slice(0, 300);
      break;
    }
    case "deleteModule": {
      const i = modules.findIndex((m) => m.id === body.module);
      if (i < 0) return bad("That module doesn't exist.");
      removedItems = modules[i].items.map((it) => it.id);
      modules.splice(i, 1);
      break;
    }
    case "addItem": {
      const m = mod();
      if (!m) return bad("That module doesn't exist.");
      const { data, error } = parseItem(body.item);
      if (error) return bad(error);
      m.items.push({ id: newId("item"), ...data });
      break;
    }
    case "updateItem": {
      const m = mod();
      const it = m?.items.find((x) => x.id === body.itemId);
      if (!it) return bad("That item doesn't exist.");
      if (it.type === "practice") {
        // Built-in quizzes keep their type and questions; only the title changes.
        const title = String(body.item?.title ?? "").trim().slice(0, 200);
        if (!title) return bad("Give the item a title.");
        it.title = title;
        break;
      }
      const { data, error } = parseItem(body.item);
      if (error) return bad(error);
      for (const k of ["link", "difficulty", "detail"]) delete it[k];
      Object.assign(it, data);
      break;
    }
    case "deleteItem": {
      const m = mod();
      const i = m?.items.findIndex((x) => x.id === body.itemId) ?? -1;
      if (i < 0) return bad("That item doesn't exist.");
      removedItems = [m.items[i].id];
      m.items.splice(i, 1);
      break;
    }
    case "moveItem": {
      const m = mod();
      const i = m?.items.findIndex((x) => x.id === body.itemId) ?? -1;
      const j = i + (body.dir === -1 ? -1 : 1);
      if (i < 0) return bad("That item doesn't exist.");
      if (j >= 0 && j < m.items.length) [m.items[i], m.items[j]] = [m.items[j], m.items[i]];
      break;
    }
    default:
      return bad("Unknown change.");
  }

  if (body.op !== "course") await col.updateOne({ _id: slug }, { $set: { modules, updatedAt: new Date() } });
  if (removedItems.length) {
    await db.collection("studyProgress").deleteMany({ course: slug, item: { $in: removedItems } });
  }
  const updated = await col.findOne({ _id: slug });
  return NextResponse.json({ course: courseToClient(updated) });
}

// DELETE -> removes the course and all its progress and quiz attempts
export async function DELETE(request, { params }) {
  if (!isAdmin(request)) return unauthorised();
  const slug = (await params).slug;
  const db = await requireDb();
  const { deletedCount } = await db.collection("studyCourses").deleteOne({ _id: slug });
  if (!deletedCount) return notFound();
  await Promise.all([db.collection("studyProgress").deleteMany({ course: slug }), db.collection("quizAttempts").deleteMany({ course: slug })]);
  return NextResponse.json({ ok: true });
}
