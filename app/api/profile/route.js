import { NextResponse } from "next/server";
import { getProfile } from "@/lib/profile";

export const revalidate = 60;

export async function GET() {
  return NextResponse.json(await getProfile());
}
