"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { storyImg } from "./dataTransform";

const TAG_GRADIENTS = {
  markets:"linear-gradient(135deg,#0f2027,#2c5364)",
  ai:"linear-gradient(135deg,#1a0533,#7b1fa2)",
  tech:"linear-gradient(135deg,#0d1b2a,#1e5799)",
  earnings:"linear-gradient(135deg,#1a1200,#7a5800)",
  energy:"linear-gradient(135deg,#0a1628,#2e7d32)",
  crypto:"linear-gradient(135deg,#1a0e00,#c56a00)",
  defense:"linear-gradient(135deg,#1a1a1a,#3a4a3a)",
  macro:"linear-gradient(135deg,#0c1445,#2e4490)",
  policy:"linear-gradient(135deg,#0a0e2e,#243b8a)",
  health:"linear-gradient(135deg,#001a0e,#00693a)",
  world:"linear-gradient(135deg,#1a0a00,#7a3a00)",
  startups:"linear-gradient(135deg,#001a2c,#006a8a)",
  science:"linear-gradient(135deg,#001a2e,#005c8a)",
  longevity:"linear-gradient(135deg,#001a14,#00543e)",
  performance:"linear-gradient(135deg,#1a1400,#6b5400)",
  default:"linear-gradient(135deg,#111827,#374151)",
};
function tagGradient(tag) {
  return TAG_GRADIENTS[(tag||"").toLowerCase().replace(/[\s/+]+/g,"")] || TAG_GRADIENTS.default;
}

function ModalImg({ story }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div style={{ width:"100%", height:420, background:tagGradient(story.tag||story.topic), display:"flex", alignItems:"center", justifyContent:"center" }}>
        <span style={{ fontFamily:"var(--di-font-ui)", fontSize:13, fontWeight:700, letterSpacing:"0.12em", color:"rgba(255,255,255,0.3)", textTransform:"uppercase" }}>
          {(story.tag||"?").slice(0,2).toUpperCase()}
        </span>
      </div>
    );
  }
  return (
    <img src={storyImg(story, 1600, 800)} alt="" loading="eager"
      style={{ width:"100%", height:420, objectFit:"cover", display:"block" }}
      onError={() => setFailed(true)} />
  );
}

// ── WHY IT MATTERS copy by tag ────────────────────────────────────────────────
const WHY = {
  Crypto:       "Structural demand from regulated products is reshaping crypto's marginal bid. ETF approvals and institutional custody frameworks now drive near-term flows more than on-chain activity.",
  Tech:         "The AI capex cycle is compressing historical product timelines. Hardware, talent, and power access are the binding constraints — not capital.",
  Energy:       "Energy policy and AI compute demand are converging. Nuclear, LNG, and grid buildout are now tech-equity-correlated trades.",
  Health:       "GLP-1 franchise economics and payer dynamics now price the sector more than traditional pipeline readouts. Indications beyond metabolic are the next leg.",
  World:        "Geopolitics is no longer a side factor in equity positioning. Defense capex, supply chain routing, and currency regime shifts drive cross-asset moves.",
  "Real Estate":"Rates, supply overhangs, and AI data-center demand are the three vectors — and they point in different directions by sub-sector.",
  Startups:     "Private market pricing has decoupled from public comps. AI infrastructure rounds set new benchmarks that may or may not translate to exit outcomes.",
  Science:      "Translation speed from paper to market is compressing. Foundation models, automated wet-lab, and regulatory clearance paths are all accelerating.",
  Longevity:    "The category is crossing from biohacker-curiosity to FDA-relevant endpoints. Real RCTs are replacing narrative; effect sizes are clarifying.",
  Policy:       "Regulatory calendars are now a core input to sector positioning. Pharma, finance, and crypto all face 18-month windows that re-price risk.",
  Performance:  "Behavior-change evidence is catching up to the wearables market. The science narrows what works from what markets.",
  AI:           "AI infrastructure has become the single largest non-government capex story in the global economy. Power, memory, and talent are the near-term gating factors.",
  Markets:      "Macro positioning is increasingly driven by policy calendars rather than data surprises. Vol is compressed but asymmetric risk remains.",
  Defense:      "Drones, counter-drone, and long-range fires are reshaping defense procurement. Program-of-record winners are diverging from headline appropriations.",
  Commodities:  "Supply disruption, not demand, is now the dominant price-setter. Hedge flows and physical differentials matter more than speculative positioning.",
  Earnings:     "The Q1 print matters less than forward guidance on capex, tariffs, and AI monetization. Beats without raises are being punished.",
  Macro:        "The Fed-to-fiscal handoff is the dominant macro trade. Rate-cut pricing and term premium are moving on different drivers.",
};
const DEFAULT_WHY = "Monitor how this story affects the sectors it touches. Second-order effects on supply chains, capital allocation, and regulatory frameworks often move faster than the headline.";

