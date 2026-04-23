/**
 * imageCache.js
 * Permanent AI image storage pipeline for Daily Intel.
 *
 * Architecture:
 *   1. Each story gets a deterministic seed from its headline.
 *   2. The Vercel Blob URL is stored in KV: img:{seed}:{w}x{h} → blobUrl
 *   3. On first request, we fetch from Pollinations, upload to Blob, index in KV.
 *   4. Every subsequent render uses the permanent CDN URL — zero Pollinations calls.
 */

import { kv } from "@vercel/kv";
import { put } from "@vercel/blob";

// ── Deterministic seed ────────────────────────────────────────────────────────
export function storyImageSeed(headline = "", rank = 0) {
  let h = 0;
  const s = headline || String(rank);
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// ── Tag → visual theme (for Pollinations prompts) ─────────────────────────────
const TAG_THEMES = {
  markets:      "financial district stock exchange candlestick chart abstract",
  ai:           "artificial intelligence neural network circuit glowing blue purple",
  tech:         "technology silicon chip circuit board futuristic",
  earnings:     "corporate office quarterly report business",
  energy:       "oil derrick solar panels wind turbines energy",
  crypto:       "bitcoin blockchain digital gold coin",
  defense:      "military drone aircraft defense technology",
  macro:        "global economy world map currency",
  policy:       "government capitol building legislation law",
  health:       "medical laboratory dna helix science green",
  world:        "globe map geopolitics diplomacy earth",
  commodities:  "commodity wheat gold crude oil",
  startups:     "startup rocket launch venture capital",
  science:      "laboratory microscope space telescope discovery",
  longevity:    "dna cells aging longevity biology",
  performance:  "athlete training performance sport fitness",
  research:     "scientific research laboratory analysis",
  exercise:     "athlete training gym fitness",
  nutrition:    "healthy food vegetables nutrition",
  sleep:        "calm dark bedroom rest sleep",
  supplements:  "vitamins supplements health capsules",
  wearables:    "smartwatch fitness tracker wearable",
  gut:          "gut microbiome biology microscope",
  mental:       "brain meditation mental health calm",
  inflammation: "immune system biology cells",
  breathing:    "lung breath meditation calm air",
  hormones:     "molecular biology science cells",
  peptides:     "molecular structure protein science",
  senolytics:   "cell biology aging research",
  "nad+":       "molecular biology energy cells",
  rapamycin:    "pharmaceutical research science",
  epigenetics:  "dna genetics molecular biology",
  fasting:      "clean minimal wellness health",
  biomarkers:   "medical test laboratory data",
  "stem cells": "biology cells research microscope",
  "gene therapy":"dna genetics laboratory",
};

export function buildPrompt(headline, tag) {
  const theme = TAG_THEMES[(tag || "").toLowerCase().replace(/[\s/+]+/g, "")]
    || "business news editorial illustration";
  const words = (headline || "").split(" ").slice(0, 6).join(" ");
  return `${words}, ${theme}, editorial photography, muted professional tones, high quality`;
}

// ── KV key ────────────────────────────────────────────────────────────────────
export function imgKvKey(seed, w, h) {
  return `img:${seed}:${w}x${h}`;
}

// ── Check cache ───────────────────────────────────────────────────────────────
export async function getCachedImageUrl(seed, w, h) {
  try {
    const url = await kv.get(imgKvKey(seed, w, h));
    return url || null;
  } catch {
    return null;
  }
}

// ── Generate, upload, cache ───────────────────────────────────────────────────
export async function generateAndCacheImage(seed, headline, tag, w = 600, h = 400) {
  const kvKey = imgKvKey(seed, w, h);

  // Already cached?
  try {
    const cached = await kv.get(kvKey);
    if (cached) return cached;
  } catch {}

  // Build Pollinations URL (flux = best quality, used for on-demand /api/image)
  const prompt = buildPrompt(headline, tag);
  const pollinationsUrl =
    `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}` +
    `?width=${w}&height=${h}&seed=${seed}&nologo=true&model=flux`;

  let finalUrl = pollinationsUrl; // default fallback

  // Try to download + upload to Blob for permanent CDN
  try {
    const res = await fetch(pollinationsUrl, { signal: AbortSignal.timeout(55000) });
    if (res.ok) {
      const imgBuffer = await res.arrayBuffer();
      const blob = await put(`di-images/${seed}-${w}x${h}.jpg`, imgBuffer, {
        access: "public", contentType: "image/jpeg",
        cacheControlMaxAge: 60 * 60 * 24 * 365,
      });
      finalUrl = blob.url;
    }
  } catch {
    // Blob upload failed — fall back to Pollinations URL (stable for same seed+prompt)
  }

  // Cache URL in KV (Blob URL or Pollinations URL as fallback)
  try { await kv.set(kvKey, finalUrl); } catch {}
  return finalUrl;
}

/**
 * Fast backfill: store Pollinations URL directly in KV — NO downloading/uploading.
 * 100x faster than generateAndCacheImage.
 * Images render via Pollinations. Blob upgrade can happen later on-demand via /api/image.
 */
export async function cachePollinationsUrl(seed, headline, tag, w = 600, h = 400) {
  const kvKey = imgKvKey(seed, w, h);
  try {
    const existing = await kv.get(kvKey);
    if (existing) return existing;
  } catch {}

  const prompt = buildPrompt(headline, tag);
  const url =
    `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}` +
    `?width=${w}&height=${h}&seed=${seed}&nologo=true&model=flux`;

  try {
    await kv.set(kvKey, url);
    return url;
  } catch { return null; }
}

// ── Pre-generate images for an entire digest ──────────────────────────────────
// Called after a new digest is POSTed to the API.
// Sizes: hero (900×700), thumb (300×300), detail (1600×800)
const IMAGE_SIZES = [
  [900, 700],
  [300, 300],
  [1600, 800],
];

export async function pregenerateDigestImages(stories = []) {
  const jobs = [];
  for (const story of stories) {
    const headline = story.headline || "";
    const tag = story.topic || story.tag || "markets";
    const seed = storyImageSeed(headline, story.rank || 0);
    for (const [w, h] of IMAGE_SIZES) {
      jobs.push({ seed, headline, tag, w, h });
    }
  }

  let done = 0, failed = 0;
  // Process in batches of 4 to be nice to Pollinations
  for (let i = 0; i < jobs.length; i += 4) {
    const batch = jobs.slice(i, i + 4);
    await Promise.all(
      batch.map(async ({ seed, headline, tag, w, h }) => {
        try {
          await generateAndCacheImage(seed, headline, tag, w, h);
          done++;
        } catch {
          failed++;
        }
      })
    );
    // Small pause between batches
    if (i + 4 < jobs.length) await new Promise(r => setTimeout(r, 500));
  }

  return { done, failed, total: jobs.length };
}
