/**
 * HealthSpotlights -- displays expert/podcast spotlights from the health digest.
 * Each spotlight: { name, type, insight, url }
 * type: "influencer" | "podcast"
 */
export default function HealthSpotlights({ items }) {
  if (!items || items.length === 0) return null;

  return (
    <div style={{
      background: "var(--watch-bg)",
      backdropFilter: "blur(20px) saturate(180%)",
      WebkitBackdropFilter: "blur(20px) saturate(180%)",
      border: "1px solid rgba(5,150,105,0.18)",
      borderRadius: 10,
      padding: "24px 28px",
      marginTop: 48,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <span style={{
          background: "var(--health-badge)",
          color: "var(--health)",
          padding: "4px 12px", borderRadius: 20,
          fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
        }}>🔬 Expert Spotlights</span>
        <span style={{ color: "var(--text-muted)", fontSize: 13 }}>
          Influencers &amp; podcasts to follow
        </span>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        gap: 12,
      }}>
        {items.map((item, i) => (
          <div key={i} style={{
            background: "var(--watch-item-bg)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: "16px 18px",
            display: "flex", flexDirection: "column", gap: 8,
            transition: "border-color 0.2s",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div>
                {item.url ? (
                  <a href={item.url} target="_blank" rel="noopener noreferrer"
                    style={{ fontWeight: 700, fontSize: 14, color: "var(--health)", textDecoration: "none" }}>
                    {item.name}
                  </a>
                ) : (
                  <span style={{ fontWeight: 700, fontSize: 14, color: "var(--health)" }}>{item.name}</span>
                )}
                <div style={{
                  fontSize: 11, color: "var(--text-muted)",
                  textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 2,
                }}>
                  {item.type === "podcast" ? "Podcast" : "Expert"}
                </div>
              </div>
            </div>
            {item.insight && (
              <p style={{
                fontSize: 13, color: "var(--text-secondary)",
                lineHeight: 1.55, margin: 0,
              }}>
                {item.insight}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
