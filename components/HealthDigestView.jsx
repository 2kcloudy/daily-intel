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
      <div style={{
        width: 72, height: 72, borderRadius: 18,
        background: "linear-gradient(135deg, #10b981, #059669)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 32, marginBottom: 24,
        boxShadow: "0 4px 20px rgba(5,150,105,0.28)",
      }}>🌿</div>
      <h2 style={{
        fontSize: 24, fontWeight: 800,
        color: "var(--text-primary)", marginBottom: 12,
        fontFamily: "'Barlow', 'Helvetica Neue', sans-serif",
      }}>Health Digest Coming Soon</h2>
      <p style={{
        color: "var(--text-muted)", fontSize: 15,
        maxWidth: 440, lineHeight: 1.75,
      }}>
        Your daily health intelligence digest will appear here — curated stories on sleep,
        nutrition, longevity, exercise science, and more.
      </p>
      <div style={{
        background: "var(--empty-code-bg)",
        border: "1px solid var(--border)",
        borderRadius: 8, padding: "14px 24px", marginTop: 20,
      }}>
        <code style={{ color: "var(--health)", fontSize: 14 }}>
          "Do the health digest for today"
        </code>
      </div>
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
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8, flexWrap: "wrap" }}>
            <h1 style={{
              fontFamily: "'Barlow', 'Helvetica Neue', Helvetica, sans-serif",
              fontSize: 32, fontWeight: 800,
              color: "var(--text-primary)",
              letterSpacing: "-0.02em",
            }}>Health Intel</h1>
            {digest?.date && (
              <span style={{
                background: "var(--health-badge)",
                color: "var(--health)",
                padding: "4px 12px", borderRadius: 20,
                fontSize: 12, fontWeight: 600, letterSpacing: "0.05em",
              }}>
                {fmtDate(digest.date)}
              </span>
            )}
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
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
              <span style={{ color: "var(--text-muted)", fontSize: 13 }}>
                {digest.stories.length} stories · Ranked by health relevance
              </span>
              <span style={{
                background: "var(--bg-card)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1px solid var(--border)",
                color: "var(--text-muted)",
                padding: "3px 10px", borderRadius: 20, fontSize: 11,
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
              marginTop: 60, paddingTop: 24,
              borderTop: "1px solid var(--footer-border)",
              display: "flex", justifyContent: "space-between", alignItems: "center",
              flexWrap: "wrap", gap: 8,
            }}>
              <span style={{ color: "var(--text-muted)", fontSize: 12 }}>
                Daily Intel · AI-curated health intelligence
              </span>
              {digest.postedAt && (
                <span style={{ color: "var(--text-muted)", fontSize: 12 }}>
                  Posted {new Date(digest.postedAt).toLocaleTimeString("en-US", {
                    hour: "2-digit", minute: "2-digit", timeZoneName: "short",
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
