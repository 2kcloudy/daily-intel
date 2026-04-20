export default function HealthPulse({ text }) {
  if (!text) return null;
  return (
    <div style={{
      background: "linear-gradient(135deg, #0f2218 0%, #091a12 100%)",
      border: "1px solid rgba(62,207,142,0.25)",
      borderLeft: "4px solid #3ecf8e",
      borderRadius: 10,
      padding: "20px 28px",
      marginBottom: 36,
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 10, marginBottom: 10
      }}>
        <span style={{
          background: "rgba(62,207,142,0.12)", color: "#3ecf8e",
          padding: "3px 10px", borderRadius: 20, fontSize: 11,
          fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
        }}>🌿 Health Pulse</span>
      </div>
      <p style={{
        fontSize: 17, lineHeight: 1.65, color: "#d4dae8",
        fontStyle: "italic", fontWeight: 400,
      }}>{text}</p>
    </div>
  );
}
