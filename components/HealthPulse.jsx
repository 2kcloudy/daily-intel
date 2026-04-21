export default function HealthPulse({ text }) {
  if (!text) return null;
  return (
    <div style={{
      background: "var(--pulse-bg)",
      backdropFilter: "blur(20px) saturate(180%)",
      WebkitBackdropFilter: "blur(20px) saturate(180%)",
      border: "1px solid rgba(5,150,105,0.22)",
      borderLeft: "4px solid var(--health)",
      borderRadius: 10,
      padding: "22px 28px",
      marginBottom: 36,
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 10, marginBottom: 10,
      }}>
        <span style={{
          background: "var(--health-badge)",
          color: "var(--health)",
          padding: "3px 10px", borderRadius: 20, fontSize: 12,
          fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
        }}>🌿 Health Pulse</span>
      </div>
      <p style={{
        fontSize: 17, lineHeight: 1.7,
        color: "var(--text-secondary)",
        fontStyle: "italic", fontWeight: 400,
        fontFamily: "'Inter', 'Helvetica Neue', Helvetica, sans-serif",
      }}>{text}</p>
    </div>
  );
}
