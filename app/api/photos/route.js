import { NextResponse } from "next/server";
import { getPhotos } from "@/lib/photos";

export const dynamic = "force-dynamic";

// GET /api/photos -> { avatar, photos: [{ id, src, title, date, description, alt }] }
// Public, visible photos only. Editing lives under /api/admin/photos.
export async function GET() {
  return NextResponse.json(await getPhotos());
}
