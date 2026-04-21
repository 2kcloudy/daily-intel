"use client";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

export default function SiteHeader({ currentDate, allDates, tab }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isHealth = tab === "health" || pathname?.startsWith("/health");
  const archiveBase = isHealth ? "/health" : "";

  const fmtDate = (d) =>
    new Date(d + "T12:00:00Z").toLocaleDateString("en-US", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });

  return (
    <header style={{
      background: "var(--bg-header)",
      backdropFilter: "blur(24px) saturate(200%)",
      WebkitBackdropFilter: "blur(24px) saturate(200%)",
      borderBottom: "1px solid var(--bg-header-border)",
      boxShadow: "var(--shadow-header)",
      position: "sticky", top: 0, zIndex: 100,
    }}>
      <div style={{
        maxWidth: 1200, margin: "0 auto", padding: "0 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 64,
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            background: "linear-gradient(135deg, #c9a84c, #8a6420)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 800, color: "#fff",
            boxShadow: "0 2px 8px rgba(184,146,26,0.30)",
          }}>DI</div>
          <span style={{
            fontFamily: "'Barlow', 'Inter', sans-serif",
            fontSize: 19, fontWeight: 700, color: "var(--text-primary)",
            letterSpacing: "-0.02em",
          }}>Daily Intel</span>
        </Link>

        {/* Finance | Health tabs */}
        <div style={{
          display: "flex", alignItems: "center", gap: 4,
          background: "rgba(0,0,0,0.04)",
          borderRadius: 12, padding: 4,
          border: "1px solid var(--border)",
        }}>
          <Link href="/" style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "6px 16px", borderRadius: 9, fontSize: 13, fontWeight: 600,
            textDecoration: "none", transition: "all 0.18s",
            background: !isHealth ? "var(--bg-card)" : "transparent",
            color: !isHealth ? "var(--gold)" : "var(--text-muted)",
            boxShadow: !isHealth ? "var(--shadow-card)" : "none",
            border: !isHealth ? "1px solid rgba(184,146,26,0.18)" : "1px solid transparent",
          }}>
            <span>📈</span> Finance
          </Link>
          <Link href="/health" style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "6px 16px", borderRadius: 9, fontSize: 13, fontWeight: 600,
            textDecoration: "none", transition: "all 0.18s",
            background: isHealth ? "var(--bg-card)" : "transparent",
            color: isHealth ? "var(--health)" : "var(--text-muted)",
            boxShadow: isHealth ? "var(--shadow-card)" : "none",
            border: isHealth ? "1px solid rgba(5,150,105,0.18)" : "1px solid transparent",
          }}>
            <span>🌿</span> Health
          </Link>
        </div>

        {/* Archive dropdown */}
        {allDates && allDates.length > 1 && (
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setOpen(!open)}
              style={{
                background: "var(--btn-bg)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1px solid var(--btn-border)",
                color: "var(--btn-text)",
                padding: "7px 14px", borderRadius: 8,
                cursor: "pointer", fontSize: 13,
                display: "flex", alignItems: "center", gap: 6,
                fontWeight: 500,
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              }}
            >
              Archive ▾
            </button>
            {open && (
              <div style={{
                position: "absolute", right: 0, top: "calc(100% + 8px)",
                background: "var(--bg-elevated)",
                backdropFilter: "blur(24px) saturate(200%)",
                WebkitBackdropFilter: "blur(24px) saturate(200%)",
                border: "1px solid var(--glass-border)",
                borderRadius: 12, minWidth: 220,
                boxShadow: "var(--shadow-dropdown)",
                zIndex: 200, maxHeight: 320, overflowY: "auto",
              }}>
                {allDates.map((d) => (
                  <Link key={d} href={`${archiveBase}/${d}`} onClick={() => setOpen(false)}
                    style={{
                      display: "block", padding: "10px 16px",
                      color: d === currentDate
                        ? (isHealth ? "var(--health)" : "var(--gold)")
                        : "var(--text-secondary)",
                      fontSize: 13, borderBottom: "1px solid var(--border)",
                      fontWeight: d === currentDate ? 600 : 400,
                      textDecoration: "none",
                    }}>
                    {fmtDate(d)}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
