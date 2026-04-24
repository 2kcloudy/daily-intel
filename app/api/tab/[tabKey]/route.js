import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { saveTabDigest, getLatestTabDigest, getAllTabDates } from "@/lib/storage";
import { attachImagesToStories, pregenerateDigestImages } from "@/lib/imageCache";

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

  // Attach deterministic Pollinations turbo URLs to every story before saving.
  attachImagesToStories(stories);

  const digest = {
    date,
    pulse: pulse || "",
    stories,
    postedAt: new Date().toISOString(),
    ...body, // allow extra fields
    stories, // keep image-augmented stories even though body is spread after
  };

  await saveTabDigest(tabKey, date, digest);

  try {
    revalidatePath(`/${tabKey}`);
    revalidatePath(`/${tabKey}/${date}`);
  } catch {}

  pregenerateDigestImages(stories).then(r =>
    console.log(`[images] ${tabKey} ${date}: ${r.done} generated, ${r.failed} failed`)
  ).catch(() => {});

  return NextResponse.json({
    success: true,
    digest: { date, storyCount: stories.length },
    url: `${process.env.NEXT_PUBLIC_SITE_URL || ""}/${tabKey}/${date}`,
    images: "attached-inline",
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
