import { NextResponse } from "next/server";
import { getDb, isDbConfigured } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isDbConfigured()) return NextResponse.json({ status: "ok", database: "not-configured" });
  try {
    const db = await getDb();
    await db.command({ ping: 1 });
    return NextResponse.json({ status: "ok", database: "connected" });
  } catch (err) {
    console.error("[health] database ping failed:", err.message);
    return NextResponse.json({ status: "degraded", database: "error" }, { status: 503 });
  }
}
