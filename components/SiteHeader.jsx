"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { TAB_ORDER, TAB_CONFIGS } from "./TabConfig";

export default function SiteHeader({ currentDate, allDates, tab }) {
  const [open, setOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    try {
      const saved = localStorage.getItem("di-theme");
      setIsDark(saved === "dark");
    } catch {}
  }, []);

  const toggleDark = () => {
    const next = !isDark;
    setIsDark(next);
    try {
      if (next) {
        document.documentElement.setAttribute("data-theme", "dark");
        localStorage.setItem("di-theme", "dark");
      } else {
        document.documentElement.removeAttribute("data-theme");
        localStorage.setItem("di-theme", "light");
      }
    } catch {}
  };

  /* Determine active tab key from pathname */
  const getActiveTab = () => {
    if (!pathname) return "finance";
    if (pathname === "/" || pathname.match(/^\/\d{4}-\d{2}-\d{2}$/)) return "finance";
    for (const key of TAB_ORDER) {
      if (key === "finance") continue;
      const cfg = TAB_CONFIGS[key];
      if (pathname.startsWith(cfg.path)) return key;
    }
    return "finance";
  };

  const activeTab = getActiveTab();

  /* Archive base for current tab */
  const activeCfg = TAB_CONFIGS[activeTab] || TAB_CONFIGS.finance;
  const archiveBase = activeCfg.path === "/" ? "" : activeCfg.path;

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
      {/* ── Top row: logo + controls ── */}
      <div style={{
        maxWidth: 1200, margin: "0 auto", padding: "0 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 54, borderBottom: "1px solid var(--border-light)",
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: "linear-gradient(135deg, #c9a84c, #8a6420)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 800, color: "#fff",
            boxShadow: "0 2px 8px rgba(184,146,26,0.30)",
            flexShrink: 0,
          }}>DI</div>
          <span style={{
            fontFamily: "'Barlow', 'Inter', sans-serif",
            fontSize: 17, fontWeight: 700, color: "var(--text-primary)",
            letterSpacing: "-0.02em",
          }}>Daily Intel</span>
        </Link>

        {/* Right controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Dark mode toggle */}
          <button
            onClick={toggleDark}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            style={{
              background: "var(--btn-bg)", border: "1px solid var(--btn-border)",
              color: "var(--btn-text)", padding: "5px 10px", borderRadius: 7,
              cursor: "pointer", fontSize: 14, lineHeight: 1,
            }}
          >
            {isDark ? "☀️" : "🌙"}
          </button>

          {/* Stats link */}
          <Link href="/stats" style={{
            background: "var(--btn-bg)", border: "1px solid var(--btn-border)",
            color: "var(--btn-text)", padding: "5px 10px", borderRadius: 7,
            fontSize: 12, fontWeight: 600, textDecoration: "none",
          }}>
            📊 Stats
          </Link>

          {/* Archive dropdown */}
          {allDates && allDates.length > 1 && (
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setOpen(!open)}
                style={{
                  background: "var(--btn-bg)", border: "1px solid var(--btn-border)",
                  color: "var(--btn-text)", padding: "5px 12px", borderRadius: 7,
                  cursor: "pointer", fontSize: 12,
                  display: "flex", alignItems: "center", gap: 5,
                  fontWeight: 500,
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
                          ? activeCfg.accentColor
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
      </div>

      {/* ── Tab strip: all 12 tabs ── */}
      <div style={{
        maxWidth: 1200, margin: "0 auto", padding: "0 16px",
        display: "flex", alignItems: "stretch", gap: 0,
        height: 40, overflowX: "auto",
      }}
        className="scrollbar-none"
      >
        {TAB_ORDER.map((key) => {
          const cfg = TAB_CONFIGS[key];
          const isActive = key === activeTab;
          return (
            <Link
              key={key}
              href={cfg.path}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "0 14px", fontSize: 12, fontWeight: isActive ? 700 : 500,
                color: isActive ? cfg.accentColor : "var(--text-muted)",
                textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0,
                borderBottom: isActive ? `2px solid ${cfg.accentColor}` : "2px solid transparent",
                background: isActive ? cfg.accentDim : "transparent",
                transition: "all 0.15s",
              }}
            >
              <span style={{ fontSize: 13 }}>{cfg.emoji}</span>
              {cfg.label}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
