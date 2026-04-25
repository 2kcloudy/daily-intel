"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";

import { TickerBar, Masthead, CategoryNav, Bulletin, Footer } from "./Chrome";
import { StoryList, TagFilter } from "./Stories";
import Rail from "./Rail";
import { StoryDetail, SearchOverlay } from "./Extras";
import { useTweaks, TweaksPanel } from "./Tweaks";
import { CATEGORIES, PLACEHOLDER_INDICES } from "./dataTransform";

/** Fetch live market data from our API route, fall back to placeholders */
function useLiveMarketData() {
  const [indices, setIndices] = useState(PLACEHOLDER_INDICES);
  const [lastUpdated, setLastUpdated] = useState(null);
  const timerRef = useRef(null);

  async function fetchData() {
    try {
      const res = await fetch("/api/market-data", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      if (data?.indices?.length) {
        setIndices(data.indices);
        setLastUpdated(data.updatedAt ? new Date(data.updatedAt) : new Date());
      }
    } catch {
      // silently keep last known data
    }
  }

  useEffect(() => {
    fetchData(); // initial load
    // Refresh every 90 seconds
    timerRef.current = setInterval(fetchData, 90_000);
    return () => clearInterval(timerRef.current);
  }, []);

  return { indices, lastUpdated };
}

// Tab key → display name map
const CAT_META = {
  finance:      { desc: "Markets, macro, earnings, and the money that moves them.", kicker: "The Daily Brief" },
  health:       { desc: "Science-backed health, pharma, and wellness intelligence.", kicker: "Health Desk" },
  tech:         { desc: "Chips, clouds, and the companies shipping at the frontier.", kicker: "Tech Desk" },
  world:        { desc: "Geopolitics, conflict, and the shifting global order.", kicker: "World Desk" },
  geopolitics:  { desc: "Geopolitics, conflict, and the shifting global order.", kicker: "World Desk" },
  energy:       { desc: "Crude, grids, and the new molecules of transition.", kicker: "Energy Desk" },
  "real-estate":{ desc: "Housing, commercial, and the rates that price them.", kicker: "Real Estate Desk" },
  startups:     { desc: "Venture, deals, and the next decade of platforms.", kicker: "Startup Desk" },
  crypto:       { desc: "Digital assets, ETFs, and on-chain signal.", kicker: "Crypto Desk" },
  science:      { desc: "Discoveries with market and societal consequence.", kicker: "Science Desk" },
  longevity:    { desc: "Healthspan, diagnostics, and the long arc of aging.", kicker: "Longevity Desk" },
  policy:       { desc: "Washington, Brussels, Beijing — rule sets that price risk.", kicker: "Policy Desk" },
  performance:  { desc: "Sleep, focus, and the science of operating at peak.", kicker: "Performance Desk" },
};

/**
 * PageShell — wraps any page in the new DI design.
 *
 * Props (Finance homepage variant):
 *   mode="finance"   financeData={buildFinanceData(...)} allDates={[...]}
 *
 * Props (Category page variant):
 *   mode="category"  categoryId="tech"
 *   tabData={buildTabData(...)}  financeData={buildFinanceData(...)}
 */
export default function PageShell({ mode = "finance", financeData, tabData, categoryId, allDates = [], cardLayout = "side-thumb" }) {
  const router = useRouter();
  const [tweaks, updateTweaks] = useTweaks();
  const [showTweaks, setShowTweaks] = useState(false);
  const [theme, setTheme] = useState("light");
  const [openStory, setOpenStory] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeTag, setActiveTag] = useState("all");

  // Live market data (auto-refreshes every 90s)
  const { indices: liveIndices, lastUpdated: marketUpdatedAt } = useLiveMarketData();

  // Initialise theme from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("di-theme") || "light";
      setTheme(saved);
      document.documentElement.setAttribute("data-theme", saved);
    } catch {}
  }, []);

  function toggleTheme() {
    setTheme(t => {
      const next = t === "dark" ? "light" : "dark";
      try { localStorage.setItem("di-theme", next); } catch {}
      document.documentElement.setAttribute("data-theme", next);
      return next;
    });
  }

  // "/" shortcut to open search
  useEffect(() => {
    function onKey(e) {
      if (e.key === "/" && !searchOpen && !openStory) {
        const tag = (e.target?.tagName || "").toLowerCase();
        if (tag === "input" || tag === "textarea") return;
        e.preventDefault();
        setSearchOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [searchOpen, openStory]);

  function handleNav(catId) {
    if (!catId || catId === "finance") { router.push("/"); return; }
    if (catId === "stats")   { router.push("/stats"); return; }
    if (catId === "archive") { router.push("/archive"); return; }
    // Map "world" → "geopolitics" for URL routing
    const slug = catId === "world" ? "geopolitics" : catId;
    router.push(`/${slug}`);
  }

  // Decide which data to render
  const data = mode === "finance" ? financeData : tabData;
  const stories = data?.stories || [];

  // Tag filter (finance only)
  const tagCounts = useMemo(() => {
    const c = {};
    stories.forEach(s => { if (s.tag) c[s.tag] = (c[s.tag] || 0) + 1; });
    return c;
  }, [stories]);

  const tags = useMemo(() => [
    { id: "all", label: "All", count: stories.length },
    ...Object.entries(tagCounts).sort((a,b) => b[1]-a[1]).map(([id, count]) => ({
      id: id.toLowerCase(), label: id, count,
    })),
  ], [tagCounts, stories.length]);

  const filtered = useMemo(() => {
    if (activeTag === "all" || mode !== "finance") return stories;
    return stories.filter(s => (s.tag || "").toLowerCase() === activeTag);
  }, [activeTag, stories, mode]);

  // Hero story removed — every story now renders in the standard StoryList grid below.

  // All stories for search (finance + current tab)
  const allStories = useMemo(() => {
    const out = stories.map(s => ({ ...s, _cat: mode === "finance" ? "finance" : categoryId }));
    return out;
  }, [stories, mode, categoryId]);

  const watchlist = (mode === "finance" ? financeData?.watchlist : tabData?.watchlist) || [];
  const archive   = data?.archive || [];
  const pulse     = data?.pulse || "";
  // Use live indices from Yahoo Finance (auto-refreshed), fall back to digest data or static placeholders
  const indices = liveIndices?.length ? liveIndices : (financeData?.indices || PLACEHOLDER_INDICES);
  const sources   = data?.sources || [];
  const dateShort = financeData?.dateShort || "";

  // Category display info
  const catMeta = CAT_META[categoryId || "finance"] || CAT_META.finance;
  const catLabel = CATEGORIES.find(c => c.id === (categoryId === "geopolitics" ? "world" : categoryId))?.label || categoryId;
  const catGlyph = CATEGORIES.find(c => c.id === (categoryId === "geopolitics" ? "world" : categoryId))?.glyph || "·";

  // Active nav id — map geopolitics → world for the nav
  const activeNavId = mode === "finance" ? "finance"
    : (categoryId === "geopolitics" ? "world" : categoryId);

  const densityClass = tweaks.density === "compact" ? "compact" : tweaks.density === "spacious" ? "spacious" : "";

  return (
    <>
      <TickerBar indices={indices} />
      <Masthead
        date={financeData?.date || ""}
        postedAt={dateShort}
        theme={theme}
        onToggleTheme={toggleTheme}
        onNav={handleNav}
        onSearch={() => setSearchOpen(true)}
      />
      <CategoryNav
        categories={CATEGORIES}
        active={activeNavId}
        onSelect={handleNav}
      />
      <Bulletin
        text={pulse}
        postedAt={dateShort}
        storyCount={stories.length}
        sources={sources}
      />

      {/* Category pages share the same compact header as Finance — the active
          tab in the nav already conveys which desk we're on. */}

      <main className={`di-main ${densityClass}`}>
        <div>
          {/* Section header */}
          <div className="di-section-head">
            <div className="di-section-title">
              {mode === "finance" ? "Today's Brief" : `More in ${catLabel}`}
              <span className="count">
                {mode === "finance" ? "Ranked by market importance" : `${filtered.length} stories`}
              </span>
            </div>
            <div className="di-section-sources">{sources.slice(0, 4).join(" · ")}</div>
          </div>

          {/* Tag filter — finance homepage only */}
          {mode === "finance" && (
            <TagFilter tags={tags} active={activeTag} onSelect={setActiveTag} />
          )}

          {/* Story list — every story rendered in the same grid format */}
          <StoryList
            stories={filtered}
            compact={tweaks.density === "compact"}
            onOpen={setOpenStory}
            layout={cardLayout}
          />
        </div>

        <Rail
          indices={indices}
          watchlist={watchlist}
          archive={archive}
          onNav={handleNav}
          showIndices={mode === "finance" && tweaks.showIndices}
          marketUpdatedAt={marketUpdatedAt}
        />
      </main>

      <Footer onNav={handleNav} />

      {/* Tweaks toggle (bottom-right, dev / design review) */}
      {!showTweaks && (
        <button className="di-tweaks-toggle" onClick={() => setShowTweaks(true)} title="Design tweaks">
          Tweaks
        </button>
      )}
      {showTweaks && (
        <TweaksPanel tweaks={tweaks} update={updateTweaks} onClose={() => setShowTweaks(false)} />
      )}

      {/* Story detail modal */}
      {openStory && (
        <StoryDetail story={openStory} onClose={() => setOpenStory(null)} dateShort={dateShort} />
      )}

      {/* Search overlay */}
      {searchOpen && (
        <SearchOverlay
          onClose={() => setSearchOpen(false)}
          onOpenStory={s => { setSearchOpen(false); setOpenStory(s); }}
          onNav={handleNav}
          allStories={allStories}
          categories={CATEGORIES}
        />
      )}
    </>
  );
}
