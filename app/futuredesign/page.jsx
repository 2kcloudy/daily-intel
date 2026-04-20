// /futuredesign — full-screen Glacial Light design preview
// Overlays the existing site so it shows as a standalone experience

export const metadata = {
  title: "Daily Intel — Design Preview",
  description: "Preview of the next Daily Intel design direction",
};

const IMG = (prompt, seed, w = 800, h = 280) =>
  `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${w}&height=${h}&nologo=true&seed=${seed}&model=flux`;

const STORIES = [
  {
    tag: "Markets", tagClass: "fd-tag-markets",
    title: "Fed Officials Signal Extended Pause as Inflation Data Surprises to the Upside",
    summary: "Two Federal Reserve governors pushed back against rate-cut expectations Monday, citing persistent services inflation and a resilient labor market. Markets repriced the first cut to Q4 2026.",
    source: "Wall Street Journal", time: "2 hours ago",
    img: IMG("federal reserve interest rates abstract soft blue lavender minimal art editorial", 101, 900, 300),
    imgH: "220px", feature: true,
  },
  {
    tag: "Technology", tagClass: "fd-tag-tech",
    title: "Nvidia Data Center Revenue Surges 78% as Hyperscalers Race to Build Infrastructure",
    summary: "Blackwell chip demand crushes estimates for the eighth consecutive quarter. Management guides to record Q2.",
    source: "Bloomberg", time: "3h ago",
    img: IMG("nvidia GPU chip AI technology abstract teal minimal editorial", 202, 600, 220),
    imgH: "140px",
  },
  {
    tag: "Energy", tagClass: "fd-tag-energy",
    title: "Oil Dips Below $80 on Demand Concerns; OPEC+ Emergency Meeting Scheduled",
    summary: "Chinese industrial output disappoints, raising summer demand fears. Crude at lowest since October.",
    source: "Reuters", time: "5h ago",
    img: IMG("crude oil energy abstract warm orange minimal editorial", 303, 600, 220),
    imgH: "140px",
  },
];

const GRID = [
  { tag: "Markets", tagClass: "fd-tag-markets", title: "Goldman Sachs Reports Blowout Quarter as Investment Banking Rebounds", summary: "Strongest IB quarter since 2021, driven by M&A resurgence and high-yield bond issuances. Revenue beat by 18%.", source: "CNBC", time: "4h ago" },
  { tag: "Crypto", tagClass: "fd-tag-crypto", title: "Bitcoin Crosses $72,000 as Spot ETF Inflows Resume After Two-Week Pause", summary: "Institutional buyers return; options market prices in 80% probability of a new all-time high this quarter.", source: "CoinDesk", time: "1h ago" },
  { tag: "Policy", tagClass: "fd-tag-policy", title: "Treasury Proposes New SEC Rules for AI-Driven Financial Products", summary: "Firms deploying algorithmic trading systems must register with SEC and maintain audit trails for all model decisions.", source: "Financial Times", time: "6h ago" },
  { tag: "Technology", tagClass: "fd-tag-tech", title: "Apple Explores Custom Silicon for AR Glasses — 3× More Efficient Than M-Series", summary: "Next-gen chip targets sub-10-gram wearable form factor; AR glasses launch window rumored for late 2027.", source: "Bloomberg", time: "7h ago" },
  { tag: "Macro", tagClass: "fd-tag-macro", title: "China GDP Growth Hits 4.7%, Below 5% Target — Politburo Stimulus Expected", summary: "Property sector drag continues to weigh on the broader economy. Targeted measures expected this week.", source: "Financial Times", time: "8h ago" },
  { tag: "Markets", tagClass: "fd-tag-markets", title: "Pfizer Eyes $8B Oncology Acquisition in Latest Biotech Merger Wave", summary: "Pharma giant in advanced talks to acquire oncology startup with two late-stage pipeline assets in rare blood cancers.", source: "Reuters", time: "9h ago" },
];

