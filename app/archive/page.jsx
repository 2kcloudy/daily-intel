import Link from "next/link";
import {
  getAllDates,
  getAllHealthDates,
  getAllTabDates,
} from "@/lib/storage";

export const revalidate = 300;

export const metadata = {
  title: "Archive — Daily Intel",
  description: "Past issues across every Daily Intel desk.",
};

const TAB_KEYS = [
  "tech", "geopolitics", "energy", "real-estate", "startups",
  "crypto", "science", "longevity", "policy", "performance",
];

const TAB_META = {
  finance:       { label: "Finance",      glyph: "📈", path: (d) => `/${d}` },
  health:        { label: "Health",       glyph: "🌿", path: (d) => `/health/${d}` },
  tech:          { label: "Tech",         glyph: "🤖", path: (d) => `/tech/${d}` },
  geopolitics:   { label: "World",        glyph: "🌍", path: (d) => `/geopolitics/${d}` },
  energy:        { label: "Energy",       glyph: "⚡", path: (d) => `/energy/${d}` },
  "real-estate": { label: "Real Estate",  glyph: "🏠", path: (d) => `/real-estate/${d}` },
  startups:      { label: "Startups",     glyph: "🚀", path: (d) => `/startups/${d}` },
  crypto:        { label: "Crypto",       glyph: "₿",  path: (d) => `/crypto/${d}` },
  science:       { label: "Science",      glyph: "🔬", path: (d) => `/science/${d}` },
  longevity:     { label: "Longevity",    glyph: "🧬", path: (d) => `/longevity/${d}` },
  policy:        { label: "Policy",       glyph: "⚖️", path: (d) => `/policy/${d}` },
  performance:   { label: "Performance",  glyph: "💪", path: (d) => `/performance/${d}` },
};

function fmtLong(d) {
  try {
    const date = new Date(d + "T12:00:00Z");
    return date.toLocaleDateString("en-US", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });
  } catch { return d; }
}

export default async function ArchivePage() {
  // Pull every desk's dates in parallel.
  const [financeDates, healthDates, ...tabDateLists] = await Promise.all([
    getAllDates().catch(() => []),
    getAllHealthDates().catch(() => []),
    ...TAB_KEYS.map((k) => getAllTabDates(k).catch(() => [])),
  ]);

  const byTab = {
    finance: financeDates || [],
    health:  healthDates || [],
  };
  TAB_KEYS.forEach((k, i) => { byTab[k] = tabDateLists[i] || []; });

  // Build a flat union of all dates we have anything for, sorted desc.
  const allDates = Array.from(
    new Set(Object.values(byTab).flat())
  ).sort((a, b) => (a < b ? 1 : -1));

  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: "48px 24px 96px", fontFamily: "var(--di-font-body, var(--di-font-serif))" }}>
      <div style={{ marginBottom: 32 }}>
        <Link href="/" style={{ fontSize: 13, color: "var(--di-ink-3)", textDecoration: "none" }}>
          ← Back to Daily Intel
        </Link>
      </div>

      <h1 style={{ fontFamily: "var(--di-font-serif)", fontSize: 44, fontWeight: 700, letterSpacing: "-0.02em", margin: "0 0 8px" }}>
        Archive
      </h1>
      <p style={{ color: "var(--di-ink-3)", fontSize: 15, margin: "0 0 40px", lineHeight: 1.5 }}>
        Every Daily Intel issue we&rsquo;ve published, by date and desk.
        {allDates.length > 0 && ` ${allDates.length} day${allDates.length === 1 ? "" : "s"} on file.`}
      </p>

      {allDates.length === 0 ? (
        <div style={{ padding: 32, border: "1px dashed var(--di-line)", borderRadius: 4, color: "var(--di-ink-3)", textAlign: "center" }}>
          No archived issues yet. Check back tomorrow.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          {allDates.map((date) => {
            const tabsForDate = Object.keys(TAB_META).filter((k) => byTab[k]?.includes(date));
            if (!tabsForDate.length) return null;
            return (
              <div key={date} style={{ borderTop: "1px solid var(--di-line)", paddingTop: 16 }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12 }}>
                  <h3 style={{ fontFamily: "var(--di-font-serif)", fontSize: 22, fontWeight: 600, margin: 0, letterSpacing: "-0.01em" }}>
                    {fmtLong(date)}
                  </h3>
                  <span style={{ fontFamily: "var(--di-font-ui)", fontSize: 11, fontWeight: 600, color: "var(--di-ink-4)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    {tabsForDate.length} desk{tabsForDate.length === 1 ? "" : "s"}
                  </span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {tabsForDate.map((k) => (
                    <Link
                      key={k}
                      href={TAB_META[k].path(date)}
                      style={{
                        padding: "8px 14px",
                        border: "1px solid var(--di-line)",
                        borderRadius: 100,
                        fontFamily: "var(--di-font-ui)", fontSize: 12, fontWeight: 600,
                        textDecoration: "none", color: "var(--di-ink)",
                        textTransform: "uppercase", letterSpacing: "0.06em",
                        display: "inline-flex", alignItems: "center", gap: 8,
                      }}
                    >
                      <span style={{ fontSize: 14 }}>{TAB_META[k].glyph}</span>
                      {TAB_META[k].label}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
