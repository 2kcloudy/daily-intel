import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import {
  getCachedImageUrl,
  cachePollinationsUrl,
  generateAndCacheImage,
  storyImageSeed,
} from "@/lib/imageCache";

// Blob mode downloads from Pollinations and uploads to Vercel Blob — slow,
// so give the function room.
export const maxDuration = 60;

const ALL_TABS = [
  "finance", "health", "tech", "geopolitics", "energy",
  "real-estate", "startups", "crypto", "science", "longevity", "policy", "performance",
];

function isBlobUrl(url) {
  return typeof url === "string" && url.includes("blob.vercel-storage.com");
}

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

// Default backfill keeps it cheap: only the primary 900×700 size that the
// homepage actually renders. Older sizes regenerate lazily via /api/image.
const IMAGE_SIZES = [[900, 700]];
const MAX_MS_URL  = 25000; // KV-write only mode
const MAX_MS_BLOB = 55000; // Pollinations + Blob upload

/**
 * POST /api/admin/backfill-images
 *
 * Modes:
 *   ?mode=blob (default for missing-image fixes) — runs the full
 *     Pollinations → Blob → KV pipeline so every entry resolves to a
 *     permanent CDN URL. Slow per image (~3-5s each) but rate-limit immune.
 *     Also UPGRADES entries that currently point at a raw Pollinations URL.
 *   ?mode=url  — legacy fast path: writes a Pollinations URL to KV with no
 *     download/upload. Suffers from Pollinations rate limits.
 *
 * Other query params:
 *   tab=finance     — single tab only (default: all 12)
 *   check=true      — count only, no generation
 *   limit=32        — max images to (re)generate this call
 *   force=1         — rewrite existing entries even if non-flux
 */
export async function POST(request) {
  const apiKey = request.headers.get("x-api-key");
  if (apiKey !== process.env.DIGEST_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const targetTab  = searchParams.get("tab") || null;
  const checkOnly  = searchParams.get("check") === "true";
  const requestedMode = (searchParams.get("mode") || "blob").toLowerCase();
  const mode       = requestedMode === "url" ? "url" : "blob";
  const concurrent = mode === "blob" ? 4 : 20;
  const maxMs      = mode === "blob" ? MAX_MS_BLOB : MAX_MS_URL;
  const imgLimit   = Math.min(parseInt(searchParams.get("limit") || (mode === "blob" ? "16" : "200"), 10), 969);
  const force      = searchParams.get("force") === "1";

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
          // Blob mode: a non-Blob entry counts as pending so we upgrade it
          // even on first run (no force flag needed).
          if (mode === "blob") {
            if (cached && isBlobUrl(cached) && !force) { totalCached++; continue; }
          } else {
            if (cached && !force) { totalCached++; continue; }
            if (cached && force && !cached.includes("model=flux")) { totalCached++; continue; }
          }
          pending.push({ seed, headline, tag, w, h });
        }
      }
    }
  }

  if (checkOnly) {
    return NextResponse.json({
      mode: "check",
      runMode: mode,
      summary: { cached: totalCached, pending: pending.length },
    });
  }

  // ── Generate in concurrent batches ─────────────────────────────────────────
  const toProcess = pending.slice(0, imgLimit);
  let generated = 0, failed = 0;

  for (let i = 0; i < toProcess.length; i += concurrent) {
    if (Date.now() - startMs > maxMs) break;

    const batch = toProcess.slice(i, i + concurrent);
    const results = await Promise.allSettled(
      batch.map(({ seed, headline, tag, w, h }) =>
        mode === "blob"
          // force=true so we re-download + upload to Blob even if the KV
          // entry already holds a Pollinations URL.
          ? generateAndCacheImage(seed, headline, tag, w, h, true)
          : cachePollinationsUrl(seed, headline, tag, w, h)
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
    runMode: mode,
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
