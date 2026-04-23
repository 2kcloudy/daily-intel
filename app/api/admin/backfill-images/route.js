import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { pregenerateDigestImages, storyImageSeed, getCachedImageUrl } from "@/lib/imageCache";

const ALL_TABS = [
  "finance", "health", "tech", "geopolitics", "energy",
  "real-estate", "startups", "crypto", "science", "longevity", "policy", "performance",
];

const TAB_KV_KEYS = {
  finance:      { dates: "digest:dates",                getDigest: (d) => `digest:${d}` },
  health:       { dates: "health-digest:dates",         getDigest: (d) => `health-digest:${d}` },
  tech:         { dates: "tech-digest:dates",           getDigest: (d) => `tech-digest:${d}` },
  geopolitics:  { dates: "geopolitics-digest:dates",    getDigest: (d) => `geopolitics-digest:${d}` },
  energy:       { dates: "energy-digest:dates",         getDigest: (d) => `energy-digest:${d}` },
  "real-estate":{ dates: "real-estate-digest:dates",    getDigest: (d) => `real-estate-digest:${d}` },
  startups:     { dates: "startups-digest:dates",       getDigest: (d) => `startups-digest:${d}` },
  crypto:       { dates: "crypto-digest:dates",         getDigest: (d) => `crypto-digest:${d}` },
  science:      { dates: "science-digest:dates",        getDigest: (d) => `science-digest:${d}` },
  longevity:    { dates: "longevity-digest:dates",      getDigest: (d) => `longevity-digest:${d}` },
  policy:       { dates: "policy-digest:dates",         getDigest: (d) => `policy-digest:${d}` },
  performance:  { dates: "performance-digest:dates",    getDigest: (d) => `performance-digest:${d}` },
};

const IMAGE_SIZES = [[900, 700], [300, 300], [1600, 800]];

/**
 * POST /api/admin/backfill-images
 * Headers: x-api-key: di-k9x4m2p7n8q1r5s3t6v0w
 *
 * Query params:
 *   tab=finance          (optional — backfill a single tab; default: all tabs)
 *   check=true           (optional — dry run: just count pending images, don't generate)
 *   limit=20             (optional — max stories to process per call; default: 50)
 *
 * This endpoint is designed to be called repeatedly (idempotent).
 * Already-cached images are skipped instantly.
 */
export async function POST(request) {
  const apiKey = request.headers.get("x-api-key");
  if (apiKey !== process.env.DIGEST_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const targetTab = searchParams.get("tab") || null;  // null = all tabs
  const checkOnly = searchParams.get("check") === "true";
  const limit     = Math.min(parseInt(searchParams.get("limit") || "50", 10), 200);

  const tabs = targetTab ? [targetTab] : ALL_TABS;
  const results = {};
  let totalStories = 0, totalImages = 0, skipped = 0, processed = 0, failed = 0;

  for (const tab of tabs) {
    const cfg = TAB_KV_KEYS[tab];
    if (!cfg) continue;

    let dates = [];
    try {
      dates = await kv.zrange(cfg.dates, 0, -1, { rev: true });
      if (!dates || !dates.length) { results[tab] = { dates: 0 }; continue; }
    } catch (e) {
      results[tab] = { error: e.message }; continue;
    }

    let tabStories = 0, tabSkipped = 0, tabProcessed = 0, tabFailed = 0;

    for (const date of dates) {
      if (processed >= limit) break;

      let digest;
      try {
        const raw = await kv.get(cfg.getDigest(date));
        digest = typeof raw === "string" ? JSON.parse(raw) : raw;
      } catch { continue; }

      if (!digest?.stories?.length) continue;

      for (const story of digest.stories) {
        if (processed >= limit) break;
        tabStories++;
        totalStories++;

        const headline = story.headline || "";
        const tag = story.topic || story.tag || "markets";
        const seed = storyImageSeed(headline, story.rank || 0);

        // Check if all sizes are already cached
        const checks = await Promise.all(
          IMAGE_SIZES.map(([w, h]) => getCachedImageUrl(seed, w, h))
        );
        const allCached = checks.every(Boolean);

        if (allCached) {
          tabSkipped++; skipped++;
          continue;
        }

        totalImages += IMAGE_SIZES.length - checks.filter(Boolean).length;

        if (checkOnly) continue;

        // Generate missing sizes
        for (let i = 0; i < IMAGE_SIZES.length; i++) {
          if (checks[i]) continue;
          const [w, h] = IMAGE_SIZES[i];
          const { generateAndCacheImage } = await import("@/lib/imageCache");
          try {
            await generateAndCacheImage(seed, headline, tag, w, h);
            tabProcessed++; processed++;
          } catch {
            tabFailed++; failed++;
          }
        }
      }
    }

    results[tab] = {
      dates: dates.length,
      stories: tabStories,
      skipped: tabSkipped,
      processed: tabProcessed,
      failed: tabFailed,
    };
  }

  return NextResponse.json({
    mode: checkOnly ? "check" : "generate",
    summary: { totalStories, totalImages, skipped, processed, failed },
    tabs: results,
    note: processed >= limit
      ? `Hit limit of ${limit}. Call again to continue — already-cached images are skipped.`
      : "Done.",
  });
}

/**
 * GET /api/admin/backfill-images
 * Returns current image cache stats.
 */
export async function GET(request) {
  const apiKey = request.headers.get("x-api-key");
  if (apiKey !== process.env.DIGEST_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Count cached image keys
  let cachedCount = 0;
  try {
    // KV scan isn't available on all plans, so we use a prefix scan
    let cursor = 0;
    do {
      const [nextCursor, keys] = await kv.scan(cursor, { match: "img:*", count: 100 });
      cachedCount += keys.length;
      cursor = nextCursor;
    } while (cursor !== 0);
  } catch (e) {
    return NextResponse.json({ cachedImages: "unknown", error: e.message });
  }

  return NextResponse.json({ cachedImages: cachedCount });
}
