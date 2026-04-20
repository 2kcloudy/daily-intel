export default function WatchList({ items }) {
  if (!items || items.length === 0) return null;
  return (
    <div style={{
      background: "linear-gradient(135deg, #131929 0%, #0f1a2e 100%)",
      border: "1px solid rgba(201,168,76,0.2)",
      borderRadius: 10,
      padding: "24px 28px",
      marginTop: 48,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <span style=={{
          background: "rgba(201,168,76,0.12)", color: "#c9a84c",
          padding: "4px 12px", borderRadius: 20,
          fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
        }}>👁 Watch List</span>
        <span style={{ color: "#4a5a75", fontSize: 12 }}>Tickers to monitor from today's digest</span>
      </div>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: 12,
      }}>
        {items.map((item, i) => (
          <div key={i} style={{
            background: "#0a0e1a",
            border: "1px solid #1e2a42",
            borderRadius: 8,
            padding: "14px 18px",
            display: "flex", alignItems: "flex-start", gap: 14,
          }}>
            <span style={{
              fontFamily: "monospace", fontWeight: 700,
              fontSize: 14, color: "#c9a84c",
              background: "rgba(201,168,76,0.1)",
              padding: "3px 8px", borderRadius: 4,
              minWidth: "fit-content", flexShrink: 0,
            }}>{item.ticker}</span>
            <span style={{ fontSize: 13, color: "#8a9ab5", lineHeight: 1.5 }}>
              {item.note}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
