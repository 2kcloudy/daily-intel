"use client";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { FilterDrawer, Footer } from "./di/Chrome";
import ProtoTweaks from "./ProtoTweaks";
import { buildFinanceData, transformFinanceStory } from "./di/dataTransform";
import { storyImg } from "./di/dataTransform";

/* ── Bay's Filter icon (funnel in circle) ───────────────────── */
function BaysFilterIcon({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="20" fill="#29B6F6" />
      <path
        d="M10 11h20l-8 10v8l-4-2V21L10 11z"
        fill="white"
        stroke="white"
        strokeWidth="0.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ── Categories dropdown — checkbox multi-select ────────────── */
const CAT_ITEMS = ["News", "Podcasts", "Newsletters", "13F Reports", "Shareholder Letters"];

function CategoriesDropdown() {
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState(() => new Set(CAT_ITEMS));
  const ref = useRef(null);

  const allChecked = checked.size === CAT_ITEMS.length;
  const someChecked = checked.size > 0 && !allChecked;

  useEffect(() => {
    function onMouse(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onMouse);
    return () => document.removeEventListener("mousedown", onMouse);
  }, []);

  function toggleAll() {
    setChecked(allChecked ? new Set() : new Set(CAT_ITEMS));
  }
  function toggleItem(label) {
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label); else next.add(label);
      return next;
    });
  }

  const triggerLabel = allChecked
    ? "Categories"
    : checked.size === 0 ? "Categories (none)" : `Categories (${checked.size})`;

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          background: "none", border: "none", cursor: "pointer",
          fontSize: 13, fontWeight: 600, letterSpacing: "0.03em",
          color: "var(--di-ink, #0c0d10)",
          fontFamily: "var(--di-font-ui, Inter, sans-serif)",
          display: "flex", alignItems: "center", gap: 4,
          padding: "4px 0",
        }}
      >
        {triggerLabel}
        <span style={{
          fontSize: 9, display: "inline-block",
          transform: open ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform 0.15s ease",
          color: "var(--di-ink-4, #787f8c)",
        }}>▼</span>
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", left: 0, zIndex: 999,
          background: "var(--di-card, #fff)",
          border: "1px solid var(--di-line, #e4e7ec)",
          borderRadius: 8,
          boxShadow: "0 4px 16px rgba(2,4,12,0.12), 0 1px 4px rgba(2,4,12,0.06)",
          minWidth: 210,
          padding: "6px 0",
        }}>
          <label style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "9px 16px", cursor: "pointer",
            fontFamily: "var(--di-font-ui, Inter, sans-serif)",
            fontSize: 13, fontWeight: 700,
            color: "var(--di-ink, #0c0d10)",
            borderBottom: "1px solid var(--di-line, #e4e7ec)",
            marginBottom: 4,
          }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--di-paper-2, #f4f4f0)"}
            onMouseLeave={e => e.currentTarget.style.background = ""}
          >
            <input
              type="checkbox"
              checked={allChecked}
              ref={el => { if (el) el.indeterminate = someChecked; }}
              onChange={toggleAll}
              style={{ width: 15, height: 15, cursor: "pointer", accentColor: "#29B6F6" }}
            />
            All
          </label>

          {CAT_ITEMS.map(label => (
            <label
              key={label}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "8px 16px", cursor: "pointer",
                fontFamily: "var(--di-font-ui, Inter, sans-serif)",
                fontSize: 13, fontWeight: 500,
                color: "var(--di-ink, #0c0d10)",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "var(--di-paper-2, #f4f4f0)"}
              onMouseLeave={e => e.currentTarget.style.background = ""}
            >
              <input
                type="checkbox"
                checked={checked.has(label)}
                onChange={() => toggleItem(label)}
                style={{ width: 15, height: 15, cursor: "pointer", accentColor: "#29B6F6" }}
              />
              {label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Search bubble ──────────────────────────────────────────── */
function SearchBubble({ query, onChange }) {
  const [open, setOpen] = useState(false);
  const inputRef = useRef(null);

  function handleOpen() {
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  }
  function handleClose() {
    if (!query) setOpen(false);
  }
  function handleClear() {
    onChange("");
    setOpen(false);
  }

  if (open) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{
          display: "flex", alignItems: "center",
          height: 32, padding: "0 12px",
          border: "1.5px solid #29B6F6",
          borderRadius: 999,
          background: "var(--di-card, #fff)",
          boxShadow: "0 0 0 3px rgba(41,182,246,0.12)",
        }}>
          <span style={{ fontSize: 13, marginRight: 6, color: "var(--di-ink-4)" }}>⌕</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => onChange(e.target.value)}
            onBlur={handleClose}
            placeholder="Search stories…"
            style={{
              border: "none", outline: "none", background: "transparent",
              fontSize: 13, fontFamily: "var(--di-font-ui, Inter, sans-serif)",
              color: "var(--di-ink, #0c0d10)", width: 160,
            }}
          />
        </div>
        {query && (
          <button onClick={handleClear} style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: 18, color: "var(--di-ink-4)", lineHeight: 1, padding: 0,
          }}>×</button>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={handleOpen}
      style={{
        display: "flex", alignItems: "center", gap: 5,
        height: 32, padding: "0 14px",
        border: "1.5px solid var(--di-line, #e4e7ec)",
        borderRadius: 999, background: "var(--di-card, #fff)",
        fontSize: 13, fontWeight: 600, letterSpacing: "0.02em",
        color: "var(--di-ink, #0c0d10)", cursor: "pointer",
        fontFamily: "var(--di-font-ui, Inter, sans-serif)",
        transition: "border-color 0.12s ease",
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = "#29B6F6"}
      onMouseLeave={e => e.currentTarget.style.borderColor = "var(--di-line, #e4e7ec)"}
    >
      <span style={{ fontSize: 15 }}>⌕</span> Search
    </button>
  );
}

/* ── Compact header: logo + nav + signup ───────────────────── */
function BaysFilterHeader({ searchQuery, onSearchChange }) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  function handleSubscribe(e) {
    e.preventDefault();
    if (email.trim()) { setSubscribed(true); setEmail(""); }
  }

  return (
    <header style={{ background: "var(--di-paper, #fafaf7)", borderBottom: "1px solid var(--di-line, #e4e7ec)" }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 24, maxWidth: 1400, margin: "0 auto", padding: "0 40px",
        height: 88,
      }}>
        {/* Left — logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
          <div style={{ flexShrink: 0 }}>
            <BaysFilterIcon size={48} />
          </div>
          <span style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontWeight: 900,
            fontSize: 52,
            letterSpacing: "0.02em",
            textTransform: "uppercase",
            color: "var(--di-ink, #0c0d10)",
            lineHeight: "0.85",
          }}>
            Bay's Filter
          </span>
        </div>

        {/* Right — nav + signup */}
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <nav style={{ display: "flex", alignItems: "center", gap: 28, fontFamily: "var(--di-font-ui, Inter, sans-serif)" }}>
            <a href="#" style={{
              fontSize: 13, fontWeight: 600, letterSpacing: "0.03em",
              color: "var(--di-ink, #0c0d10)", textDecoration: "none",
              transition: "color 0.12s ease",
            }}
              onMouseEnter={e => e.currentTarget.style.color = "#29B6F6"}
              onMouseLeave={e => e.currentTarget.style.color = "var(--di-ink, #0c0d10)"}
            >
              About
            </a>
            <CategoriesDropdown />
            <SearchBubble query={searchQuery} onChange={onSearchChange} />
          </nav>

          {/* Inline email signup */}
          {!subscribed ? (
            <form onSubmit={handleSubscribe} style={{
              display: "flex", alignItems: "center",
              background: "#fff",
              border: "1px solid var(--di-line, #e4e7ec)",
              borderRadius: 999,
              overflow: "hidden",
              height: 38,
              flexShrink: 0,
            }}>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={{
                  height: "100%", padding: "0 14px",
                  border: "none", outline: "none", background: "transparent",
                  fontSize: 13, fontFamily: "var(--di-font-ui, Inter, sans-serif)",
                  color: "var(--di-ink, #0c0d10)",
                  width: 180, minWidth: 0,
                }}
              />
              <button type="submit" style={{
                height: "100%", padding: "0 16px",
                background: "#29B6F6", border: "none",
                fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
                textTransform: "uppercase", color: "#fff", cursor: "pointer",
                fontFamily: "var(--di-font-ui, Inter, sans-serif)",
                transition: "background 0.15s ease", flexShrink: 0,
                whiteSpace: "nowrap",
              }}
                onMouseEnter={e => e.currentTarget.style.background = "#039BE5"}
                onMouseLeave={e => e.currentTarget.style.background = "#29B6F6"}
              >
                Sign Up →
              </button>
            </form>
          ) : (
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "#e8f7ee", border: "1px solid #a8dbbe",
              borderRadius: 999, padding: "0 16px", height: 38, flexShrink: 0,
            }}>
              <span style={{ fontSize: 13 }}>✓</span>
              <span style={{
                fontSize: 12, fontWeight: 600, color: "#007a3d",
                fontFamily: "var(--di-font-ui, Inter, sans-serif)",
              }}>You're in!</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

/* ── Topic pill row ─────────────────────────────────────────── */
const TOPIC_PILLS = ["Technology", "Macro", "Stock Ideas", "Commodities", "Stock Market", "Trading Ideas"];

function TopicPills({ active, onSelect }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
      maxWidth: 1400, margin: "0 auto",
      padding: "10px 40px 10px",
    }}>
      {TOPIC_PILLS.map(label => {
        const isActive = active === label;
        return (
          <button
            key={label}
            onClick={() => onSelect(isActive ? null : label)}
            style={{
              height: 32, padding: "0 16px", borderRadius: 999,
              border: isActive ? "1.5px solid #29B6F6" : "1.5px solid var(--di-line, #e4e7ec)",
              background: isActive ? "#29B6F6" : "var(--di-card, #fff)",
              color: isActive ? "#fff" : "var(--di-ink, #0c0d10)",
              fontFamily: "var(--di-font-ui, Inter, sans-serif)",
              fontSize: 13, fontWeight: isActive ? 700 : 500,
              cursor: "pointer", letterSpacing: "0.01em",
              transition: "all 0.15s ease",
              boxShadow: isActive ? "0 2px 8px rgba(41,182,246,0.3)" : "0 1px 3px rgba(2,4,12,0.06)",
            }}
            onMouseEnter={e => {
              if (!isActive) {
                e.currentTarget.style.borderColor = "#29B6F6";
                e.currentTarget.style.color = "#29B6F6";
              }
            }}
            onMouseLeave={e => {
              if (!isActive) {
                e.currentTarget.style.borderColor = "var(--di-line, #e4e7ec)";
                e.currentTarget.style.color = "var(--di-ink, #0c0d10)";
              }
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

/* ── Story card — direct link, no modal ─────────────────────── */
function HTStoryCard({ story }) {
  const [imgFailed, setImgFailed] = useState(false);
  const [retries, setRetries] = useState(0);
  const tag = story.tag || story.topic || "";

  const imgSrc = retries === 0
    ? (story.image || `/api/image?seed=${story.seed || 0}&tag=${encodeURIComponent(tag)}&headline=${encodeURIComponent((story.headline || "").slice(0, 80))}&w=900&h=600`)
    : `/api/image?seed=${story.seed || 0}&tag=${encodeURIComponent(tag)}&headline=${encodeURIComponent((story.headline || "").slice(0, 80))}&w=900&h=600&_r=${retries}`;

  function handleImgError() {
    if (retries < 2) setTimeout(() => setRetries(r => r + 1), 2000 * (retries + 1));
    else setImgFailed(true);
  }

  return (
    <article style={{
      border: "1px solid rgba(15, 18, 32, 0.22)",
      borderRadius: "var(--di-glass-radius, 6px)",
      overflow: "hidden",
      background: "var(--di-card, #fff)",
      display: "flex", flexDirection: "column",
      transition: "box-shadow 0.15s ease",
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 20px rgba(2,4,12,0.12)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
    >
      {/* Image */}
      <div style={{ position: "relative", paddingTop: "58%", overflow: "hidden", background: "#f0f2f5", flexShrink: 0 }}>
        {!imgFailed ? (
          <img
            key={retries}
            src={imgSrc}
            alt=""
            loading="lazy"
            onError={handleImgError}
            style={{
              position: "absolute", inset: 0, width: "100%", height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(135deg, #111827 0%, #1f2937 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              {tag.slice(0, 2)}
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: "16px 18px 18px", flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Tag label */}
        <div style={{
          fontSize: 10, fontWeight: 700, textTransform: "uppercase",
          letterSpacing: "0.1em", color: "#29B6F6", marginBottom: 8,
        }}>
          {tag}
        </div>

        {/* Headline — direct link, no modal */}
        <h3 style={{
          fontFamily: "var(--di-font-ui, Inter, sans-serif)",
          fontWeight: 700, fontSize: 16, lineHeight: 1.3,
          margin: "0 0 10px", flex: "0 0 auto",
        }}>
          <a
            href={story.url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--di-ink, #0c0d10)", textDecoration: "none" }}
            onMouseEnter={e => e.currentTarget.style.color = "#29B6F6"}
            onMouseLeave={e => e.currentTarget.style.color = "var(--di-ink, #0c0d10)"}
          >
            {story.headline}
          </a>
        </h3>

        {/* Summary */}
        <p style={{
          fontFamily: "var(--di-font-ui, Inter, sans-serif)",
          fontSize: 13, color: "var(--di-ink-3, #4a5261)", lineHeight: 1.6,
          margin: "0 0 16px", flex: 1,
        }}>
          {story.body || story.sub || ""}
        </p>

        {/* Footer */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <span style={{
            fontSize: 11, color: "var(--di-ink-4, #787f8c)",
            fontFamily: "var(--di-font-ui, Inter, sans-serif)", fontWeight: 500,
          }}>
            {story.source}
          </span>
          <a
            href={story.url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: 11, fontWeight: 700, color: "#29B6F6",
              textDecoration: "none",
              padding: "5px 12px",
              border: "1.5px solid #29B6F6",
              borderRadius: 999,
              fontFamily: "var(--di-font-ui, Inter, sans-serif)",
              letterSpacing: "0.04em",
              transition: "background 0.12s ease, color 0.12s ease",
              flexShrink: 0,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "#29B6F6";
              e.currentTarget.style.color = "#fff";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#29B6F6";
            }}
          >
            Read Story →
          </a>
        </div>
      </div>
    </article>
  );
}

/* ── Story grid ─────────────────────────────────────────────── */
function HTStoryGrid({ stories }) {
  if (!stories.length) return (
    <p style={{ textAlign: "center", color: "var(--di-ink-4)", padding: "60px 0", fontFamily: "var(--di-font-ui, Inter, sans-serif)" }}>
      No stories match your filter.
    </p>
  );
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: 20,
    }}>
      {stories.map((s, i) => (
        <HTStoryCard key={`${s.rank || i}-${s.headline?.slice(0, 20)}`} story={s} />
      ))}
    </div>
  );
}

/* ── Prototype banner ───────────────────────────────────────── */
function ProtoBanner() {
  return (
    <div style={{
      position: "sticky", top: 0, zIndex: 9999,
      background: "#0c0d10", borderBottom: "2px solid #29B6F6",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 24px", height: 44,
      fontFamily: "var(--di-font-ui, sans-serif)", gap: 16,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <a href="/prototypes" style={{
          fontSize: 11, fontWeight: 600, letterSpacing: "0.1em",
          textTransform: "uppercase", color: "#787f8c", textDecoration: "none",
        }}>← All Prototypes</a>
        <span style={{ width: 1, height: 16, background: "#2a2e36" }} />
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 7,
          fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
          textTransform: "uppercase", color: "#29B6F6",
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: "50%", background: "#29B6F6",
            display: "inline-block", animation: "pulse 2s infinite",
          }} />
          Prototype · Header Tweak
        </span>
      </div>
      <a href="/" style={{
        fontSize: 11, fontWeight: 600, letterSpacing: "0.08em",
        textTransform: "uppercase", color: "#787f8c", textDecoration: "none",
      }}>Live Site →</a>
    </div>
  );
}

/* ── Main view ──────────────────────────────────────────────── */
export default function HeaderTweakView({ digest, allDates }) {
  const financeData = buildFinanceData(digest, allDates);
  const baseStories = financeData?.stories || [];

  // Endless scroll state
  const [allStories, setAllStories] = useState(baseStories);
  const [nextDateIdx, setNextDateIdx] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState((allDates || []).length > 1);
  const sentinelRef = useRef(null);

  // Filters & search
  const [activePill, setActivePill] = useState(null);
  const [activeTag, setActiveTag] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showTweaks, setShowTweaks] = useState(false);

  // Apply flat style immediately
  useEffect(() => {
    document.documentElement.style.setProperty("--di-glass-radius", "6px");
    document.documentElement.style.setProperty("--di-card-shadow", "none");
    document.documentElement.style.setProperty("--di-card-hover-shadow", "none");
    document.documentElement.style.setProperty("--di-card-border", "rgba(15, 18, 32, 0.22)");
  }, []);

  // Endless scroll — load older digests when sentinel enters viewport
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore || !allDates || nextDateIdx >= allDates.length) {
      if (nextDateIdx >= (allDates || []).length) setHasMore(false);
      return;
    }
    setIsLoadingMore(true);
    try {
      const date = allDates[nextDateIdx];
      const res = await fetch(`/api/digest/${date}`);
      if (res.ok) {
        const older = await res.json();
        const newStories = (older.stories || []).map((s, i) => transformFinanceStory(s, i));
        setAllStories(prev => [...prev, ...newStories]);
        setNextDateIdx(n => n + 1);
        if (nextDateIdx + 1 >= allDates.length) setHasMore(false);
      } else {
        setHasMore(false);
      }
    } catch {
      setHasMore(false);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, allDates, nextDateIdx]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) loadMore();
    }, { rootMargin: "200px" });
    obs.observe(el);
    return () => obs.disconnect();
  }, [loadMore]);

  // Filtering
  const tagCounts = useMemo(() => {
    const c = {};
    allStories.forEach(s => { const t = s.tag || s.topic; if (t) c[t] = (c[t] || 0) + 1; });
    return c;
  }, [allStories]);

  const tags = useMemo(() => [
    { id: "all", label: "All", count: allStories.length },
    ...Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).map(([id, count]) => ({
      id: id.toLowerCase(), label: id, count,
    })),
  ], [tagCounts, allStories.length]);

  const filtered = useMemo(() => {
    let result = allStories;
    if (activeTag !== "all") {
      result = result.filter(s => (s.tag || s.topic || "").toLowerCase() === activeTag);
    }
    if (activePill) {
      result = result.filter(s => (s.tag || s.topic || "").toLowerCase() === activePill.toLowerCase());
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s =>
        (s.headline || "").toLowerCase().includes(q) ||
        (s.body || "").toLowerCase().includes(q) ||
        (s.tag || "").toLowerCase().includes(q)
      );
    }
    return result;
  }, [allStories, activeTag, activePill, searchQuery]);

  return (
    <>
      <ProtoBanner />
      <BaysFilterHeader searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      {/* Topic pills */}
      <div style={{ background: "var(--di-paper, #fafaf7)" }}>
        <TopicPills active={activePill} onSelect={setActivePill} />
      </div>

      {/* Story grid */}
      <main style={{ padding: "8px 40px 80px", maxWidth: 1400, margin: "0 auto" }}>
        <HTStoryGrid stories={filtered} />

        {/* Endless scroll sentinel */}
        <div ref={sentinelRef} style={{ height: 1, marginTop: 40 }} />

        {isLoadingMore && (
          <div style={{
            textAlign: "center", padding: "24px 0 48px",
            fontFamily: "var(--di-font-ui, Inter, sans-serif)",
            fontSize: 13, color: "var(--di-ink-4, #787f8c)",
          }}>
            Loading more stories…
          </div>
        )}

        {!hasMore && allStories.length > 0 && (
          <div style={{
            textAlign: "center", padding: "24px 0 48px",
            fontFamily: "var(--di-font-ui, Inter, sans-serif)",
            fontSize: 12, color: "var(--di-ink-4, #787f8c)",
            letterSpacing: "0.06em", textTransform: "uppercase",
          }}>
            — End of archive —
          </div>
        )}
      </main>

      <FilterDrawer tags={tags} active={activeTag} onSelect={setActiveTag} />
      <Footer onNav={() => {}} />

      {!showTweaks && (
        <button className="di-tweaks-toggle" onClick={() => setShowTweaks(true)} title="Design tweaks">
          Tweaks
        </button>
      )}
      {showTweaks && (
        <ProtoTweaks onClose={() => setShowTweaks(false)} initialGlassStyle="flat" />
      )}
    </>
  );
}
