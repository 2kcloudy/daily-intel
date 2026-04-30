"use client";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

import { Masthead, CategoryNav, Footer, FilterDrawer } from "./Chrome";
import { HTStoryGrid } from "./Stories";
import { SearchOverlay } from "./Extras";
import { CATEGORIES, PLACEHOLDER_INDICES, transformFinanceStory } from "./dataTransform";

/** Fetch live market data from our API route, fall back to placeholders */
function useLiveMarketData() {
  const [indices, setIndices] = useState(PLACEHOLDER_INDICES);
  const timerRef = useRef(null);

  async function fetchData() {
    try {
      const res = await fetch("/api/market-data", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      if (data?.indices?.length) setIndices(data.indices);
    } catch {}
  }

  useEffect(() => {
    fetchData();
    timerRef.current = setInterval(fetchData, 90_000);
    return () => clearInterval(timerRef.current);
  }, []);

  return { indices };
}

// Tab key → display name map
const CAT_META = {
  finance:      { kicker: "The Daily Brief" },
  health:       { kicker: "Health Desk" },
  tech:         { kicker: "Tech Desk" },
  world:        { kicker: "World Desk" },
  geopolitics:  { kicker: "World Desk" },
  energy:       { kicker: "Energy Desk" },
  "real-estate":{ kicker: "Real Estate Desk" },
  startups:     { kicker: "Startup Desk" },
  crypto:       { kicker: "Crypto Desk" },
  science:      { kicker: "Science Desk" },
  longevity:    { kicker: "Longevity Desk" },
  policy:       { kicker: "Policy Desk" },
  performance:  { kicker: "Performance Desk" },
};

/** Topic pills — built dynamically from top story tags */
function TopicPills({ tags, active, onSelect }) {
  // Show top 8 tags (excluding "all")
  const pills = tags.filter(t => t.id !== "all").slice(0, 8);
  if (!pills.length) return null;

  return (
    <div style={{ background: "var(--di-paper, #fafaf7)", borderBottom: "1px solid var(--di-line, #e4e7ec)" }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
        maxWidth: 1440, margin: "0 auto", padding: "10px 40px",
      }}>
        {pills.map(t => {
          const isActive = active === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onSelect(isActive ? "all" : t.id)}
              style={{
                height: 32, padding: "0 16px", borderRadius: 999,
                border: isActive ? "1.5px solid #29B6F6" : "1.5px solid var(--di-line, #e4e7ec)",
                background: isActive ? "#29B6F6" : "var(--di-card, #fff)",
                color: isActive ? "#fff" : "var(--di-ink, #0c0d10)",
                fontFamily: "var(--di-font-ui, Inter, sans-serif)",
                fontSize: 13, fontWeight: isActive ? 700 : 500,
                cursor: "pointer", letterSpacing: "0.01em",
                transition: "all 0.15s ease",
                boxShadow: isActive ? "0 2px 8px rgba(41,182,246,0.3)" : "0 1px 3px rgba(2,4,12,0.06)",
              }}
              onMouseEnter={e => { if (!isActive) { e.currentTarget.style.borderColor = "#29B6F6"; e.currentTarget.style.color = "#29B6F6"; } }}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.borderColor = "var(--di-line, #e4e7ec)"; e.currentTarget.style.color = "var(--di-ink, #0c0d10)"; } }}
            >
              {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * PageShell — wraps every page in the Daily Intel design.
 *
 * Props (Finance homepage):  mode="finance"   financeData={...} allDates={[...]}
 * Props (Category page):     mode="category"  categoryId="tech"
 *                            tabData={...}    financeData={...}
 */
export default function PageShell({ mode = "finance", financeData, tabData, categoryId, allDates = [], hideDefaultNav = false }) {
  const router = useRouter();
  const [theme, setTheme] = useState("light");
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeTag, setActiveTag] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Endless scroll state — finance only
  const baseStories = useMemo(
    () => (mode === "finance" ? financeData?.stories : tabData?.stories) || [],
    [mode, financeData, tabData]
  );
  const [allStories, setAllStories] = useState(baseStories);
  const [nextDateIdx, setNextDateIdx] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(mode === "finance" && (allDates || []).length > 1);
  const sentinelRef = useRef(null);

  // Sync stories when financeData/tabData changes (e.g. SPA navigation)
  useEffect(() => {
    setAllStories(baseStories);
    setNextDateIdx(1);
    setHasMore(mode === "finance" && (allDates || []).length > 1);
  }, [baseStories, mode, allDates]);

  // Apply flat card style CSS vars on mount
  useEffect(() => {
    document.documentElement.style.setProperty("--di-glass-radius", "6px");
    document.documentElement.style.setProperty("--di-card-shadow", "none");
    document.documentElement.style.setProperty("--di-card-hover-shadow", "none");
    document.documentElement.style.setProperty("--di-card-border", "rgba(15,18,32,0.22)");
  }, []);

  // Live market data
  useLiveMarketData();

  // Theme init from localStorage
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

  // "/" shortcut → search overlay
  useEffect(() => {
    function onKey(e) {
      if (e.key === "/" && !searchOpen) {
        const tag = (e.target?.tagName || "").toLowerCase();
        if (tag === "input" || tag === "textarea") return;
        e.preventDefault();
        setSearchOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [searchOpen]);

  function handleNav(catId) {
    if (!catId || catId === "finance") { router.push("/"); return; }
    if (catId === "stats")   { router.push("/stats"); return; }
    if (catId === "archive") { router.push("/archive"); return; }
    const slug = catId === "world" ? "geopolitics" : catId;
    router.push(`/${slug}`);
  }

  // Endless scroll — load older finance digests
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore || !allDates || nextDateIdx >= allDates.length) {
      if (nextDateIdx >= (allDates || []).length) setHasMore(false);
      return;
    }
    setIsLoadingMore(true);
    try {
      const date = allDates[nextDateIdx];
      const res = await fetch(`/api/digest/${date}`);
      if (res.ok) {
        const older = await res.json();
        const newStories = (older.stories || []).map((s, i) => transformFinanceStory(s, i));
        setAllStories(prev => [...prev, ...newStories]);
        setNextDateIdx(n => n + 1);
        if (nextDateIdx + 1 >= allDates.length) setHasMore(false);
      } else {
        setHasMore(false);
      }
    } catch {
      setHasMore(false);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, allDates, nextDateIdx]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) loadMore();
    }, { rootMargin: "200px" });
    obs.observe(el);
    return () => obs.disconnect();
  }, [loadMore]);

  // Tag counts (for pills + filter drawer)
  const tagCounts = useMemo(() => {
    const c = {};
    allStories.forEach(s => {
      const t = s.tag || s.topic;
      if (t) c[t] = (c[t] || 0) + 1;
    });
    return c;
  }, [allStories]);

  const tags = useMemo(() => [
    { id: "all", label: "All", count: allStories.length },
    ...Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).map(([id, count]) => ({
      id: id.toLowerCase(), label: id, count,
    })),
  ], [tagCounts, allStories.length]);

  // Filtered stories — tag + search
  const filtered = useMemo(() => {
    let result = allStories;
    if (activeTag !== "all") {
      result = result.filter(s => (s.tag || s.topic || "").toLowerCase() === activeTag);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(s =>
        (s.headline || "").toLowerCase().includes(q) ||
        (s.body || s.summary || "").toLowerCase().includes(q) ||
        (s.tag || s.topic || "").toLowerCase().includes(q)
      );
    }
    return result;
  }, [allStories, activeTag, searchQuery]);

  // All stories for search overlay
  const allStoriesForSearch = useMemo(() => (
    allStories.map(s => ({ ...s, _cat: mode === "finance" ? "finance" : categoryId }))
  ), [allStories, mode, categoryId]);

  const data = mode === "finance" ? financeData : tabData;
  const dateShort = financeData?.dateShort || "";
  const catLabel = CATEGORIES.find(c => c.id === (categoryId === "geopolitics" ? "world" : categoryId))?.label || categoryId;
  const activeNavId = mode === "finance" ? "finance" : (categoryId === "geopolitics" ? "world" : categoryId);

  return (
    <>
      {!hideDefaultNav && (
        <>
          <Masthead
            date={financeData?.date || ""}
            postedAt={dateShort}
            theme={theme}
            onToggleTheme={toggleTheme}
            onNav={handleNav}
            onSearch={() => setSearchOpen(true)}
            brief={data?.brief}
            briefLabel={mode === "finance" ? "Daily Brief" : `${catLabel} Brief`}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
          <CategoryNav
            categories={CATEGORIES}
            active={activeNavId}
            onSelect={handleNav}
          />
        </>
      )}

      {/* Topic pills — dynamic from story tags */}
      <TopicPills tags={tags} active={activeTag} onSelect={setActiveTag} />

      {/* Story grid */}
      <main style={{ padding: "24px 40px 80px", maxWidth: 1440, margin: "0 auto" }}>
        <HTStoryGrid stories={filtered} />

        {/* Endless scroll sentinel (finance only) */}
        {mode === "finance" && (
          <>
            <div ref={sentinelRef} style={{ height: 1, marginTop: 40 }} />
            {isLoadingMore && (
              <div style={{
                textAlign: "center", padding: "24px 0 48px",
                fontFamily: "var(--di-font-ui, Inter, sans-serif)",
                fontSize: 13, color: "var(--di-ink-4, #787f8c)",
              }}>
                Loading more stories…
              </div>
            )}
            {!hasMore && allStories.length > 0 && (
              <div style={{
                textAlign: "center", padding: "24px 0 48px",
                fontFamily: "var(--di-font-ui, Inter, sans-serif)",
                fontSize: 12, color: "var(--di-ink-4, #787f8c)",
                letterSpacing: "0.06em", textTransform: "uppercase",
              }}>
                — End of archive —
              </div>
            )}
          </>
        )}
      </main>

      {/* Floating filter drawer — fallback for many tags */}
      <FilterDrawer tags={tags} active={activeTag} onSelect={setActiveTag} />

      <Footer onNav={handleNav} />

      {/* Search overlay (press /) */}
      {searchOpen && (
        <SearchOverlay
          onClose={() => setSearchOpen(false)}
          onOpenStory={s => { setSearchOpen(false); window.open(s.url, "_blank", "noopener"); }}
          onNav={handleNav}
          allStories={allStoriesForSearch}
          categories={CATEGORIES}
        />
      )}
    </>
  );
}
