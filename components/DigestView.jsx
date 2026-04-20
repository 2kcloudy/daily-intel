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

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 24px 80px" }}>
        {/* Page title */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 32, fontWeight: 700, color: "#e8edf5",
              letterSpacing: "-0.02em",
            }}>Daily Intel</h1>
            {digest?.date && (
              <span style={{
                background: "rgba(201,168,76,0.1)", color: "#c9a84c",
                padding: "4px 12px", borderRadius: 20,
                fontSize: 12, fontWeight: 600, letterSpacing: "0.05em",
              }}>
                {fmtDate(digest.date)}
              </span>
            )}
          </div>
          <p style={{ color: "#4a5a75", fontSize: 14 }}>
            Business &amp; investment intelligence — curated daily by AI
          </p>
        </div>

        {!digest ? (
          <EmptyState />
        ) : (
          <>
            {/* Market Pulse */}
            <MarketPulse text={digest.marketPulse} />

            {/* Story count badge */}
            <div style={{
              display: "flex", alignItems: "center", gap: 12, marginBottom: 24,
            }}>
              <span style={{ color: "#4a5a75", fontSize: 13 }}>
                {digest.stories.length} stories · Ranked by market importance
              </span>
              <span style={{
                background: "#131929", border: "1px solid #1e2a42",
                color: "#4a5a75", padding: "3px 10px", borderRadius: 20, fontSize: 11,
              }}>
                Sources: WSJ · Bloomberg · FT · CNBC · Reuters · MarketWatch · +more
              </span>
            </div>

            {/* Stories grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
              gap: 16,
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
              marginTop: 60, paddingTop: 24, borderTop: "1px solid #1e2a42",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <span style={{ color: "#4a5a75", fontSize: 12 }}>
                Daily Intel · AI-curated market intelligence
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
