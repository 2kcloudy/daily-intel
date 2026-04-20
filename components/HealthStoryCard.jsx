"use client";
const TOPIC_COLORS = {
  "Sleep":           "#7b68ee",
  "Nutrition":       "#3ecf8e",
  "Exercise":        "#f59e0b",
  "Longevity":       "#06b6d4",
  "Heart":           "#f43f5e",
  "Gut":             "#84cc16",
  "Mental":          "#a78bfa",
  "Supplements":     "#fb923c",
  "Research":        "#38bdf8",
  "Wearables":       "#34d399",
  "Peptides":        "#c084fc",
  "Hormones":        "#f472b6",
  "Inflammation":    "#fbbf24",
  "Breathing":       "#67e8f9",
  "default":         "#4a5a75",
};

function topicColor(topic) {
  if (!topic) return TOPIC_COLORS.default;
  for (const [key, val] of Object.entries(TOPIC_COLORS)) {
    if (topic.toLowerCase().includes(key.toLowerCase())) return val;
  }
  return TOPIC_COLORS.default;
}

export default function HealthStoryCard({ rank, headline, summary, source, url, topic }) {
  const color = topicColor(topic);
  return (
    <article
      style={{
        background: "#0d1a10",
        border: "1px solid #1a2e1e",
        borderRadius: 10,
        padding: "22px 26px",
        transition: "border-color 0.2s, background 0.2s",
        display: "flex", flexDirection: "column", gap: 12,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "#253d29";
        e.currentTarget.style.background = "#112016";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "#1a2e1e";
        e.currentTarget.style.background = "#0d1a10";
      }}
    >
      {/* Top row: rank + topic */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{
          background: "rgba(62,207,142,0.12)", color: "#3ecf8e",
          width: 28, height: 28, borderRadius: 6, fontSize: 12,
          fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>{rank}</span>
        {topic && (
          <span style={{
            background: `${color}18`,
            color: color,
            padding: "3px 10px", borderRadius: 20,
            fontSize: 11, fontWeight: 600, letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}>{topic}</span>
        )}
      </div>

      {/* Headline */}
      <h2 style={{
        fontSize: 15.5, fontWeight: 700, color: "#e8edf5",
        lineHeight: 1.4, letterSpacing: "-0.01em",
      }}>{headline}</h2>

      {/* Summary */}
      <p style={{
        fontSize: 13.5, color: "#8a9ab5", lineHeight: 1.7, flexGrow: 1,
      }}>{summary}</p>

      {/* Footer */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderTop: "1px solid #1a2e1e", paddingTop: 12, marginTop: 4,
      }}>
        <span style={{
          fontSize: 12, color: "#4a5a75", fontWeight: 500, textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}>{source}</span>
        {url && (
          <a href={url} target="_blank" rel="noopener noreferrer"
            style={{
              fontSize: 12, color: "#3ecf8e", fontWeight: 600,
              display: "flex", alignItems: "center", gap: 4, textDecoration: "none",
            }}>
            Read more
          </a>
        )}
      </div>
    </article>
  );
}
