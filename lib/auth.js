import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

// Admin sessions: a signed cookie set after logging in with ADMIN_PASSWORD.
// API routes also accept `Authorization: Bearer <ADMIN_TOKEN>` for scripts.

export const SESSION_COOKIE = "admin_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function secret() {
  const s = process.env.SESSION_SECRET || process.env.ADMIN_TOKEN || "";
  return s.length >= 16 ? s : null;
}

function safeEqual(a, b) {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && timingSafeEqual(x, y);
}

function sign(data) {
  return createHmac("sha256", secret()).update(data).digest("base64url");
}

export function createSessionValue() {
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + SESSION_MAX_AGE * 1000 })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function isValidSession(value) {
  if (!value || !secret()) return false;
  const [payload, sig] = value.split(".");
  if (!payload || !sig || !safeEqual(sig, sign(payload))) return false;
  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString()).exp > Date.now();
  } catch {
    return false;
  }
}

export function checkPassword(given) {
  const expected = process.env.ADMIN_PASSWORD ?? "";
  return expected.length >= 8 && safeEqual(given ?? "", expected);
}

// For server components and pages.
export async function isLoggedIn() {
  const jar = await cookies();
  return isValidSession(jar.get(SESSION_COOKIE)?.value);
}

// For API routes. Cookie sessions must come from this site (blocks cross-site
// form posts); bearer tokens are for scripts and skip that check.
export function isAdmin(request) {
  const header = request.headers.get("authorization") ?? "";
  const token = process.env.ADMIN_TOKEN ?? "";
  if (header.startsWith("Bearer ") && token.length >= 16) return safeEqual(header.slice(7), token);

  if (!isValidSession(request.cookies.get(SESSION_COOKIE)?.value)) return false;
  if (request.method !== "GET") {
    const origin = request.headers.get("origin");
    if (origin && new URL(origin).host !== request.headers.get("host")) return false;
  }
  return true;
}

export function unauthorised() {
  return Response.json({ error: "Please log in again." }, { status: 401 });
}
