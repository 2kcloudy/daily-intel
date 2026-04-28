"use client";
import { useState, useMemo, useEffect, useRef } from "react";
import { StoryList } from "./di/Stories";
import { FilterDrawer, Footer } from "./di/Chrome";
import ProtoTweaks from "./ProtoTweaks";
import { buildFinanceData } from "./di/dataTransform";

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

/* ── Categories dropdown ────────────────────────────────────── */
const CATEGORY_LINKS = [
  { label: "News",               href: "#" },
  { label: "Podcasts",           href: "#" },
  { label: "Newsletters",        href: "#" },
  { label: "13F Reports",        href: "#" },
  { label: "Shareholder Letters",href: "#" },
];

function CategoriesDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

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
        Categories
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
          minWidth: 190,
          padding: "6px 0",
          overflow: "hidden",
        }}>
          {CATEGORY_LINKS.map(c => (
            <a
              key={c.label}
              href={c.href}
              onClick={() => setOpen(false)}
              style={{
                display: "block",
                padding: "9px 16px",
                fontSize: 13, fontWeight: 500,
                color: "var(--di-ink, #0c0d10)",
                fontFamily: "var(--di-font-ui, Inter, sans-serif)",
                textDecoration: "none",
                transition: "background 0.1s ease",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "var(--di-paper-2, #f4f4f0)"}
              onMouseLeave={e => e.currentTarget.style.background = ""}
            >
              {c.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Main header ────────────────────────────────────────────── */
function BaysFilterHeader() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  function handleSubscribe(e) {
    e.preventDefault();
    if (email.trim()) { setSubscribed(true); setEmail(""); }
  }

  return (
    <header style={{
      background: "var(--di-paper, #fafaf7)",
      padding: "0 40px",
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 24,
        height: 68,
        maxWidth: 1400,
        margin: "0 auto",
      }}>

        {/* Left — logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          <BaysFilterIcon size={42} />
          <span style={{
            fontFamily: "var(--di-font-ui, Inter, sans-serif)",
            fontWeight: 900,
            fontSize: 22,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "var(--di-ink, #0c0d10)",
            lineHeight: 1,
          }}>
            Bay's Filter
          </span>
        </div>

        {/* Center — nav */}
        <nav style={{
          display: "flex", alignItems: "center", gap: 28,
          fontFamily: "var(--di-font-ui, Inter, sans-serif)",
        }}>
          {["About", "Archive"].map(label => (
            <a
              key={label}
              href="#"
              style={{
                fontSize: 13, fontWeight: 600, letterSpacing: "0.03em",
                color: "var(--di-ink, #0c0d10)", textDecoration: "none",
                transition: "color 0.12s ease",
              }}
              onMouseEnter={e => e.currentTarget.style.color = "var(--di-accent, #008533)"}
              onMouseLeave={e => e.currentTarget.style.color = "var(--di-ink, #0c0d10)"}
            >
              {label}
            </a>
          ))}
          <CategoriesDropdown />
        </nav>

        {/* Right — email signup */}
        {!subscribed ? (
          <form
            onSubmit={handleSubscribe}
            style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}
          >
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{
                height: 36,
                padding: "0 14px",
                border: "1px solid var(--di-line, #e4e7ec)",
                borderRadius: 999,
                fontSize: 13,
                fontFamily: "var(--di-font-ui, Inter, sans-serif)",
                color: "var(--di-ink, #0c0d10)",
                background: "var(--di-card, #fff)",
                outline: "none",
                width: 200,
                transition: "border-color 0.15s ease",
              }}
              onFocus={e => e.target.style.borderColor = "#29B6F6"}
              onBlur={e => e.target.style.borderColor = "var(--di-line, #e4e7ec)"}
            />
            <button
              type="submit"
              style={{
                height: 36,
                padding: "0 16px",
                background: "#29B6F6",
                border: "none",
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "#fff",
                cursor: "pointer",
                fontFamily: "var(--di-font-ui, Inter, sans-serif)",
                transition: "background 0.15s ease",
                flexShrink: 0,
              }}
              onMouseEnter={e => e.currentTarget.style.background = "#039BE5"}
              onMouseLeave={e => e.currentTarget.style.background = "#29B6F6"}
            >
              Sign Up
            </button>
          </form>
        ) : (
          <span style={{
            fontSize: 12, fontWeight: 600, color: "var(--di-accent, #008533)",
            fontFamily: "var(--di-font-ui, Inter, sans-serif)",
          }}>
            ✓ You're in!
          </span>
        )}
      </div>
    </header>
  );
}

/* ── Topic pill row ─────────────────────────────────────────── */
const TOPIC_PILLS = [
  "Technology", "Macro", "Stock Ideas", "Commodities", "Stock Market", "Trading Ideas",
];

function TopicPills({ active, onSelect }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
      padding: "14px 40px 16px",
      maxWidth: 1400, margin: "0 auto",
    }}>
      {TOPIC_PILLS.map(label => {
        const isActive = active === label;
        return (
          <button
            key={label}
            onClick={() => onSelect(isActive ? null : label)}
            style={{
              height: 34,
              padding: "0 18px",
              borderRadius: 999,
              border: isActive ? "1.5px solid #29B6F6" : "1.5px solid var(--di-line, #e4e7ec)",
              background: isActive ? "#29B6F6" : "var(--di-card, #fff)",
              color: isActive ? "#fff" : "var(--di-ink, #0c0d10)",
              fontFamily: "var(--di-font-ui, Inter, sans-serif)",
              fontSize: 13, fontWeight: isActive ? 700 : 500,
              cursor: "pointer",
              letterSpacing: "0.01em",
              transition: "all 0.15s ease",
              boxShadow: isActive
                ? "0 2px 8px rgba(41,182,246,0.3)"
                : "0 1px 3px rgba(2,4,12,0.06)",
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

/* ── Prototype banner (matches other prototypes) ────────────── */
function ProtoBanner() {
  return (
    <div style={{
      position: "sticky", top: 0, zIndex: 9999,
      background: "#0c0d10",
      borderBottom: "2px solid #29B6F6",
      display: "flex", alignItems: "center",
      justifyContent: "space-between",
      padding: "0 24px",
      height: 44,
      fontFamily: "var(--di-font-ui, sans-serif)",
      gap: 16,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <a href="/prototypes" style={{
          fontSize: 11, fontWeight: 600, letterSpacing: "0.1em",
          textTransform: "uppercase", color: "#787f8c", textDecoration: "none",
        }}>
          ← All Prototypes
        </a>
        <span style={{ width: 1, height: 16, background: "#2a2e36" }} />
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 7,
          fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
          textTransform: "uppercase", color: "#29B6F6",
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: "50%",
            background: "#29B6F6", display: "inline-block",
            animation: "pulse 2s infinite",
          }} />
          Prototype · Header Tweak
        </span>
      </div>
      <a href="/" style={{
        fontSize: 11, fontWeight: 600, letterSpacing: "0.08em",
        textTransform: "uppercase", color: "#787f8c", textDecoration: "none",
      }}>
        Live Site →
      </a>
    </div>
  );
}

/* ── Tweaks panel (proto) ───────────────────────────────────── */
function HeaderTweaksTweaks({ onClose }) {
  return <ProtoTweaks onClose={onClose} initialGlassStyle="rounded" />;
}

/* ── Main view ──────────────────────────────────────────────── */
export default function HeaderTweakView({ digest, allDates }) {
  const financeData = buildFinanceData(digest, allDates);
  const stories = financeData?.stories || [];

  const [activePill, setActivePill] = useState(null);
  const [openStory, setOpenStory] = useState(null);
  const [showTweaks, setShowTweaks] = useState(false);
  const [activeTag, setActiveTag] = useState("all");

  // Font / radius from ProtoTweaks — applied via CSS vars, nothing extra needed here

  const tagCounts = useMemo(() => {
    const c = {};
    stories.forEach(s => {
      const t = s.tag || s.topic;
      if (t) c[t] = (c[t] || 0) + 1;
    });
    return c;
  }, [stories]);

  const tags = useMemo(() => [
    { id: "all", label: "All", count: stories.length },
    ...Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).map(([id, count]) => ({
      id: id.toLowerCase(), label: id, count,
    })),
  ], [tagCounts, stories.length]);

  // Combined filter: tag drawer + topic pill
  const filtered = useMemo(() => {
    let result = stories;
    if (activeTag !== "all") {
      result = result.filter(s => (s.tag || s.topic || "").toLowerCase() === activeTag);
    }
    if (activePill) {
      result = result.filter(s => {
        const t = (s.tag || s.topic || "").toLowerCase();
        return t === activePill.toLowerCase();
      });
    }
    return result;
  }, [stories, activeTag, activePill]);

  // Keyboard "/" → open story detail or search
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape" && openStory) setOpenStory(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openStory]);

  return (
    <>
      <ProtoBanner />
      <BaysFilterHeader />

      {/* Horizontal rule */}
      <hr style={{
        border: "none",
        borderTop: "1px solid var(--di-line, #e4e7ec)",
        margin: 0,
      }} />

      {/* Topic pills */}
      <div style={{ background: "var(--di-paper, #fafaf7)", paddingBottom: 4 }}>
        <TopicPills active={activePill} onSelect={setActivePill} />
      </div>

      {/* Second rule to visually separate pills from stories */}
      <hr style={{
        border: "none",
        borderTop: "1px solid var(--di-line, #e4e7ec)",
        margin: 0,
      }} />

      {/* Story grid */}
      <main style={{ padding: "32px 40px 80px", maxWidth: 1400, margin: "0 auto" }}>
        <StoryList
          stories={filtered}
          compact={false}
          onOpen={setOpenStory}
          layout="image-top"
        />
      </main>

      {/* Filter drawer (left side) */}
      <FilterDrawer tags={tags} active={activeTag} onSelect={setActiveTag} />

      {/* Footer */}
      <Footer onNav={() => {}} />

      {/* Tweaks toggle */}
      {!showTweaks && (
        <button className="di-tweaks-toggle" onClick={() => setShowTweaks(true)} title="Design tweaks">
          Tweaks
        </button>
      )}
      {showTweaks && (
        <HeaderTweaksTweaks onClose={() => setShowTweaks(false)} />
      )}

      {/* Story detail modal */}
      {openStory && (
        <div
          onClick={() => setOpenStory(null)}
          style={{
            position: "fixed", inset: 0, zIndex: 8000,
            background: "rgba(0,0,0,0.55)", display: "flex",
            alignItems: "flex-start", justifyContent: "center",
            padding: "60px 24px 24px", overflowY: "auto",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "var(--di-card, #fff)",
              borderRadius: "var(--di-glass-radius, 22px)",
              maxWidth: 720, width: "100%",
              padding: "40px 44px 44px",
              boxShadow: "0 8px 48px rgba(2,4,12,0.28)",
            }}
          >
            <button
              onClick={() => setOpenStory(null)}
              style={{
                float: "right", background: "none", border: "none",
                fontSize: 24, cursor: "pointer", color: "var(--di-ink-4)",
                lineHeight: 1, padding: 0,
              }}
            >×</button>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase",
              letterSpacing: "0.1em", color: "#29B6F6", marginBottom: 12 }}>
              {openStory.tag || openStory.topic}
            </div>
            <h2 style={{
              fontFamily: "var(--di-font-head, var(--di-font-serif))",
              fontWeight: 700, fontSize: 26, lineHeight: 1.25,
              color: "var(--di-ink)", margin: "0 0 12px",
            }}>
              {openStory.headline}
            </h2>
            {openStory.sub && (
              <p style={{ fontSize: 16, color: "var(--di-ink-3)", margin: "0 0 16px",
                fontFamily: "var(--di-font-body, var(--di-font-serif))", lineHeight: 1.55 }}>
                {openStory.sub}
              </p>
            )}
            {openStory.body && (
              <p style={{ fontSize: 15, color: "var(--di-ink-2)", margin: "0 0 20px",
                fontFamily: "var(--di-font-body, var(--di-font-serif))", lineHeight: 1.65 }}>
                {openStory.body}
              </p>
            )}
            <a
              href={openStory.url}
              target="_blank" rel="noopener"
              style={{
                display: "inline-block",
                padding: "10px 20px", borderRadius: 999,
                background: "#29B6F6", color: "#fff",
                fontFamily: "var(--di-font-ui)", fontWeight: 700,
                fontSize: 12, letterSpacing: "0.06em", textTransform: "uppercase",
                textDecoration: "none",
              }}
            >
              Read Full Story →
            </a>
          </div>
        </div>
      )}
    </>
  );
}
