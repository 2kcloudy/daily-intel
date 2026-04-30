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

function StoryMeta({ tag }) {
  if (!tag) return null;
  const tagClass = (tag || "").toLowerCase().replace(/[\s/+]+/g, "");
  return (
    <div className="di-hero-meta">
      <span className={"di-cat-label " + tagClass}>{tag}</span>
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
        <StoryMeta tag={story.tag} />
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
      <StoryMeta tag={story.tag} />
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

function PublishedAtPill({ publishedAt }) {
  if (!publishedAt) return null;
  return (
    <span style={{
      fontFamily: "var(--di-font-ui)", fontSize: 10, fontWeight: 600,
      color: "var(--di-accent)", textTransform: "uppercase", letterSpacing: "0.08em",
    }}>
      {(() => {
        try {
          const d = new Date(publishedAt);
          const h = (Date.now() - d) / 3600000;
          if (h < 6)  return `${Math.round(h)}h ago`;
          if (h < 24) return "Today";
          if (h < 48) return "Yesterday";
          return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        } catch { return null; }
      })()}
    </span>
  );
}

export function StoryCard({ story, compact, onOpen, layout = "side-thumb" }) {
  const useImageTop = (layout === "image-top" || layout === "image-top-short") && !compact;
  const isShort = layout === "image-top-short";
  const useFlat = layout === "flat" && !compact;

  if (useFlat) {
    const tag = story.tag || story.topic || "";
    const tagClass = tag.toLowerCase().replace(/[\s/+]+/g, "");
    return (
      <article className="di-story-flat" onClick={() => onOpen && onOpen(story)}>
        <div className="di-story-flat-thumb">
          <StoryImg story={story} width={900} height={500} />
        </div>
        <div className="di-story-flat-body">
          <div className="di-story-flat-meta">
            <span className={"di-cat-label " + tagClass}>{tag}</span>
          </div>
          <h3 className="di-story-flat-head">
            <a href={story.url} target="_blank" rel="noopener"
               onClick={e => { e.preventDefault(); onOpen && onOpen(story); }}>
              {story.headline}
            </a>
          </h3>
          <p className="di-story-flat-sub">{story.sub}</p>
          <p className="di-story-flat-body-text">{story.body}</p>
          <div className="di-story-flat-footer">
            <span>{story.source}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <PublishedAtPill publishedAt={story.publishedAt} />
              <TickerChips tickers={(story.tickers || []).slice(0, 2)} />
            </div>
          </div>
        </div>
      </article>
    );
  }

  if (useImageTop) {
    const articleClass =
      "di-story di-story-image-top" + (isShort ? " di-story-image-top-short" : "");
    return (
      <article className={articleClass} onClick={() => onOpen && onOpen(story)}>
        <div className="di-story-image-top-thumb">
          <StoryImg story={story} width={900} height={isShort ? 260 : 500} />
        </div>
        <div className="di-story-body">
          <StoryMeta tag={story.tag} />
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
              <PublishedAtPill publishedAt={story.publishedAt} />
              <TickerChips tickers={(story.tickers || []).slice(0, 2)} />
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="di-story" onClick={() => onOpen && onOpen(story)}>
      <div className="di-story-body">
        <StoryMeta tag={story.tag} />
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
            <PublishedAtPill publishedAt={story.publishedAt} />
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

export function StoryList({ stories = [], compact, onOpen, layout = "side-thumb" }) {
  const wrapClass =
    (layout === "flat"            ? "di-stories-flat" : "di-stories") +
    (layout === "image-top"       ? " di-stories-image-top" : "") +
    (layout === "image-top-short" ? " di-stories-image-top di-stories-image-top-short" : "");
  return (
    <div className={wrapClass}>
      {stories.map((s, i) => (
        <StoryCard key={s.rank || i} story={s} compact={compact} onOpen={onOpen} layout={layout} />
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

/* ─────────────────────────────────────────────────────────────────────────
   HTStoryCard / HTStoryGrid — prototype "header-tweak" card style.
   Direct external links, flat border, cyan tag, "Read Story →" pill.
   ───────────────────────────────────────────────────────────────────────── */
export function HTStoryCard({ story }) {
  const [imgFailed, setImgFailed] = useState(false);
  const [retries, setRetries] = useState(0);
  const tag = story.tag || story.topic || "";

  const imgSrc = retries === 0
    ? storyImg(story, 900, 600)
    : `${storyImg(story, 900, 600)}&_r=${retries}`;

  function handleImgError() {
    if (retries < 2) setTimeout(() => setRetries(r => r + 1), 2000 * (retries + 1));
    else setImgFailed(true);
  }

  const gradient = (() => {
    const GRADS = {
      markets: "linear-gradient(135deg,#0f2027,#203a43,#2c5364)",
      ai:      "linear-gradient(135deg,#1a0533,#4a148c,#7b1fa2)",
      tech:    "linear-gradient(135deg,#0d1b2a,#1a3a5c,#1e5799)",
      earnings:"linear-gradient(135deg,#1a1200,#4a3500,#7a5800)",
      energy:  "linear-gradient(135deg,#0a1628,#1b3a2c,#2e7d32)",
      crypto:  "linear-gradient(135deg,#1a0e00,#4a2800,#c56a00)",
      defense: "linear-gradient(135deg,#1a1a1a,#2a3a2a,#3a4a3a)",
      macro:   "linear-gradient(135deg,#0c1445,#1a2a6c,#2e4490)",
      policy:  "linear-gradient(135deg,#0a0e2e,#1a2050,#243b8a)",
      health:  "linear-gradient(135deg,#001a0e,#003d1f,#00693a)",
      world:   "linear-gradient(135deg,#1a0a00,#3d1a00,#7a3a00)",
      startups:"linear-gradient(135deg,#001a2c,#00405c,#006a8a)",
      science: "linear-gradient(135deg,#001a2e,#002d50,#005c8a)",
    };
    const key = tag.toLowerCase().replace(/[\s/+]+/g, "");
    return GRADS[key] || "linear-gradient(135deg,#111827,#1f2937,#374151)";
  })();

  return (
    <article
      style={{
        border: "1px solid rgba(15,18,32,0.22)",
        borderRadius: 6,
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
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div style={{
            position: "absolute", inset: 0,
            background: gradient,
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
        {/* Tag */}
        <div style={{
          fontSize: 10, fontWeight: 700, textTransform: "uppercase",
          letterSpacing: "0.1em", color: "#29B6F6", marginBottom: 8,
        }}>
          {tag}
        </div>

        {/* Headline — direct external link */}
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
          {story.body || story.sub || story.summary || ""}
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
            onMouseEnter={e => { e.currentTarget.style.background = "#29B6F6"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#29B6F6"; }}
          >
            Read Story →
          </a>
        </div>
      </div>
    </article>
  );
}

export function HTStoryGrid({ stories = [] }) {
  if (!stories.length) return (
    <p style={{
      textAlign: "center", color: "var(--di-ink-4, #787f8c)",
      padding: "60px 0", fontFamily: "var(--di-font-ui, Inter, sans-serif)",
    }}>
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
        <HTStoryCard key={`${s.rank || i}-${(s.headline || "").slice(0, 20)}`} story={s} />
      ))}
    </div>
  );
}
