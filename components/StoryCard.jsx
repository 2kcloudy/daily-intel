"use client";
import { useState, useEffect, useRef } from "react";

/* Topic color map */
const TOPIC_COLORS = {
  AI:          { text: "#1d6fb8", bg: "rgba(29,111,184,0.08)" },
  Tech:        { text: "#1d6fb8", bg: "rgba(29,111,184,0.08)" },
  Markets:     { text: "#16863d", bg: "rgba(22,134,61,0.08)" },
  Defense:     { text: "#c05621", bg: "rgba(192,86,33,0.08)" },
  Energy:      { text: "#c05621", bg: "rgba(192,86,33,0.08)" },
  Commodities: { text: "#b8921a", bg: "rgba(184,146,26,0.10)" },
  Crypto:      { text: "#6d28d9", bg: "rgba(109,40,217,0.08)" },
  Space:       { text: "#0e7490", bg: "rgba(14,116,144,0.08)" },
  Biotech:     { text: "#059669", bg: "rgba(5,150,105,0.08)" },
  Macro:       { text: "#b91c1c", bg: "rgba(185,28,28,0.08)" },
  Policy:      { text: "#b91c1c", bg: "rgba(185,28,28,0.08)" },
  Earnings:    { text: "#16863d", bg: "rgba(22,134,61,0.08)" },
  default:     { text: "#6b7280", bg: "rgba(107,114,128,0.08)" },
};

/* Emoji fallback per topic */
const TOPIC_EMOJI = {
  AI: "🤖", Tech: "💻", Markets: "📈", Defense: "🛡️", Energy: "⚡",
  Commodities: "🏗️", Crypto: "🔐", Space: "🚀", Biotech: "🧬",
  Macro: "🌐", Policy: "🏛️", Earnings: "💰", default: "📰",
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

/* Generate a stable numeric seed from a string */
function seedFromString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/* Build a Pollinations.ai image URL */
function buildImageUrl(headline, topic) {
  const prompt = `Financial news illustration, abstract editorial style: ${topic || "business"} - ${headline.slice(0, 80)}. Clean, minimal, professional, no text, photorealistic.`;
  const seed = seedFromString(headline);
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=600&height=220&nologo=true&seed=${seed}`;
}

/* AI image with shimmer skeleton + emoji fallback + 12s timeout */
function StoryImage({ headline, topic }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const timerRef = useRef(null);

  const src = buildImageUrl(headline, topic);
  const emoji = topicEmoji(topic);

  useEffect(() => {
    // Fall back to emoji if image doesn't load within 12 seconds
    timerRef.current = setTimeout(() => {
      if (!loaded) setError(true);
    }, 12000);
    return () => clearTimeout(timerRef.current);
  }, [loaded]);

  if (error) {
    return (
      <div style={{
        height: 160,
        background: "var(--gold-dim)",
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

export default function StoryCard({ rank, headline, summary, source, url, topic }) {
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
          ? "1px solid var(--gold-light)"
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
      <StoryImage headline={headline} topic={topic} />

      {/* Top row: rank badge + topic tag */}
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
      }}>
        <span style={{
          background: "var(--gold-badge-bg)",
          color: "var(--gold)",
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
              fontSize: 13, color: "var(--gold)", fontWeight: 600,
              display: "flex", alignItems: "center", gap: 4,
              transition: "color 0.2s",
            }}
          >
            Read →
          </a>
        )}
      </div>
    </article>
  );
}