// ── STORY DETAIL MODAL ────────────────────────────────────────────────────────
export function StoryDetail({ story, onClose, dateShort }) {
  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  if (!story) return null;

  const paragraphs = (story.body || "").split(/(?<=[.!?])\s+(?=[A-Z])/).filter(Boolean);
  const tag = story.tag || "";
  const tagClass = tag.toLowerCase().replace(/[\s/+]+/g, "");
  const whyCopy = WHY[tag] || DEFAULT_WHY;

  return (
    <div className="di-detail-backdrop" onClick={onClose}>
      <article className="di-detail" onClick={(e) => e.stopPropagation()}>
        <button className="di-detail-close" onClick={onClose} aria-label="Close">×</button>

        <header className="di-detail-head">
          <div className="di-detail-meta">
            <span className={"di-cat-label " + tagClass}>— {tag}</span>
            <span className="di-detail-sep">·</span>
            <span>{story.source}</span>
            {dateShort && <><span className="di-detail-sep">·</span><span>{dateShort}</span></>}
          </div>
          <h1 className="di-detail-head-title">{story.headline}</h1>
          <p className="di-detail-head-sub">{story.sub}</p>
        </header>

        <figure className="di-detail-fig">
          <ModalImg story={story} />
          <figcaption>{tag} · Editorial illustration — Daily Intel</figcaption>
        </figure>

        <div className="di-detail-body">
          {paragraphs.map((p, i) => (
            <p key={i} className={i === 0 ? "lede" : ""}>{p}</p>
          ))}

          {(story.tickers || []).length > 0 && (
            <div className="di-detail-tickers">
              <div className="di-detail-tickers-label">Market reaction</div>
              <div className="di-detail-tickers-grid">
                {story.tickers.map((t, i) => (
                  <div key={i} className="di-detail-ticker">
                    <span className="sym">{t.sym}</span>
                    <span className={"val " + (t.dir === "up" ? "pos" : "neg")}>
                      {t.dir === "up" ? "▲" : "▼"} {t.val}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="di-detail-why">
            <div className="di-detail-why-label">Why it matters</div>
            <p>{whyCopy}</p>
          </div>

          <div className="di-detail-footer">
            <a className="di-detail-source" href={story.url} target="_blank" rel="noopener noreferrer">
              Read on {story.source} →
            </a>
            <div className="di-detail-share">
              <button onClick={() => navigator.clipboard?.writeText(story.url || window.location.href)}>Copy link</button>
              <button onClick={() => window.open(`mailto:?subject=${encodeURIComponent(story.headline)}&body=${encodeURIComponent(story.url || "")}`)}>Email</button>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}

// ── SEARCH OVERLAY ────────────────────────────────────────────────────────────
export function SearchOverlay({ onClose, onOpenStory, onNav, allStories = [], categories = [] }) {
  const [q, setQ] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    function onKey(e) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const results = useMemo(() => {
    if (!q.trim()) return [];
    const needle = q.toLowerCase();
    return allStories.filter(s =>
      (s.headline && s.headline.toLowerCase().includes(needle)) ||
      (s.body && s.body.toLowerCase().includes(needle)) ||
      (s.tag && s.tag.toLowerCase().includes(needle)) ||
      (s.source && s.source.toLowerCase().includes(needle))
    ).slice(0, 20);
  }, [q, allStories]);

  const suggested = [
    { lbl: "Bitcoin", q: "bitcoin" },
    { lbl: "Nvidia", q: "nvidia" },
    { lbl: "GLP-1", q: "glp" },
    { lbl: "Nuclear SMR", q: "smr" },
    { lbl: "Apple", q: "apple" },
    { lbl: "AI capex", q: "capex" },
  ];

  return (
    <div className="di-search-backdrop" onClick={onClose}>
      <div className="di-search" onClick={(e) => e.stopPropagation()}>
        <div className="di-search-head">
          <span className="di-search-icon">⌕</span>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search stories, tickers, sources…"
            className="di-search-input"
          />
          <kbd>esc</kbd>
        </div>

        {!q.trim() && (
          <div className="di-search-empty">
            <div className="di-search-empty-label">Suggested</div>
            <div className="di-search-chips">
              {suggested.map((s, i) => (
                <button key={i} onClick={() => setQ(s.q)} className="di-search-chip">{s.lbl}</button>
              ))}
            </div>
            {categories.length > 0 && (
              <>
                <div className="di-search-empty-label" style={{ marginTop: 24 }}>Jump to desk</div>
                <div className="di-search-chips">
                  {categories.map(c => (
                    <button key={c.id} onClick={() => { onClose(); onNav && onNav(c.id); }} className="di-search-chip">
                      <span className="g">{c.glyph}</span> {c.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {q.trim() && results.length === 0 && (
          <div className="di-search-noresults">No stories match <b>&ldquo;{q}&rdquo;</b>.</div>
        )}

        {results.length > 0 && (
          <div className="di-search-results">
            <div className="di-search-results-label">{results.length} result{results.length !== 1 ? "s" : ""}</div>
            {results.map((s, i) => (
              <button key={i} className="di-search-result" onClick={() => { onClose(); onOpenStory && onOpenStory(s); }}>
                <span className={"di-cat-label " + (s.tag || "").toLowerCase().replace(/[\s/+]+/g, "")}>— {s.tag}</span>
                <div>
                  <div className="di-search-result-head">{s.headline}</div>
                  <div className="di-search-result-sub">{s.sub || s.source}</div>
                </div>
                <span className="di-search-result-cat">{s._cat || ""}</span>
              </button>
            ))}
          </div>
        )}

        <div className="di-search-footer">
          <span><kbd>↵</kbd> open</span>
          <span><kbd>esc</kbd> close</span>
          <span><kbd>/</kbd> focus</span>
        </div>
      </div>
    </div>
  );
}

// ── CATEGORY STRIPS ───────────────────────────────────────────────────────────
function CryptoStrip() {
  const rows = [
    { sym:"BTC",  val:"$76,535", pct:"+2.70%", dir:"up",   dom:"58.1%" },
    { sym:"ETH",  val:"$2,322",  pct:"+2.20%", dir:"up",   dom:"14.2%" },
    { sym:"SOL",  val:"$182.41", pct:"+4.12%", dir:"up",   dom:"3.8%"  },
    { sym:"BNB",  val:"$614.22", pct:"+0.91%", dir:"up",   dom:"5.4%"  },
    { sym:"XRP",  val:"$0.548",  pct:"-0.33%", dir:"down", dom:"2.1%"  },
    { sym:"DOGE", val:"$0.148",  pct:"+1.84%", dir:"up",   dom:"1.1%"  },
    { sym:"TON",  val:"$5.82",   pct:"+3.22%", dir:"up",   dom:"0.6%"  },
    { sym:"LINK", val:"$14.88",  pct:"+2.14%", dir:"up",   dom:"0.4%"  },
  ];
  return (
    <div className="di-cat-strip di-cat-strip-crypto">
      <div className="di-cat-strip-label"><span className="live-dot" />Spot</div>
      <div className="di-cat-strip-rows">
        {rows.map((r,i) => (
          <div key={i} className="di-cat-strip-row">
            <span className="s">{r.sym}</span><span className="v">{r.val}</span>
            <span className={"p "+(r.dir==="up"?"pos":"neg")}>{r.dir==="up"?"▲":"▼"} {r.pct}</span>
            <span className="d">Dom {r.dom}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function EnergyStrip() {
  const rows = [
    { sym:"WTI",     val:"$89.14", pct:"+2.20%", dir:"up"   },
    { sym:"Brent",   val:"$94.88", pct:"+1.66%", dir:"up"   },
    { sym:"Nat Gas", val:"$3.41",  pct:"+1.12%", dir:"up"   },
    { sym:"Gasoline",val:"$2.84",  pct:"+0.82%", dir:"up"   },
    { sym:"Heating", val:"$2.96",  pct:"+1.44%", dir:"up"   },
    { sym:"Uranium", val:"$92.14", pct:"+3.18%", dir:"up"   },
    { sym:"Coal",    val:"$148.22",pct:"-0.44%", dir:"down" },
    { sym:"Carbon",  val:"€88.12", pct:"+0.22%", dir:"up"   },
  ];
  return (
    <div className="di-cat-strip di-cat-strip-energy">
      <div className="di-cat-strip-label"><span className="live-dot" />Commodities</div>
      <div className="di-cat-strip-rows">
        {rows.map((r,i) => (
          <div key={i} className="di-cat-strip-row">
            <span className="s">{r.sym}</span><span className="v">{r.val}</span>
            <span className={"p "+(r.dir==="up"?"pos":"neg")}>{r.dir==="up"?"▲":"▼"} {r.pct}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PolicyStrip() {
  const events = [
    { date:"APR 28", ev:"FOMC Day 1",       note:"Policy rate decision expected unchanged" },
    { date:"APR 29", ev:"FOMC Statement",   note:"Powell presser 2:30pm ET" },
    { date:"MAY 07", ev:"Warsh Floor Vote", note:"Senate confirmation as Fed Chair" },
    { date:"MAY 12", ev:"CFTC BTC Futures", note:"Coinbase Derivatives launch" },
    { date:"MAY 15", ev:"House FSC Markup", note:"FIT21 crypto framework" },
    { date:"MAY 22", ev:"EU AI Act Ph. 2",  note:"High-risk model obligations live" },
    { date:"JUN 11", ev:"SEC Roundtable",   note:"Digital asset listing standards" },
    { date:"JUN 18", ev:"SpaceX Pricing",   note:"Roadshow closes; pricing night" },
  ];
  return (
    <div className="di-cat-strip di-cat-strip-policy">
      <div className="di-cat-strip-label"><span className="live-dot" />Regulatory Calendar</div>
      <div className="di-cat-strip-rows">
        {events.map((e,i) => (
          <div key={i} className="di-cat-strip-event">
            <span className="d">{e.date}</span>
            <span className="n"><b>{e.ev}</b><em>{e.note}</em></span>
          </div>
        ))}
      </div>
    </div>
  );
}

function WorldStrip() {
  const rows = [
    { r:"Hormuz Blockade",  v:"Day 54",  n:"17 mb/d tanker flow locked" },
    { r:"EU Defense / GDP", v:"3.04%",   n:"+0.62 pp YoY" },
    { r:"India GDP (nom.)", v:"$4.3T",   n:"Overtakes Japan" },
    { r:"US-CN tariff",     v:"54%",     n:"On basket · paused" },
    { r:"JPY/USD",          v:"158.12",  n:"BoJ two-way risk" },
    { r:"ADIZ Incursions",  v:"187",     n:"6-mo low · Mar '26" },
  ];
  return (
    <div className="di-cat-strip di-cat-strip-world">
      <div className="di-cat-strip-label"><span className="live-dot" />Geo-Economic Board</div>
      <div className="di-cat-strip-rows">
        {rows.map((r,i) => (
          <div key={i} className="di-cat-strip-geo">
            <span className="s">{r.r}</span><span className="v">{r.v}</span><span className="n">{r.n}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function HealthStrip() {
  const rows = [
    { date:"MAY 08", ev:"Zepbound OSA",   note:"LLY PDUFA · $1.2B peak" },
    { date:"MAY 14", ev:"Casgevy EU",     note:"VRTX reimbursement milestone" },
    { date:"MAY 22", ev:"Cagrisema P3",   note:"NVO readout" },
    { date:"JUN 04", ev:"DaVinci 5 EU",   note:"ISRG CE mark" },
    { date:"JUN 11", ev:"CMS IRA Ph. 2",  note:"Effective date prep" },
    { date:"JUN 18", ev:"SURMOUNT-ALZ",   note:"LLY exploratory endpoints" },
  ];
  return (
    <div className="di-cat-strip di-cat-strip-health">
      <div className="di-cat-strip-label"><span className="live-dot" />FDA / Pipeline Calendar</div>
      <div className="di-cat-strip-rows">
        {rows.map((e,i) => (
          <div key={i} className="di-cat-strip-event">
            <span className="d">{e.date}</span>
            <span className="n"><b>{e.ev}</b><em>{e.note}</em></span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StartupsStrip() {
  const rows = [
    { c:"OpenAI",    a:"$122B", v:"$852B", r:"Series I" },
    { c:"Cursor",    a:"$2.0B", v:"$50B",  r:"Series C" },
    { c:"Anthropic", a:"$12.0B",v:"$200B", r:"Series F" },
    { c:"xAI",       a:"$6.0B", v:"$75B",  r:"Series D" },
    { c:"Databricks",a:"$8.5B", v:"$82B",  r:"Pre-IPO"  },
    { c:"Mistral",   a:"$2.1B", v:"$18B",  r:"Series D" },
  ];
  return (
    <div className="di-cat-strip di-cat-strip-startups">
      <div className="di-cat-strip-label"><span className="live-dot" />Deal Flow · Last 30 days</div>
      <div className="di-cat-strip-rows">
        {rows.map((r,i) => (
          <div key={i} className="di-cat-strip-deal">
            <span className="c">{r.c}</span><span className="a">{r.a}</span>
            <span className="v">@ {r.v}</span><span className="r">{r.r}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TechStrip() {
  const rows = [
    { r:"MSFT AI capex '26",v:"$115B",    n:"+42% YoY" },
    { r:"META capex '26",   v:"$94B",     n:"+33% YoY" },
    { r:"GOOGL capex '26",  v:"$82B",     n:"+28% YoY" },
    { r:"AMZN capex '26",   v:"$125B",    n:"+38% YoY" },
    { r:"Stargate planned",  v:"7 GW",    n:"5 new sites" },
    { r:"TSMC 3nm",          v:"Sold out",n:"Through 2028" },
  ];
  return (
    <div className="di-cat-strip di-cat-strip-world">
      <div className="di-cat-strip-label"><span className="live-dot" />AI Infrastructure Board</div>
      <div className="di-cat-strip-rows">
        {rows.map((r,i) => (
          <div key={i} className="di-cat-strip-geo">
            <span className="s">{r.r}</span><span className="v">{r.v}</span><span className="n">{r.n}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScienceStrip() {
  const rows = [
    { r:"AlphaFold 4",   v:"3x",   n:"Binding accuracy vs. AF3" },
    { r:"CFS Magnet",    v:"20T",  n:"HTS tokamak milestone" },
    { r:"Fusion funding",v:"$9.1B",n:"Private · cumulative" },
    { r:"BCI implants",  v:"22",   n:"Humans · 2026 YTD" },
    { r:"Rigetti QEC",   v:"336",  n:"Qubit roadmap · Q4" },
    { r:"JWST K2-18b",   v:"3σ",   n:"Biosig debate" },
  ];
  return (
    <div className="di-cat-strip di-cat-strip-world">
      <div className="di-cat-strip-label"><span className="live-dot" />Research Board</div>
      <div className="di-cat-strip-rows">
        {rows.map((r,i) => (
          <div key={i} className="di-cat-strip-geo">
            <span className="s">{r.r}</span><span className="v">{r.v}</span><span className="n">{r.n}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LongevityStrip() {
  const rows = [
    { r:"Zone 2 cardio",    v:"4×45m", n:"Weekly protocol" },
    { r:"VO2 max (M40)",    v:"52+",   n:"'Elite' threshold" },
    { r:"Creatine",         v:"10g/d", n:"Cognitive dose" },
    { r:"Sleep window",     v:"7h 22m",n:"Median · WHOOP" },
    { r:"RTB-101",          v:"-4.2y", n:"PhenoAge Δ · P2" },
    { r:"Vit D3",           v:"5000IU",n:"Baseline winter" },
  ];
  return (
    <div className="di-cat-strip di-cat-strip-world">
      <div className="di-cat-strip-label"><span className="live-dot" />Protocol Board</div>
      <div className="di-cat-strip-rows">
        {rows.map((r,i) => (
          <div key={i} className="di-cat-strip-geo">
            <span className="s">{r.r}</span><span className="v">{r.v}</span><span className="n">{r.n}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RealEstateStrip() {
  const rows = [
    { r:"30Y Fixed",      v:"6.37%",   n:"-15 bps WoW" },
    { r:"Median List",    v:"$424,900",n:"-0.4% YoY" },
    { r:"Inventory (SFR)",v:"1.23M",   n:"+4.2% YoY" },
    { r:"Days-on-market", v:"52",      n:"+11 vs. '25" },
    { r:"DC Lease",       v:"$185/kW", n:"Ashburn · ATH" },
    { r:"Indl Vacancy",   v:"6.8%",    n:"+20 bps QoQ" },
  ];
  return (
    <div className="di-cat-strip di-cat-strip-world">
      <div className="di-cat-strip-label"><span className="live-dot" />Property & Rates</div>
      <div className="di-cat-strip-rows">
        {rows.map((r,i) => (
          <div key={i} className="di-cat-strip-geo">
            <span className="s">{r.r}</span><span className="v">{r.v}</span><span className="n">{r.n}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PerformanceStrip() {
  const rows = [
    { r:"HRV (35-45)",    v:"54ms",   n:"+2 vs '25" },
    { r:"RHR (median)",   v:"58",     n:"-1.1 YoY" },
    { r:"Sleep trackers", v:"40%",    n:"Gallup-Pew" },
    { r:"VO2 median 40M", v:"42",     n:"ML/kg/min" },
    { r:"Step target",    v:"8,200",  n:"Mortality plateau" },
    { r:"Resistance 2×/wk",v:"+14%", n:"All-cause Δ" },
  ];
  return (
    <div className="di-cat-strip di-cat-strip-world">
      <div className="di-cat-strip-label"><span className="live-dot" />Metrics Board</div>
      <div className="di-cat-strip-rows">
        {rows.map((r,i) => (
          <div key={i} className="di-cat-strip-geo">
            <span className="s">{r.r}</span><span className="v">{r.v}</span><span className="n">{r.n}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CategoryStrip({ categoryId }) {
  if (categoryId === "crypto")      return <CryptoStrip />;
  if (categoryId === "energy")      return <EnergyStrip />;
  if (categoryId === "policy")      return <PolicyStrip />;
  if (categoryId === "world" || categoryId === "geopolitics") return <WorldStrip />;
  if (categoryId === "health")      return <HealthStrip />;
  if (categoryId === "startups")    return <StartupsStrip />;
  if (categoryId === "real-estate") return <RealEstateStrip />;
  if (categoryId === "science")     return <ScienceStrip />;
  if (categoryId === "longevity")   return <LongevityStrip />;
  if (categoryId === "performance") return <PerformanceStrip />;
  if (categoryId === "tech")        return <TechStrip />;
  return null;
}
