import { NextResponse } from "next/server";
import { requireDb } from "@/lib/mongodb";
import { isAdmin, unauthorised } from "@/lib/auth";
import { addDays, isDate } from "@/lib/fitness";
import { buildExport, exportToMarkdown } from "@/lib/fitness-export";

export const dynamic = "force-dynamic";

// GET ?to=YYYY-MM-DD&days=14&format=md|json&ask=1&notes=...
// Your workouts, food, sleep, body weight and plan for the last `days` days up to `to`,
// as a download. Markdown starts with a request for a new plan, ready to paste into an AI chat.
export async function GET(request) {
  if (!isAdmin(request)) return unauthorised();
  const q = request.nextUrl.searchParams;
  const to = q.get("to") ?? "";
  const days = Number(q.get("days") ?? 14);
  const format = q.get("format") === "json" ? "json" : "md";
  if (!isDate(to)) return NextResponse.json({ error: "to must be YYYY-MM-DD." }, { status: 400 });
  if (!Number.isInteger(days) || days < 1 || days > 120) return NextResponse.json({ error: "days must be 1 to 120." }, { status: 400 });

  const from = addDays(to, -(days - 1));
  const data = await buildExport(await requireDb(), { from, to });
  const name = `fitness-${from}-to-${to}.${format}`;
  const body =
    format === "json"
      ? JSON.stringify(data, null, 2)
      : exportToMarkdown(data, { ask: q.get("ask") !== "0", notes: (q.get("notes") ?? "").slice(0, 500) });
  return new NextResponse(body, {
    headers: {
      "Content-Type": format === "json" ? "application/json; charset=utf-8" : "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${name}"`,
      "Cache-Control": "no-store",
    },
  });
}
