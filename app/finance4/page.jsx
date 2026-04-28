// /finance4 — Glass widget design experiment
// Pure white background. Articles rendered as floating glass-style widgets.
// Same data source as the main Finance tab (latest digest from KV).

import { getLatestDigest } from "@/lib/storage";

export const revalidate = 60;

export const metadata = {
  title: "Bays Finance",
  description: "Bays Finance — daily curated finance brief",
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

.f4-root {
  min-height: 100vh;
  background: #ffffff;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  -webkit-font-smoothing: antialiased;
  color: #0f1220;
  line-height: 1.6;
  position: relative;
  overflow-x: hidden;
}

/* Pure white page — no ambient tint. Cards float against pure #fff. */
.f4-ambient {
  position: fixed; inset: 0; z-index: 0; pointer-events: none;
  background: transparent;
}

/* ── Header ── */
.f4-page { position: relative; z-index: 1; }

.f4-header {
  max-width: 1340px;
  margin: 0 auto;
  padding: 0 28px 0;
  display: flex; align-items: center; justify-content: space-between; gap: 20px;
  flex-wrap: wrap;
}
.f4-brand {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16px;
}
.f4-logo {
  width: 100px;
  height: auto;
  flex-shrink: 0;
  display: block;
}
.f4-kicker {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #8e95b3;
  margin-bottom: 6px;
}
.f4-title {
  font-family: 'Fraunces', serif;
  font-size: 44px;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: #0f1220;
  line-height: 1;
}
.f4-meta {
  display: flex; align-items: center; gap: 14px;
  flex-wrap: wrap;
}
.f4-meta-item {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11px;
  font-weight: 500;
  color: #6c7396;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.f4-live-chip {
  display: flex; align-items: center; gap: 7px;
  font-size: 10px; font-weight: 700; letter-spacing: 0.16em;
  text-transform: uppercase; color: #0e7c4a;
}
.f4-live-dot {
  width: 7px; height: 7px; border-radius: 50%; background: #10b981;
  box-shadow: 0 0 0 4px rgba(16,185,129,0.16);
  animation: f4-live 2.4s ease-out infinite;
}
@keyframes f4-live {
  0%,100% { box-shadow: 0 0 0 4px rgba(16,185,129,0.16); }
  50%      { box-shadow: 0 0 0 8px rgba(16,185,129,0.04); }
}

/* Pulse banner */
.f4-pulse-wrap {
  max-width: 1340px;
  margin: 0 auto;
  padding: 0 28px 4px;
}
.f4-pulse {
  font-family: 'Fraunces', serif;
  font-size: 19px;
  font-weight: 500;
  letter-spacing: -0.01em;
  color: #1f2440;
  line-height: 1.45;
  max-width: 980px;
}
.f4-pulse strong { color: #0f1220; font-weight: 700; }

/* Section divider line */
.f4-divider {
  max-width: 1340px;
  margin: 0 auto;
  padding: 0 28px;
}
.f4-divider-line {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(15,18,32,0.08) 12%, rgba(15,18,32,0.08) 88%, transparent);
}

.f4-section-head {
  max-width: 1340px;
  margin: 0 auto;
  padding: 2px 28px 4px;
  display: flex; align-items: center; gap: 14px;
}
.f4-section-title {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11px; font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #6c7396;
  white-space: nowrap;
}
.f4-section-rule { flex: 1; height: 1px; background: rgba(15,18,32,0.06); }
.f4-section-count {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11px; font-weight: 600;
  color: #8e95b3;
  letter-spacing: 0.06em;
}

/* ── Main grid ── */
.f4-main {
  max-width: 1340px;
  margin: 0 auto;
  padding: 0 28px 80px;
}

/* Single uniform 3-column grid — every story the same size */
.f4-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 22px;
}

