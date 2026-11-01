import { timingSafeEqual } from "node:crypto";

// Write endpoints require `Authorization: Bearer <ADMIN_TOKEN>`.
// With no ADMIN_TOKEN set, writes are refused entirely.
export function isAdmin(request) {
  const expected = process.env.ADMIN_TOKEN ?? "";
  if (expected.length < 16) return false;
  const header = request.headers.get("authorization") ?? "";
  const given = header.startsWith("Bearer ") ? header.slice(7) : "";
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
