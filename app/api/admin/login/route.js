import { NextResponse } from "next/server";
import { checkPassword, createSessionValue, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/auth";

// Slows down password guessing: 5 wrong tries locks that address for 10 minutes.
// In-memory, so it resets on redeploy; good enough for a single-user admin.
const attempts = new Map();
const LIMIT = 5;
const LOCK_MS = 10 * 60 * 1000;

export async function POST(request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const entry = attempts.get(ip);
  if (entry?.lockedUntil > Date.now()) {
    return NextResponse.json({ error: "Too many attempts. Try again in a few minutes." }, { status: 429 });
  }

  let password = "";
  try {
    password = String((await request.json())?.password ?? "");
  } catch {}

  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "ADMIN_PASSWORD isn't set on the server." }, { status: 503 });
  }

  if (!checkPassword(password)) {
    const count = (entry?.count ?? 0) + 1;
    attempts.set(ip, count >= LIMIT ? { count: 0, lockedUntil: Date.now() + LOCK_MS } : { count });
    await new Promise((r) => setTimeout(r, 600));
    return NextResponse.json({ error: "Wrong password." }, { status: 401 });
  }

  attempts.delete(ip);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, createSessionValue(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}
