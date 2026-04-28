import { NextResponse } from "next/server";
import { saveDigest, getLatestDigest, getAllDates } from "@/lib/storage";
import { pregenerateDigestImages } from "@/lib/imageCache";

// POST /api/digest — Claude posts a new digest here
export async function POST(request) {
  // Check API key
  const apiKey = request.headers.get("x-api-key");
  if (apiKey !== process.env.DIGEST_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { date, marketPulse, stories, watchList } = body;

  if (!date || !stories || !Array.isArray(stories)) {
    return NextResponse.json(
      { error: "Required fields: date (YYYY-MM-DD), stories (array)" },
      { status: 400 }
    );
  }

  const digest = {
    date,
    marketPulse: marketPulse || "",
    stories,
    watchList: watchList || [],
    postedAt: new Date().toISOString(),
  };

  await saveDigest(date, digest);

  // Pre-generate images in the background (non-blocking)
  // waitUntil isn't available in all environments, so we fire-and-forget
  pregenerateDigestImages(stories).then(r =>
    console.log(`[images] Finance ${date}: ${r.done} generated, ${r.failed} failed`)
  ).catch(() => {});

  return NextResponse.json({
    success: true,
    digest: { date, storyCount: stories.length },
    url: `${process.env.NEXT_PUBLIC_SITE_URL || ""}/${date}`,
    images: "generating in background",
  });
}

// GET /api/digest — returns latest digest + list of all dates
export async function GET() {
  const [latest, dates] = await Promise.all([getLatestDigest(), getAllDates()]);
  return NextResponse.json({ latest, dates });
}
