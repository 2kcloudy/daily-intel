"use client";
import PageShell from "./di/PageShell";
import { buildFinanceData, buildTabData } from "./di/dataTransform";

export default function GenericDigestView({ digest, allDates, financeDigest, financeDates, tabKey, config }) {
  // Support old pages that pass config with a key field
  const resolvedTabKey = tabKey || config?.key || "tech";
  const tabData = buildTabData(digest, resolvedTabKey, allDates);
  const financeData = buildFinanceData(financeDigest, financeDates);

  // Use finance data as the source for ticker bar, dates, indices
  // even on category pages (just like the original design)
  const shellFinanceData = financeData || {
    date: digest?.date ? new Date(digest.date + "T12:00:00Z").toLocaleDateString("en-US", { weekday:"long",year:"numeric",month:"long",day:"numeric" }) : "",
    dateShort: digest?.date ? new Date(digest.date + "T12:00:00Z").toLocaleDateString("en-US", { weekday:"short",month:"short",day:"numeric" }) : "",
    pulse: "",
    indices: [],
    categories: [],
    stories: [],
    watchlist: [],
    archive: [],
    sources: [],
    tags: [],
  };

  if (!tabData) {
    return (
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"60vh", fontFamily:"var(--di-font-serif)", fontSize:22, color:"var(--di-ink-3)" }}>
        No content for this desk yet. Check back tomorrow.
      </div>
    );
  }

  return (
    <PageShell
      mode="category"
      categoryId={resolvedTabKey}
      financeData={shellFinanceData}
      tabData={tabData}
      allDates={allDates}
    />
  );
}
