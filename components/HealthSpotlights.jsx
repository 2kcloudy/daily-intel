/**
 * HealthSpotlights -- displays influencer/podcast spotlights from the health digest.
 * Each spotlight: { name, type, insight, url }
 * type: "influencer" | "podcast"
 */
export default function HealthSpotlights({ items }) {
  if (!items || items.length === 0) return null;

  return (
    <div style={{
      background: "linear-gradient(135deg, #0f2218 0%, #091a12 100%)",
      border: "1px solid rgba(62,207,142,0.18)",
      borderRadius: 10,
      padding: "24px 28px",
      marginTop: 48,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <span style={{
          background: "rgba(62,207,142,0.12)", color: "#3ecf8e",
          padding: "4px 12px", borderRadius: 20,
          fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
        }}>Expert Spotlights</span>
        <span style={{ color: "#4a5a75", fontSize: 12 }}>Influencers &amp; podcasts to follow</span>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        gap: 12,
      }}>
        {items.map((item, i) => (
          <div key={i} style={{
            background: "#091a12",
            border: "1px solid #1a2e1e",
            borderRadius: 8,
            padding: "16px 18px",
            display: "flex", flexDirection: "column", gap: 8,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div>
                {item.url ? (
                  <a href={item.url} target="_blank" rel="noopener noreferrer"
                    style={{ fontWeight: 700, fontSize: 14, color: "#3ecf8e", textDecoration: "none" }}>
                    {item.name}
                  </a>
                ) : (
                  <span style={{ fontWeight: 700, fontSize: 14, color: "#3ecf8e" }}>{item.name}</span>
                )}
                <div style={{ fontSize: 11, color: "#4a5a75", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 2 }}>
                  {item.type === "podcast" ? "Podcast" : "Expert"}
                </div>
              </div>
            </div>
            {item.insight && (
              <p style={{ fontSize: 13, color: "#8a9ab5", lineHeight: 1.55, margin: 0 }}>
                {item.insight}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
