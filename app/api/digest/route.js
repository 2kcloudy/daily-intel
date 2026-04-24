import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { saveDigest, getLatestDigest, getAllDates } from "@/lib/storage";
import { attachImagesToStories, pregenerateDigestImages } from "@/lib/imageCache";

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

  // Best-effort Blob upload for permanent CDN copies (non-blocking).
  // Even if this fails, story.image already points to a stable Pollinations
  // URL that works forever for the same seed.
  pregenerateDigestImages(stories).then(r =>
    console.log(`[images] Finance ${date}: ${r.done} generated, ${r.failed} failed`)
  ).catch(() => {});

  return NextResponse.json({
    success: true,
    digest: { date, storyCount: stories.length },
    url: `${process.env.NEXT_PUBLIC_SITE_URL || ""}/${date}`,
    images: "attached-inline",
  });
}

// GET /api/digest — returns latest digest + list of all dates
export async function GET() {
  const [latest, dates] = await Promise.all([getLatestDigest(), getAllDates()]);
  return NextResponse.json({ latest, dates });
}
