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
const CONCURRENT = 4;   // parallel image generations
const MAX_MS = 240000;  // 4-minute wall-clock limit (Pro: 300s timeout)

/**
 * POST /api/admin/backfill-images
 * Generates all missing story images across all 12 tabs.
 * Concurrent generation (4 at once), idempotent, safe to call repeatedly.
 *
 * Query params:
 *   tab=finance     — single tab only
 *   check=true      — count only, no generation
 *   limit=32        — max images to generate this call (default 32 = ~2 min)
 */
export async function POST(request) {
  const apiKey = request.headers.get("x-api-key");
  if (apiKey !== process.env.DIGEST_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const targetTab  = searchParams.get("tab") || null;
  const checkOnly  = searchParams.get("check") === "true";
  const imgLimit   = Math.min(parseInt(searchParams.get("limit") || "32", 10), 120);

  const tabs     = targetTab ? [targetTab] : ALL_TABS;
  const startMs  = Date.now();

  // ── Collect all pending jobs ───────────────────────────────────────────────
  const pending = [];   // { seed, headline, tag, w, h }
  let totalCached = 0;

  for (const tab of tabs) {
    const cfg = TAB_KV_KEYS[tab];
    if (!cfg) continue;

    let dates = [];
    try {
      dates = await kv.zrange(cfg.dates, 0, -1, { rev: true });
      if (!dates?.length) continue;
    } catch { continue; }

    for (const date of dates) {
      let digest;
      try {
        const raw = await kv.get(cfg.getDigest(date));
        digest = typeof raw === "string" ? JSON.parse(raw) : raw;
      } catch { continue; }
      if (!digest?.stories?.length) continue;

      for (const story of digest.stories) {
        const headline = story.headline || "";
        const tag      = story.topic || story.tag || "markets";
        const seed     = storyImageSeed(headline, story.rank || 0);

        for (const [w, h] of IMAGE_SIZES) {
          const cached = await getCachedImageUrl(seed, w, h).catch(() => null);
          if (cached) { totalCached++; continue; }
          pending.push({ seed, headline, tag, w, h });
        }
      }
    }
  }

  if (checkOnly) {
    return NextResponse.json({
      mode: "check",
      summary: { cached: totalCached, pending: pending.length },
      tabs: tabs.reduce((a, t) => ({ ...a, [t]: "see summary" }), {}),
    });
  }

  // ── Generate in concurrent batches ─────────────────────────────────────────
  const toProcess = pending.slice(0, imgLimit);
  let generated = 0, failed = 0;

  for (let i = 0; i < toProcess.length; i += CONCURRENT) {
    if (Date.now() - startMs > MAX_MS) break;

    const batch = toProcess.slice(i, i + CONCURRENT);
    const results = await Promise.allSettled(
      batch.map(({ seed, headline, tag, w, h }) =>
        generateAndCacheImage(seed, headline, tag, w, h)
      )
    );

    for (const r of results) {
      if (r.status === "fulfilled" && r.value) generated++;
      else failed++;
    }
  }

  const remaining = pending.length - toProcess.length;

  return NextResponse.json({
    mode:    "generate",
    summary: {
      cachedBefore: totalCached,
      pendingFound: pending.length,
      generated,
      failed,
      remaining,
      elapsedMs: Date.now() - startMs,
    },
    note: remaining > 0
      ? `${remaining} images still pending — call again to continue.`
      : "All images cached!",
  });
}

export async function GET(request) {
  const apiKey = request.headers.get("x-api-key");
  if (apiKey !== process.env.DIGEST_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = new URL(request.url);
  url.searchParams.set("check", "true");
  return POST(new Request(url.toString(), { method: "POST", headers: request.headers }));
}
