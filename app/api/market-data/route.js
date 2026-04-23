import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

const CACHE_KEY = "market-data:live";
const CACHE_TTL = 300; // 5 minutes

// Symbols to fetch from Yahoo Finance
const SYMBOLS = [
  { sym: "^GSPC",    label: "S&P 500",  type: "index"  },
  { sym: "^IXIC",    label: "NASDAQ",   type: "index"  },
  { sym: "^DJI",     label: "DOW",      type: "index"  },
  { sym: "CL=F",     label: "WTI",      type: "oil",   prefix: "$" },
  { sym: "BZ=F",     label: "BRENT",    type: "oil",   prefix: "$" },
  { sym: "GC=F",     label: "GOLD",     type: "metal", prefix: "$" },
  { sym: "BTC-USD",  label: "BTC",      type: "crypto",prefix: "$" },
  { sym: "^TNX",     label: "10Y",      type: "bond",  suffix: "%" },
  { sym: "^VIX",     label: "VIX",      type: "vol"   },
  { sym: "DX-Y.NYB", label: "DXY",      type: "fx"    },
];

function formatPrice(price, type, prefix, suffix) {
  if (type === "crypto") return `$${price >= 1000 ? price.toLocaleString("en-US", { maximumFractionDigits: 0 }) : price.toFixed(2)}`;
  if (type === "bond")   return `${price.toFixed(2)}%`;
  if (type === "oil" || type === "metal") return `$${price.toFixed(2)}`;
  if (type === "index")  return price >= 1000 ? price.toLocaleString("en-US", { maximumFractionDigits: 0 }) : price.toFixed(2);
  if (suffix) return `${price.toFixed(2)}${suffix}`;
  if (prefix) return `${prefix}${price.toFixed(2)}`;
  return price.toFixed(2);
}

async function fetchYahooFinance() {
  const symbolList = SYMBOLS.map(s => encodeURIComponent(s.sym)).join(",");
  const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbolList}&fields=regularMarketPrice,regularMarketChangePercent,regularMarketChange`;

  const headers = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json",
    "Accept-Language": "en-US,en;q=0.9",
    "Origin": "https://finance.yahoo.com",
    "Referer": "https://finance.yahoo.com/",
  };

  const res = await fetch(url, {
    headers,
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) throw new Error(`Yahoo Finance HTTP ${res.status}`);
  const json = await res.json();
  const quotes = json?.quoteResponse?.result;
  if (!quotes?.length) throw new Error("No quotes returned");

  // Build a lookup by symbol
  const bySymbol = {};
  for (const q of quotes) bySymbol[q.symbol] = q;

  return SYMBOLS.map(({ sym, label, type, prefix, suffix }) => {
    const q = bySymbol[sym];
    if (!q) return null;
    const price  = q.regularMarketPrice ?? 0;
    const pct    = q.regularMarketChangePercent ?? 0;
    const dir    = pct >= 0 ? "up" : "down";
    const sign   = pct >= 0 ? "+" : "";
    return {
      label,
      value:  formatPrice(price, type, prefix, suffix),
      pct:    `${sign}${Math.abs(pct).toFixed(2)}%`,
      dir,
      raw:    { price, pct },
    };
  }).filter(Boolean);
}

/**
 * GET /api/market-data
 * Returns live market indices, served from KV cache (5 min TTL).
 * Falls back to last known good data on error.
 */
export async function GET() {
  // Try cache first
  try {
    const cached = await kv.get(CACHE_KEY);
    if (cached) {
      const data = typeof cached === "string" ? JSON.parse(cached) : cached;
      return NextResponse.json({ ...data, fromCache: true }, {
        headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
      });
    }
  } catch {}

  // Fetch live data
  try {
    const indices = await fetchYahooFinance();
    const payload = { indices, updatedAt: new Date().toISOString() };

    // Cache in KV
    try {
      await kv.set(CACHE_KEY, JSON.stringify(payload), { ex: CACHE_TTL });
    } catch {}

    return NextResponse.json({ ...payload, fromCache: false }, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
    });
  } catch (err) {
    // Return error so client can use its fallback
    return NextResponse.json(
      { error: err.message, indices: null },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}
