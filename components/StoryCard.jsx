"use client";
import { useState } from "react";

/* Topic color map — works on both light and dark backgrounds */
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

function topicStyle(topic) {
  if (!topic) return TOPIC_COLORS.default;
  for (const [key, val] of Object.entries(TOPIC_COLORS)) {
    if (topic.toLowerCase().includes(key.toLowerCase())) return val;
  }
  return TOPIC_COLORS.default;
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
        border: hovered
          ? "1px solid var(--gold-light)"
          : "1px solid var(--border)",
        borderRadius: 10,
        padding: "22px 24px",
        boxShadow: hovered ? "var(--shadow-card-hover)" : "var(--shadow-card)",
        transition: "border-color 0.2s, box-shadow 0.2s",
        display: "flex", flexDirection: "column", gap: 14,
        cursor: "default",
      }}
    >
      {/* Top row: rank badge + topic tag */}
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
      }}>
        <span style={{
          background: "var(--gold-badge-bg)",
          color: "var(--gold)",
          width: 28, height: 28, borderRadius: 6, fontSize: 13,
          fontWeight: 700,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>{rank}</span>
        {topic && (
          <span style={{
            background: topicBg,
            color: topicText,
            padding: "3px 10px", borderRadius: 20,
            fontSize: 12, fontWeight: 700, letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}>{topic}</span>
        )}
      </div>

      {/* Headline */}
      <h2 style={{
        fontSize: 16, fontWeight: 700,
        color: "var(--text-primary)",
        lineHeight: 1.45, letterSpacing: "-0.01em",
      }}>{headline}</h2>

      {/* Summary */}
      <p style={{
        fontSize: 14.5,
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
          fontSize: 12, color: "var(--text-muted)",
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
            Read more →
          </a>
        )}
      </div>
    </article>
  );
}
