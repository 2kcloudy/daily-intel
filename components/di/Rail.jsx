"use client";
import { useState } from "react";

function IndicesGrid({ indices = [] }) {
  return (
    <div className="di-indices">
      {indices.map((i) => (
        <div key={i.label} className="di-idx">
          <span className="lbl">{i.label}</span>
          <span className="val">{i.value}</span>
          <span className={"chg " + (i.dir === "up" ? "pos" : "neg")}>
            {i.dir === "up" ? "▲" : "▼"} {i.pct}
          </span>
        </div>
      ))}
    </div>
  );
}

function Watchlist({ items = [] }) {
  if (!items.length) return <div style={{ color: "var(--di-ink-4)", fontFamily: "var(--di-font-ui)", fontSize: 12 }}>No watchlist for today.</div>;
  return (
    <div>
      {items.map((w) => (
        <div key={w.ticker} className="di-watch-item">
          <span className="di-watch-tkr">{w.ticker}</span>
          <span className="di-watch-note">{w.note}</span>
          <span className="di-watch-px">
            <span className="p">{w.price || "—"}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

function ArchiveList({ archive = [], onNav }) {
  return (
    <div className="di-archive-list">
      {archive.map((a, idx) => (
        <button key={idx}
          className={"di-archive-item" + (a.active ? " active" : "")}
          onClick={() => onNav && onNav(a.date || a.href)}
          style={{ background: "none", border: "none", textAlign: "left", width: "100%", cursor: "pointer", fontFamily: "var(--di-font-ui)", fontSize: 13, color: "inherit" }}
        >
          <span className="day">{a.label}</span>
          <span className="arrow">→</span>
        </button>
      ))}
    </div>
  );
}

function Subscribe() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <div className="di-subscribe">
      <h3>In your inbox, 6am.</h3>
      <p>Finance, health, tech &amp; more — curated by AI, delivered before the open.</p>
      <form onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
        <input
          type="email"
          placeholder="name@firm.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">{sent ? "✓ Sent" : "Subscribe"}</button>
      </form>
    </div>
  );
}

export default function Rail({ indices, watchlist, archive, onNav, showIndices = true }) {
  return (
    <aside className="di-rail">
      {showIndices && indices?.length > 0 && (
        <section className="di-rail-section">
          <h4 className="di-rail-title">
            Markets
            <span className="meta">Indicative</span>
          </h4>
          <IndicesGrid indices={indices} />
        </section>
      )}
      {watchlist?.length > 0 && (
        <section className="di-rail-section">
          <h4 className="di-rail-title">
            Watch List
            <span className="meta">From today's digest</span>
          </h4>
          <Watchlist items={watchlist} />
        </section>
      )}
      {archive?.length > 0 && (
        <section className="di-rail-section">
          <h4 className="di-rail-title">
            Archive
            <span className="meta">Past issues</span>
          </h4>
          <ArchiveList archive={archive} onNav={onNav} />
        </section>
      )}
      <Subscribe />
    </aside>
  );
}
