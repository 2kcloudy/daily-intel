import { NextResponse } from "next/server";
import { getDigest } from "@/lib/storage";

// GET /api/digest/2026-04-17
export async function GET(request, { params }) {
  const { date } = params;
  const digest = await getDigest(date);
  if (!digest) {
    return NextResponse.json({ error: "Digest not found" }, { status: 404 });
  }
  return NextResponse.json(digest);
}
