import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireDb } from "@/lib/mongodb";
import { isAdmin, unauthorised } from "@/lib/auth";
import { getAlbums, parseAlbum, uniqueAlbumSlug } from "@/lib/travel";
import { COUNTRIES } from "@/lib/world";

export const dynamic = "force-dynamic";

// GET -> { albums, countries } (countries for the picker)
export async function GET(request) {
  if (!isAdmin(request)) return unauthorised();
  return NextResponse.json({ albums: await getAlbums(), countries: COUNTRIES });
}

// POST { title, countryCode, place?, startDate?, endDate?, description? }
export async function POST(request) {
  if (!isAdmin(request)) return unauthorised();
  const { data, error } = parseAlbum(await request.json().catch(() => ({})));
  if (error) return NextResponse.json({ error }, { status: 400 });

  const db = await requireDb();
  const slug = await uniqueAlbumSlug(db, data.title);
  await db.collection("albums").insertOne({ _id: slug, ...data, coverPhotoId: null, createdAt: new Date() });
  revalidatePath("/travel", "layout");
  revalidatePath("/");
  return NextResponse.json({ slug }, { status: 201 });
}
