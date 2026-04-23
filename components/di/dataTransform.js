/**
 * dataTransform.js
 * Bridge between the Daily Intel API data format and the new design's story format.
 */

import { TAB_CONFIGS, TAB_ORDER } from "@/components/TabConfig";

/** Simple deterministic hash for image seeds */
function strHash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** Generate a Pollinations.ai image URL for a story */
export function storyImg(story, w = 600, h = 400) {
  const prompt = encodeURIComponent(
    `editorial news illustration for: ${(story.headline || "").slice(0, 80)}, ${story.tag || story.topic || ""}, desaturated, newspaper style`
  );
  const seed = story.seed || strHash(story.headline || String(story.rank || 0));
  return `https://image.pollinations.ai/prompt/${prompt}?width=${w}&height=${h}&seed=${seed}&nologo=true`;
}

/**
 * Extract a short sub-headline from a longer summary.
 * Returns the first 1-2 sentences, max ~120 chars.
 */
function extractSub(text = "") {
  if (!text) return "";
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  let sub = sentences[0] || "";
  if (sub.length > 130) sub = sub.slice(0, 127) + "…";
  return sub.trim();
}

/**
 * Transform a Finance digest story (has rank) to the design story shape.
 */
export function transformFinanceStory(s, index) {
  const rank = s.rank || index + 1;
  return {
    rank,
    tag:      s.topic || "Markets",
    source:   s.source || "",
    url:      s.url || "#",
    headline: s.headline || "",
    sub:      extractSub(s.summary),
    body:     s.summary || "",
    tickers:  [],
    seed:     strHash(s.headline || String(rank)),
  };
}

/**
 * Transform a generic tab story to the design story shape.
 */
export function transformTabStory(s, index) {
  const rank = s.rank || index + 1;
  return {
    rank,
    tag:      s.topic || "News",
    source:   s.source || "",
    url:      s.url || "#",
    headline: s.headline || "",
    sub:      extractSub(s.summary),
    body:     s.summary || "",
    tickers:  [],
    seed:     strHash(s.headline || String(rank)),
  };
}

/** Static placeholder market indices for the ticker bar + rail */
export const PLACEHOLDER_INDICES = [
  { label: "S&P 500", value: "7,092",  pct: "+0.55%", dir: "up"   },
  { label: "NASDAQ",  value: "24,436", pct: "+0.73%", dir: "up"   },
  { label: "DOW",     value: "49,362", pct: "+0.44%", dir: "up"   },
  { label: "WTI",     value: "$89.14", pct: "+2.20%", dir: "up"   },
  { label: "BRENT",   value: "$94.88", pct: "+1.66%", dir: "up"   },
  { label: "GOLD",    value: "$3,312", pct: "+0.32%", dir: "up"   },
  { label: "BTC",     value: "$76,535",pct: "+2.70%", dir: "up"   },
  { label: "10Y",     value: "4.31%",  pct: "-2bps",  dir: "down" },
  { label: "VIX",     value: "18.42",  pct: "-0.88%", dir: "down" },
  { label: "DXY",     value: "102.44", pct: "-0.14%", dir: "down" },
];

/** Build the 12-category nav array from TabConfig */
export const CATEGORIES = TAB_ORDER.map(id => {
  const cfg = TAB_CONFIGS[id];
  return {
    id:    id === "geopolitics" ? "world" : id,
    label: cfg?.label || id,
    glyph: cfg?.emoji || "·",
    path:  cfg?.path || `/${id}`,
  };
});

/** Map tab key → category id used in navigation */
export function tabKeyToCatId(tabKey) {
  if (tabKey === "geopolitics") return "world";
  return tabKey;
}
export function catIdToTabKey(catId) {
  if (catId === "world") return "geopolitics";
  return catId;
}

/**
 * Build a full "DI_DATA"-style object from a Finance digest + allDates.
 */
export function buildFinanceData(digest, allDates = []) {
  if (!digest) return null;

  const rawDate = digest.date || "";
  const dateObj = rawDate ? new Date(rawDate + "T12:00:00Z") : new Date();
  const dateLong = dateObj.toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
  const dateShort = dateObj.toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric",
  });

  const stories = (digest.stories || []).map(transformFinanceStory);

  // Build tag list from stories
  const tagCounts = {};
  stories.forEach(s => { tagCounts[s.tag] = (tagCounts[s.tag] || 0) + 1; });
  const tags = [
    { id: "all", label: "All", count: stories.length },
    ...Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([id, count]) => ({ id: id.toLowerCase(), label: id, count })),
  ];

  // Archive items from allDates
  const archive = (allDates || []).slice(0, 7).map((d, i) => {
    const dObj = new Date(d + "T12:00:00Z");
    return {
      label: dObj.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
      href: `/${d}`,
      active: i === 0,
      date: d,
    };
  });

  // Watchlist from digest
  const watchlist = (digest.watchList || []).map(w => ({
    ticker: w.ticker,
    note:   w.note || "",
    price:  w.price || "—",
    pct:    w.pct || "—",
    dir:    "up",
  }));

  return {
    date:       dateLong,
    dateShort,
    postedAt:   dateShort,
    pulse:      digest.marketPulse || "",
    sources:    ["WSJ", "Bloomberg", "CNBC", "Reuters", "FT", "MarketWatch"],
    stories,
    tags,
    watchlist,
    archive,
    indices:    PLACEHOLDER_INDICES,
    categories: CATEGORIES,
  };
}

/**
 * Build a "category data" object from a tab digest.
 */
export function buildTabData(digest, tabKey, allDates = []) {
  if (!digest) return null;

  const stories = (digest.stories || []).map(transformTabStory);
  const cfg = TAB_CONFIGS[tabKey] || {};

  const archive = (allDates || []).slice(0, 7).map((d, i) => {
    const dObj = new Date(d + "T12:00:00Z");
    return {
      label: dObj.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
      href: `/${tabKey}/${d}`,
      active: i === 0,
      date: d,
    };
  });

  return {
    pulse:    digest.pulse || digest.healthPulse || "",
    sources:  cfg.sources ? cfg.sources.split(" · ") : ["Various"],
    stories,
    watchlist: [],
    archive,
  };
}
