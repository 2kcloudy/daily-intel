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

function SubscribeModal({ onClose }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(8,9,12,0.55)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1000, backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "var(--di-paper)", border: "1px solid var(--di-line)",
          borderRadius: 6, padding: "32px 32px 28px", width: "min(440px, 92vw)",
          fontFamily: "var(--di-font-body, var(--di-font-serif))",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
          <h3 style={{ margin: 0, fontFamily: "var(--di-font-serif)", fontSize: 24, lineHeight: 1.15, letterSpacing: "-0.01em" }}>
            In your inbox, 6am.
          </h3>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "var(--di-ink-3)", lineHeight: 1, padding: 0 }}
          >×</button>
        </div>
        <p style={{ margin: "0 0 20px", color: "var(--di-ink-3)", fontSize: 14, lineHeight: 1.5 }}>
          Finance, health, tech &amp; more — curated by AI, delivered before the open.
        </p>
        {sent ? (
          <div style={{ padding: "14px 16px", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 4, fontSize: 14, color: "var(--di-ink)" }}>
            ✓ Thanks — you're on the list.
          </div>
        ) : (
          <form
            onSubmit={(e) => { e.preventDefault(); setSent(true); }}
            style={{ display: "flex", gap: 8 }}
          >
            <input
              type="email"
              required
              placeholder="name@firm.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                flex: 1, padding: "10px 12px", border: "1px solid var(--di-line)",
                borderRadius: 4, fontFamily: "inherit", fontSize: 14,
                background: "var(--di-paper-2)", color: "var(--di-ink)",
              }}
            />
            <button
              type="submit"
              style={{
                padding: "10px 18px", background: "var(--di-ink)", color: "var(--di-paper)",
                border: "none", borderRadius: 4, fontFamily: "var(--di-font-ui)",
                fontSize: 12, fontWeight: 700, letterSpacing: "0.08em",
                textTransform: "uppercase", cursor: "pointer",
              }}
            >Subscribe</button>
          </form>
        )}
      </div>
    </div>
  );
}

export function Masthead({ date, postedAt, theme, onToggleTheme, onNav, onSearch }) {
  const [subOpen, setSubOpen] = useState(false);
  return (
    <div className="di-masthead">
      <div className="di-masthead-inner">
        <div className="di-masthead-left">
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
          <button className="action" onClick={() => onNav && onNav("archive")}>Archive</button>
          <button className="action primary" onClick={() => setSubOpen(true)}>Subscribe</button>
        </div>
      </div>
      {subOpen && <SubscribeModal onClose={() => setSubOpen(false)} />}
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
