"use client";
import { useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SiteHeader from "./SiteHeader";
import MarketPulse from "./MarketPulse";
import StoryCard from "./StoryCard";
import WatchList from "./WatchList";
import EmptyState from "./EmptyState";
import { useIsMobile } from "../hooks/useIsMobile";

export default function DigestView({ digest, allDates, prevTopics }) {
  const [activeTag, setActiveTag] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [compact, setCompact] = useState(false);
  const [shareState, setShareState] = useState("idle");
  const [email, setEmail] = useState("");
  const [subState, setSubState] = useState("idle");
  const isMobile = useIsMobile();
  const searchRef = useRef(null);
  const touchStartX = useRef(null);
  const router = useRouter();

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

  const topics = digest
    ? [...new Set(digest.stories.map(s => s.topic).filter(Boolean))].sort()
    : [];

  const topicCounts = useMemo(() => {
    if (!digest) return {};
    const counts = {};
    digest.stories.forEach(s => { if (s.topic) counts[s.topic] = (counts[s.topic] || 0) + 1; });
    return counts;
  }, [digest]);

  const trendingTopics = useMemo(() => {
    if (!prevTopics || !Array.isArray(prevTopics)) return new Set();
    return new Set(prevTopics);
  }, [prevTopics]);

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

  const handleShare = async () => {
    if (!digest) return;
    const url = `${window.location.origin}/${digest.date}`;
    const top3 = digest.stories.slice(0, 3).map(s => `• ${s.headline}`).join("\n");
    const text = `📊 Daily Intel — ${fmtDate(digest.date)}\n\n${top3}\n\n${url}`;
    try {
      if (navigator.share) { await navigator.share({ title: "Daily Intel", text, url }); setShareState("shared"); }
      else { await navigator.clipboard.writeText(text); setShareState("copied"); }
      setTimeout(() => setShareState("idle"), 2500);
    } catch {}
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubState("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), tab: "finance" }),
      });
      setSubState(res.ok ? "done" : "error");
    } catch { setSubState("error"); }
  };

  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (!touchStartX.current || !allDates || !digest) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 80) {
      const idx = allDates.indexOf(digest.date);
      if (delta < 0 && idx > 0) router.push(`/${allDates[idx - 1]}`);
      else if (delta > 0 && idx < allDates.length - 1) router.push(`/${allDates[idx + 1]}`);
    }
    touchStartX.current = null;
  };

  return (
    <>
      <SiteHeader currentDate={digest?.date} allDates={allDates} />

      <div
        style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "flex-start" }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Left sidebar */}
        {!isMobile && allDates && allDates.length > 0 && (
          <aside style={{
            width: 196, flexShrink: 0, position: "sticky",
            top: 96, height: "calc(100vh - 96px)", overflowY: "auto",
            padding: "32px 16px 32px 24px", borderRight: "1px solid var(--border)",
          }}>
            <div style={{
              fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
              textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 12,
            }}>Archive</div>
            {allDates.map((d) => (
              <Link key={d} href={`/${d}`} style={{
                display: "block", padding: "7px 10px", borderRadius: 7, marginBottom: 2,
                fontSize: 13,
                fontWeight: d === digest?.date ? 600 : 400,
                color: d === digest?.date ? "var(--gold)" : "var(--text-secondary)",
                background: d === digest?.date ? "var(--gold-badge-bg)" : "transparent",
                textDecoration: "none", transition: "background 0.15s, color 0.15s", lineHeight: 1.4,
              }}>{fmtDateShort(d)}</Link>
            ))}
          </aside>
        )}

        <main style={{ flex: 1, padding: isMobile ? "24px 16px 60px" : "40px 32px 80px", minWidth: 0 }}>

          {/* Mobile date strip */}
          {isMobile && allDates && allDates.length > 1 && (
            <div style={{
              overflowX: "auto", display: "flex", gap: 6, marginBottom: 20,
              paddingBottom: 4, scrollbarWidth: "none", WebkitOverflowScrolling: "touch",
            }}>
              {allDates.map((d) => (
                <Link key={d} href={`/${d}`} style={{
                  display: "inline-block", whiteSpace: "nowrap",
                  padding: "6px 12px", borderRadius: 20, fontSize: 12,
                  fontWeight: d === digest?.date ? 600 : 400,
                  color: d === digest?.date ? "var(--gold)" : "var(--text-secondary)",
                  background: d === digest?.date ? "var(--gold-badge-bg)" : "var(--bg-card)",
                  border: d === digest?.date ? "1px solid var(--gold)" : "1px solid var(--border)",
                  textDecoration: "none", flexShrink: 0,
                }}>{fmtDateShort(d)}</Link>
              ))}
            </div>
          )}

          {/* Masthead */}
          <div style={{ marginBottom: isMobile ? 20 : 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
              <h1 style={{
                fontFamily: "'Barlow', 'Helvetica Neue', Helvetica, sans-serif",
                fontSize: isMobile ? 28 : 38, fontWeight: 800,
                color: "var(--text-primary)", letterSpacing: "-0.04em",
              }}>Daily Intel</h1>
              {digest?.date && (
                <span style={{
                  background: "var(--gold-dim)", color: "var(--gold)",
                  padding: "4px 12px", borderRadius: 20,
                  fontSize: isMobile ? 11 : 13, fontWeight: 600, letterSpacing: "0.04em",
                }}>{fmtDate(digest.date)}</span>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <p style={{ color: "var(--text-muted)", fontSize: isMobile ? 13 : 14.5, fontWeight: 400 }}>
                Business &amp; investment intelligence — curated daily by AI
              </p>
              {digest && (
                <div style={{ display: "flex", gap: 6, marginLeft: "auto" }} className="no-print">
                  <button onClick={handleShare} style={{
                    background: "var(--btn-bg)", border: "1px solid var(--btn-border)",
                    color: shareState !== "idle" ? "var(--gold)" : "var(--btn-text)",
                    padding: "5px 12px", borderRadius: 7, cursor: "pointer",
                    fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 4,
                  }}>
                    {shareState === "copied" ? "✓ Copied!" : shareState === "shared" ? "✓ Shared!" : "⎋ Share"}
                  </button>
                  <button onClick={() => window.print()} style={{
                    background: "var(--btn-bg)", border: "1px solid var(--btn-border)",
                    color: "var(--btn-text)", padding: "5px 12px", borderRadius: 7,
                    cursor: "pointer", fontSize: 12, fontWeight: 600,
                  }}>🖸 Print</button>
                </div>
              )}
            </div>
          </div>

          {!digest ? (
            <EmptyState />
          ) : (
            <>
              <MarketPulse text={digest.marketPulse} />

              {/* Search */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <span style={{ position: "absolute", left: 14, color: "var(--text-muted)", fontSize: 15, pointerEvents: "none", lineHeight: 1 }}>🔍</span>
                  <input
                    ref={searchRef} type="text" placeholder="Search stories…"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                    style={{
                      width: "100%", padding: "10px 40px 10px 40px", borderRadius: 10,
                      border: searchFocused ? "1px solid var(--gold)" : "1px solid var(--border)",
                      background: "var(--bg-card)", color: "var(--text-primary)", fontSize: 14, outline: "none",
                      fontFamily: "'Inter', 'Helvetica Neue', sans-serif", transition: "border-color 0.2s",
                      boxShadow: searchFocused ? "0 0 0 3px rgba(184,146,26,0.12)" : "none",
                    }}
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")} style={{
                      position: "absolute", right: 12, background: "none", border: "none",
                      cursor: "pointer", color: "var(--text-muted)", fontSize: 16, lineHeight: 1, padding: 2,
                    }}>×</button>
                  )}
                </div>
              </div>

              {/* Meta bar */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
                <span style={{ color: "var(--text-muted)", fontSize: 13 }}>
                  <strong style={{ color: "var(--text-secondary)", fontWeight: 600 }}>{filteredStories.length}</strong>{" "}
                  {hasActiveFilter ? `of ${digest.stories.length} stories` : "stories · Ranked by market importance"}
                </span>
                {!isMobile && (
                  <span style={{
                    background: "var(--bg-card)", border: "1px solid var(--border)",
                    color: "var(--text-muted)", padding: "3px 10px", borderRadius: 20, fontSize: 11,
                  }}>WSJ · Bloomberg · FT · CNBC · Reuters · MarketWatch · +more</span>
                )}
                <button onClick={() => setCompact(!compact)} className="no-print" style={{
                  marginLeft: "auto",
                  background: compact ? "var(--gold-badge-bg)" : "var(--bg-card)",
                  border: compact ? "1px solid var(--gold)" : "1px solid var(--border)",
                  color: compact ? "var(--gold)" : "var(--text-muted)",
                  padding: "3px 10px", borderRadius: 20, cursor: "pointer",
                  fontSize: 11, fontWeight: 600,
                }}>{compact ? "⊞ Cards" : "☰ Compact"}</button>
              </div>

              {/* Topic pills */}
              {topics.length > 0 && (
                <div style={{
                  display: "flex", gap: 6,
                  flexWrap: isMobile ? "nowrap" : "wrap",
                  marginBottom: 22,
                  overflowX: isMobile ? "auto" : "visible",
                  paddingBottom: isMobile ? 4 : 0,
                  scrollbarWidth: "none", WebkitOverflowScrolling: "touch",
                }}>
                  <button onClick={() => setActiveTag(null)} style={{
                    padding: "5px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer",
                    border: activeTag === null ? "1px solid var(--gold)" : "1px solid var(--border)",
                    background: activeTag === null ? "var(--gold-badge-bg)" : "var(--bg-card)",
                    color: activeTag === null ? "var(--gold)" : "var(--text-muted)",
                    transition: "all 0.15s", letterSpacing: "0.02em",
                    fontFamily: "'Inter', 'Helvetica Neue', sans-serif", flexShrink: 0, whiteSpace: "nowrap",
                  }}>All</button>
                  {topics.map(t => (
                    <button key={t} onClick={() => setActiveTag(activeTag === t ? null : t)} style={{
                      padding: "5px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer",
                      border: activeTag === t ? "1px solid var(--gold)" : "1px solid var(--border)",
                      background: activeTag === t ? "var(--gold-badge-bg)" : "var(--bg-card)",
                      color: activeTag === t ? "var(--gold)" : "var(--text-muted)",
                      transition: "all 0.15s", letterSpacing: "0.02em",
                      fontFamily: "'Inter', 'Helvetica Neue', sans-serif", flexShrink: 0, whiteSpace: "nowrap",
                    }}>
                      {t}
                      {topicCounts[t] > 0 && (
                        <span style={{ marginLeft: 5, opacity: 0.6, fontWeight: 500 }}>({topicCounts[t]})</span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Stories grid */}
              {filteredStories.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 24px", color: "var(--text-muted)", fontSize: 15 }}>
                  No stories match your search.{" "}
                  <button onClick={() => { setSearchQuery(""); setActiveTag(null); }} style={{
                    background: "none", border: "none", color: "var(--gold)", cursor: "pointer", fontSize: 15, fontWeight: 600,
                  }}>Clear filters</button>
                </div>
              ) : (
                <div style={{
                  display: compact ? "flex" : "grid",
                  flexDirection: compact ? "column" : undefined,
                  gridTemplateColumns: !compact && !isMobile ? "repeat(auto-fill, minmax(340px, 1fr))" : "1fr",
                  gap: compact ? 6 : (isMobile ? 12 : 14),
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
                      compact={compact}
                      isTrending={trendingTopics.has(story.topic)}
                    />
                  ))}
                </div>
              )}

              <WatchList items={digest.watchList} />

              {/* Email subscribe */}
              <div style={{
                marginTop: 48, background: "var(--bg-card)", border: "1px solid var(--border)",
                borderRadius: 12, padding: "24px 28px",
                display: "flex", flexDirection: isMobile ? "column" : "row",
                alignItems: isMobile ? "flex-start" : "center", gap: 16,
              }} className="no-print">
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
                    📬 Get Daily Intel in your inbox
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                    Finance, health, tech &amp; more — curated by AI every morning.
                  </div>
                </div>
                {subState === "done" ? (
                  <span style={{ color: "var(--gold)", fontWeight: 600, fontSize: 14 }}>✓ You&apos;re subscribed!</span>
                ) : (
                  <form onSubmit={handleSubscribe} style={{ display: "flex", gap: 8, width: isMobile ? "100%" : "auto" }}>
                    <input
                      type="email" placeholder="your@email.com" value={email}
                      onChange={e => setEmail(e.target.value)} required
                      style={{
                        padding: "8px 14px", borderRadius: 8, border: "1px solid var(--border)",
                        background: "var(--bg-card)", color: "var(--text-primary)", fontSize: 13, outline: "none",
                        fontFamily: "'Inter', sans-serif", flex: isMobile ? 1 : undefined, width: isMobile ? undefined : 220,
                      }}
                    />
                    <button type="submit" disabled={subState === "loading"} style={{
                      background: "var(--gold)", color: "#fff", border: "none",
                      padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600,
                      cursor: subState === "loading" ? "default" : "pointer",
                      opacity: subState === "loading" ? 0.7 : 1,
                    }}>{subState === "loading" ? "…" : "Subscribe"}</button>
                  </form>
                )}
              </div>

              {/* Footer */}
              <div style={{
                marginTop: 48, paddingTop: 24, borderTop: "1px solid var(--footer-border)",
                display: "flex", justifyContent: isMobile ? "center" : "space-between",
                alignItems: "center", flexWrap: "wrap", gap: 8,
                flexDirection: isMobile ? "column" : "row",
              }}>
                <span style={{ color: "var(--text-muted)", fontSize: 13 }}>Daily Intel · AI-curated market intelligence</span>
                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                  <a href="/api/rss" target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>RSS Feed</a>
                  {digest.postedAt && (
                    <span style={{ color: "var(--text-muted)", fontSize: 13 }}>
                      Posted{" "}
                      {new Date(digest.postedAt).toLocaleTimeString("en-US", {
                        hour: "2-digit", minute: "2-digit", timeZoneName: "short",
                      })}
                    </span>
                  )}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </>
  );
}
