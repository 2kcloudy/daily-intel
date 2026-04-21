"use client";
import { useState, useMemo, useRef } from "react";
import Link from "next/link";
import SiteHeader from "./SiteHeader";
import HealthPulse from "./HealthPulse";
import HealthStoryCard from "./HealthStoryCard";
import HealthSpotlights from "./HealthSpotlights";
import { useIsMobile } from "../hooks/useIsMobile";

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
  const [activeTag, setActiveTag] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const isMobile = useIsMobile();
  const searchRef = useRef(null);

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

  /* Collect unique topics */
  const topics = digest
    ? [...new Set(digest.stories.map(s => s.topic).filter(Boolean))].sort()
    : [];

  /* Filter stories by tag + search query */
  const filteredStories = useMemo(() => {
    if (!digest) return [];
    let stories = digest.stories;
    if (activeTag) stories = stories.filter(s => s.topic === activeTag);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      stories = stories.filter(s =>
        (s.headline || "").toLowerCase().includes(q) ||
        (s.summary || "").toLowerCase().includes(q) ||
        (s.source || "").toLowerCase().includes(q) ||
        (s.topic || "").toLowerCase().includes(q)
      );
    }
    return stories;
  }, [digest, activeTag, searchQuery]);

  const hasActiveFilter = activeTag !== null || searchQuery.trim().length > 0;

  return (
    <>
      <SiteHeader currentDate={digest?.date} allDates={allDates} tab="health" />

      <div style={{
        maxWidth: 1200,
        margin: "0 auto",
        display: "flex",
        alignItems: "flex-start",
      }}>

        {/* ── Left sidebar — desktop only ── */}
        {!isMobile && allDates && allDates.length > 0 && (
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
              <Link key={d} href={`/health/${d}`} style={{
                display: "block",
                padding: "7px 10px",
                borderRadius: 7,
                marginBottom: 2,
                fontSize: 13,
                fontWeight: d === digest?.date ? 600 : 400,
                color: d === digest?.date ? "var(--health)" : "var(--text-secondary)",
                background: d === digest?.date ? "var(--health-badge)" : "transparent",
                textDecoration: "none",
                transition: "background 0.15s, color 0.15s",
                lineHeight: 1.4,
              }}>
                {fmtDateShort(d)}
              </Link>
            ))}
          </aside>
        )}

        {/* ── Main content ── */}
        <main style={{
          flex: 1,
          padding: isMobile ? "24px 16px 60px" : "44px 32px 80px",
          minWidth: 0,
        }}>

          {/* ── Mobile date strip ── */}
          {isMobile && allDates && allDates.length > 1 && (
            <div style={{
              overflowX: "auto",
              display: "flex",
              gap: 6,
              marginBottom: 20,
              paddingBottom: 4,
              scrollbarWidth: "none",
              WebkitOverflowScrolling: "touch",
            }}>
              {allDates.map((d) => (
                <Link key={d} href={`/health/${d}`} style={{
                  display: "inline-block",
                  whiteSpace: "nowrap",
                  padding: "6px 12px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: d === digest?.date ? 600 : 400,
                  color: d === digest?.date ? "var(--health)" : "var(--text-secondary)",
                  background: d === digest?.date ? "var(--health-badge)" : "var(--bg-card)",
                  border: d === digest?.date
                    ? "1px solid var(--health)"
                    : "1px solid var(--border)",
                  textDecoration: "none",
                  flexShrink: 0,
                }}>
                  {fmtDateShort(d)}
                </Link>
              ))}
            </div>
          )}

          {/* Masthead */}
          <div style={{ marginBottom: isMobile ? 20 : 36 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 10, marginBottom: 6,
              flexWrap: "wrap",
            }}>
              <h1 style={{
                fontFamily: "'Barlow', 'Helvetica Neue', Helvetica, sans-serif",
                fontSize: isMobile ? 28 : 38, fontWeight: 800,
                color: "var(--text-primary)",
                letterSpacing: "-0.04em",
              }}>Health Intel</h1>
              {digest?.date && (
                <span style={{
                  background: "var(--health-badge)",
                  color: "var(--health)",
                  padding: "4px 12px", borderRadius: 20,
                  fontSize: isMobile ? 11 : 13, fontWeight: 600, letterSpacing: "0.04em",
                }}>
                  {fmtDate(digest.date)}
                </span>
              )}
            </div>
            <p style={{
              color: "var(--text-muted)",
              fontSize: isMobile ? 13 : 14.5,
              fontWeight: 400,
            }}>
              Wellness &amp; longevity intelligence — curated daily by AI
            </p>
          </div>

          {!digest ? (
            <EmptyHealthState />
          ) : (
            <>
              {/* Health Pulse */}
              <HealthPulse text={digest.healthPulse} />

              {/* ── Search bar ── */}
              <div style={{ marginBottom: 16 }}>
                <div style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                }}>
                  <span style={{
                    position: "absolute",
                    left: 14,
                    color: "var(--text-muted)",
                    fontSize: 15,
                    pointerEvents: "none",
                    lineHeight: 1,
                  }}>🔍</span>
                  <input
                    ref={searchRef}
                    type="text"
                    placeholder="Search health stories…"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                    style={{
                      width: "100%",
                      padding: "10px 40px 10px 40px",
                      borderRadius: 10,
                      border: searchFocused
                        ? "1px solid var(--health)"
                        : "1px solid var(--border)",
                      background: "var(--bg-card)",
                      color: "var(--text-primary)",
                      fontSize: 14,
                      outline: "none",
                      fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
                      transition: "border-color 0.2s",
                      boxShadow: searchFocused
                        ? "0 0 0 3px rgba(5,150,105,0.12)"
                        : "none",
                    }}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      style={{
                        position: "absolute",
                        right: 12,
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--text-muted)",
                        fontSize: 16,
                        lineHeight: 1,
                        padding: 2,
                      }}
                    >&#xD7;</button>
                  )}
                </div>
              </div>

              {/* Meta bar */}
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                marginBottom: 14, flexWrap: "wrap",
              }}>
                <span style={{ color: "var(--text-muted)", fontSize: 13 }}>
                  <strong style={{ color: "var(--text-secondary)", fontWeight: 600 }}>
                    {filteredStories.length}
                  </strong>{" "}
                  {hasActiveFilter
                    ? `of ${digest.stories.length} stories`
                    : "stories · Ranked by health relevance"}
                </span>
                {!isMobile && (
                  <span style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                    color: "var(--text-muted)",
                    padding: "3px 10px", borderRadius: 20, fontSize: 11,
                  }}>
                    Sources: WSJ · NYT · Reuters Health · CNN Health · TIME · New Scientist · ABC Health · +more
                  </span>
                )}
              </div>

              {/* Topic filter tags */}
              {topics.length > 0 && (
                <div style={{
                  display: "flex", gap: 6, flexWrap: isMobile ? "nowrap" : "wrap",
                  marginBottom: 22,
                  overflowX: isMobile ? "auto" : "visible",
                  paddingBottom: isMobile ? 4 : 0,
                  scrollbarWidth: "none",
                  WebkitOverflowScrolling: "touch",
                }}>
                  <button
                    onClick={() => setActiveTag(null)}
                    style={{
                      padding: "5px 14px", borderRadius: 20,
                      fontSize: 12, fontWeight: 600, cursor: "pointer",
                      border: activeTag === null ? "1px solid var(--health)" : "1px solid var(--border)",
                      background: activeTag === null ? "var(--health-badge)" : "var(--bg-card)",
                      color: activeTag === null ? "var(--health)" : "var(--text-muted)",
                      transition: "all 0.15s",
                      letterSpacing: "0.02em",
                      fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
                      flexShrink: 0,
                      whiteSpace: "nowrap",
                    }}
                  >All</button>
                  {topics.map(t => (
                    <button
                      key={t}
                      onClick={() => setActiveTag(activeTag === t ? null : t)}
                      style={{
                        padding: "5px 14px", borderRadius: 20,
                        fontSize: 12, fontWeight: 600, cursor: "pointer",
                        border: activeTag === t ? "1px solid var(--health)" : "1px solid var(--border)",
                        background: activeTag === t ? "var(--health-badge)" : "var(--bg-card)",
                        color: activeTag === t ? "var(--health)" : "var(--text-muted)",
                        transition: "all 0.15s",
                        letterSpacing: "0.02em",
                        fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
                        flexShrink: 0,
                        whiteSpace: "nowrap",
                      }}
                    >{t}</button>
                  ))}
                </div>
              )}

              {/* Stories grid */}
              {filteredStories.length === 0 ? (
                <div style={{
                  textAlign: "center",
                  padding: "60px 24px",
                  color: "var(--text-muted)",
                  fontSize: 15,
                }}>
                  No stories match your search.{" "}
                  <button
                    onClick={() => { setSearchQuery(""); setActiveTag(null); }}
                    style={{
                      background: "none", border: "none",
                      color: "var(--health)", cursor: "pointer",
                      fontSize: 15, fontWeight: 600,
                    }}
                  >Clear filters</button>
                </div>
              ) : (
                <div style={{
                  display: "grid",
                  gridTemplateColumns: isMobile
                    ? "1fr"
                    : "repeat(auto-fill, minmax(340px, 1fr))",
                  gap: isMobile ? 12 : 14,
                }}>
                  {filteredStories.map((story, i) => (
                    <HealthStoryCard
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
              )}

              {/* Expert Spotlights */}
              <HealthSpotlights items={digest.spotlights} />

              {/* Footer */}
              <div style={{
                marginTop: 60, paddingTop: 24,
                borderTop: "1px solid var(--footer-border)",
                display: "flex",
                justifyContent: isMobile ? "center" : "space-between",
                alignItems: "center", flexWrap: "wrap", gap: 8,
                flexDirection: isMobile ? "column" : "row",
              }}>
                <span style={{ color: "var(--text-muted)", fontSize: 13 }}>
                  Daily Intel · AI-curated health intelligence
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
