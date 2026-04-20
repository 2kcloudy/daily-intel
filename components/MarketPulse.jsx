export default function MarketPulse({ text }) {
  if (!text) return null;
  return (
    <div style={{
      background: "linear-gradient(135deg, #1a2540 0%, #0f1a30 100%)",
      border: "1px solid rgba(201,168,76,0.3)",
      borderLeft: "4px solid #c9a84c",
      borderRadius: 10,
      padding: "20px 28px",
      marginBottom: 36,
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 10, marginBottom: 10
      }}>
        <span style={{
          background: "rgba(201,168,76,0.15)", color: "#c9a84c",
          padding: "3px 10px", borderRadius: 20, fontSize: 11,
          fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
        }}>⚡ Market Pulse</span>
      </div>
      <p style={{
        fontSize: 17, lineHeight: 1.65, color: "#d4dae8",
        fontStyle: "italic", fontWeight: 400,
      }}>{text}</p>
    </div>
  );
}
