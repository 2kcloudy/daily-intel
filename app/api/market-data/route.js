import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import yahooFinance from "yahoo-finance2";

const CACHE_KEY = "market-data:live";
const CACHE_TTL = 300; // 5-minute KV cache

// Suppress the yahoo-finance2 survey notice
yahooFinance.suppressNotices(["yahooSurvey"]);

const SYMBOLS = [
  { sym: "^GSPC",    label: "S&P 500",  type: "index"  },
  { sym: "^IXIC",    label: "NASDAQ",   type: "index"  },
  { sym: "^DJI",     label: "DOW",      type: "index"  },
  { sym: "CL=F",     label: "WTI",      type: "oil"    },
  { sym: "BZ=F",     label: "BRENT",    type: "oil"    },
  { sym: "GC=F",     label: "GOLD",     type: "metal"  },
  { sym: "BTC-USD",  label: "BTC",      type: "crypto" },
  { sym: "^TNX",     label: "10Y",      type: "bond"   },
  { sym: "^VIX",     label: "VIX",      type: "vol"    },
  { sym: "DX-Y.NYB", label: "DXY",      type: "fx"     },
];

function formatPrice(price, type) {
  if (!price) return "—";
  if (type === "crypto") return `$${price >= 1000 ? price.toLocaleString("en-US", { maximumFractionDigits: 0 }) : price.toFixed(2)}`;
  if (type === "bond")   return `${price.toFixed(2)}%`;
  if (type === "oil" || type === "metal") return `$${price.toFixed(2)}`;
  if (type === "index")  return price >= 10000
    ? price.toLocaleString("en-US", { maximumFractionDigits: 0 })
    : price >= 1000
      ? price.toLocaleString("en-US", { maximumFractionDigits: 2 })
      : price.toFixed(2);
  return price.toFixed(2);
}

async function fetchMarketData() {
  const symList = SYMBOLS.map(s => s.sym);

  // yahoo-finance2 handles crumb, cookies, and retries automatically
  const results = await yahooFinance.quote(symList, {
    fields: ["regularMarketPrice", "regularMarketChangePercent", "regularMarketChange"],
  });

  // Results can be a single object or an array
  const quotes = Array.isArray(results) ? results : [results];
  const bySymbol = {};
  for (const q of quotes) if (q?.symbol) bySymbol[q.symbol] = q;

  return SYMBOLS.map(({ sym, label, type }) => {
    const q = bySymbol[sym];
    if (!q?.regularMarketPrice) return null;
    const price = q.regularMarketPrice;
    const pct   = q.regularMarketChangePercent ?? 0;
    const dir   = pct >= 0 ? "up" : "down";
    const sign  = pct >= 0 ? "+" : "";
    return {
      label,
      value: formatPrice(price, type),
      pct:   `${sign}${Math.abs(pct).toFixed(2)}%`,
      dir,
    };
  }).filter(Boolean);
}

/**
 * GET /api/market-data
 * Returns live market data, KV-cached for 5 minutes.
 */
export async function GET() {
  // Fast path: serve from KV cache
  try {
    const cached = await kv.get(CACHE_KEY);
    if (cached) {
      const data = typeof cached === "string" ? JSON.parse(cached) : cached;
      return NextResponse.json({ ...data, fromCache: true }, {
        headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
      });
    }
  } catch {}

  // Slow path: fetch live
  try {
    const indices = await fetchMarketData();
    const payload = { indices, updatedAt: new Date().toISOString() };

    try {
      await kv.set(CACHE_KEY, JSON.stringify(payload), { ex: CACHE_TTL });
    } catch {}

    return NextResponse.json({ ...payload, fromCache: false }, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
    });
  } catch (err) {
    console.error("[market-data] fetch error:", err.message);
    return NextResponse.json(
      { error: err.message, indices: null },
      { status: 503 }
    );
  }
}
