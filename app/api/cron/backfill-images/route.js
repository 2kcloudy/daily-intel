import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

/**
 * GET /api/cron/backfill-images
 * Called every 5 min by Vercel Cron until all archive images are cached.
 *
 * Strategy: delegates to the admin backfill endpoint (tab-by-tab, round-robin).
 * Simple, no heavy imports — just orchestrates which tab to process next.
 */

const ALL_TABS = [
  "finance", "health", "tech", "geopolitics", "energy",
  "real-estate", "startups", "crypto", "science", "longevity", "policy", "performance",
];
const CRON_TAB_POINTER = "cron:backfill:tab-idx";
const CRON_DONE_KEY    = "cron:backfill:complete";
const LIMIT_PER_RUN    = 12; // images per cron run

export async function GET(request) {
  // Vercel Cron auth
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Already fully cached?
  const done = await kv.get(CRON_DONE_KEY).catch(() => null);
  if (done) {
    return NextResponse.json({ status: "complete — all images cached" });
  }

  // Determine which tab to process this run
  const tabIdx = parseInt((await kv.get(CRON_TAB_POINTER).catch(() => "0")) || "0", 10);
  const tab    = ALL_TABS[tabIdx % ALL_TABS.length];
  const nextIdx = (tabIdx + 1) % ALL_TABS.length;

  // Call the admin backfill endpoint for this tab
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://daily-intel-nu.vercel.app";
  const url     = `${baseUrl}/api/admin/backfill-images?tab=${tab}&limit=${LIMIT_PER_RUN}`;

  let result = {};
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "x-api-key": process.env.DIGEST_API_KEY || "" },
      signal: AbortSignal.timeout(20000),
    });
    result = await res.json();
  } catch (err) {
    console.error("[cron/backfill] fetch error:", err.message);
  }

  // Advance the tab pointer
  await kv.set(CRON_TAB_POINTER, String(nextIdx)).catch(() => {});

  // If this tab reported nothing remaining, do a full completion check
  const proc = result?.summary?.processed ?? 0;
  const skip = result?.summary?.skipped ?? 0;
  if (proc === 0 && skip > 0 && nextIdx === 0) {
    // We just wrapped around the full tab list with nothing to do — likely complete
    await kv.set(CRON_DONE_KEY, "1").catch(() => {});
    console.log("[cron/backfill] ✓ All images cached — cron self-disabled");
  }

  return NextResponse.json({
    tab,
    nextTab:   ALL_TABS[nextIdx],
    processed: proc,
    skipped:   skip,
    failed:    result?.summary?.failed ?? 0,
    note:      result?.note,
  });
}
