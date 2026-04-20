"use client";
import Link from "next/link";
import { useState } from "react";

export default function SiteHeader({ currentDate, allDates }) {
  const [open, setOpen] = useState(false);

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
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
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

        {/* Current date label */}
        <span style={{ color: "#4a5a75", fontSize: 13 }}>
          {currentDate ? fmtDate(currentDate) : ""}
        </span>

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
              Archive ▾
            </button>
            {open && (
              <div style={{
                position: "absolute", right: 0, top: "calc(100% + 8px)",
                background: "#131929", border: "1px solid #1e2a42",
                borderRadius: 8, minWidth: 200, boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                zIndex: 200,
              }}>
                {allDates.map((d) => (
                  <Link key={d} href={`/${d}`} onClick={() => setOpen(false)}
                    style={{
                      display: "block", padding: "10px 16px",
                      color: d === currentDate ? "#c9a84c" : "#8a9ab5",
                      fontSize: 13, borderBottom: "1px solid #1e2a42",
                      fontWeight: d === currentDate ? 600 : 400,
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
