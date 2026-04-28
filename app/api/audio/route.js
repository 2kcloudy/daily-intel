import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

export const maxDuration = 60;

/**
 * POST /api/audio
 *
 * Upload a Daily Brief MP3 (or other audio) to Vercel Blob and get back a
 * permanent CDN URL the digest payload can reference via brief.audioUrl.
 *
 * Two payload shapes are accepted:
 *   1. multipart/form-data with `file` and optional `slug`/`durationSec` fields
 *   2. application/json with `{ slug, base64, contentType?, durationSec? }`
 *      where base64 is the audio payload as a base64 string
 *
 * Returns: { url, durationSec? }
 */
export async function POST(request) {
  const apiKey = request.headers.get("x-api-key");
  if (apiKey !== process.env.DIGEST_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ctype = request.headers.get("content-type") || "";

  let buffer = null;
  let filename = "brief.mp3";
  let contentType = "audio/mpeg";
  let durationSec = null;

  try {
    if (ctype.startsWith("multipart/form-data")) {
      const form = await request.formData();
      const file = form.get("file");
      if (!file || typeof file === "string") {
        return NextResponse.json({ error: "missing file" }, { status: 400 });
      }
      const slug = (form.get("slug") || "brief").toString();
      filename = `${slug}-${Date.now()}.mp3`;
      contentType = file.type || contentType;
      buffer = Buffer.from(await file.arrayBuffer());
      const dur = form.get("durationSec");
      if (dur) durationSec = Number(dur);
    } else {
      const body = await request.json().catch(() => null);
      if (!body?.base64) {
        return NextResponse.json({ error: "missing base64" }, { status: 400 });
      }
      const slug = (body.slug || "brief").toString();
      filename = `${slug}-${Date.now()}.mp3`;
      if (body.contentType) contentType = String(body.contentType);
      if (body.durationSec) durationSec = Number(body.durationSec);
      buffer = Buffer.from(body.base64, "base64");
    }

    if (!buffer?.length) {
      return NextResponse.json({ error: "empty audio payload" }, { status: 400 });
    }

    const blob = await put(`di-audio/${filename}`, buffer, {
      access: "public",
      contentType,
      cacheControlMaxAge: 60 * 60 * 24 * 365,
    });

    return NextResponse.json({
      success: true,
      url: blob.url,
      durationSec,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "upload failed", message: err?.message || String(err) },
      { status: 500 }
    );
  }
}
