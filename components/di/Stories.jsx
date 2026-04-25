"use client";
import { useState } from "react";
import { storyImg } from "./dataTransform";

// Gradient fallbacks keyed by tag — show a beautiful colour field when image fails
const TAG_GRADIENTS = {
  markets:     "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)",
  ai:          "linear-gradient(135deg, #1a0533 0%, #4a148c 50%, #7b1fa2 100%)",
  tech:        "linear-gradient(135deg, #0d1b2a 0%, #1a3a5c 50%, #1e5799 100%)",
  earnings:    "linear-gradient(135deg, #1a1200 0%, #4a3500 50%, #7a5800 100%)",
  energy:      "linear-gradient(135deg, #0a1628 0%, #1b3a2c 50%, #2e7d32 100%)",
  crypto:      "linear-gradient(135deg, #1a0e00 0%, #4a2800 50%, #c56a00 100%)",
  defense:     "linear-gradient(135deg, #1a1a1a 0%, #2a3a2a 50%, #3a4a3a 100%)",
  macro:       "linear-gradient(135deg, #0c1445 0%, #1a2a6c 50%, #2e4490 100%)",
  policy:      "linear-gradient(135deg, #0a0e2e 0%, #1a2050 50%, #243b8a 100%)",
  health:      "linear-gradient(135deg, #001a0e 0%, #003d1f 50%, #00693a 100%)",
  world:       "linear-gradient(135deg, #1a0a00 0%, #3d1a00 50%, #7a3a00 100%)",
  startups:    "linear-gradient(135deg, #001a2c 0%, #00405c 50%, #006a8a 100%)",
  science:     "linear-gradient(135deg, #001a2e 0%, #002d50 50%, #005c8a 100%)",
  longevity:   "linear-gradient(135deg, #001a14 0%, #003326 50%, #00543e 100%)",
  performance: "linear-gradient(135deg, #1a1400 0%, #3d3000 50%, #6b5400 100%)",
  default:     "linear-gradient(135deg, #111827 0%, #1f2937 50%, #374151 100%)",
};

function tagGradient(tag) {
  const key = (tag || "").toLowerCase().replace(/[\s/+]+/g, "");
  return TAG_GRADIENTS[key] || TAG_GRADIENTS.default;
}

/** An image that retries once on failure, then falls back to a gradient */
function StoryImg({ story, width, height, className, style }) {
  const [retryCount, setRetryCount] = useState(0);
  const [failed, setFailed] = useState(false);
  const gradient = tagGradient(story.tag || story.topic);
  const initials = (story.tag || "?").slice(0, 2).toUpperCase();

  function handleError() {
    if (retryCount < 2) {
      // Retry after a short delay — Pollinations is sometimes slow on first hit
      setTimeout(() => setRetryCount(c => c + 1), 2000 * (retryCount + 1));
    } else {
      setFailed(true);
    }
  }

  // Build URL — add cache-buster on retries so the browser re-requests
  const src = retryCount === 0
    ? storyImg(story, width, height)
    : `${storyImg(story, width, height)}&_retry=${retryCount}`;

  if (failed) {
    return (
      <div style={{
        width: "100%", height: "100%",
        background: gradient,
        display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative",
        ...style,
      }}>
        <span style={{
          fontFamily: "var(--di-font-ui)", fontSize: "clamp(11px, 2vw, 13px)",
          fontWeight: 700, letterSpacing: "0.12em",
          color: "rgba(255,255,255,0.35)", textTransform: "uppercase",
        }}>{initials}</span>
      </div>
    );
  }

  return (
    <img
      key={retryCount}  // remount on retry to force fresh request
      src={src}
      alt=""
      loading="lazy"
      className={className}
      style={style}
      onError={handleError}
    />
  );
}

function TickerChips({ tickers = [] }) {
  if (!tickers.length) return null;
  return (
    <div className="di-tickers-row">
      {tickers.map((t, i) => (
        <span key={i} className="di-ticker-chip">
          <b>{t.sym}</b>
          <span className={t.dir === "up" ? "pos" : "neg"}>
            {t.dir === "up" ? "▲" : "▼"} {t.val}
          </span>
        </span>
      ))}
    </div>
  );
}

function StoryMeta({ rank, tag }) {
  const tagClass = (tag || "").toLowerCase().replace(/[\s/+]+/g, "");
  return (
    <div className="di-hero-meta">
      <span className="di-rank">№ {String(rank).padStart(2, "0")}</span>
      <span className={"di-cat-label " + tagClass}>— {tag}</span>
    </div>
  );
}

