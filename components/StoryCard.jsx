const TOPIC_COLORS = {
  "AI": "#4a90d9", "Tech": "#4a90d9", "Markets": "#2ecc71",
  "Defense": "#e67e22", "Energy": "#e67e22", "Commodities": "#c9a84c",
  "Crypto": "#9b59b6", "Space": "#4a90d9", "Biotech": "#2ecc71",
  "Macro": "#e74c3c", "Policy": "#e74c3c", "Earnings": "#2ecc71",
  "default": "#4a5a75",
};

function topicColor(topic) {
  if (!topic) return TOPIC_COLORS.default;
  for (const [key, val] of Object.entries(TOPIC_COLORS)) {
    if (topic.toLowerCase().includes(key.toLowerCase())) return val;
  }
  return TOPIC_COLORS.default;
}

export default function StoryCard({ rank, headline, summary, source, url, topic }) {
  const color = topicColor(topic);
  return (
    <article style={{
      background: "#131929",
      border: "1px solid #1e2a42",
      borderRadius: 10,
      padding: "22px 26px",
      transition: "border-color 0.2s, background 0.2s",
      display: "flex", flexDirection: "column", gap: 12,
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = "#253349";
      e.currentTarget.style.background = "#182035";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = "#1e2a42";
      e.currentTarget.style.background = "#131929";
    }}>
      {/* Top row: rank badge + topic tag */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{
          background: "rgba(201,168,76,0.12)", color: "#c9a84c",
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
        borderTop: "1px solid #1e2a42", paddingTop: 12, marginTop: 4,
      }}>
        <span style={{
          fontSize: 12, color: "#4a5a75", fontWeight: 500, textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}>{source}</span>
        {url && (
          <a href={url} target="_blank" rel="noopener noreferrer"
            style={{
              fontSize: 12, color: "#c9a84c", fontWeight: 600,
              display: "flex", alignItems: "center", gap: 4,
            }}>
            Read more →
          </a>
        )}
      </div>
    </article>
  );
}
