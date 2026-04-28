import { NextResponse } from "next/server";
import { getCachedImageUrl, generateAndCacheImage } from "@/lib/imageCache";

// On a KV miss this hits Pollinations (turbo, ~3-5s) and uploads the result
// to Blob. 60s leaves headroom for batched lazy generations.
export const maxDuration = 60;

/**
 * GET /api/image?seed=12345&tag=markets&headline=...&w=900&h=700
 *
 * Returns a redirect to the permanent Blob URL.
 * Self-healing: if the KV cache holds a Pollinations URL (which can be rate
 * limited or timeout), we treat it as a miss and run the full Pollinations →
 * Blob → KV pipeline so the next reader gets a permanent CDN URL.
 */
function isBlobUrl(url) {
  return typeof url === "string" && url.includes("blob.vercel-storage.com");
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const seed     = parseInt(searchParams.get("seed") || "0", 10);
  const tag      = searchParams.get("tag") || "markets";
  const headline = searchParams.get("headline") || "";
  const w        = parseInt(searchParams.get("w") || "600", 10);
  const h        = parseInt(searchParams.get("h") || "400", 10);

  if (!seed) {
    return NextResponse.json({ error: "seed required" }, { status: 400 });
  }

  // Fast path: KV already holds a permanent Blob URL — redirect instantly.
  const cached = await getCachedImageUrl(seed, w, h);
  if (cached && isBlobUrl(cached)) {
    return NextResponse.redirect(cached, {
      headers: { "Cache-Control": "public, max-age=31536000, immutable" },
    });
  }

  // Either no cache, or KV holds only a Pollinations URL (which 429s under
  // load). Force the full Pollinations → Blob → KV upgrade so subsequent
  // requests hit the CDN.
  const url = await generateAndCacheImage(seed, headline, tag, w, h);
  if (!url) {
    // Return a 1×1 transparent GIF as absolute last resort
    return new Response(
      Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64"),
      { headers: { "Content-Type": "image/gif", "Cache-Control": "no-cache" } }
    );
  }

  return NextResponse.redirect(url, {
    headers: { "Cache-Control": "public, max-age=31536000, immutable" },
  });
}