const BRIEFS = [
  { source: "SpaceX · CNBC", title: "Starship 8th Test Flight Clears FAA — Full Stack Launch This Week", time: "10h ago" },
  { source: "Chicago Fed", title: "Chicago Fed President Signals No Rush to Cut Rates in 2026", time: "3h ago" },
  { source: "ECB · Reuters", title: "ECB Holds Rates; Lagarde Signals June Cut Window Remains Open", time: "6h ago" },
  { source: "Treasury Dept", title: "US 10Y Auction Draws Strong Demand Despite Rate Uncertainty", time: "8h ago" },
];

const WATCH = [
  { sym: "NVDA", name: "NVIDIA Corp", note: "Earnings Wed ↗" },
  { sym: "AAPL", name: "Apple Inc", note: "AR chip rumored" },
  { sym: "BTC", name: "Bitcoin", note: "ETF inflow surge" },
  { sym: "GS", name: "Goldman Sachs", note: "IB beat Q1" },
  { sym: "WTI", name: "Crude Oil", note: "OPEC+ meeting" },
  { sym: "GOLD", name: "Gold Spot", note: "$2,318 · +0.6%" },
];

const TICKER_ITEMS = [
  ["SPX", "▲ 5,248 +0.83%", "up"],
  ["NDX", "▲ 18,142 +1.12%", "up"],
  ["NVDA", "▲ $884 +3.44%", "up"],
  ["AAPL", "▼ $172 −0.52%", "dn"],
  ["BTC", "▲ $72,144 +2.18%", "up"],
  ["GS", "▲ $461 +1.92%", "up"],
  ["DXY", "▼ 103.84 −0.34%", "dn"],
  ["10Y", "4.32%", ""],
  ["WTI", "▼ $79.14 −1.08%", "dn"],
  ["GOLD", "▲ $2,318 +0.61%", "up"],
];

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

.fd-root {
  position: fixed; inset: 0; z-index: 9999;
  overflow-y: auto; overflow-x: hidden;
  background: #edf0f9;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  -webkit-font-smoothing: antialiased;
  color: #1a1d2e; line-height: 1.6;
}

