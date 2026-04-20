"use client";
import { useState } from "react";
import Link from "next/link";
import SiteHeader from "./SiteHeader";
import MarketPulse from "./MarketPulse";
import StoryCard from "./StoryCard";
import WatchList from "./WatchList";
import EmptyState from "./EmptyState";

export default function DigestView({ digest, allDates }) {
  const [activeTag, setActiveTag] = useState(null);

  const fmtDate = (d) => {
    if (!d) return "";
    return new Date(d + "T12:00:00Z").toLocaleDateString("en-US", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });
  };

  const fmtDateShort = (d) => {
    if (!d) return "";
    return new Date(d + "T12:00:00Z").toLocaleDateString("en-US", {
      weekday: "short", month: "short", day: "numeric",
    });
  };

  // Collect unique topics from stories
  const topics = digest
    ? [...new Set(digest.stories.map(s => s.topic).filter(Boolean))].sort()
    : [];

  // Filter stories by active tag
  const filteredStories = digest
    ? (activeTag ? digest.stories.filter(s => s.topic === activeTag) : digest.stories)
    : [];

  return (
    <>
      <SiteHeader currentDate={digest?.date} />

      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "flex-start" }}>

        {/* Left sidebar — date navigation */}
        {allDates && allDates.length > 0 && (
          <aside style={{
            width: 196,
            flexShrink: 0,
            position: "sticky",
            top: 64,
            height: "calc(100vh - 64px)",
            overflowY: "auto",
            padding: "32px 16px 32px 24px",
            borderRight: "1px solid var(--border)",
          }}>
            <div style={{
              fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              marginBottom: 12,
            }}>Archive</div>
            {allDates.map((d) => (
              <Link key={d} href={`/${d}`} style={{
                display: "block",
                padding: "7px 10px",
                borderRadius: 7,
                marginBottom: 2,
                fontSize: 13,
                fontWeight: d === digest?.date ? 600 : 400,
                color: d === digest?.date ? "var(--gold)" : "var(--text-secondary)",
                background: d === digest?.date ? "var(--gold-badge-bg)" : "transparent",
                textDecoration: "none",
                transition: "background 0.15s, color 0.15s",
                lineHeight: 1.4,
              }}>
                {fmtDateShort(d)}
              </Link>
            ))}
          </aside>
        )}

        {/* Main content */}
        <main style={{ flex: 1, padding: "44px 32px 80px", minWidth: 0 }}>

          {/* Masthead */}
          <div style={{ marginBottom: 36 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 12, marginBottom: 6,
              flexWrap: "wrap",
            }}>
              <h1 style={{
                fontFamily: "'Source Serif 4', Georgia, serif",
                fontSize: 36, fontWeight: 700,
                color: "var(--text-primary)",
                letterSpacing: "-0.03em",
              }}>Daily Intel</h1>
              {digest?.date && (
                <span style={{
                  background: "var(--gold-dim)",
                  color: "var(--gold)",
                  padding: "4px 12px", borderRadius: 20,
                  fontSize: 13, fontWeight: 600, letterSpacing: "0.04em",
                }}>
                  {fmtDate(digest.date)}
                </span>
              )}
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: 14.5, fontWeight: 400 }}>
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
                marginBottom: 16, flexWrap: "wrap",
              }}>
                <span style={{ color: "var(--text-muted)", fontSize: 14 }}>
                  <strong style={{ color: "var(--text-secondary)", fontWeight: 600 }}>
                    {filteredStories.length}
                  </strong>{" "}
                  {activeTag ? `${activeTag} stories` : "stories · Ranked by market importance"}
                </span>
                <span style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  color: "var(--text-muted)",
                  padding: "3px 10px", borderRadius: 20, fontSize: 12,
                }}>
                  WSJ · Bloomberg · FT · CNBC · Reuters · MarketWatch · +more
                </span>
              </div>

              {/* Topic filter tags */}
              {topics.length > 0 && (
                <div style={{
                  display: "flex", gap: 7, flexWrap: "wrap",
                  marginBottom: 24,
                }}>
                  <button
                    onClick={() => setActiveTag(null)}
                    style={{
                      padding: "5px 14px", borderRadius: 20,
                      fontSize: 12, fontWeight: 600, cursor: "pointer",
                      border: activeTag === null ? "1px solid var(--gold)" : "1px solid var(--border)",
                      background: activeTag === null ? "var(--gold-badge-bg)" : "var(--bg-card)",
                      color: activeTag === null ? "var(--gold)" : "var(--text-muted)",
                      transition: "all 0.15s",
                      letterSpacing: "0.02em",
                      fontFamily: "'IBM Plex Sans', sans-serif",
                    }}
                  >All</button>
                  {topics.map(t => (
                    <button
                      key={t}
                      onClick={() => setActiveTag(activeTag === t ? null : t)}
                      style={{
                        padding: "5px 14px", borderRadius: 20,
                        fontSize: 12, fontWeight: 600, cursor: "pointer",
                        border: activeTag === t ? "1px solid var(--gold)" : "1px solid var(--border)",
                        background: activeTag === t ? "var(--gold-badge-bg)" : "var(--bg-card)",
                        color: activeTag === t ? "var(--gold)" : "var(--text-muted)",
                        transition: "all 0.15s",
                        letterSpacing: "0.02em",
                        fontFamily: "'IBM Plex Sans', sans-serif",
                      }}
                    >{t}</button>
                  ))}
                </div>
              )}

              {/* Stories grid */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
                gap: 14,
              }}>
                {filteredStories.map((story, i) => (
                  <StoryCard
                    key={i}
                    rank={digest.stories.indexOf(story) + 1}
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
                <span style={{ color: "var(--text-muted)", fontSize: 13 }}>
                  Daily Intel · AI-curated market intelligence
                </span>
                {digest.postedAt && (
                  <span style={{ color: "var(--text-muted)", fontSize: 13 }}>
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
      </div>
    </>
  );
}
