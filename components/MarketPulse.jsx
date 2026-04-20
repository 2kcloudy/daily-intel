export default function MarketPulse({ text }) {
  if (!text) return null;
  return (
    <div style={{
      background: "var(--pulse-bg)",
      border: "1px solid var(--pulse-border)",
      borderLeft: "4px solid var(--pulse-accent)",
      borderRadius: 10,
      padding: "22px 28px",
      marginBottom: 32,
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 10, marginBottom: 10,
      }}>
        <span style={{
          background: "var(--gold-badge-bg)",
          color: "var(--gold)",
          padding: "3px 10px", borderRadius: 20, fontSize: 12,
          fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
        }}>⚡ Market Pulse</span>
      </div>
      <p style={{
        fontSize: 18, lineHeight: 1.7,
        color: "var(--text-secondary)",
        fontWeight: 400,
        fontFamily: "'Source Serif 4', Georgia, serif",
      }}>{text}</p>
    </div>
  );
}