/* Ambient background */
.fd-ambient {
  position: fixed; inset: 0; z-index: 0; pointer-events: none;
  background:
    radial-gradient(ellipse 65% 55% at 12% 8%,  rgba(190,178,255,0.32) 0%, transparent 65%),
    radial-gradient(ellipse 52% 48% at 88% 14%,  rgba(148,210,255,0.26) 0%, transparent 60%),
    radial-gradient(ellipse 58% 52% at 50% 92%,  rgba(205,185,255,0.22) 0%, transparent 60%),
    radial-gradient(ellipse 38% 42% at 4%  76%,  rgba(165,222,255,0.18) 0%, transparent 55%),
    radial-gradient(ellipse 46% 40% at 96% 58%,  rgba(255,205,185,0.14) 0%, transparent 55%),
    linear-gradient(160deg, #e8ecf8 0%, #f0f3fc 45%, #eaedfa 100%);
}

.fd-orb {
  position: fixed; border-radius: 50%;
  filter: blur(100px); pointer-events: none; z-index: 0;
  animation: fd-orb-drift 24s ease-in-out infinite;
}
.fd-orb-1 { width: 720px; height: 720px; background: rgba(180,168,255,0.20); top: -240px; left: -130px; animation-delay: 0s; }
.fd-orb-2 { width: 520px; height: 520px; background: rgba(155,210,255,0.17); top: 60px; right: -110px; animation-delay: -9s; }
.fd-orb-3 { width: 620px; height: 620px; background: rgba(210,188,255,0.16); bottom: -160px; left: 22%; animation-delay: -18s; }
.fd-orb-4 { width: 360px; height: 360px; background: rgba(255,215,195,0.12); top: 44%; right: 8%; animation-delay: -5s; }

@keyframes fd-orb-drift {
  0%,100% { transform: translate(0,0) scale(1); }
  33%      { transform: translate(28px,-22px) scale(1.04); }
  66%      { transform: translate(-16px,28px) scale(0.97); }
}

.fd-page { position: relative; z-index: 1; min-height: 100%; }

/* ── HEADER ── */
.fd-header {
  position: sticky; top: 0; z-index: 100;
  background: rgba(237,240,249,0.82);
  backdrop-filter: blur(36px) saturate(200%);
  -webkit-backdrop-filter: blur(36px) saturate(200%);
  border-bottom: 1px solid rgba(200,212,245,0.55);
  box-shadow: 0 1px 0 rgba(255,255,255,0.85), 0 2px 24px rgba(80,100,190,0.06);
}
.fd-header-inner {
  max-width: 1340px; margin: 0 auto; padding: 0 28px;
  display: flex; align-items: center; justify-content: space-between;
  height: 62px; gap: 20px;
}
.fd-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; flex-shrink: 0; }
.fd-logo-mark {
  width: 34px; height: 34px; border-radius: 9px;
  background: linear-gradient(135deg, #7b77f9, #4a47d8);
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 800; color: #fff; letter-spacing: -0.04em;
  box-shadow: 0 2px 12px rgba(91,94,246,0.35), inset 0 1px 0 rgba(255,255,255,0.25);
}
.fd-logo-name { font-size: 19px; font-weight: 700; color: #1a1d2e; letter-spacing: -0.03em; }

.fd-nav { display: flex; gap: 2px; }
.fd-nav a {
  font-size: 13px; font-weight: 500; color: #4a5070;
  text-decoration: none; padding: 6px 14px; border-radius: 20px;
  border: 1px solid transparent; transition: all 0.18s;
  white-space: nowrap;
}
.fd-nav a:hover { background: rgba(255,255,255,0.72); border-color: rgba(200,212,245,0.60); color: #1a1d2e; }
.fd-nav a.fd-active { background: rgba(91,94,246,0.10); border-color: rgba(91,94,246,0.24); color: #5b5ef6; }

.fd-header-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.fd-hbtn {
  height: 34px; padding: 0 13px; border-radius: 9px;
  background: rgba(255,255,255,0.72); border: 1px solid rgba(200,212,245,0.60);
  display: flex; align-items: center; gap: 6px;
  font-size: 13px; font-weight: 500; color: #4a5070;
  cursor: pointer; transition: all 0.18s; text-decoration: none;
  box-shadow: 0 1px 3px rgba(80,100,180,0.06);
}
.fd-hbtn:hover { background: rgba(255,255,255,0.92); color: #1a1d2e; box-shadow: 0 2px 8px rgba(80,100,180,0.10); }
.fd-hbtn-icon { width: 34px; padding: 0; justify-content: center; }

/* ── EXIT BANNER ── */
.fd-exit-bar {
  background: rgba(91,94,246,0.08);
  border-bottom: 1px solid rgba(91,94,246,0.14);
  padding: 7px 28px;
  display: flex; align-items: center; justify-content: space-between;
  font-size: 12px; color: #5b5ef6; font-weight: 500;
  position: relative; z-index: 1;
}
.fd-exit-link {
  display: flex; align-items: center; gap: 6px; color: #5b5ef6;
  text-decoration: none; font-weight: 600; transition: opacity 0.15s;
}
.fd-exit-link:hover { opacity: 0.75; }

/* ── TICKER ── */
.fd-ticker {
  background: rgba(255,255,255,0.52);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(200,212,245,0.48);
  overflow: hidden; white-space: nowrap;
  box-shadow: inset 0 -1px 0 rgba(255,255,255,0.85);
  position: relative; z-index: 1;
}
.fd-ticker-track { display: inline-block; animation: fd-ticker 44s linear infinite; padding: 6px 0; }
@keyframes fd-ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
.fd-ti { display: inline-block; padding: 0 22px; font-family: 'IBM Plex Mono', monospace; font-size: 11px; font-weight: 500; color: #6870a0; }
.fd-ti .fd-sym { font-weight: 700; color: #1a1d2e; margin-right: 5px; }
.fd-ti .fd-up { color: #0e7c4a; font-weight: 600; }
.fd-ti .fd-dn { color: #c02828; font-weight: 600; }
.fd-ti-dot { color: #ccd4f0; }

/* ── PULSE ── */
.fd-hero { max-width: 1340px; margin: 0 auto; padding: 36px 28px 0; position: relative; z-index: 1; }
.fd-pulse {
  background: rgba(255,255,255,0.68);
  backdrop-filter: blur(22px);
  -webkit-backdrop-filter: blur(22px);
  border: 1px solid rgba(255,255,255,0.90);
  border-radius: 16px; padding: 16px 22px;
  display: flex; align-items: center; gap: 14px;
  box-shadow: 0 2px 18px rgba(80,100,180,0.07), inset 0 1px 0 rgba(255,255,255,0.95);
}
.fd-live-chip {
  display: flex; align-items: center; gap: 6px; flex-shrink: 0;
  font-size: 10px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #0e7c4a;
}
.fd-live-dot {
  width: 7px; height: 7px; border-radius: 50%; background: #0e7c4a;
  box-shadow: 0 0 0 3px rgba(14,124,74,0.16);
  animation: fd-live 2.2s ease-out infinite;
}
@keyframes fd-live { 0%,100% { box-shadow: 0 0 0 3px rgba(14,124,74,0.16); } 50% { box-shadow: 0 0 0 7px rgba(14,124,74,0.04); } }
.fd-div { width: 1px; height: 20px; background: rgba(200,212,245,0.60); flex-shrink: 0; }
.fd-pulse-text { font-size: 13.5px; color: #4a5070; line-height: 1.55; }
.fd-pulse-text strong { color: #1a1d2e; }

/* ── MAIN ── */
.fd-main { max-width: 1340px; margin: 0 auto; padding: 30px 28px 80px; position: relative; z-index: 1; }

/* Section head */
.fd-sec-head { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.fd-sec-title { font-size: 10px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #8890b0; white-space: nowrap; }
.fd-sec-rule { flex: 1; height: 1px; background: rgba(200,212,245,0.50); }

/* ── CARD ── */
.fd-card {
  background: rgba(255,255,255,0.66);
  backdrop-filter: blur(28px) saturate(180%);
  -webkit-backdrop-filter: blur(28px) saturate(180%);
  border: 1px solid rgba(255,255,255,0.92);
  border-radius: 20px;
  box-shadow: 0 2px 12px rgba(80,100,180,0.07), 0 8px 32px rgba(80,100,180,0.08);
  overflow: hidden;
  transition: transform 0.30s cubic-bezier(.34,1.56,.64,1), box-shadow 0.30s ease, border-color 0.20s;
  cursor: pointer; position: relative;
}
.fd-card::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 48%;
  background: linear-gradient(to bottom, rgba(255,255,255,0.26), transparent);
  pointer-events: none; z-index: 1; border-radius: 20px 20px 0 0;
}
.fd-card:hover {
  transform: translateY(-5px) scale(1.008);
  box-shadow: 0 8px 32px rgba(80,100,180,0.13), 0 24px 64px rgba(80,100,180,0.10);
  border-color: rgba(255,255,255,0.98);
}

/* Card image */
.fd-card-img {
  width: 100%; overflow: hidden; position: relative;
  background: linear-gradient(135deg, rgba(200,195,255,0.45), rgba(160,200,255,0.38));
  flex-shrink: 0;
}
.fd-card-img img {
  width: 100%; height: 100%; object-fit: cover; display: block;
  transition: transform 0.5s ease;
}
.fd-card:hover .fd-card-img img { transform: scale(1.04); }
.fd-card-img-sheen {
  position: absolute; inset: 0;
  background: linear-gradient(to bottom, transparent 50%, rgba(255,255,255,0.16) 100%);
  pointer-events: none;
}

/* Card body */
.fd-card-body { padding: 22px 24px 24px; position: relative; z-index: 2; display: flex; flex-direction: column; }
.fd-tag-row { display: flex; align-items: center; gap: 7px; margin-bottom: 11px; flex-wrap: wrap; }
.fd-tag {
  font-size: 10px; font-weight: 700; letter-spacing: 0.10em; text-transform: uppercase;
  padding: 3px 10px; border-radius: 20px; border: 1px solid;
}
.fd-tag-markets { color: #5b5ef6; background: rgba(91,94,246,0.09);  border-color: rgba(91,94,246,0.22); }
.fd-tag-tech    { color: #0e7a6a; background: rgba(14,122,106,0.09); border-color: rgba(14,122,106,0.20); }
.fd-tag-policy  { color: #1a6fa8; background: rgba(26,111,168,0.09); border-color: rgba(26,111,168,0.20); }
.fd-tag-energy  { color: #9c4f00; background: rgba(156,79,0,0.09);   border-color: rgba(156,79,0,0.20); }
.fd-tag-crypto  { color: #7b3fa8; background: rgba(123,63,168,0.09); border-color: rgba(123,63,168,0.20); }
.fd-tag-macro   { color: #4a5070; background: rgba(74,80,112,0.08);  border-color: rgba(74,80,112,0.18); }
.fd-card-time   { font-size: 11px; color: #8890b0; margin-left: auto; }

.fd-card-title    { font-size: 17px; font-weight: 700; line-height: 1.3; letter-spacing: -0.02em; color: #1a1d2e; margin-bottom: 10px; }
.fd-card-title-xl { font-size: 23px; }
.fd-card-summary  { font-size: 13.5px; color: #4a5070; line-height: 1.65; flex: 1; }
.fd-card-footer {
  display: flex; align-items: center; justify-content: space-between;
  margin-top: 16px; padding-top: 13px;
  border-top: 1px solid rgba(200,212,245,0.42);
}
.fd-card-source { font-size: 11px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; color: #5b5ef6; }
.fd-read-link   { font-size: 12px; font-weight: 600; color: #8890b0; text-decoration: none; transition: color 0.15s; }
.fd-read-link:hover { color: #5b5ef6; }

/* Layouts */
.fd-feature-row    { display: grid; grid-template-columns: 1.55fr 1fr; gap: 14px; margin-bottom: 14px; }
.fd-feature-stack  { display: flex; flex-direction: column; gap: 14px; }
.fd-story-grid     { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 32px; }

/* Briefs */
.fd-brief-strip { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; margin-bottom: 32px; }
.fd-brief-card {
  background: rgba(255,255,255,0.62); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.88); border-radius: 14px; padding: 16px 18px;
  box-shadow: 0 1px 4px rgba(80,100,180,0.06), 0 4px 16px rgba(80,100,180,0.07);
  cursor: pointer; transition: transform 0.22s ease, box-shadow 0.22s ease;
}
.fd-brief-card:hover { transform: translateY(-3px); box-shadow: 0 2px 12px rgba(80,100,180,0.10), 0 8px 32px rgba(80,100,180,0.10); }
.fd-bc-source { font-size: 10px; font-weight: 700; letter-spacing: 0.10em; text-transform: uppercase; color: #5b5ef6; margin-bottom: 7px; }
.fd-bc-title  { font-size: 13.5px; font-weight: 600; color: #1a1d2e; line-height: 1.4; margin-bottom: 6px; }
.fd-bc-time   { font-size: 11px; color: #8890b0; }

/* Watch */
.fd-watch-strip { display: grid; grid-template-columns: repeat(6,1fr); gap: 10px; }
.fd-watch-tile {
  background: rgba(255,255,255,0.62); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.88); border-radius: 14px; padding: 14px 16px;
  box-shadow: 0 1px 4px rgba(80,100,180,0.06), 0 4px 16px rgba(80,100,180,0.07);
  cursor: pointer; transition: transform 0.20s ease, box-shadow 0.20s ease;
}
.fd-watch-tile:hover { transform: translateY(-2px); box-shadow: 0 2px 12px rgba(80,100,180,0.10), 0 8px 32px rgba(80,100,180,0.10); }
.fd-wt-sym  { font-size: 15px; font-weight: 800; letter-spacing: -0.03em; color: #1a1d2e; margin-bottom: 2px; }
.fd-wt-name { font-size: 11px; color: #8890b0; margin-bottom: 8px; }
.fd-wt-note { font-size: 11px; color: #5b5ef6; font-weight: 600; }

/* Footer */
.fd-footer {
  padding: 24px 28px; text-align: center;
  font-size: 12px; color: #8890b0;
  border-top: 1px solid rgba(200,212,245,0.42);
  max-width: 1340px; margin: 32px auto 0;
  position: relative; z-index: 1;
}

/* Responsive */
@media (max-width: 900px) {
  .fd-feature-row { grid-template-columns: 1fr; }
  .fd-story-grid  { grid-template-columns: 1fr 1fr; }
  .fd-brief-strip { grid-template-columns: 1fr 1fr; }
  .fd-watch-strip { grid-template-columns: repeat(3,1fr); }
  .fd-nav { display: none; }
}
@media (max-width: 600px) {
  .fd-story-grid  { grid-template-columns: 1fr; }
  .fd-brief-strip { grid-template-columns: 1fr; }
  .fd-watch-strip { grid-template-columns: repeat(2,1fr); }
  .fd-main { padding: 20px 16px 60px; }
  .fd-hero { padding: 20px 16px 0; }
  .fd-header-inner { padding: 0 16px; }
}
`;

export default function FutureDesignPage() {
  const tickerItems = [...TICKER_ITEMS, ...TICKER_ITEMS]; // duplicate for seamless loop

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div className="fd-root">
        {/* Ambient layers */}
        <div className="fd-ambient" />
        <div className="fd-orb fd-orb-1" />
        <div className="fd-orb fd-orb-2" />
        <div className="fd-orb fd-orb-3" />
        <div className="fd-orb fd-orb-4" />

        <div className="fd-page">

          {/* Header */}
          <header className="fd-header">
            <div className="fd-header-inner">
              <a className="fd-logo" href="/futuredesign">
                <div className="fd-logo-mark">DI</div>
                <span className="fd-logo-name">Daily Intel</span>
              </a>
              <nav className="fd-nav">
                <a href="#" className="fd-active">Markets</a>
                <a href="#">Technology</a>
                <a href="#">Policy</a>
                <a href="#">Energy</a>
                <a href="#">Earnings</a>
                <a href="#">Crypto</a>
              </nav>
              <div className="fd-header-right">
                <a className="fd-hbtn" href="#">🔍 Search</a>
                <a className="fd-hbtn fd-hbtn-icon" href="#" title="Notifications">🔔</a>
              </div>
            </div>
          </header>

          {/* Exit bar */}
          <div className="fd-exit-bar">
            <span>✦ Design Preview — Glacial Light concept · not live</span>
            <a className="fd-exit-link" href="/">← Back to current site</a>
          </div>

          {/* Ticker */}
          <div className="fd-ticker">
            <div className="fd-ticker-track">
              {tickerItems.map(([sym, val, cls], i) => (
                <span key={i} className="fd-ti">
                  <span className="fd-sym">{sym}</span>
                  <span className={cls === "up" ? "fd-up" : cls === "dn" ? "fd-dn" : ""}>{val}</span>
                  {i < tickerItems.length - 1 && <span className="fd-ti-dot"> · </span>}
                </span>
              ))}
            </div>
          </div>

          {/* Pulse */}
          <div className="fd-hero">
            <div className="fd-pulse">
              <div className="fd-live-chip">
                <div className="fd-live-dot" />
                Live
              </div>
              <div className="fd-div" />
              <p className="fd-pulse-text">
                <strong>Market Pulse —</strong> Equity futures push higher as Fed officials signal patience on rate cuts.
                Tech mega-caps report this week. Dollar softens. <strong>10Y at 4.32%.</strong>{" "}
                Bitcoin breaks <strong>$72K</strong> on renewed spot ETF inflows.
              </p>
            </div>
          </div>

          {/* Main */}
          <div className="fd-main">

            {/* Section header */}
            <div className="fd-sec-head">
              <span className="fd-sec-title">Top Stories</span>
              <div className="fd-sec-rule" />
              <span className="fd-sec-title">Monday, April 20, 2026</span>
            </div>

            {/* Feature row */}
            <div className="fd-feature-row">
              {/* Lead story */}
              <div className="fd-card">
                <div className="fd-card-img" style={{ height: "220px" }}>
                  <img src={STORIES[0].img} alt="" loading="lazy" />
                  <div className="fd-card-img-sheen" />
                </div>
                <div className="fd-card-body">
                  <div className="fd-tag-row">
                    <span className={`fd-tag ${STORIES[0].tagClass}`}>{STORIES[0].tag}</span>
                    <span className="fd-card-time">{STORIES[0].time}</span>
                  </div>
                  <h2 className="fd-card-title fd-card-title-xl">{STORIES[0].title}</h2>
                  <p className="fd-card-summary">{STORIES[0].summary}</p>
                  <div className="fd-card-footer">
                    <span className="fd-card-source">{STORIES[0].source}</span>
                    <a className="fd-read-link" href="#">Read more →</a>
                  </div>
                </div>
              </div>

              {/* Right stack */}
              <div className="fd-feature-stack">
                {STORIES.slice(1).map((s, i) => (
                  <div className="fd-card" key={i} style={{ flex: 1 }}>
                    <div className="fd-card-img" style={{ height: "140px" }}>
                      <img src={s.img} alt="" loading="lazy" />
                      <div className="fd-card-img-sheen" />
                    </div>
                    <div className="fd-card-body">
                      <div className="fd-tag-row">
                        <span className={`fd-tag ${s.tagClass}`}>{s.tag}</span>
                        <span className="fd-card-time">{s.time}</span>
                      </div>
                      <h3 className="fd-card-title">{s.title}</h3>
                      <div className="fd-card-footer">
                        <span className="fd-card-source">{s.source}</span>
                        <a className="fd-read-link" href="#">→</a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3-col grid */}
            <div className="fd-story-grid">
              {GRID.map((s, i) => (
                <div className="fd-card" key={i}>
                  <div className="fd-card-body">
                    <div className="fd-tag-row">
                      <span className={`fd-tag ${s.tagClass}`}>{s.tag}</span>
                      <span className="fd-card-time">{s.time}</span>
                    </div>
                    <h3 className="fd-card-title">{s.title}</h3>
                    <p className="fd-card-summary">{s.summary}</p>
                    <div className="fd-card-footer">
                      <span className="fd-card-source">{s.source}</span>
                      <a className="fd-read-link" href="#">Read →</a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Briefs */}
            <div className="fd-sec-head">
              <span className="fd-sec-title">Market Briefs</span>
              <div className="fd-sec-rule" />
            </div>
            <div className="fd-brief-strip">
              {BRIEFS.map((b, i) => (
                <div className="fd-brief-card" key={i}>
                  <div className="fd-bc-source">{b.source}</div>
                  <div className="fd-bc-title">{b.title}</div>
                  <div className="fd-bc-time">{b.time}</div>
                </div>
              ))}
            </div>

            {/* Watch list */}
            <div className="fd-sec-head">
              <span className="fd-sec-title">Watch List</span>
              <div className="fd-sec-rule" />
            </div>
            <div className="fd-watch-strip">
              {WATCH.map((w, i) => (
                <div className="fd-watch-tile" key={i}>
                  <div className="fd-wt-sym">{w.sym}</div>
                  <div className="fd-wt-name">{w.name}</div>
                  <div className="fd-wt-note">{w.note}</div>
                </div>
              ))}
            </div>

          </div>{/* /main */}

          <footer className="fd-footer">
            Daily Intel · Design Preview · AI-Curated Market Intelligence · April 20, 2026 · 6:02 AM EST
          </footer>

        </div>{/* /page */}
      </div>{/* /root */}
    </>
  );
}
