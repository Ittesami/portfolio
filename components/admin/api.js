"use client";

// Calls an admin API and returns its JSON. Throws an Error with the server's
// message on failure, and sends you to the login page if the session expired.
export async function api(path, { method = "GET", body, form } = {}) {
  const res = await fetch(path, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: form ?? (body ? JSON.stringify(body) : undefined),
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) {
    window.location.href = "/admin/login";
    throw new Error("Please log in again.");
  }
  if (!res.ok) throw new Error(data.error || "Something went wrong. Try again.");
  return data;
}

// Local calendar helpers. Dates are "YYYY-MM-DD" strings in your own time zone.
export function todayStr(d = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function shiftDate(date, days) {
  const d = new Date(`${date}T12:00:00`);
  d.setDate(d.getDate() + days);
  return todayStr(d);
}

export function nowHHMM() {
  return new Date().toTimeString().slice(0, 5);
}

export function prettyDate(date, opts = { weekday: "long", day: "numeric", month: "long" }) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("en-GB", opts);
}
