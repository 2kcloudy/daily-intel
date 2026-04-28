"use client";
import { useEffect, useRef, useState } from "react";

/**
 * DailyBrief — top-of-page audio player.
 *
 * Two playback paths:
 *  1. brief.audioUrl set → real <audio> element pointing at the MP3 the skill
 *     uploaded (or generated server-side via /api/tts).
 *  2. brief.script set, no audioUrl → fall back to the browser's
 *     SpeechSynthesis API so the brief still plays today, no API keys needed.
 */
export default function DailyBrief({ brief, label = "Daily Brief", postedAt }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);     // 0–1
  const [duration, setDuration] = useState(brief?.durationSec || 0);
  const [showTranscript, setShowTranscript] = useState(false);
  const [ttsSupported, setTtsSupported] = useState(false);
  const [voiceUtter, setVoiceUtter] = useState(null);

  const url = brief?.audioUrl || brief?.url || null;
  const script = brief?.script || brief?.text || "";

  // ── Real audio element handlers ──
  useEffect(() => {
    if (!url) return;
    const a = audioRef.current;
    if (!a) return;
    const onTime = () => {
      if (a.duration && isFinite(a.duration)) {
        setProgress(a.currentTime / a.duration);
        setDuration(a.duration);
      }
    };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnd  = () => { setPlaying(false); setProgress(0); };
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);
    a.addEventListener("ended", onEnd);
    a.addEventListener("loadedmetadata", onTime);
    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
      a.removeEventListener("ended", onEnd);
      a.removeEventListener("loadedmetadata", onTime);
    };
  }, [url]);

  // ── Speech Synthesis fallback ──
  useEffect(() => {
    if (typeof window === "undefined") return;
    setTtsSupported(typeof window.speechSynthesis !== "undefined");
  }, []);

  function toggleAudioPlay() {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) a.play(); else a.pause();
  }

  function pickWarmVoice(synth) {
    const voices = synth.getVoices();
    if (!voices?.length) return null;
    // Ranked from warmest/most natural-sounding to least, across major platforms.
    // The browser ignores anything it doesn't have; first match wins.
    const PREFERRED = [
      // Apple — Samantha and Allison are the warmest stock voices
      "Samantha (Enhanced)", "Samantha", "Allison", "Ava (Enhanced)", "Ava",
      "Karen", "Susan", "Joelle", "Daniel (Enhanced)", "Daniel",
      // Microsoft Edge / Windows neural voices — best free Windows TTS
      "Microsoft Aria Online (Natural)", "Microsoft Jenny Online (Natural)",
      "Microsoft Sonia Online (Natural)", "Microsoft Guy Online (Natural)",
      "Microsoft Aria", "Microsoft Jenny", "Microsoft Sonia", "Microsoft Guy",
      // Chrome / Google
      "Google UK English Female", "Google US English",
    ];
    for (const name of PREFERRED) {
      const hit = voices.find(v => v.name === name);
      if (hit) return hit;
    }
    // Fallback: first English-language voice that isn't flagged "novelty".
    return voices.find(v => /^en[-_]/i.test(v.lang) && !/Fred|Albert|Zarvox|Cellos/.test(v.name)) || voices[0];
  }

  function toggleSpeechPlay() {
    if (!ttsSupported) return;
    const synth = window.speechSynthesis;
    if (synth.speaking && !synth.paused) {
      synth.pause();
      setPlaying(false);
      return;
    }
    if (synth.paused) {
      synth.resume();
      setPlaying(true);
      return;
    }
    synth.cancel();
    const u = new SpeechSynthesisUtterance(script);
    // Slightly slower than default + a hint warmer pitch reads as conversational
    // rather than robotic on most platforms.
    u.rate = 0.95;
    u.pitch = 1.05;
    u.volume = 1.0;
    const voice = pickWarmVoice(synth);
    if (voice) u.voice = voice;
    u.onend   = () => { setPlaying(false); setProgress(0); };
    u.onpause = () => setPlaying(false);
    synth.speak(u);
    setVoiceUtter(u);
    setPlaying(true);
  }

  // Stop speech on unmount / route change
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!url && !script) return null;

  function fmtSecs(s) {
    if (!s || !isFinite(s)) return "—:—";
    const m = Math.floor(s / 60);
    const r = Math.floor(s % 60);
    return `${m}:${r < 10 ? "0" : ""}${r}`;
  }

  const onPlayClick = url ? toggleAudioPlay : toggleSpeechPlay;

  return (
    <section
      style={{
        margin: "0 0 28px",
        padding: "18px 22px",
        background: "var(--di-paper-2)",
        border: "1px solid var(--di-line)",
        borderRadius: 8,
        display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
      }}
    >
      <button
        onClick={onPlayClick}
        aria-label={playing ? "Pause Daily Brief" : "Play Daily Brief"}
        style={{
          width: 48, height: 48, borderRadius: "50%",
          background: "var(--di-ink)", color: "var(--di-paper)",
          border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, flexShrink: 0,
        }}
      >
        {playing ? "❚❚" : "▶"}
      </button>

      <div style={{ flex: "1 1 220px", minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 6 }}>
          <span style={{
            fontFamily: "var(--di-font-ui)", fontSize: 11, fontWeight: 700,
            letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--di-accent)",
          }}>
            🎙 {label}
          </span>
          {postedAt && (
            <span style={{ fontFamily: "var(--di-font-ui)", fontSize: 11, color: "var(--di-ink-4)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              · {postedAt}
            </span>
          )}
          {!url && script && (
            <span style={{
              fontFamily: "var(--di-font-ui)", fontSize: 10, color: "var(--di-ink-4)",
              padding: "2px 6px", border: "1px solid var(--di-line)", borderRadius: 3,
              letterSpacing: "0.06em", textTransform: "uppercase",
            }}>
              browser voice
            </span>
          )}
        </div>
        <div style={{
          fontFamily: "var(--di-font-body, var(--di-font-serif))",
          fontSize: 14.5, lineHeight: 1.45, color: "var(--di-ink-2)",
          maxHeight: showTranscript ? "none" : "2.9em", overflow: "hidden",
        }}>
          {script
            ? script.slice(0, showTranscript ? undefined : 240) + (!showTranscript && script.length > 240 ? "…" : "")
            : "Tap play to hear the day's brief."}
        </div>
        {url && (
          <div style={{
            height: 4, background: "var(--di-line)", borderRadius: 2, marginTop: 10,
            overflow: "hidden",
          }}>
            <div style={{
              width: `${Math.round(progress * 100)}%`, height: "100%",
              background: "var(--di-accent)", transition: "width 0.2s linear",
            }} />
          </div>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        {duration > 0 && (
          <span style={{ fontFamily: "var(--di-font-mono)", fontSize: 12, color: "var(--di-ink-3)", fontVariantNumeric: "tabular-nums" }}>
            {fmtSecs(duration * progress)} / {fmtSecs(duration)}
          </span>
        )}
        {script && (
          <button
            onClick={() => setShowTranscript(s => !s)}
            style={{
              background: "none", border: "1px solid var(--di-line)",
              padding: "6px 12px", borderRadius: 100, cursor: "pointer",
              fontFamily: "var(--di-font-ui)", fontSize: 11, fontWeight: 600,
              letterSpacing: "0.06em", textTransform: "uppercase",
              color: "var(--di-ink-2)",
            }}
          >
            {showTranscript ? "Hide" : "Read"}
          </button>
        )}
      </div>

      {url && <audio ref={audioRef} src={url} preload="metadata" />}
    </section>
  );
}