export function HeroStory({ story, onOpen }) {
  return (
    <div className="di-hero">
      <div className="di-hero-img" onClick={() => onOpen && onOpen(story)} style={{ cursor: "pointer" }}>
        <StoryImg story={story} width={900} height={700} />
      </div>
      <div className="di-hero-body">
        <StoryMeta rank={story.rank} tag={story.tag} />
        <h2 className="di-hero-head">
          <a href={story.url} target="_blank" rel="noopener" onClick={e => { e.preventDefault(); onOpen && onOpen(story); }}>
            {story.headline}
          </a>
        </h2>
        <p className="di-hero-sub">{story.sub}</p>
        <p className="di-hero-body-text">{story.body}</p>
        <TickerChips tickers={story.tickers} />
        <div className="di-hero-footer">
          <span className="di-source">{story.source}</span>
          <span className="di-read" onClick={() => onOpen && onOpen(story)}>
            Read Story →
          </span>
        </div>
      </div>
    </div>
  );
}

export function HeroFull({ story, onOpen }) {
  return (
    <div className="di-hero-full" onClick={() => onOpen && onOpen(story)}>
      <StoryMeta rank={story.rank} tag={story.tag} />
      <h2 className="di-hero-head">{story.headline}</h2>
      <p className="di-hero-sub">{story.sub}</p>
      <div className="di-hero-full-img">
        <StoryImg story={story} width={1400} height={600} />
      </div>
    </div>
  );
}

export function HeroTop3({ stories = [], onOpen }) {
  return (
    <div className="di-hero-dash-top3">
      {stories.slice(0, 3).map((s) => (
        <div key={s.rank} className="di-hero-top3-item" onClick={() => onOpen && onOpen(s)}>
          <div className="di-hero-top3-rank">{String(s.rank).padStart(2, "0")}</div>
          <div>
            <div className="di-hero-meta" style={{ marginBottom: 2 }}>
              <span className={"di-cat-label " + (s.tag || "").toLowerCase()}>— {s.tag}</span>
            </div>
            <h3 className="di-hero-top3-head">{s.headline}</h3>
            <p className="di-hero-top3-sub">{s.sub}</p>
            <TickerChips tickers={s.tickers} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function MarketPanel({ indices = [] }) {
  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return (
    <div className="di-market-panel">
      <div className="di-market-head">
        <h4>Market Board</h4>
        <span className="time">Live · {time}</span>
      </div>
      <div className="di-indices">
        {indices.slice(0, 8).map((i) => (
          <div key={i.label} className="di-idx">
            <span className="lbl">{i.label}</span>
            <span className="val">{i.value}</span>
            <span className={"chg " + (i.dir === "up" ? "pos" : "neg")}>
              {i.dir === "up" ? "▲" : "▼"} {i.pct}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function StoryCard({ story, compact, onOpen }) {
  return (
    <article className="di-story" onClick={() => onOpen && onOpen(story)}>
      {compact && <div className="di-rank-big">{String(story.rank).padStart(2, "0")}</div>}
      <div className="di-story-body">
        {!compact && <StoryMeta rank={story.rank} tag={story.tag} />}
        {compact && (
          <div className="di-hero-meta" style={{ marginBottom: 2 }}>
            <span className={"di-cat-label " + (story.tag || "").toLowerCase()}>{story.tag}</span>
          </div>
        )}
        <h3 className="di-story-head">
          <a href={story.url} target="_blank" rel="noopener"
             onClick={e => { e.preventDefault(); onOpen && onOpen(story); }}>
            {story.headline}
          </a>
        </h3>
        <p className="di-story-body-text">{story.body}</p>
        <div className="di-story-footer">
          <span className="di-source">{story.source}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {story.publishedAt && (
              <span style={{
                fontFamily: "var(--di-font-ui)", fontSize: 10, fontWeight: 600,
                color: "var(--di-accent)", textTransform: "uppercase", letterSpacing: "0.08em",
              }}>
                {(() => {
                  try {
                    const d = new Date(story.publishedAt);
                    const h = (Date.now() - d) / 3600000;
                    if (h < 6)  return `${Math.round(h)}h ago`;
                    if (h < 24) return "Today";
                    if (h < 48) return "Yesterday";
                    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                  } catch { return null; }
                })()}
              </span>
            )}
            <TickerChips tickers={(story.tickers || []).slice(0, 2)} />
          </div>
        </div>
      </div>
      {!compact && (
        <div className="di-story-thumb">
          <StoryImg story={story} width={300} height={300} />
        </div>
      )}
      {compact && (
        <div className="di-story-ticker-mini">
          <span style={{ color: "var(--di-ink-4)" }}>{story.source}</span>
        </div>
      )}
    </article>
  );
}

export function StoryList({ stories = [], compact, onOpen }) {
  return (
    <div className="di-stories">
      {stories.map((s, i) => (
        <StoryCard key={s.rank || i} story={s} compact={compact} onOpen={onOpen} />
      ))}
    </div>
  );
}

export function TagFilter({ tags = [], active, onSelect }) {
  return (
    <div className="di-tags">
      {tags.map((t) => (
        <button
          key={t.id}
          className={"di-tag-pill" + (active === t.id ? " active" : "")}
          onClick={() => onSelect(t.id)}
        >
          {t.label}
          <span className="num">{t.count}</span>
        </button>
      ))}
    </div>
  );
}
