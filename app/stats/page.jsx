import { getAllDates, getDigest, getAllHealthDates, getHealthDigest } from "@/lib/storage";
import SiteHeader from "@/components/SiteHeader";
import Link from "next/link";

export const revalidate = 3600;

export const metadata = {
  title: "Stats & Trends — Daily Intel",
  description: "Topic trends, source analytics, and story volume across Daily Intel digests.",
};

function Bar({ value, max, color }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{
        flex: 1, height: 8, borderRadius: 4,
        background: "var(--border)", overflow: "hidden",
      }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 4, transition: "width 0.4s" }} />
      </div>
      <span style={{ fontSize: 12, color: "var(--text-muted)", minWidth: 28, textAlign: "right" }}>{value}</span>
    </div>
  );
}

export default async function StatsPage() {
  const [financeDates, healthDates] = await Promise.all([getAllDates(), getAllHealthDates()]);

  const [financeDigests, healthDigests] = await Promise.all([
    Promise.all(financeDates.map(d => getDigest(d))),
    Promise.all(healthDates.map(d => getHealthDigest(d))),
  ]);

  const financeValid = financeDigests.filter(Boolean);
  const healthValid = healthDigests.filter(Boolean);

  // Aggregate Finance stats
  const fTopics = {}, fSources = {};
  let fTotal = 0;
  for (const d of financeValid) {
    for (const s of d.stories || []) {
      fTotal++;
      if (s.topic) fTopics[s.topic] = (fTopics[s.topic] || 0) + 1;
      if (s.source) fSources[s.source] = (fSources[s.source] || 0) + 1;
    }
  }

  // Aggregate Health stats
  const hTopics = {}, hSources = {};
  let hTotal = 0;
  for (const d of healthValid) {
    for (const s of d.stories || []) {
      hTotal++;
      if (s.topic) hTopics[s.topic] = (hTopics[s.topic] || 0) + 1;
      if (s.source) hSources[s.source] = (hSources[s.source] || 0) + 1;
    }
  }

  const topFinanceTopics = Object.entries(fTopics).sort((a, b) => b[1] - a[1]).slice(0, 12);
  const topFinanceSources = Object.entries(fSources).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const topHealthTopics = Object.entries(hTopics).sort((a, b) => b[1] - a[1]).slice(0, 12);
  const topHealthSources = Object.entries(hSources).sort((a, b) => b[1] - a[1]).slice(0, 10);

  const fMax = topFinanceTopics[0]?.[1] || 1;
  const hMax = topHealthTopics[0]?.[1] || 1;
  const fsMax = topFinanceSources[0]?.[1] || 1;
  const hsMax = topHealthSources[0]?.[1] || 1;

  return (
    <>
      <SiteHeader />
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px 80px" }}>
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <h1 style={{
            fontFamily: "'Barlow', sans-serif", fontSize: 36, fontWeight: 800,
            color: "var(--text-primary)", letterSpacing: "-0.04em", marginBottom: 8,
          }}>
            📊 Stats &amp; Trends
          </h1>
          <p style={{ fontSize: 15, color: "var(--text-muted)" }}>
            Meta-intelligence across all Daily Intel digests
          </p>
        </div>

        {/* Summary cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 16, marginBottom: 48,
        }}>
          {[
            { label: "Finance Digests", value: financeValid.length, color: "#b8921a", emoji: "📈" },
            { label: "Finance Stories", value: fTotal, color: "#b8921a", emoji: "📰" },
            { label: "Health Digests", value: healthValid.length, color: "#059669", emoji: "🌿" },
            { label: "Health Stories", value: hTotal, color: "#059669", emoji: "💚" },
          ].map(item => (
            <div key={item.label} style={{
              background: "var(--bg-card)", border: "1px solid var(--border)",
              borderRadius: 12, padding: "20px 24px",
              backdropFilter: "blur(20px) saturate(180%)",
              WebkitBackdropFilter: "blur(20px) saturate(180%)",
              boxShadow: "var(--shadow-card)",
            }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{item.emoji}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: item.color, letterSpacing: "-0.03em" }}>
                {item.value.toLocaleString()}
              </div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>{item.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))", gap: 28 }}>

          {/* Finance Topics */}
          <div style={{
            background: "var(--bg-card)", border: "1px solid var(--border)",
            borderRadius: 12, padding: "24px 28px",
            backdropFilter: "blur(20px) saturate(180%)",
            WebkitBackdropFilter: "blur(20px) saturate(180%)",
          }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ background: "var(--gold-badge-bg)", color: "var(--gold)", padding: "3px 10px", borderRadius: 20, fontSize: 12 }}>Finance</span>
              Top Topics
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {topFinanceTopics.map(([topic, count]) => (
                <div key={topic}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>{topic}</span>
                  </div>
                  <Bar value={count} max={fMax} color="var(--gold)" />
                </div>
              ))}
            </div>
          </div>

          {/* Health Topics */}
          <div style={{
            background: "var(--bg-card)", border: "1px solid var(--border)",
            borderRadius: 12, padding: "24px 28px",
            backdropFilter: "blur(20px) saturate(180%)",
            WebkitBackdropFilter: "blur(20px) saturate(180%)",
          }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ background: "var(--health-badge)", color: "var(--health)", padding: "3px 10px", borderRadius: 20, fontSize: 12 }}>Health</span>
              Top Topics
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {topHealthTopics.map(([topic, count]) => (
                <div key={topic}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>{topic}</span>
                  </div>
                  <Bar value={count} max={hMax} color="var(--health)" />
                </div>
              ))}
            </div>
          </div>

          {/* Finance Sources */}
          <div style={{
            background: "var(--bg-card)", border: "1px solid var(--border)",
            borderRadius: 12, padding: "24px 28px",
            backdropFilter: "blur(20px) saturate(180%)",
            WebkitBackdropFilter: "blur(20px) saturate(180%)",
          }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ background: "var(--gold-badge-bg)", color: "var(--gold)", padding: "3px 10px", borderRadius: 20, fontSize: 12 }}>Finance</span>
              Top Sources
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {topFinanceSources.map(([source, count]) => (
                <div key={source}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>{source}</span>
                  </div>
                  <Bar value={count} max={fsMax} color="var(--gold)" />
                </div>
              ))}
            </div>
          </div>

          {/* Health Sources */}
          <div style={{
            background: "var(--bg-card)", border: "1px solid var(--border)",
            borderRadius: 12, padding: "24px 28px",
            backdropFilter: "blur(20px) saturate(180%)",
            WebkitBackdropFilter: "blur(20px) saturate(180%)",
          }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ background: "var(--health-badge)", color: "var(--health)", padding: "3px 10px", borderRadius: 20, fontSize: 12 }}>Health</span>
              Top Sources
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {topHealthSources.map(([source, count]) => (
                <div key={source}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>{source}</span>
                  </div>
                  <Bar value={count} max={hsMax} color="var(--health)" />
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div style={{ marginTop: 48, paddingTop: 24, borderTop: "1px solid var(--footer-border)" }}>
          <Link href="/" style={{ fontSize: 13, color: "var(--text-muted)" }}>← Back to Daily Intel</Link>
        </div>
      </div>
    </>
  );
}
