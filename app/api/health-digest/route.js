import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { saveHealthDigest, getLatestHealthDigest, getAllHealthDates } from "@/lib/storage";
import { attachImagesToStories, pregenerateDigestImages } from "@/lib/imageCache";

// Allow up to 60s so the awaited image pre-warm has room to finish.
export const maxDuration = 60;

/**
 * POST /api/health-digest
 * Claude posts a new health digest here.
 */
export async function POST(request) {
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

  const { date, healthPulse, stories, spotlights, brief } = body;

  if (!date || !stories || !Array.isArray(stories)) {
    return NextResponse.json(
      { error: "Required fields: date (YYYY-MM-DD), stories (array)" },
      { status: 400 }
    );
  }

  if (stories.length < 10 || stories.length > 20) {
    return NextResponse.json(
      { error: "stories array must contain 10-20 items" },
      { status: 400 }
    );
  }

  // Attach deterministic Pollinations turbo URLs to every story before saving.
  attachImagesToStories(stories);

  const digest = {
    date,
    healthPulse: healthPulse || "",
    stories,
    spotlights: spotlights || [],
    brief: brief || null,
    postedAt: new Date().toISOString(),
  };

  await saveHealthDigest(date, digest);

  try {
    revalidatePath("/health");
    revalidatePath(`/health/${date}`);
  } catch {}

  let imageStats = { done: 0, failed: 0, total: 0 };
  try {
    imageStats = await pregenerateDigestImages(stories);
    console.log(`[images] Health ${date}: ${imageStats.done}/${imageStats.total} generated, ${imageStats.failed} failed`);
  } catch (err) {
    console.log(`[images] Health ${date}: pregen failed:`, err?.message);
  }

  return NextResponse.json({
    success: true,
    digest: { date, storyCount: stories.length },
    url: `${process.env.NEXT_PUBLIC_SITE_URL || ""}/health/${date}`,
    images: imageStats,
  });
}

/**
 * GET /api/health-digest
 * Returns latest health digest + list of all dates.
 */
export async function GET() {
  const [latest, dates] = await Promise.all([
    getLatestHealthDigest(),
    getAllHealthDates(),
  ]);
  return NextResponse.json({ latest, dates });
}
