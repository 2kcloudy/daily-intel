import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

const CACHE_KEY = "market-data:live";
const CACHE_TTL = 300; // 5 minutes

// ── Data sources ──────────────────────────────────────────────────────────────
// Priority order:
//   1. Twelve Data (free 800 req/day — set TWELVE_DATA_KEY in Vercel env vars)
//   2. CoinGecko for BTC (free, no key needed) + fallback static for the rest
//   3. Cached last-known values
// ─────────────────────────────────────────────────────────────────────────────

// Twelve Data symbol map — verified working symbols
const TD_SYMBOLS = [
  { sym: "SPX",     label: "S&P 500", type: "index" },
  { sym: "IXIC",    label: "NASDAQ",  type: "index" },
  { sym: "DJI",     label: "DOW",     type: "index" },
  { sym: "XTI/USD", label: "WTI",     type: "oil"   },  // WTI crude (not "WTI")
  { sym: "XBR/USD", label: "BRENT",   type: "oil"   },  // Brent crude
  { sym: "XAU/USD", label: "GOLD",    type: "metal" },  // Gold spot
  { sym: "VIX",     label: "VIX",     type: "vol"   },
  { sym: "US10Y",   label: "10Y",     type: "bond"  },  // US 10-Year yield
  { sym: "DXY",     label: "DXY",     type: "fx"    },  // US Dollar Index
];

function formatValue(price, pct, type) {
  if (!price) return { value: "—", pct: "—", dir: "up" };
  let value;
  if (type === "crypto") value = `$${Number(price) >= 10000 ? Number(price).toLocaleString("en-US", { maximumFractionDigits: 0 }) : Number(price).toFixed(2)}`;
  else if (type === "bond") value = `${Number(price).toFixed(2)}%`;
  else if (type === "oil" || type === "metal") value = `$${Number(price).toFixed(2)}`;
  else if (type === "index") value = Number(price) >= 10000
    ? Number(price).toLocaleString("en-US", { maximumFractionDigits: 0 })
    : Number(price).toLocaleString("en-US", { maximumFractionDigits: 2 });
  else value = Number(price).toFixed(2);

  const pctNum = Number(pct) || 0;
  return {
    value,
    pct: `${pctNum >= 0 ? "+" : ""}${pctNum.toFixed(2)}%`,
    dir: pctNum >= 0 ? "up" : "down",
  };
}

// ── Twelve Data ──────────────────────────────────────────────────────────────
async function fetchTwelveData(apiKey) {
  // Use the /price endpoint for simple latest price (1 request per symbol)
  // For change%, use /quote endpoint (also 1 per symbol but more data)
  const symbols = TD_SYMBOLS.map(s => s.sym).join(",");
  const url = `https://api.twelvedata.com/quote?symbol=${symbols}&apikey=${apiKey}`;

  const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`Twelve Data HTTP ${res.status}`);
  const json = await res.json();

  // Response is either a single object or a map keyed by symbol
  const bySymbol = {};
  if (json.symbol) {
    // Single symbol response
    bySymbol[json.symbol] = json;
  } else {
    Object.assign(bySymbol, json);
  }

  return TD_SYMBOLS.map(({ sym, label, type }) => {
    const q = bySymbol[sym];
    if (!q || q.status === "error") return null;
    const price = q.close || q.price || 0;
    const pct   = q.percent_change || 0;
    return { label, ...formatValue(price, pct, type) };
  }).filter(Boolean);
}

