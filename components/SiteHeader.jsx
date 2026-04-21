"use client";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

export default function SiteHeader({ currentDate, allDates, tab }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Determine active tab from pathname
  const isHealth = tab === "health" || pathname?.startsWith("/health");
  const archiveBase = isHealth ? "/health" : "";

  const fmtDate = (d) =>
    new Date(d + "T12:00:00Z").toLocaleDateString("en-US", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });

  return (
    <header style={{
      background: "linear-gradient(180deg, #070b14 0%, #0a0e1a 100%)",
      borderBottom: "1px solid #1e2a42",
      position: "sticky", top: 0, zIndex: 100,
      backdropFilter: "blur(12px)",
    }}>
      <div style={{
        maxWidth: 1200, margin: "0 auto", padding: "0 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 64,
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{
            width: 32, height: 32, borderRadius: 6,
            background: "linear-gradient(135deg, #c9a84c, #8a6420)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 700, color: "#fff",
          }}>DI</div>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "#e8edf5" }}>
            Daily Intel
          </span>
        </Link>

        {/* Finance | Health tabs */}
        <div style={{ display: "flex", alignItems: "center", gap: 4, background: "#0d1220", borderRadius: 10, padding: 4, border: "1px solid #1e2a42" }}>
          <Link href="/" style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "6px 16px", borderRadius: 7, fontSize: 13, fontWeight: 600,
            textDecoration: "none", transition: "all 0.15s",
            background: !isHealth ? "linear-gradient(135deg, #1a2540, #253349)" : "transparent",
            color: !isHealth ? "#c9a84c" : "#4a5a75",
            border: !isHealth ? "1px solid rgba(201,168,76,0.25)" : "1px solid transparent",
          }}>
            <span>ð</span> Finance
          </Link>
          <Link href="/health" style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "6px 16px", borderRadius: 7, fontSize: 13, fontWeight: 600,
            textDecoration: "none", transition: "all 0.15s",
            background: isHealth ? "linear-gradient(135deg, #0f2218, #162e20)" : "transparent",
            color: isHealth ? "#3ecf8e" : "#4a5a75",
            border: isHealth ? "1px solid rgba(62,207,142,0.25)" : "1px solid transparent",
          }}>
            <span>ð½</span> Health
          </Link>
        </div>

        {/* Archive dropdown */}
        {allDates && allDates.length > 1 && (
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setOpen(!open)}
              style={{
                background: "#131929", border: "1px solid #1e2a42",
                color: "#8a9ab5", padding: "7px 14px", borderRadius: 6,
                cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 6,
              }}
            >
              Archive â§
            </button>
            {open && (
              <div style={{
                position: "absolute", right: 0, top: "calc(100% + 8px)",
                background: "#131929", border: "1px solid #1e2a42",
                borderRadius: 8, minWidth: 220, boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                zIndex: 200, maxHeight: 320, overflowY: "auto",
              }}>
                {allDates.map((d) => (
                  <Link key={d} href={`${archiveBase}/${d}`} onClick={() => setOpen(false)}
                    style={{
                      display: "block", padding: "10px 16px",
                      color: d === currentDate
                        ? (isHealth ? "#3ecf8e" : "#c9a84c")
                        : "#8a9ab5",
                      fontSize: 13, borderBottom: "1px solid #1e2a42",
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
