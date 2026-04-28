import { NextResponse } from "next/server";
import { getCachedImageUrl, generateAndCacheImage } from "@/lib/imageCache";

/**
 * GET /api/image?seed=12345&tag=markets&headline=...&w=900&h=700
 *
 * Returns a redirect to the permanent Blob URL.
 * On first hit: generates via Pollinations, uploads to Blob, caches in KV.
 * On subsequent hits: instant redirect from KV cache.
 */
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

  // Fast path: cached URL exists
  const cached = await getCachedImageUrl(seed, w, h);
  if (cached) {
    return NextResponse.redirect(cached, {
      headers: { "Cache-Control": "public, max-age=31536000, immutable" },
    });
  }

  // Slow path: generate, cache, and redirect
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
