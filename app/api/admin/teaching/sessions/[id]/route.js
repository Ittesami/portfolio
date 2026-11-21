import { NextResponse } from "next/server";
import { requireDb } from "@/lib/mongodb";
import { isAdmin, unauthorised } from "@/lib/auth";
import { parseId, parseRegularId } from "@/lib/teaching";

// DELETE -> an extra class is removed; a regular class is reset to "scheduled" (what you
// recorded is cleared, along with any make-up class). Make-up classes go away by changing
// the original class's status.
export async function DELETE(request, { params }) {
  if (!isAdmin(request)) return unauthorised();
  const id = decodeURIComponent((await params).id);
  const col = (await requireDb()).collection("teachSessions");

  if (parseRegularId(id)) {
    const rec = await col.findOne({ _id: id });
    if (rec?.makeupId) await col.deleteOne({ _id: rec.makeupId });
    await col.deleteOne({ _id: id });
    return NextResponse.json({ ok: true });
  }
  const _id = parseId(id);
  const rec = _id && (await col.findOne({ _id }));
  if (!rec) return NextResponse.json({ error: "Session not found." }, { status: 404 });
  if (rec.kind === "makeup") {
    return NextResponse.json({ error: "This is a make-up class. Change the original class's status instead." }, { status: 400 });
  }
  await col.deleteOne({ _id });
  return NextResponse.json({ ok: true });
}
