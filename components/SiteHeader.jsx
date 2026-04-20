"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useIsMobile } from "../hooks/useIsMobile";

export default function SiteHeader({ currentDate }) {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);
  const isMobile = useIsMobile();

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
            fontSize: 14, fontWeight: 800, color: "#fff",
            letterSpacing: "-0.02em",
            boxShadow: "0 2px 8px rgba(184,146,26,0.3)",
          }}>DI</div>
          <span style={{
            fontFamily: "'Barlow', 'Helvetica Neue', Helvetica, sans-serif",
            fontSize: 22, fontWeight: 800,
            color: "var(--text-primary)",
            letterSpacing: "-0.03em",
          }}>
            Daily Intel
          </span>
        </Link>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {currentDate && !isMobile && (
            <span style={{
              color: "var(--text-muted)", fontSize: 14, fontWeight: 400,
            }}>
              {fmtDate(currentDate)}
            </span>
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
              fontSize: 16,
              transition: "background 0.2s, border-color 0.2s",
              flexShrink: 0,
            }}
          >
            {mounted ? (isDark ? "☀️" : "🌙") : "🌙"}
          </button>
        </div>
      </div>
    </header>
  );
}
