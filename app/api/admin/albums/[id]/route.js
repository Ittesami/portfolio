import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireDb } from "@/lib/mongodb";
import { isAdmin, unauthorised } from "@/lib/auth";
import { parseAlbum } from "@/lib/travel";

function refresh() {
  revalidatePath("/travel", "layout");
  revalidatePath("/photos");
  revalidatePath("/");
}

// PATCH { title?, countryCode?, place?, startDate?, endDate?, description?, coverPhotoId? }
export async function PATCH(request, { params }) {
  if (!isAdmin(request)) return unauthorised();
  const { id } = await params;
  const { data, error } = parseAlbum(await request.json().catch(() => ({})), true);
  if (error) return NextResponse.json({ error }, { status: 400 });

  const db = await requireDb();
  const current = await db.collection("albums").findOne({ _id: id });
  if (!current) return NextResponse.json({ error: "Album not found." }, { status: 404 });
  const start = data.startDate ?? current.startDate;
  const end = data.endDate ?? current.endDate;
  if (start && end && end < start) return NextResponse.json({ error: "The trip can't end before it starts." }, { status: 400 });
  if (data.coverPhotoId) {
    const photo = await db.collection("photos").findOne({ _id: data.coverPhotoId, albumId: id });
    if (!photo) return NextResponse.json({ error: "The cover must be a photo in this album." }, { status: 400 });
  }

  await db.collection("albums").updateOne({ _id: id }, { $set: { ...data, updatedAt: new Date() } });
  refresh();
  return NextResponse.json({ ok: true });
}

// DELETE: removes the album. Its photos are kept and move back to the main
// Photos list (they can then be deleted or put in another album).
export async function DELETE(request, { params }) {
  if (!isAdmin(request)) return unauthorised();
  const { id } = await params;
  const db = await requireDb();
  const { deletedCount } = await db.collection("albums").deleteOne({ _id: id });
  if (!deletedCount) return NextResponse.json({ error: "Album not found." }, { status: 404 });
  await db.collection("photos").updateMany({ albumId: id }, { $set: { albumId: null } });
  refresh();
  return NextResponse.json({ ok: true });
}
