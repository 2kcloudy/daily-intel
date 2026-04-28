"use client";
import { useState } from "react";
import { PLACEHOLDER_INDICES } from "./dataTransform";

export function TickerBar({ indices = PLACEHOLDER_INDICES }) {
  const loop = [...indices, ...indices];
  return (
    <div className="di-chrome">
      <div className="di-ticker">
        <div className="di-ticker-track">
          {loop.map((item, idx) => (
            <span key={idx} style={{ display: "inline-flex", alignItems: "baseline", gap: 0 }}>
              <div className="di-tick">
                <b>{item.label}</b>
                <span>{item.value}</span>
                <span className={`chg ${item.dir === "up" ? "pos" : "neg"}`}>
                  {item.dir === "up" ? "▲" : "▼"} {item.pct}
                </span>
              </div>
              <span className="di-tick-sep" />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Masthead({ date, postedAt, theme, onToggleTheme, onNav, onSearch }) {
  return (
    <div className="di-masthead">
      <div className="di-masthead-inner">
        <div className="di-masthead-left">
          <span className="vol">Vol. III</span>
          <span className="dot" />
          <span>{postedAt || date}</span>
        </div>
        <div
          className="di-wordmark"
          onClick={() => onNav && onNav(null)}
          role="link"
          tabIndex={0}
          onKeyDown={e => e.key === "Enter" && onNav && onNav(null)}
        >
          Daily<span className="amp">·</span>Intel
        </div>
        <div className="di-masthead-right">
          <button className="di-search-trigger" onClick={() => onSearch && onSearch()} title="Search (press /)">
            <span className="icon">⌕</span>
            <span className="lbl">Search</span>
            <kbd>/</kbd>
          </button>
          <button className="di-theme-toggle" onClick={onToggleTheme} title="Toggle theme">
            {theme === "dark" ? "☀" : "☾"}
          </button>
          <button className="action" onClick={() => onNav && onNav("stats")}>Stats</button>
          <button className="action" onClick={() => onNav && onNav("archive")}>Archive</button>
          <button className="action primary">Subscribe</button>
        </div>
      </div>
    </div>
  );
}

export function CategoryNav({ categories = [], active, onSelect }) {
  return (
    <div className="di-catnav-wrap">
      <nav className="di-catnav">
        {categories.map((c) => (
          <button
            key={c.id}
            className={"di-cat" + (active === c.id ? " active" : "")}
            onClick={() => onSelect && onSelect(c.id)}
          >
            <span className="glyph">{c.glyph}</span>
            {c.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

export function Bulletin({ text = "", postedAt, storyCount, sources = [] }) {
  const formatted = text
    .replace(/(\$[\d,.]+[BbMmKk]?|\d+(?:\.\d+)?%)/g, "<em>$1</em>");

  return (
    <div className="di-bulletin">
      <div className="di-bulletin-kicker">
        <span className="live-dot" />
        Market Pulse
      </div>
      <div
        className="di-bulletin-text"
        dangerouslySetInnerHTML={{ __html: formatted }}
      />
      <div className="di-bulletin-meta">
        {postedAt}<br />
        {storyCount} stories
      </div>
    </div>
  );
}

export function Footer({ onNav }) {
  return (
    <div className="di-footer">
      <div>© 2026 Daily Intel · AI-curated intelligence</div>
      <div style={{ display: "flex", gap: "24px" }}>
        <button onClick={() => onNav && onNav("archive")} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", fontFamily: "inherit", fontSize: "inherit", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 500 }}>Archive</button>
        <button onClick={() => onNav && onNav("stats")} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", fontFamily: "inherit", fontSize: "inherit", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 500 }}>Stats</button>
      </div>
    </div>
  );
}
