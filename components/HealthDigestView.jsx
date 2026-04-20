"use client";
import SiteHeader from "./SiteHeader";
import HealthPulse from "./HealthPulse";
import HealthStoryCard from "./HealthStoryCard";
import HealthSpotlights from "./HealthSpotlights";

function EmptyHealthState() {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: "80px 24px", textAlign: "center",
    }}>
      <div style={{ fontSize: 56, marginBottom: 20 }}>🌿</div>
      <h2 style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: 26, fontWeight: 700, color: "#e8edf5", marginBottom: 12,
      }}>Health Digest Coming Soon</h2>
      <p style={{ color: "#4a5a75", fontSize: 15, maxWidth: 440, lineHeight: 1.7 }}>
        Your daily health intelligence digest will appear here — curated stories on sleep, nutrition,
        longevity, exercise science, and more.
      </p>
    </div>
  );
}

export default function HealthDigestView({ digest, allDates }) {
  const fmtDate = (d) => {
    if (!d) return "";
    return new Date(d + "T12:00:00Z").toLocaleDateString("en-US", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });
  };

  return (
    <>
      <SiteHeader currentDate={digest?.date} allDates={allDates} tab="health" />

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 24px 80px" }}>
        {/* Page title */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 32, fontWeight: 700, color: "#e8edf5",
              letterSpacing: "-0.02em",
            }}>Health Intel</h1>
            {digest?.date && (
              <span style={{
                background: "rgba(62,207,142,0.1)", color: "#3ecf8e",
                padding: "4px 12px", borderRadius: 20,
                fontSize: 12, fontWeight: 600, letterSpacing: "0.05em",
              }}>
                {fmtDate(digest.date)}
              </span>
            )}
          </div>
          <p style={{ color: "#4a5a75", fontSize: 14 }}>
            Wellness &amp; longevity intelligence — curated daily by AI
          </p>
        </div>

        {!digest ? (
          <EmptyHealthState />
        ) : (
          <>
            {/* Health Pulse */}
            <HealthPulse text={digest.healthPulse} />

            {/* Story count badge */}
            <div style={{
              display: "flex", alignItems: "center", gap: 12, marginBottom: 24,
              flexWrap: "wrap",
            }}>
              <span style={{ color: "#4a5a75", fontSize: 13 }}>
                {digest.stories.length} stories · Ranked by health relevance
              </span>
              <span style={{
                background: "#0d1a10", border: "1px solid #1a2e1e",
                color: "#4a5a75", padding: "3px 10px", borderRadius: 20, fontSize: 11,
              }}>
                Sources: WSJ · NYT · Reuters Health · CNN Health · TIME · New Scientist · ABC Health · +more
              </span>
            </div>

            {/* Stories grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
              gap: 16,
            }}>
              {digest.stories.map((story, i) => (
                <HealthStoryCard
                  key={i}
                  rank={i + 1}
                  headline={story.headline}
                  summary={story.summary}
                  source={story.source}
                  url={story.url}
                  topic={story.topic}
                />
              ))}
            </div>

            {/* Expert Spotlights */}
            <HealthSpotlights items={digest.spotlights} />

            {/* Footer */}
            <div style={{
              marginTop: 60, paddingTop: 24, borderTop: "1px solid #1a2e1e",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <span style={{ color: "#4a5a75", fontSize: 12 }}>
                Daily Intel · AI-curated health intelligence
              </span>
              {digest.postedAt && (
                <span style={{ color: "#4a5a75", fontSize: 12 }}>
                  Posted {new Date(digest.postedAt).toLocaleTimeString("en-US", {
                    hour: "2-digit", minute: "2-digit", timeZoneName: "short"
                  })}
                </span>
              )}
            </div>
          </>
        )}
      </main>
    </>
  );
}
