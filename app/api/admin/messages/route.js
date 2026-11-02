import { NextResponse } from "next/server";
import { requireDb } from "@/lib/mongodb";
import { isAdmin, unauthorised } from "@/lib/auth";
import { messageToClient, unreadCount } from "@/lib/messages";

export const dynamic = "force-dynamic";

// GET -> { messages (newest first, up to 200), unread }
// GET ?count=1 -> { unread } only, for the badge in the admin nav
export async function GET(request) {
  if (!isAdmin(request)) return unauthorised();
  const db = await requireDb();
  if (request.nextUrl.searchParams.get("count")) return NextResponse.json({ unread: await unreadCount(db) });
  const [docs, unread] = await Promise.all([
    db.collection("messages").find({}).sort({ createdAt: -1 }).limit(200).toArray(),
    unreadCount(db),
  ]);
  return NextResponse.json({ messages: docs.map(messageToClient), unread });
}
