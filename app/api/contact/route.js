import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  // Honeypot: real visitors never fill the hidden "company" field.
  if (body?.company) return NextResponse.json({ ok: true }, { status: 201 });

  const name = String(body?.name ?? "").trim();
  const email = String(body?.email ?? "").trim();
  const message = String(body?.message ?? "").trim();

  if (!name || name.length > 100) return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  if (!EMAIL.test(email) || email.length > 200)
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  if (message.length < 10 || message.length > 5000)
    return NextResponse.json({ error: "Message should be between 10 and 5000 characters." }, { status: 400 });

  let db;
  try {
    db = await getDb();
  } catch (err) {
    console.error("[contact] database connection failed:", err.message);
    return NextResponse.json({ error: "Couldn't save your message. Please email me instead." }, { status: 500 });
  }

  if (!db) {
    return NextResponse.json(
      { error: "The contact form isn't connected yet. Please email me directly." },
      { status: 503 },
    );
  }

  try {
    await db.collection("messages").insertOne({
      name,
      email,
      message,
      createdAt: new Date(),
      userAgent: request.headers.get("user-agent") ?? null,
    });
  } catch (err) {
    console.error("[contact] insert failed:", err.message);
    return NextResponse.json({ error: "Couldn't save your message. Please email me instead." }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
