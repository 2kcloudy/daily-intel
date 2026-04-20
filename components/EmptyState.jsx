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
        boxShadow: "0 4px 16px rgba(184,146,26,0.25)",
      }}>📰</div>
      <div>
        <h2 style={{
          fontSize: 24, fontWeight: 800,
          color: "var(--text-primary)",
          marginBottom: 10,
          fontFamily: "'Barlow', 'Helvetica Neue', Helvetica, sans-serif",
        }}>
          No digest yet today
        </h2>
        <p style={{
          color: "var(--text-muted)", fontSize: 15,
          maxWidth: 400, lineHeight: 1.75,
        }}>
          Ask Claude to "do the news digest" and your Daily Intel briefing will appear here automatically.
        </p>
      </div>
      <div style={{
        background: "var(--empty-code-bg)",
        border: "1px solid var(--border)",
        borderRadius: 8, padding: "14px 24px", marginTop: 8,
      }}>
        <code style={{ color: "var(--gold)", fontSize: 14 }}>
          "Do the news digest for today"
        </code>
      </div>
    </div>
  );
}
