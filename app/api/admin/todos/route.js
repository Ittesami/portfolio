import { NextResponse } from "next/server";
import { requireDb } from "@/lib/mongodb";
import { isAdmin, unauthorised } from "@/lib/auth";
import { parseTodo, sortTodos, toClient } from "@/lib/todos";

export const dynamic = "force-dynamic";

export async function GET(request) {
  if (!isAdmin(request)) return unauthorised();
  const docs = await (await requireDb()).collection("todos").find({}).toArray();
  return NextResponse.json({ todos: sortTodos(docs).map(toClient) });
}

export async function POST(request) {
  if (!isAdmin(request)) return unauthorised();
  const body = await request.json().catch(() => ({}));
  const { data, error } = parseTodo(body);
  if (error) return NextResponse.json({ error }, { status: 400 });

  const doc = { ...data, done: false, doneAt: null, createdAt: new Date() };
  const { insertedId } = await (await requireDb()).collection("todos").insertOne(doc);
  return NextResponse.json({ todo: toClient({ _id: insertedId, ...doc }) }, { status: 201 });
}
