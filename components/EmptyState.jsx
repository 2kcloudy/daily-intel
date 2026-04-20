export default function EmptyState() {
  return (
    <div style={{
      textAlign: "center", padding: "80px 24px",
      display: "flex", flexDirection: "column", alignItems: "center", gap: 20,
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: 16,
        background: "linear-gradient(135deg, #c9a84c, #8a6420)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 28,
      }}>📰</div>
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#e8edf5", marginBottom: 8 }}>
          No digest yet today
        </h2>
        <p style={{ color: "#4a5a75", fontSize: 14, maxWidth: 400, lineHeight: 1.7 }}>
          Ask Claude to "do the news digest" and your Daily Intel briefing will appear here automatically.
        </p>
      </div>
      <div style={{
        background: "#131929", border: "1px solid #1e2a42",
        borderRadius: 8, padding: "14px 24px", marginTop: 8,
      }}>
        <code style={{ color: "#c9a84c", fontSize: 14 }}>
          "Do the news digest for today"
        </code>
      </div>
    </div>
  );
}
