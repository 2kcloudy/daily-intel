"use client";
import PageShell from "./di/PageShell";
import { buildFinanceData } from "./di/dataTransform";

/**
 * ProtoView — wraps PageShell with a small prototype banner across the top.
 * Used by /prototypes/glass and /prototypes/flat.
 */
export default function ProtoView({ digest, allDates, cardLayout, protoName, protoDesc, protoHref, altHref, altLabel }) {
  const financeData = buildFinanceData(digest, allDates);

  return (
    <>
      {/* Prototype banner */}
      <div style={{
        position: "sticky", top: 0, zIndex: 9999,
        background: "#0c0d10",
        borderBottom: "2px solid #31c463",
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        height: 44,
        fontFamily: "var(--di-font-ui, sans-serif)",
        gap: 16,
      }}>
        {/* Left — back + proto name */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <a href="/prototypes" style={{
            fontSize: 11, fontWeight: 600, letterSpacing: "0.1em",
            textTransform: "uppercase", color: "#787f8c", textDecoration: "none",
          }}>
            ← All Prototypes
          </a>
          <span style={{ width: 1, height: 16, background: "#2a2e36" }} />
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
            textTransform: "uppercase", color: "#31c463",
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: "50%",
              background: "#31c463", display: "inline-block",
              animation: "pulse 2s infinite",
            }} />
            Prototype · {protoName}
          </span>
          <span style={{
            fontSize: 11, color: "#4a5261",
            display: "none",  // hide on narrow screens, fine
          }}>
            — {protoDesc}
          </span>
        </div>

        {/* Right — switch + live link */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <a href={altHref} style={{
            fontSize: 11, fontWeight: 600, letterSpacing: "0.08em",
            textTransform: "uppercase", color: "#f2efe6", textDecoration: "none",
            padding: "4px 12px", border: "1px solid #2a2e36", borderRadius: 4,
          }}>
            {altLabel}
          </a>
          <a href="/" style={{
            fontSize: 11, fontWeight: 600, letterSpacing: "0.08em",
            textTransform: "uppercase", color: "#787f8c", textDecoration: "none",
          }}>
            Live Site →
          </a>
        </div>
      </div>

      <PageShell
        mode="finance"
        financeData={financeData}
        allDates={allDates}
        cardLayout={cardLayout}
      />
    </>
  );
}
