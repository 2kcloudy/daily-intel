import { NextResponse } from "next/server";
import { getTabDigest } from "@/lib/storage";

const VALID_TABS = ["tech", "geopolitics", "energy", "real-estate", "startups", "crypto", "science", "longevity", "policy", "performance"];

export async function GET(request, { params }) {
  const { tabKey, date } = params;
  if (!VALID_TABS.includes(tabKey)) {
    return NextResponse.json({ error: "Unknown tab" }, { status: 404 });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
  }
  const digest = await getTabDigest(tabKey, date);
  if (!digest) {
    return NextResponse.json({ error: "Digest not found" }, { status: 404 });
  }
  return NextResponse.json(digest);
}
