"use client";
import SiteHeader from "./SiteHeader";
import MarketPulse from "./MarketPulse";
import StoryCard from "./StoryCard";
import WatchList from "./WatchList";
import EmptyState from "./EmptyState";

export default function DigestView({ digest, allDates }) {
  const fmtDate = (d) => {
    if (!d) return "";
    return new Date(d + "T12:00:00Z").toLocaleDateString("en-US", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });
  };

  return (
    <>
      <SiteHeader currentDate={digest?.date} allDates={allDates} />

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "44px 24px 80px" }}>

        {/* Masthead */}
        <div style={{ marginBottom: 36 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 12, marginBottom: 6,
            flexWrap: "wrap",
          }}>
            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 34, fontWeight: 700,
              color: "var(--text-primary)",
              letterSpacing: "-0.03em",
            }}>Daily Intel</h1>
            {digest?.date && (
              <span style={{
                background: "var(--gold-dim)",
                color: "var(--gold)",
                padding: "4px 12px", borderRadius: 20,
                fontSize: 12, fontWeight: 600, letterSpacing: "0.04em",
              }}>
                {fmtDate(digest.date)}
              </span>
            )}
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: 13.5, fontWeight: 400 }}>
            Business &amp; investment intelligence — curated daily by AI
          </p>
        </div>

        {!digest ? (
          <EmptyState />
        ) : (
          <>
            {/* Market Pulse */}
            <MarketPulse text={digest.marketPulse} />

            {/* Meta bar */}
            <div style={{
              display: "flex", alignItems: "center", gap: 12,
              marginBottom: 24, flexWrap: "wrap",
            }}>
              <span style={{ color: "var(--text-muted)", fontSize: 13 }}>
                <strong style={{ color: "var(--text-secondary)", fontWeight: 600 }}>
                  {digest.stories.length}
                </strong>{" "}
                stories · Ranked by market importance
              </span>
              <span style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                color: "var(--text-muted)",
                padding: "3px 10px", borderRadius: 20, fontSize: 11,
              }}>
                WSJ · Bloomberg · FT · CNBC · Reuters · MarketWatch · +more
              </span>
            </div>

            {/* Stories grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
              gap: 14,
            }}>
              {digest.stories.map((story, i) => (
                <StoryCard
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

            {/* Watch List */}
            <WatchList items={digest.watchList} />

            {/* Footer */}
            <div style={{
              marginTop: 60, paddingTop: 24,
              borderTop: "1px solid var(--footer-border)",
              display: "flex", justifyContent: "space-between",
              alignItems: "center", flexWrap: "wrap", gap: 8,
            }}>
              <span style={{ color: "var(--text-muted)", fontSize: 12 }}>
                Daily Intel · AI-curated market intelligence
              </span>
              {digest.postedAt && (
                <span style={{ color: "var(--text-muted)", fontSize: 12 }}>
                  Posted{" "}
                  {new Date(digest.postedAt).toLocaleTimeString("en-US", {
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
