export default function WatchList({ items }) {
  if (!items || items.length === 0) return null;
  return (
    <div style={{
      background: "var(--watch-bg)",
      backdropFilter: "blur(20px) saturate(180%)",
      WebkitBackdropFilter: "blur(20px) saturate(180%)",
      border: "1px solid var(--watch-border)",
      borderRadius: 10,
      padding: "24px 28px",
      marginTop: 48,
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 10, marginBottom: 20,
      }}>
        <span style={{
          background: "var(--gold-badge-bg)",
          color: "var(--gold)",
          padding: "4px 12px", borderRadius: 20,
          fontSize: 12, fontWeight: 700,
          letterSpacing: "0.08em", textTransform: "uppercase",
        }}>👁 Watch List</span>
        <span style={{ color: "var(--text-muted)", fontSize: 13 }}>
          Tickers to monitor from today's digest
        </span>
      </div>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: 12,
      }}>
        {items.map((item, i) => (
          <div key={i} style={{
            background: "var(--watch-item-bg)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: "14px 18px",
            display: "flex", alignItems: "flex-start", gap: 14,
          }}>
            <span style={{
              fontFamily: "'IBM Plex Mono', 'SF Mono', ui-monospace, monospace",
              fontWeight: 700,
              fontSize: 14, color: "var(--gold)",
              background: "var(--gold-badge-bg)",
              padding: "3px 8px", borderRadius: 4,
              minWidth: "fit-content", flexShrink: 0,
              letterSpacing: "0.03em",
            }}>{item.ticker}</span>
            <span style={{
              fontSize: 14,
              color: "var(--text-secondary)",
              lineHeight: 1.55,
            }}>
              {item.note}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
