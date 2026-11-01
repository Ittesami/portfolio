import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/mongodb";
import { isAdmin } from "@/lib/admin";
import { getPhotos, listPhotoFiles } from "@/lib/photos";

export const dynamic = "force-dynamic";

// GET /api/photos -> { avatar, photos: [{ file, src, title, date, description, alt }] }
export async function GET() {
  return NextResponse.json(await getPhotos());
}

const DATE = /^\d{4}-\d{2}-\d{2}$/;

// PUT /api/photos  (Authorization: Bearer <ADMIN_TOKEN>)
// Body: { file, title?, date?: "YYYY-MM-DD" | "", description? }. Empty values clear a field.
export async function PUT(request) {
  if (!isAdmin(request)) return NextResponse.json({ error: "Not authorised." }, { status: 401 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const file = String(body?.file ?? "");
  const title = String(body?.title ?? "").trim();
  const date = String(body?.date ?? "").trim();
  const description = String(body?.description ?? "").trim();

  if (!(await listPhotoFiles()).includes(file))
    return NextResponse.json({ error: "No photo with that file name in public/photos." }, { status: 404 });
  if (title.length > 120) return NextResponse.json({ error: "Title must be 120 characters or fewer." }, { status: 400 });
  if (date && !DATE.test(date)) return NextResponse.json({ error: "Date must be YYYY-MM-DD." }, { status: 400 });
  if (description.length > 1000)
    return NextResponse.json({ error: "Description must be 1000 characters or fewer." }, { status: 400 });

  let db;
  try {
    db = await getDb();
  } catch (err) {
    console.error("[photos] database connection failed:", err.message);
  }
  if (!db) return NextResponse.json({ error: "Database isn't available." }, { status: 503 });

  await db
    .collection("photos")
    .updateOne({ _id: file }, { $set: { title, date, description, updatedAt: new Date() } }, { upsert: true });

  revalidatePath("/");
  revalidatePath("/photos");
  return NextResponse.json({ ok: true, file, title, date, description });
}
