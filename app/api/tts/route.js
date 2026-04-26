import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

export const maxDuration = 60;

/**
 * POST /api/tts
 *
 * Generate a Daily Brief MP3 from a script using OpenAI TTS, upload it to
 * Vercel Blob, and return the permanent URL.
 *
 * Requires the OPENAI_API_KEY env var to be set in the Vercel project. If it
 * isn't, returns 503 so the caller can fall back to client-side
 * SpeechSynthesis playback.
 *
 * Body: { script: string, slug?: string, voice?: "alloy"|"nova"|"shimmer"|"onyx"|"echo"|"fable" }
 * Returns: { url, durationSec?, voice }
 */
export async function POST(request) {
  const apiKey = request.headers.get("x-api-key");
  if (apiKey !== process.env.DIGEST_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    return NextResponse.json(
      { error: "TTS not configured", note: "Set OPENAI_API_KEY in Vercel env to enable server-side audio. The caller should fall back to sending only brief.script for client-side speech synthesis." },
      { status: 503 }
    );
  }

  let body;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const script = (body?.script || "").trim();
  const slug   = (body?.slug || "brief").toString().slice(0, 80).replace(/[^\w\-]+/g, "-");
  const voice  = body?.voice || "nova";

  if (!script) {
    return NextResponse.json({ error: "script required" }, { status: 400 });
  }
  // OpenAI TTS hard limit is ~4096 chars per call.
  if (script.length > 4000) {
    return NextResponse.json(
      { error: "script too long", limit: 4000, length: script.length },
      { status: 400 }
    );
  }

  try {
    const ttsRes = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini-tts",
        voice,
        input: script,
        response_format: "mp3",
      }),
      signal: AbortSignal.timeout(50000),
    });

    if (!ttsRes.ok) {
      const errText = await ttsRes.text().catch(() => "");
      return NextResponse.json(
        { error: "openai tts failed", status: ttsRes.status, detail: errText.slice(0, 400) },
        { status: 502 }
      );
    }

    const buffer = Buffer.from(await ttsRes.arrayBuffer());
    const blob = await put(`di-audio/${slug}-${Date.now()}.mp3`, buffer, {
      access: "public", contentType: "audio/mpeg",
      cacheControlMaxAge: 60 * 60 * 24 * 365,
    });

    // Rough duration estimate: ~155 wpm conversational pace.
    const wordCount = script.split(/\s+/).filter(Boolean).length;
    const durationSec = Math.round((wordCount / 155) * 60);

    return NextResponse.json({
      success: true,
      url: blob.url,
      voice,
      durationSec,
      bytes: buffer.length,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "tts pipeline error", message: err?.message || String(err) },
      { status: 500 }
    );
  }
}
