"use client";
import { useEffect, useRef, useState } from "react";
import { PLACEHOLDER_INDICES } from "./dataTransform";

/**
 * BriefMini — compact "play button + label" version of the Daily Brief that
 * sits in the masthead. Reuses the same audio + speech-synthesis fallback
 * logic as the full DailyBrief player but renders just a 28px circular play
 * button and the label (e.g. "Daily Brief").
 */
function BriefMini({ brief, label = "Daily Brief" }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [ttsSupported, setTtsSupported] = useState(false);

  const url = brief?.audioUrl || brief?.url || null;
  const script = brief?.script || brief?.text || "";

  useEffect(() => {
    if (!url) return;
    const a = audioRef.current;
    if (!a) return;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnd = () => setPlaying(false);
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);
    a.addEventListener("ended", onEnd);
    return () => {
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
      a.removeEventListener("ended", onEnd);
    };
  }, [url]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setTtsSupported(typeof window.speechSynthesis !== "undefined");
  }, []);

  // Stop any speech on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  function pickWarmVoice(synth) {
    const voices = synth.getVoices();
    if (!voices?.length) return null;
    const PREFERRED = [
      "Samantha (Enhanced)", "Samantha", "Allison", "Ava (Enhanced)", "Ava",
      "Karen", "Susan", "Joelle", "Daniel (Enhanced)", "Daniel",
      "Microsoft Aria Online (Natural)", "Microsoft Jenny Online (Natural)",
      "Microsoft Sonia Online (Natural)", "Microsoft Guy Online (Natural)",
      "Microsoft Aria", "Microsoft Jenny", "Microsoft Sonia", "Microsoft Guy",
      "Google UK English Female", "Google US English",
    ];
    for (const name of PREFERRED) {
      const hit = voices.find(v => v.name === name);
      if (hit) return hit;
    }
    return voices.find(v => /^en[-_]/i.test(v.lang) && !/Fred|Albert|Zarvox|Cellos/.test(v.name)) || voices[0];
  }

  function onPlayClick() {
    if (url) {
      const a = audioRef.current;
      if (!a) return;
      if (a.paused) a.play(); else a.pause();
      return;
    }
    if (!ttsSupported || !script) return;
    const synth = window.speechSynthesis;
    if (synth.speaking && !synth.paused) {
      synth.pause();
      setPlaying(false);
      return;
    }
    if (synth.paused) {
      synth.resume();
      setPlaying(true);
      return;
    }
    synth.cancel();
    const u = new SpeechSynthesisUtterance(script);
    u.rate = 0.95;
    u.pitch = 1.05;
    u.volume = 1.0;
    const voice = pickWarmVoice(synth);
    if (voice) u.voice = voice;
    u.onend = () => setPlaying(false);
    u.onpause = () => setPlaying(false);
    synth.speak(u);
    setPlaying(true);
  }

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <button
        onClick={onPlayClick}
        aria-label={playing ? "Pause Daily Brief" : "Play Daily Brief"}
        style={{
          width: 28, height: 28, borderRadius: "50%",
          background: "var(--di-ink)", color: "var(--di-paper)",
          border: "none", cursor: "pointer",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          fontSize: 11, lineHeight: 1, padding: 0, flexShrink: 0,
        }}
      >
        {playing ? "❚❚" : "▶"}
      </button>
      <span style={{
        fontFamily: "var(--di-font-ui)", fontSize: 11, fontWeight: 700,
        letterSpacing: "0.10em", textTransform: "uppercase",
        color: "var(--di-ink-2)", whiteSpace: "nowrap",
      }}>
        {label}
      </span>
      {url && <audio ref={audioRef} src={url} preload="metadata" />}
    </div>
  );
}

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

