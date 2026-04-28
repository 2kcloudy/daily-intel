"use client";
import PageShell from "./di/PageShell";
import { buildFinanceData } from "./di/dataTransform";

/**
 * Experimental Finance variant — same data as DigestView, but each card
 * renders with the image across the top instead of as a side thumbnail.
 * Used by /finance2.
 */
export default function DigestViewImageTop({ digest, allDates }) {
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
      cardLayout="image-top"
    />
  );
}
