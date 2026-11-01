import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireDb } from "@/lib/mongodb";
import { isAdmin, unauthorised } from "@/lib/auth";
import { getAllPhotos, photoBucket } from "@/lib/photos";
import { parsePhotoDetails } from "@/lib/photo-details";

export const dynamic = "force-dynamic";

const TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];
// Vercel caps request bodies at 4.5 MB; the admin page shrinks photos before upload.
const MAX_BYTES = 4 * 1024 * 1024;

export async function GET(request) {
  if (!isAdmin(request)) return unauthorised();
  return NextResponse.json({ photos: await getAllPhotos() });
}

// POST multipart/form-data: file, plus optional title, date, description.
export async function POST(request) {
  if (!isAdmin(request)) return unauthorised();
  let form;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Upload a photo file." }, { status: 400 });
  }
  const file = form.get("file");
  if (!file || typeof file === "string") return NextResponse.json({ error: "Upload a photo file." }, { status: 400 });
  if (!TYPES.includes(file.type))
    return NextResponse.json({ error: "Use a JPG, PNG, WebP, AVIF or GIF image." }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "That photo is over 4 MB." }, { status: 413 });

  const { data, error } = parsePhotoDetails(Object.fromEntries(form), true);
  if (error) return NextResponse.json({ error }, { status: 400 });

  const db = await requireDb();
  const buffer = Buffer.from(await file.arrayBuffer());
  const stream = photoBucket(db).openUploadStream(file.name || "photo", { metadata: { contentType: file.type } });
  await new Promise((resolve, reject) => {
    stream.on("finish", resolve).on("error", reject);
    stream.end(buffer);
  });

  const doc = {
    _id: `u_${stream.id}`,
    kind: "upload",
    fileId: stream.id,
    mime: file.type,
    size: buffer.length,
    originalName: file.name || "",
    title: data.title ?? "",
    date: data.date ?? "",
    description: data.description ?? "",
    hidden: false,
    createdAt: new Date(),
  };
  await db.collection("photos").insertOne(doc);

  revalidatePath("/");
  revalidatePath("/photos");
  return NextResponse.json({ ok: true, id: doc._id }, { status: 201 });
}
