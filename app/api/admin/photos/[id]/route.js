import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireDb } from "@/lib/mongodb";
import { isAdmin, unauthorised } from "@/lib/auth";
import { getAllPhotos, photoBucket } from "@/lib/photos";
import { parsePhotoDetails } from "@/lib/photo-details";

function refresh() {
  revalidatePath("/");
  revalidatePath("/photos");
}

// PATCH { title?, date?, description?, hidden?, avatar? }
export async function PATCH(request, { params }) {
  if (!isAdmin(request)) return unauthorised();
  const id = decodeURIComponent((await params).id);
  const photo = (await getAllPhotos()).find((p) => p.id === id);
  if (!photo) return NextResponse.json({ error: "Photo not found." }, { status: 404 });

  const body = await request.json().catch(() => ({}));
  const { data, error } = parsePhotoDetails(body, true);
  if (error) return NextResponse.json({ error }, { status: 400 });

  const db = await requireDb();
  // Only one profile picture at a time.
  if (data.avatar) await db.collection("photos").updateMany({ avatar: true }, { $set: { avatar: false } });
  await db
    .collection("photos")
    .updateOne({ _id: id }, { $set: { ...data, updatedAt: new Date() } }, { upsert: photo.kind === "folder" });

  refresh();
  return NextResponse.json({ ok: true });
}

// DELETE: removes an uploaded photo for good. Folder photos live in the code,
// so they can only be hidden here (or deleted from public/photos).
export async function DELETE(request, { params }) {
  if (!isAdmin(request)) return unauthorised();
  const id = decodeURIComponent((await params).id);
  const db = await requireDb();
  const doc = await db.collection("photos").findOne({ _id: id });
  if (!doc || doc.kind !== "upload") {
    return NextResponse.json(
      { error: "Only uploaded photos can be deleted here. Hide this one, or remove it from public/photos." },
      { status: 400 },
    );
  }
  await photoBucket(db)
    .delete(doc.fileId)
    .catch(() => {});
  await db.collection("photos").deleteOne({ _id: id });
  refresh();
  return NextResponse.json({ ok: true });
}