export function Masthead({ date, postedAt, theme, onToggleTheme, onNav, onSearch, brief, briefLabel = "Daily Brief" }) {
  const [subOpen, setSubOpen] = useState(false);
  const hasBrief = brief && (brief.script || brief.audioUrl || brief.url);
  return (
    <div className="di-masthead">
      <div className="di-masthead-inner">
        <div className="di-masthead-left" style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <span>{postedAt || date}</span>
          {hasBrief && <BriefMini brief={brief} label={briefLabel} />}
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

/**
 * FilterDrawer — a floating "Filter" tab anchored to the left edge of the
 * viewport. Click it to slide open a panel showing all topic tags; click a
 * tag to filter; click outside or the tab again to collapse. Available on
 * any page that has tags (multi-topic).
 */
export function FilterDrawer({ tags = [], active = "all", onSelect }) {
  const [open, setOpen] = useState(false);
  // Hide the drawer entirely if there's nothing to filter (only "All" tag)
  if (!tags.length || tags.length <= 1) return null;
  const activeTag = tags.find(t => t.id === active);
  const activeLabel = activeTag && activeTag.id !== "all" ? activeTag.label : null;

  return (
    <>
      {/* The vertical pill that hugs the left edge */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label={open ? "Close filter" : "Open filter"}
        style={{
          position: "fixed",
          left: 0,
          top: "50%",
          transform: "translateY(-50%)",
          background: activeLabel ? "var(--di-accent, #5b5ef6)" : "var(--di-ink)",
          color: "#fff",
          border: "none",
          padding: "18px 9px",
          borderRadius: "0 10px 10px 0",
          writingMode: "vertical-rl",
          textOrientation: "mixed",
          letterSpacing: "0.18em",
          fontSize: 11,
          fontWeight: 700,
          textTransform: "uppercase",
          cursor: "pointer",
          zIndex: 90,
          boxShadow: "2px 2px 12px rgba(0,0,0,0.22)",
          fontFamily: "var(--di-font-ui, inherit)",
          transition: "background 0.18s ease, padding 0.2s ease",
        }}
      >
        {activeLabel ? `Filter · ${activeLabel}` : "Filter"}
      </button>

      {open && (
        <>
          {/* Click-outside backdrop */}
          <div
            onClick={() => setOpen(false)}
            style={{
              position: "fixed", inset: 0,
              background: "rgba(8,9,12,0.32)",
              backdropFilter: "blur(2px)",
              WebkitBackdropFilter: "blur(2px)",
              zIndex: 89,
              animation: "di-fade 0.18s ease",
            }}
          />
          {/* The panel that slides out from the left */}
          <div
            role="dialog"
            aria-label="Filter by topic"
            style={{
              position: "fixed",
              left: 0,
              top: "50%",
              transform: "translateY(-50%)",
              background: "var(--di-paper)",
              border: "1px solid var(--di-line)",
              borderLeft: "none",
              borderRadius: "0 14px 14px 0",
              padding: "20px 22px",
              width: 280,
              zIndex: 91,
              maxHeight: "82vh",
              overflowY: "auto",
              boxShadow: "6px 0 28px rgba(8,9,12,0.18)",
              fontFamily: "var(--di-font-body, var(--di-font-serif, inherit))",
            }}
          >
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              marginBottom: 14,
            }}>
              <div style={{
                fontFamily: "var(--di-font-ui, var(--di-font-mono, inherit))",
                fontSize: 11, fontWeight: 700,
                letterSpacing: "0.18em", textTransform: "uppercase",
                color: "var(--di-ink-3)",
              }}>Filter by topic</div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                style={{
                  background: "none", border: "none",
                  fontSize: 18, lineHeight: 1, cursor: "pointer",
                  color: "var(--di-ink-3)", padding: 0,
                }}
              >×</button>
            </div>
            {tags.map(t => (
              <button
                key={t.id}
                onClick={() => { onSelect && onSelect(t.id); setOpen(false); }}
                style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  width: "100%", padding: "10px 14px", marginBottom: 6,
                  background: active === t.id ? "var(--di-ink)" : "var(--di-paper-2)",
                  color: active === t.id ? "var(--di-paper)" : "var(--di-ink)",
                  border: "1px solid var(--di-line)",
                  borderRadius: 6, cursor: "pointer",
                  fontFamily: "inherit", fontSize: 13.5, fontWeight: 500,
                  textAlign: "left", textTransform: "capitalize",
                  transition: "background 0.15s ease, color 0.15s ease",
                }}
              >
                <span>{t.label}</span>
                <span style={{
                  fontFamily: "var(--di-font-mono, monospace)",
                  fontSize: 11, opacity: 0.65,
                  fontVariantNumeric: "tabular-nums",
                }}>{t.count}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </>
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
