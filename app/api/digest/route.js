import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { saveDigest, getLatestDigest, getAllDates } from "@/lib/storage";
import { attachImagesToStories, pregenerateDigestImages } from "@/lib/imageCache";

// Allow up to 60s so we can pre-warm every story's primary image into Blob/KV
// before responding. Without this Vercel kills the function as soon as the
// response is sent and the background pregen gets cut off, leaving the first
// reader to wait on a cold Pollinations render per card.
export const maxDuration = 60;

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

  // Attach a deterministic Pollinations turbo image URL to every story
  // BEFORE saving. The client renders story.image directly — no client-side
  // URL building, no dimension mismatch, no flux latency.
  attachImagesToStories(stories);

  const digest = {
    date,
    marketPulse: marketPulse || "",
    stories,
    watchList: watchList || [],
    postedAt: new Date().toISOString(),
  };

  await saveDigest(date, digest);

  // On-demand revalidation — update the list page and this date's page
  // immediately so readers don't wait for ISR to regenerate.
  try {
    revalidatePath("/");
    revalidatePath(`/${date}`);
  } catch {}

  // Block on Blob/KV pre-warm so every card has a permanent CDN image by the
  // time we return. We accept a slower POST (~30-50s for a 15-story digest)
  // in exchange for first-paint reliability for every reader.
  let imageStats = { done: 0, failed: 0, total: 0 };
  try {
    imageStats = await pregenerateDigestImages(stories);
    console.log(`[images] Finance ${date}: ${imageStats.done}/${imageStats.total} generated, ${imageStats.failed} failed`);
  } catch (err) {
    console.log(`[images] Finance ${date}: pregen failed:`, err?.message);
  }

  return NextResponse.json({
    success: true,
    digest: { date, storyCount: stories.length },
    url: `${process.env.NEXT_PUBLIC_SITE_URL || ""}/${date}`,
    images: imageStats,
  });
}

// GET /api/digest — returns latest digest + list of all dates
export async function GET() {
  const [latest, dates] = await Promise.all([getLatestDigest(), getAllDates()]);
  return NextResponse.json({ latest, dates });
}
