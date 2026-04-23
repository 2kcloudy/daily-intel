"use client";
import PageShell from "./di/PageShell";
import { buildFinanceData } from "./di/dataTransform";

export default function DigestView({ digest, allDates }) {
  const financeData = buildFinanceData(digest, allDates);
  if (!financeData) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", fontFamily: "var(--di-font-serif)", fontSize: 22, color: "var(--di-ink-3)" }}>
        No digest available yet. Check back soon.
      </div>
    );
  }
  return <PageShell mode="finance" financeData={financeData} allDates={allDates} />;
}
