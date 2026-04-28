import { NextResponse } from "next/server";
import { saveTabDigest, getLatestTabDigest, getAllTabDates } from "@/lib/storage";
import { pregenerateDigestImages } from "@/lib/imageCache";

const VALID_TABS = ["tech", "geopolitics", "energy", "real-estate", "startups", "crypto", "science", "longevity", "policy", "performance"];

export async function POST(request, { params }) {
  const { tabKey } = params;
  if (!VALID_TABS.includes(tabKey)) {
    return NextResponse.json({ error: "Unknown tab" }, { status: 404 });
  }

  const apiKey = request.headers.get("x-api-key");
  if (apiKey !== process.env.DIGEST_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const { date, pulse, stories } = body;
  if (!date || !stories || !Array.isArray(stories)) {
    return NextResponse.json(
      { error: "Required: date (YYYY-MM-DD), stories (array)" },
      { status: 400 }
    );
  }

  const digest = {
    date,
    pulse: pulse || "",
    stories,
    postedAt: new Date().toISOString(),
    ...body, // allow extra fields
  };

  await saveTabDigest(tabKey, date, digest);

  pregenerateDigestImages(stories).then(r =>
    console.log(`[images] ${tabKey} ${date}: ${r.done} generated, ${r.failed} failed`)
  ).catch(() => {});

  return NextResponse.json({
    success: true,
    digest: { date, storyCount: stories.length },
    url: `${process.env.NEXT_PUBLIC_SITE_URL || ""}/${tabKey}/${date}`,
    images: "generating in background",
  });
}

export async function GET(request, { params }) {
  const { tabKey } = params;
  if (!VALID_TABS.includes(tabKey)) {
    return NextResponse.json({ error: "Unknown tab" }, { status: 404 });
  }
  const [latest, dates] = await Promise.all([
    getLatestTabDigest(tabKey),
    getAllTabDates(tabKey),
  ]);
  return NextResponse.json({ latest, dates });
}