/* ── Glass card ── */
.f4-card {
  position: relative;
  background: #ffffff;
  /* Simple uniform border, with dark glass bevels on LEFT + BOTTOM */
  border: 1px solid rgba(15, 18, 32, 0.12);
  border-radius: 22px;
  overflow: hidden;
  box-shadow:
    /* Dark glass bevel — RIGHT edge */
    inset -1.5px 0 0 rgba(8, 10, 20, 0.28),
    /* Dark glass bevel — BOTTOM edge */
    inset 0 -1.5px 0 rgba(8, 10, 20, 0.32),
    /* Soft dark inner shading over bottom-RIGHT corner */
    inset -3px -3px 18px rgba(8, 10, 20, 0.14),
    /* Tiny but very dark drop shadow — offset to bottom-RIGHT */
    2px 3px 4px rgba(2, 4, 12, 0.55),
    /* Mid drop shadow */
    4px 6px 14px rgba(2, 4, 12, 0.18),
    /* Far ambient depth */
    10px 16px 36px rgba(8, 10, 22, 0.14);
  transition:
    transform 0.28s cubic-bezier(0.34,1.56,0.64,1),
    box-shadow 0.28s ease,
    border-color 0.20s ease;
  display: flex;
  flex-direction: column;
}
/* Sheen + edge ring removed — cards are clean white with a simple border */
.f4-card::before { content: none; }
.f4-card::after  { content: none; }
.f4-card-link {
  display: flex;
  flex-direction: column;
  height: 100%;
  text-decoration: none;
  color: inherit;
  position: relative;
  z-index: 2;
}
.f4-card:hover {
  transform: translateY(-3px);
  box-shadow:
    inset -1.5px 0 0 rgba(8, 10, 20, 0.32),
    inset 0 -1.5px 0 rgba(8, 10, 20, 0.36),
    inset -3px -3px 20px rgba(8, 10, 20, 0.18),
    2px 4px 5px rgba(2, 4, 12, 0.60),
    6px 10px 20px rgba(2, 4, 12, 0.22),
    14px 22px 48px rgba(8, 10, 22, 0.18);
  border-color: rgba(15, 18, 32, 0.18);
}

/* Card image */
.f4-card-img {
  width: 100%;
  flex-shrink: 0;
  position: relative;
  background: linear-gradient(135deg, rgba(200,195,255,0.30), rgba(160,200,255,0.22));
  overflow: hidden;
}
.f4-card-img img {
  width: 100%; height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.6s ease;
}
.f4-card:hover .f4-card-img img { transform: scale(1.04); }
.f4-card-img-sheen {
  position: absolute; inset: 0;
  background: linear-gradient(to bottom, transparent 60%, rgba(255,255,255,0.20) 100%);
  pointer-events: none;
}

/* Card body */
.f4-card-body {
  padding: 22px 24px 22px;
  display: flex;
  flex-direction: column;
  flex: 1;
  position: relative;
  z-index: 2;
}
.f4-tag-row {
  display: flex; align-items: center; gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}
.f4-tag {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.10em;
  text-transform: uppercase;
  padding: 4px 11px;
  border-radius: 999px;
  border: 1px solid;
  background: rgba(255,255,255,0.55);
  backdrop-filter: blur(10px);
}
.f4-tag-rank {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11px; font-weight: 700;
  color: #6c7396;
  letter-spacing: 0.04em;
  margin-right: 2px;
}
.f4-card-title {
  font-family: 'Fraunces', serif;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.3;
  letter-spacing: -0.015em;
  color: #0f1220;
  margin-bottom: 10px;
}
.f4-card-summary {
  font-size: 13.5px;
  color: #4a5070;
  line-height: 1.6;
  flex: 1;
}
/* Trade angle inline emphasis */
.f4-card-summary :global(strong),
.f4-card-summary strong {
  color: #1a1d2e;
}

.f4-card-footer {
  display: flex; align-items: center; justify-content: space-between;
  margin-top: 18px;
  padding-top: 14px;
  border-top: 1px solid rgba(15,18,32,0.06);
  gap: 12px;
}
.f4-card-source {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.10em;
  text-transform: uppercase;
  color: #5b5ef6;
}
.f4-card-time {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11px;
  color: #8e95b3;
}
.f4-read-link {
  font-size: 12px; font-weight: 600;
  color: #8e95b3;
  letter-spacing: 0.02em;
  transition: color 0.15s ease, transform 0.15s ease;
  white-space: nowrap;
}
.f4-card:hover .f4-read-link {
  color: #5b5ef6;
}

