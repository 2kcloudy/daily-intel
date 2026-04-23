import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { generateAndCacheImage, getCachedImageUrl, storyImageSeed, buildPrompt } from "@/lib/imageCache";

/**
 * GET /api/cron/backfill-images
 *
 * Called every 5 minutes by Vercel Cron until all images are cached.
 * Processes one tab per run (round-robin) so no single run exceeds ~25s.
 * Automatically stops scheduling itself once all images are done.
 *
 * Auth: Vercel provides CRON_SECRET in the Authorization header.
 */

const ALL_TABS = [
  "finance", "health", "tech", "geopolitics", "energy",
  "real-estate", "startups", "crypto", "science", "longevity", "policy", "performance",
];

const TAB_KV_KEYS = {
  finance:      { dates: "digest:dates",             getKey: (d) => `digest:${d}` },
  health:       { dates: "health-digest:dates",      getKey: (d) => `health-digest:${d}` },
  tech:         { dates: "tech-digest:dates",        getKey: (d) => `tech-digest:${d}` },
  geopolitics:  { dates: "geopolitics-digest:dates", getKey: (d) => `geopolitics-digest:${d}` },
  energy:       { dates: "energy-digest:dates",      getKey: (d) => `energy-digest:${d}` },
  "real-estate":{ dates: "real-estate-digest:dates", getKey: (d) => `real-estate-digest:${d}` },
  startups:     { dates: "startups-digest:dates",    getKey: (d) => `startups-digest:${d}` },
  crypto:       { dates: "crypto-digest:dates",      getKey: (d) => `crypto-digest:${d}` },
  science:      { dates: "science-digest:dates",     getKey: (d) => `science-digest:${d}` },
  longevity:    { dates: "longevity-digest:dates",   getKey: (d) => `longevity-digest:${d}` },
  policy:       { dates: "policy-digest:dates",      getKey: (d) => `policy-digest:${d}` },
  performance:  { dates: "performance-digest:dates", getKey: (d) => `performance-digest:${d}` },
};

const IMAGE_SIZES = [[900, 700], [300, 300], [1600, 800]];
const CRON_TAB_POINTER = "cron:backfill:tab-idx";  // KV key storing which tab to process next
const CRON_DONE_KEY    = "cron:backfill:complete";  // KV key set to 1 when all done
const IMAGES_PER_RUN   = 12; // images per cron run (~24s at ~2s/image)

export async function GET(request) {
  // Vercel Cron sends Authorization: Bearer {CRON_SECRET}
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Already done?
  const done = await kv.get(CRON_DONE_KEY);
  if (done) {
    return NextResponse.json({ status: "already-complete" });
  }

  // Which tab are we on?
  const tabIdx = parseInt((await kv.get(CRON_TAB_POINTER)) || "0", 10);
  const tab    = ALL_TABS[tabIdx % ALL_TABS.length];
  const cfg    = TAB_KV_KEYS[tab];

  let generated = 0, skipped = 0, failed = 0;
  const startMs = Date.now();

  try {
    const dates = await kv.zrange(cfg.dates, 0, -1, { rev: true });
    if (dates && dates.length) {
      outer:
      for (const date of dates) {
        const raw = await kv.get(cfg.getKey(date));
        const digest = typeof raw === "string" ? JSON.parse(raw) : raw;
        if (!digest?.stories?.length) continue;

        for (const story of digest.stories) {
          if (generated >= IMAGES_PER_RUN) break outer;
          if (Date.now() - startMs > 22000) break outer; // safety: stay under 25s

          const headline = story.headline || "";
          const tag = story.topic || story.tag || "markets";
          const seed = storyImageSeed(headline, story.rank || 0);

          for (const [w, h] of IMAGE_SIZES) {
            if (generated >= IMAGES_PER_RUN) break;

            const cached = await getCachedImageUrl(seed, w, h);
            if (cached) { skipped++; continue; }

            const url = await generateAndCacheImage(seed, headline, tag, w, h);
            if (url) generated++;
            else failed++;
          }
        }
      }
    }
  } catch (err) {
    console.error("[cron/backfill-images] error:", err.message);
  }

  // Advance the tab pointer
  const nextIdx = (tabIdx + 1) % ALL_TABS.length;
  await kv.set(CRON_TAB_POINTER, String(nextIdx));

  // Check if everything is now done (all tabs × all dates × all sizes cached)
  if (generated === 0 && skipped > 0) {
    // This tab is fully cached; check if ALL tabs are done
    try {
      let allDone = true;
      for (const t of ALL_TABS) {
        const c = TAB_KV_KEYS[t];
        const ds = await kv.zrange(c.dates, 0, -1);
        for (const d of (ds || [])) {
          const raw = await kv.get(c.getKey(d));
          const dig = typeof raw === "string" ? JSON.parse(raw) : raw;
          for (const s of (dig?.stories || [])) {
            const seed = storyImageSeed(s.headline || "", s.rank || 0);
            const checks = await Promise.all(IMAGE_SIZES.map(([w,h]) => getCachedImageUrl(seed, w, h)));
            if (!checks.every(Boolean)) { allDone = false; break; }
          }
          if (!allDone) break;
        }
        if (!allDone) break;
      }
      if (allDone) {
        await kv.set(CRON_DONE_KEY, "1");
        console.log("[cron/backfill-images] ✓ ALL IMAGES CACHED — cron will self-disable");
      }
    } catch {}
  }

  return NextResponse.json({
    tab,
    generated,
    skipped,
    failed,
    nextTab: ALL_TABS[nextIdx],
    elapsedMs: Date.now() - startMs,
  });
}
