"use client";
import { storyImg } from "./dataTransform";

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
        <img src={storyImg(story, 900, 700)} alt="" loading="lazy" />
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
        <img src={storyImg(story, 1400, 600)} alt="" loading="lazy" />
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
        <p className="di-story-sub">{story.sub}</p>
        <p className="di-story-body-text">{story.body}</p>
        <div className="di-story-footer">
          <span className="di-source">{story.source}</span>
          <TickerChips tickers={(story.tickers || []).slice(0, 2)} />
        </div>
      </div>
      {!compact && (
        <div className="di-story-thumb">
          <img src={storyImg(story, 300, 300)} alt="" loading="lazy" />
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