/* Tag color variants */
.f4-tag-markets     { color: #5b5ef6; background: rgba(91,94,246,0.10);  border-color: rgba(91,94,246,0.30); }
.f4-tag-ai          { color: #6d28d9; background: rgba(109,40,217,0.10); border-color: rgba(109,40,217,0.28); }
.f4-tag-tech        { color: #0e7a6a; background: rgba(14,122,106,0.10); border-color: rgba(14,122,106,0.26); }
.f4-tag-earnings    { color: #1f6fd6; background: rgba(31,111,214,0.10); border-color: rgba(31,111,214,0.28); }
.f4-tag-energy      { color: #c2570c; background: rgba(194,87,12,0.10);  border-color: rgba(194,87,12,0.26); }
.f4-tag-commodities { color: #b07b00; background: rgba(176,123,0,0.10);  border-color: rgba(176,123,0,0.26); }
.f4-tag-crypto      { color: #7b3fa8; background: rgba(123,63,168,0.10); border-color: rgba(123,63,168,0.26); }
.f4-tag-policy      { color: #1a6fa8; background: rgba(26,111,168,0.10); border-color: rgba(26,111,168,0.26); }
.f4-tag-defense     { color: #5a4fcf; background: rgba(90,79,207,0.10);  border-color: rgba(90,79,207,0.28); }
.f4-tag-macro       { color: #4a5070; background: rgba(74,80,112,0.09);  border-color: rgba(74,80,112,0.22); }
.f4-tag-biotech     { color: #c2185b; background: rgba(194,24,91,0.10);  border-color: rgba(194,24,91,0.24); }
.f4-tag-space       { color: #1c4e80; background: rgba(28,78,128,0.10);  border-color: rgba(28,78,128,0.24); }
.f4-tag-default     { color: #4a5070; background: rgba(74,80,112,0.09);  border-color: rgba(74,80,112,0.22); }

/* Footer */
.f4-footer {
  max-width: 1340px;
  margin: 48px auto 0;
  padding: 24px 28px 36px;
  text-align: center;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11px;
  color: #8e95b3;
  letter-spacing: 0.06em;
  border-top: 1px solid rgba(15,18,32,0.06);
}
.f4-footer a {
  color: #5b5ef6;
  text-decoration: none;
  margin-left: 12px;
}
.f4-footer a:hover { text-decoration: underline; }

/* Empty state */
.f4-empty {
  max-width: 600px;
  margin: 120px auto;
  padding: 40px;
  text-align: center;
  background: rgba(255,255,255,0.55);
  backdrop-filter: blur(28px);
  -webkit-backdrop-filter: blur(28px);
  border: 1px solid rgba(255,255,255,0.85);
  border-radius: 22px;
  box-shadow: 0 8px 32px rgba(40,52,110,0.08);
  font-family: 'Fraunces', serif;
  font-size: 20px;
  color: #4a5070;
}

/* Responsive */
@media (max-width: 1100px) {
  .f4-grid    { grid-template-columns: repeat(2, 1fr); gap: 18px; }
}
@media (max-width: 700px) {
  .f4-grid    { grid-template-columns: 1fr; }
  .f4-title   { font-size: 34px; }
  .f4-pulse   { font-size: 17px; }
  .f4-header  { padding: 24px 18px 16px; }
  .f4-pulse-wrap, .f4-section-head, .f4-main, .f4-divider { padding-left: 18px; padding-right: 18px; }
}
`;

function tagClass(tag) {
  if (!tag) return "f4-tag-default";
  const k = tag.toLowerCase();
  if (k.includes("market"))      return "f4-tag-markets";
  if (k.includes("ai"))          return "f4-tag-ai";
  if (k.includes("tech"))        return "f4-tag-tech";
  if (k.includes("earning"))     return "f4-tag-earnings";
  if (k.includes("energy"))      return "f4-tag-energy";
  if (k.includes("commodit"))    return "f4-tag-commodities";
  if (k.includes("crypto"))      return "f4-tag-crypto";
  if (k.includes("policy"))      return "f4-tag-policy";
  if (k.includes("defense"))     return "f4-tag-defense";
  if (k.includes("macro"))       return "f4-tag-macro";
  if (k.includes("bio") || k.includes("pharma")) return "f4-tag-biotech";
  if (k.includes("space"))       return "f4-tag-space";
  return "f4-tag-default";
}

/** Render the story summary; trim the Trade Angle section if present. */
function renderSummary(summary = "") {
  if (!summary) return null;
  const idx = summary.indexOf("💡 Trade Angle:");
  const text = idx === -1 ? summary : summary.slice(0, idx).trim();
  return <p>{text}</p>;
}

function GlassCard({ story }) {
  return (
    <article className="f4-card">
      <a className="f4-card-link" href={story.url || "#"} target="_blank" rel="noopener noreferrer">
        {story.image && (
          <div className="f4-card-img" style={{ height: 180 }}>
            <img src={story.image} alt="" loading="lazy" />
            <div className="f4-card-img-sheen" />
          </div>
        )}
        <div className="f4-card-body">
          <div className="f4-tag-row">
            {story.rank && <span className="f4-tag-rank">№ {String(story.rank).padStart(2, "0")}</span>}
            {story.topic && (
              <span className={`f4-tag ${tagClass(story.topic)}`}>{story.topic}</span>
            )}
            {story.publishedAt && (
              <span className="f4-card-time" style={{ marginLeft: "auto" }}>
                {formatPublishedAt(story.publishedAt)}
              </span>
            )}
          </div>
          <h3 className="f4-card-title">
            {story.headline}
          </h3>
          {story.summary && (
            <div className="f4-card-summary">
              {renderSummary(story.summary)}
            </div>
          )}
          <div className="f4-card-footer">
            <span className="f4-card-source">{story.source || "Source"}</span>
            <span className="f4-read-link">Read story →</span>
          </div>
        </div>
      </a>
    </article>
  );
}

function formatPublishedAt(input) {
  if (!input) return "";
  try {
    const d = new Date(input);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch { return ""; }
}

function formatLongDate(input) {
  if (!input) return "";
  try {
    const d = new Date(input + "T12:00:00Z");
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-US", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });
  } catch { return ""; }
}

export default async function Finance4Page() {
  const digest = await getLatestDigest();

  if (!digest) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="f4-root">
          <div className="f4-ambient" />
          <div className="f4-empty">No digest available yet. Check back soon.</div>
        </div>
      </>
    );
  }

  const stories = (digest.stories || []).slice().sort((a, b) => (a.rank || 0) - (b.rank || 0));
  const dateLong = formatLongDate(digest.date);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="f4-root">
        <div className="f4-ambient" />

        <div className="f4-page">
          {/* Header */}
          <header className="f4-header">
            <div className="f4-brand">
              <svg
                className="f4-logo"
                viewBox="0 0 50 24"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="f4-logo-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#1a2a6c" />
                    <stop offset="55%" stopColor="#5b3fbf" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
                {/* Sideways filter / funnel pointing right — like > */}
                <path
                  d="M 1 2 L 11 2 L 26 11 L 33 11 L 33 13 L 26 13 L 11 22 L 1 22 Z"
                  fill="url(#f4-logo-grad)"
                />
                {/* Outward expanding ring — cyan glow */}
                <circle cx="33" cy="12" r="3" fill="none" stroke="#22d3ee" strokeWidth="1" opacity="0.6">
                  <animate attributeName="r" values="3;9;3" dur="1.8s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.6;0;0.6" dur="1.8s" repeatCount="indefinite" />
                </circle>
                {/* Inner pulsing spark — solid cyan */}
                <circle cx="33" cy="12" r="2.5" fill="#22d3ee">
                  <animate attributeName="r" values="2.5;3.4;2.5" dur="1.8s" repeatCount="indefinite" />
                </circle>
              </svg>
              <h1 className="f4-title">Bays Finance</h1>
            </div>
          </header>

          {/* Pulse */}
          {digest.marketPulse && (
            <div className="f4-pulse-wrap">
              <p className="f4-pulse">
                <strong>Market Pulse —</strong> {digest.marketPulse}
              </p>
            </div>
          )}

          <div className="f4-divider"><div className="f4-divider-line" /></div>

          {/* Section: Top Stories */}
          <div className="f4-section-head">
            <span className="f4-section-title">Top Stories</span>
            <div className="f4-section-rule" />
            <span className="f4-section-count">Ranked by market importance</span>
          </div>

          <div className="f4-main">
            {/* Single uniform grid — all stories the same size */}
            <div className="f4-grid">
              {stories.map(s => (
                <GlassCard key={s.rank || s.headline} story={s} />
              ))}
            </div>
          </div>

          <footer className="f4-footer">
            Daily Intel · Glass design experiment · {dateLong}
            <a href="/">← Back to current site</a>
          </footer>
        </div>
      </div>
    </>
  );
}
