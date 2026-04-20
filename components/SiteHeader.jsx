"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function SiteHeader({ currentDate, allDates }) {
  const [open, setOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = document.documentElement.getAttribute("data-theme");
    setIsDark(saved === "dark");
  }, []);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    if (newDark) {
      document.documentElement.setAttribute("data-theme", "dark");
      try { localStorage.setItem("di-theme", "dark"); } catch (e) {}
    } else {
      document.documentElement.removeAttribute("data-theme");
      try { localStorage.setItem("di-theme", "light"); } catch (e) {}
    }
  };

  const fmtDate = (d) =>
    new Date(d + "T12:00:00Z").toLocaleDateString("en-US", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });

  return (
    <header style={{
      background: "var(--bg-header)",
      borderBottom: "1px solid var(--bg-header-border)",
      position: "sticky", top: 0, zIndex: 100,
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
    }}>
      <div style={{
        maxWidth: 1200, margin: "0 auto", padding: "0 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 64,
      }}>
        {/* Logo */}
        <Link href="/" style={{
          display: "flex", alignItems: "center", gap: 10,
          textDecoration: "none",
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 7,
            background: "linear-gradient(135deg, #c9a84c 0%, #8a6420 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 800, color: "#fff",
            letterSpacing: "-0.02em",
            boxShadow: "0 2px 8px rgba(184,146,26,0.3)",
          }}>DI</div>
          <span style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 20, fontWeight: 700,
            color: "var(--text-primary)",
            letterSpacing: "-0.02em",
          }}>
            Daily Intel
          </span>
        </Link>

        {/* Right side controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Current date — hidden on mobile-ish */}
          {currentDate && (
            <span style={{
              color: "var(--text-muted)", fontSize: 13, fontWeight: 400,
            }}>
              {fmtDate(currentDate)}
            </span>
          )}

          {/* Archive dropdown */}
          {allDates && allDates.length > 1 && (
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setOpen(!open)}
                style={{
                  background: "var(--btn-bg)",
                  border: "1px solid var(--btn-border)",
                  color: "var(--btn-text)",
                  padding: "6px 14px", borderRadius: 7,
                  cursor: "pointer", fontSize: 13,
                  display: "flex", alignItems: "center", gap: 6,
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 500,
                  transition: "border-color 0.2s",
                }}
              >
                Archive <span style={{ fontSize: 10, opacity: 0.7 }}>▾</span>
              </button>
              {open && (
                <div style={{
                  position: "absolute", right: 0, top: "calc(100% + 8px)",
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  minWidth: 220,
                  boxShadow: "var(--shadow-dropdown)",
                  zIndex: 200,
                  overflow: "hidden",
                }}>
                  {allDates.map((d, i) => (
                    <Link key={d} href={`/${d}`} onClick={() => setOpen(false)}
                      style={{
                        display: "block", padding: "11px 16px",
                        color: d === currentDate ? "var(--gold)" : "var(--text-secondary)",
                        fontSize: 13,
                        borderBottom: i < allDates.length - 1 ? "1px solid var(--border)" : "none",
                        fontWeight: d === currentDate ? 600 : 400,
                        transition: "background 0.15s",
                      }}>
                      {fmtDate(d)}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            style={{
              width: 36, height: 36, borderRadius: 8,
              background: "var(--btn-bg)",
              border: "1px solid var(--btn-border)",
              cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 15,
              transition: "background 0.2s, border-color 0.2s",
              flexShrink: 0,
            }}
          >
            {/* Avoid hydration mismatch — only show icon after mount */}
            {mounted ? (isDark ? "☀️" : "🌙") : "🌙"}
          </button>
        </div>
      </div>
    </header>
  );
}
