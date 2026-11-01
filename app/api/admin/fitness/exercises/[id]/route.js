import { NextResponse } from "next/server";
import { requireDb } from "@/lib/mongodb";
import { isAdmin, unauthorised } from "@/lib/auth";
import { fetchVideoInfo, parseYouTubeId } from "@/lib/youtube";

// PATCH { videoUrl }: sets the exercise's form-tutorial video from any YouTube
// link (videos, Shorts, youtu.be). An empty value removes it, which leaves the
// YouTube search links.
export async function PATCH(request, { params }) {
  if (!isAdmin(request)) return unauthorised();
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  if (!("videoUrl" in body)) return NextResponse.json({ error: "Nothing to change." }, { status: 400 });

  const db = await requireDb();
  const exercise = await db.collection("exercises").findOne({ _id: id });
  if (!exercise) return NextResponse.json({ error: "Exercise not found." }, { status: 404 });

  if (!String(body.videoUrl ?? "").trim()) {
    await db.collection("exercises").updateOne({ _id: id }, { $set: { video: null } });
    return NextResponse.json({ video: null });
  }

  const videoId = parseYouTubeId(body.videoUrl);
  if (!videoId) return NextResponse.json({ error: "Paste a YouTube link (a video or a Short)." }, { status: 400 });
  let video;
  try {
    video = await fetchVideoInfo(videoId);
  } catch {
    return NextResponse.json({ error: "Couldn't reach YouTube to check the video. Try again." }, { status: 502 });
  }
  if (!video)
    return NextResponse.json(
      { error: "That video doesn't exist or its owner doesn't allow it to play on other sites. Try another." },
      { status: 400 },
    );

  await db.collection("exercises").updateOne({ _id: id }, { $set: { video } });
  return NextResponse.json({ video });
}

// DELETE: removes a custom exercise you added. Built-in ones stay, and so do
// past workouts that used it (they keep their own copy of the name).
export async function DELETE(request, { params }) {
  if (!isAdmin(request)) return unauthorised();
  const { id } = await params;
  const db = await requireDb();
  const doc = await db.collection("exercises").findOne({ _id: id });
  if (!doc) return NextResponse.json({ error: "Exercise not found." }, { status: 404 });
  if (!doc.custom) return NextResponse.json({ error: "Built-in exercises can't be deleted." }, { status: 400 });
  await db.collection("exercises").deleteOne({ _id: id });
  return NextResponse.json({ ok: true });
}