// ── CoinGecko for BTC (free, no key needed) ───────────────────────────────────
async function fetchBtcFromCoinGecko() {
  const url = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true";
  const res = await fetch(url, {
    headers: { "Accept": "application/json" },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`CoinGecko HTTP ${res.status}`);
  const json = await res.json();
  const btc = json?.bitcoin;
  if (!btc) throw new Error("No BTC data");
  const pct = btc.usd_24h_change ?? 0;
  return {
    label: "BTC",
    value: `$${btc.usd.toLocaleString("en-US", { maximumFractionDigits: 0 })}`,
    pct: `${pct >= 0 ? "+" : ""}${pct.toFixed(2)}%`,
    dir: pct >= 0 ? "up" : "down",
  };
}

// ── Fallback static data (shows last known state from digest) ─────────────────
const STATIC_FALLBACK = [
  { label: "S&P 500", value: "—",    pct: "—",       dir: "up"   },
  { label: "NASDAQ",  value: "—",    pct: "—",       dir: "up"   },
  { label: "DOW",     value: "—",    pct: "—",       dir: "up"   },
  { label: "WTI",     value: "—",    pct: "—",       dir: "up"   },
  { label: "BRENT",   value: "—",    pct: "—",       dir: "up"   },
  { label: "GOLD",    value: "—",    pct: "—",       dir: "up"   },
  { label: "BTC",     value: "—",    pct: "—",       dir: "up"   },
  { label: "10Y",     value: "—",    pct: "—",       dir: "down" },
  { label: "VIX",     value: "—",    pct: "—",       dir: "down" },
  { label: "DXY",     value: "—",    pct: "—",       dir: "down" },
];

// ── Main fetch logic ──────────────────────────────────────────────────────────
async function fetchMarketData() {
  const tdKey = process.env.TWELVE_DATA_KEY;
  const keyStatus = tdKey ? `set (${tdKey.slice(0,4)}...)` : "NOT SET";
  console.log(`[market-data] TWELVE_DATA_KEY: ${keyStatus}`);

  // Strategy 1: Twelve Data (if API key configured)
  if (tdKey) {
    try {
      const indices = await fetchTwelveData(tdKey);
      console.log(`[market-data] Twelve Data returned ${indices?.length} instruments`);
      if (indices?.length >= 5) {
        // Also try to get fresh BTC from CoinGecko
        try {
          const btc = await fetchBtcFromCoinGecko();
          const btcIdx = indices.findIndex(i => i.label === "BTC");
          if (btcIdx >= 0) indices[btcIdx] = btc;
          else indices.push(btc);
        } catch {}
        return { indices, source: "twelvedata" };
      }
    } catch (e) {
      console.error("[market-data] Twelve Data error:", e.message);
    }
  }

  // Strategy 2: CoinGecko for BTC only (always free) + partial static for rest
  try {
    const btc = await fetchBtcFromCoinGecko();
    const partial = STATIC_FALLBACK.map(item =>
      item.label === "BTC" ? btc : item
    );
    return { indices: partial, source: "partial-coingecko" };
  } catch {}

  // Strategy 3: Return static "—" placeholders (better than fake data)
  return { indices: STATIC_FALLBACK, source: "static" };
}

/**
 * GET /api/market-data
 *
 * Setup (2 min):
 *   1. Go to https://twelvedata.com → sign up free → copy API key
 *   2. In Vercel dashboard → your project → Settings → Environment Variables
 *   3. Add TWELVE_DATA_KEY = your key → Save → Redeploy
 *
 * Free tier: 800 requests/day, 8/minute — more than enough.
 * With 5-min KV cache: ~288 requests/day used.
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const nocache = searchParams.get("nocache") === "1";

  // Fast path: KV cache (skip with ?nocache=1)
  if (!nocache) try {
    const cached = await kv.get(CACHE_KEY);
    if (cached) {
      const data = typeof cached === "string" ? JSON.parse(cached) : cached;
      if (data?.indices?.length) {
        return NextResponse.json({ ...data, fromCache: true }, {
          headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
        });
      }
    }
  } catch {}

  // Slow path: fetch live
  try {
    const result = await fetchMarketData();
    const payload = {
      indices: result.indices,
      source: result.source,
      updatedAt: new Date().toISOString(),
    };

    // Cache even partial data — better than hitting the source every request
    try {
      await kv.set(CACHE_KEY, JSON.stringify(payload), { ex: CACHE_TTL });
    } catch {}

    // Include key status in debug output (safe — only shows first 4 chars)
    const debug = {
      hasKey: !!process.env.TWELVE_DATA_KEY,
      keyPreview: process.env.TWELVE_DATA_KEY
        ? `${process.env.TWELVE_DATA_KEY.slice(0,4)}...` : "NOT SET",
    };
    return NextResponse.json({ ...payload, fromCache: false, debug }, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err.message, indices: STATIC_FALLBACK, source: "error-fallback" },
      { status: 200 } // Return 200 with dashes so the UI still renders cleanly
    );
  }
}
