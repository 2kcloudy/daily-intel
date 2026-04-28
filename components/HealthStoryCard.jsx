"use client";
import { useState, useEffect, useRef } from "react";

const TOPIC_COLORS = {
  "Sleep":        { text: "#7c3aed", bg: "rgba(124,58,237,0.08)" },
  "Nutrition":    { text: "#059669", bg: "rgba(5,150,105,0.08)" },
  "Exercise":     { text: "#d97706", bg: "rgba(217,119,6,0.08)" },
  "Longevity":    { text: "#0891b2", bg: "rgba(8,145,178,0.08)" },
  "Heart":        { text: "#e11d48", bg: "rgba(225,29,72,0.08)" },
  "Gut":          { text: "#65a30d", bg: "rgba(101,163,13,0.08)" },
  "Mental":       { text: "#7c3aed", bg: "rgba(124,58,237,0.08)" },
  "Supplements":  { text: "#ea580c", bg: "rgba(234,88,12,0.08)" },
  "Research":     { text: "#0284c7", bg: "rgba(2,132,199,0.08)" },
  "Wearables":    { text: "#059669", bg: "rgba(5,150,105,0.08)" },
  "Peptides":     { text: "#9333ea", bg: "rgba(147,51,234,0.08)" },
  "Hormones":     { text: "#db2777", bg: "rgba(219,39,119,0.08)" },
  "Inflammation": { text: "#b45309", bg: "rgba(180,83,9,0.08)" },
  "Breathing":    { text: "#0891b2", bg: "rgba(8,145,178,0.08)" },
  "default":      { text: "#64748b", bg: "rgba(100,116,139,0.08)" },
};

const TOPIC_EMOJI = {
  Sleep: "😴", Nutrition: "🥗", Exercise: "🏃", Longevity: "🧬",
  Heart: "❤️", Gut: "🦠", Mental: "🧠", Supplements: "💊",
  Research: "🔬", Wearables: "⌚", Peptides: "🧪", Hormones: "⚗️",
  Inflammation: "🔥", Breathing: "🫁", default: "🌿",
};

function topicStyle(topic) {
  if (!topic) return TOPIC_COLORS.default;
  for (const [key, val] of Object.entries(TOPIC_COLORS)) {
    if (topic.toLowerCase().includes(key.toLowerCase())) return val;
  }
  return TOPIC_COLORS.default;
}

function topicEmoji(topic) {
  if (!topic) return TOPIC_EMOJI.default;
  for (const [key, val] of Object.entries(TOPIC_EMOJI)) {
    if (topic.toLowerCase().includes(key.toLowerCase())) return val;
  }
  return TOPIC_EMOJI.default;
}

function seedFromString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/* Fallback URL — only used for legacy stories without story.image. */
function buildFallbackImageUrl(headline, topic) {
  const prompt = `${(headline || "").split(" ").slice(0, 6).join(" ")}, ${topic || "wellbeing"}, medical laboratory wellness editorial illustration, no text`;
  const seed = seedFromString(headline || "");
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=900&height=700&seed=${seed}&nologo=true&model=turbo`;
}

function StoryImage({ headline, topic, image }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const timerRef = useRef(null);

  const src = image || buildFallbackImageUrl(headline, topic);
  const emoji = topicEmoji(topic);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      if (!loaded) setError(true);
    }, 20000);
    return () => clearTimeout(timerRef.current);
  }, [loaded]);

  if (error) {
    return (
      <div style={{
        height: 160,
        background: "rgba(5,150,105,0.06)",
        borderRadius: 8,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 48,
        marginBottom: 4,
        flexShrink: 0,
        border: "1px solid var(--border)",
      }}>
        {emoji}
      </div>
    );
  }

  return (
    <div style={{ position: "relative", height: 160, marginBottom: 4, flexShrink: 0 }}>
      {!loaded && (
        <div
          className="shimmer"
          style={{ position: "absolute", inset: 0, borderRadius: 8 }}
        />
      )}
      <img
        src={src}
        alt={headline}
        onLoad={() => { clearTimeout(timerRef.current); setLoaded(true); }}
        onError={() => { clearTimeout(timerRef.current); setError(true); }}
        style={{
          width: "100%", height: 160,
          objectFit: "cover",
          borderRadius: 8,
          opacity: loaded ? 1 : 0,
          transition: "opacity 0.4s ease",
          display: "block",
        }}
      />
    </div>
  );
}

export default function HealthStoryCard({ rank = 1, headline, summary, source, url, topic, image }) {
  const [hovered, setHovered] = useState(false);
  const { text: topicText, bg: topicBg } = topicStyle(topic);

  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "var(--bg-card)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        border: hovered
          ? "1px solid var(--health-light)"
          : "1px solid var(--glass-border)",
        borderRadius: 14,
        overflow: "hidden",
        padding: "18px 20px 20px",
        boxShadow: hovered ? "var(--shadow-card-hover)" : "var(--shadow-card)",
        transition: "border-color 0.2s, box-shadow 0.25s",
        display: "flex", flexDirection: "column", gap: 12,
        cursor: "default",
      }}
    >
      {/* AI Image */}
      <StoryImage headline={headline} topic={topic} image={image} />

      {/* Top row: rank badge + topic tag */}
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
      }}>
        <span style={{
          background: "var(--health-badge)",
          color: "var(--health)",
          width: 26, height: 26, borderRadius: 6, fontSize: 12,
          fontWeight: 700,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>{rank}</span>
        {topic && (
          <span style={{
            background: topicBg,
            color: topicText,
            padding: "3px 10px", borderRadius: 20,
            fontSize: 11, fontWeight: 700, letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}>{topic}</span>
        )}
      </div>

      {/* Headline */}
      <h2 style={{
        fontSize: 15.5, fontWeight: 700,
        color: "var(--text-primary)",
        lineHeight: 1.45, letterSpacing: "-0.01em",
      }}>{headline}</h2>

      {/* Summary */}
      <p style={{
        fontSize: 14,
        color: "var(--text-secondary)",
        lineHeight: 1.75,
        flexGrow: 1,
      }}>{summary}</p>

      {/* Card footer */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderTop: "1px solid var(--border)",
        paddingTop: 12, marginTop: 2,
      }}>
        <span style={{
          fontSize: 11, color: "var(--text-muted)",
          fontWeight: 600, textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}>{source}</span>
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: 13, color: "var(--health)", fontWeight: 600,
              display: "flex", alignItems: "center", gap: 4,
              textDecoration: "none",
              transition: "color 0.2s",
            }}
          >
            Read &#x2192;
          </a>
        )}
      </div>
    </article>
  );
}
