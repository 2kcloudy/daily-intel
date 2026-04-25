"use client";
import PageShell from "./di/PageShell";
import { buildFinanceData } from "./di/dataTransform";

/**
 * Experimental Finance variant — same layout as DigestViewImageTop but the
 * image strip is half the height (32:9 instead of 16:9). Used by /finance3.
 */
export default function DigestViewImageTopShort({ digest, allDates }) {
  const financeData = buildFinanceData(digest, allDates);
  if (!financeData) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        minHeight: "60vh", fontFamily: "var(--di-font-serif)",
        fontSize: 22, color: "var(--di-ink-3)",
      }}>
        No digest available yet. Check back soon.
      </div>
    );
  }
  return (
    <PageShell
      mode="finance"
      financeData={financeData}
      allDates={allDates}
      cardLayout="image-top-short"
    />
  );
}
