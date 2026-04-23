import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { getCachedImageUrl, generateAndCacheImage, storyImageSeed } from "@/lib/imageCache";

const ALL_TABS = [
  "finance", "health", "tech", "geopolitics", "energy",
  "real-estate", "startups", "crypto", "science", "longevity", "policy", "performance",
];

const TAB_KV_KEYS = {
  finance:       { dates: "digest:dates",             getDigest: (d) => `digest:${d}` },
  health:        { dates: "health-digest:dates",      getDigest: (d) => `health-digest:${d}` },
  tech:          { dates: "tech-digest:dates",        getDigest: (d) => `tech-digest:${d}` },
  geopolitics:   { dates: "geopolitics-digest:dates", getDigest: (d) => `geopolitics-digest:${d}` },
  energy:        { dates: "energy-digest:dates",      getDigest: (d) => `energy-digest:${d}` },
  "real-estate": { dates: "real-estate-digest:dates", getDigest: (d) => `real-estate-digest:${d}` },
  startups:      { dates: "startups-digest:dates",    getDigest: (d) => `startups-digest:${d}` },
  crypto:        { dates: "crypto-digest:dates",      getDigest: (d) => `crypto-digest:${d}` },
  science:       { dates: "science-digest:dates",     getDigest: (d) => `science-digest:${d}` },
  longevity:     { dates: "longevity-digest:dates",   getDigest: (d) => `longevity-digest:${d}` },
  policy:        { dates: "policy-digest:dates",      getDigest: (d) => `policy-digest:${d}` },
  performance:   { dates: "performance-digest:dates", getDigest: (d) => `performance-digest:${d}` },
};

const IMAGE_SIZES = [[900, 700], [300, 300], [1600, 800]];

/**
 * POST /api/admin/backfill-images
 *
 * Generates and caches images for all archive stories.
 * Fully idempotent — already-cached images are skipped instantly.
 *
 * Query params:
 *   tab=finance     — process a single tab (default: all)
 *   check=true      — dry-run count only, no generation
 *   limit=12        — max IMAGES to generate per call (default: 12)
 */
export async function POST(request) {
  const apiKey = request.headers.get("x-api-key");
  if (apiKey !== process.env.DIGEST_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const targetTab  = searchParams.get("tab") || null;
  const checkOnly  = searchParams.get("check") === "true";
  const imgLimit   = Math.min(parseInt(searchParams.get("limit") || "12", 10), 60);

  const tabs = targetTab ? [targetTab] : ALL_TABS;
  const results = {};
  let totalCached = 0, totalPending = 0, totalGenerated = 0, totalFailed = 0;
  let imagesGenerated = 0;
  const startMs = Date.now();

  outer:
  for (const tab of tabs) {
    const cfg = TAB_KV_KEYS[tab];
    if (!cfg) continue;

    let dates = [];
    try {
      dates = await kv.zrange(cfg.dates, 0, -1, { rev: true });
      if (!dates?.length) { results[tab] = { dates: 0, cached: 0, pending: 0 }; continue; }
    } catch (e) {
      results[tab] = { error: e.message }; continue;
    }

    let tabCached = 0, tabPending = 0, tabGenerated = 0, tabFailed = 0;

    for (const date of dates) {
      let digest;
      try {
        const raw = await kv.get(cfg.getDigest(date));
        digest = typeof raw === "string" ? JSON.parse(raw) : raw;
      } catch { continue; }
      if (!digest?.stories?.length) continue;

      for (const story of digest.stories) {
        if (Date.now() - startMs > 25000) break outer; // hard safety cutoff

        const headline = story.headline || "";
        const tag      = story.topic || story.tag || "markets";
        const seed     = storyImageSeed(headline, story.rank || 0);

        for (const [w, h] of IMAGE_SIZES) {
          // Check KV cache
          const cached = await getCachedImageUrl(seed, w, h).catch(() => null);
          if (cached) {
            tabCached++; totalCached++;
            continue;
          }

          tabPending++; totalPending++;
          if (checkOnly) continue;
          if (imagesGenerated >= imgLimit) break outer;

          // Generate + cache via the proven pipeline
          try {
            const url = await generateAndCacheImage(seed, headline, tag, w, h);
            if (url) {
              tabGenerated++; totalGenerated++; imagesGenerated++;
            } else {
              tabFailed++; totalFailed++;
            }
          } catch {
            tabFailed++; totalFailed++;
          }
        }
      }
    }

    results[tab] = {
      dates:     dates.length,
      cached:    tabCached,
      pending:   tabPending,
      generated: tabGenerated,
      failed:    tabFailed,
    };
  }

  return NextResponse.json({
    mode:    checkOnly ? "check" : "generate",
    summary: {
      cached:    totalCached,
      pending:   totalPending,
      generated: totalGenerated,
      failed:    totalFailed,
      elapsedMs: Date.now() - startMs,
    },
    tabs: results,
    note: imagesGenerated >= imgLimit
      ? `Limit of ${imgLimit} images reached. Call again — cached images are skipped instantly.`
      : "Done for this pass.",
  });
}

export async function GET(request) {
  const apiKey = request.headers.get("x-api-key");
  if (apiKey !== process.env.DIGEST_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // Forward to check mode
  const url = new URL(request.url);
  url.searchParams.set("check", "true");
  const fakeReq = new Request(url.toString(), { method: "POST", headers: request.headers });
  return POST(fakeReq);
}
