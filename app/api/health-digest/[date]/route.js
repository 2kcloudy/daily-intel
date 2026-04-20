import { NextResponse } from "next/server";
import { getHealthDigest } from "@/lib/storage";

/**
 * GET /api/health-digest/[date]
 * Returns a specific health digest by date.
 */
export async function GET(request, { params }) {
  const { date } = params;

  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Invalid date format. Use YYYY-MM-DD." }, { status: 400 });
  }

  const digest = await getHealthDigest(date);
  if (!digest) {
    return NextResponse.json({ error: "Digest not found for this date." }, { status: 404 });
  }

  return NextResponse.json({ digest });
}
