/**
 * /prototypes — Design prototype picker
 * Quick index of all UI design experiments.
 */
export const revalidate = 0;

export default function PrototypesIndex() {
  const prototypes = [
    {
      href: "/prototypes/glass",
      label: "Glass Cards",
      tag: "Current Build",
      tagColor: "#008533",
      desc: "3-column grid with lifted glass cards — layered depth shadows, 22px radius, image on top.",
      preview: "🪟",
    },
    {
      href: "/prototypes/flat",
      label: "Flat Boxy",
      tag: "Alternative",
      tagColor: "#1a5fb4",
      desc: "3-column grid with clean flat cards — 1px border, 4px radius, no shadow. Editorial and minimal.",
      preview: "▭",
    },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--di-paper, #fafaf7)",
      fontFamily: "var(--di-font-ui, Inter, sans-serif)",
      padding: "0",
    }}>
      {/* Header */}
      <div style={{
        borderBottom: "1px solid var(--di-line, #e4e7ec)",
        padding: "24px 40px",
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        gap: 16,
      }}>
        <div>
          <a href="/" style={{
            fontFamily: "var(--di-font-serif, Georgia, serif)",
            fontWeight: 800, fontSize: 28, letterSpacing: "-0.02em",
            color: "var(--di-ink, #0c0d10)", textDecoration: "none",
          }}>
            Daily Intel
          </a>
          <span style={{
            marginLeft: 16, fontFamily: "var(--di-font-ui, sans-serif)",
            fontSize: 11, fontWeight: 600, letterSpacing: "0.12em",
            textTransform: "uppercase", color: "var(--di-ink-4, #787f8c)",
          }}>
            Design Prototypes
          </span>
        </div>
        <a href="/" style={{
          fontSize: 12, fontWeight: 600, color: "var(--di-accent, #008533)",
          letterSpacing: "0.06em", textTransform: "uppercase", textDecoration: "none",
        }}>
          ← Back to Live Site
        </a>
      </div>

      {/* Intro */}
      <div style={{ padding: "48px 40px 0", maxWidth: 900 }}>
        <h1 style={{
          fontFamily: "var(--di-font-serif, Georgia, serif)",
          fontWeight: 700, fontSize: 42, letterSpacing: "-0.02em",
          color: "var(--di-ink, #0c0d10)", margin: "0 0 12px",
        }}>
          UI Prototypes
        </h1>
        <p style={{
          fontFamily: "var(--di-font-serif, Georgia, serif)",
          fontStyle: "italic", fontSize: 17, lineHeight: 1.5,
          color: "var(--di-ink-3, #4a5261)", margin: 0,
        }}>
          Live previews of story card designs using today's actual digest data.
          Click any prototype to see it full-screen with all stories.
        </p>
      </div>

      {/* Cards */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
        gap: 24, padding: "40px 40px 80px", maxWidth: 1200,
      }}>
        {prototypes.map(p => (
          <a
            key={p.href}
            href={p.href}
            style={{
              display: "block",
              background: "var(--di-card, #fff)",
              border: "1px solid var(--di-line, #e4e7ec)",
              borderRadius: 16,
              padding: "32px 28px",
              textDecoration: "none",
              color: "inherit",
              transition: "box-shadow 0.18s ease, transform 0.18s ease",
              boxShadow: "rgba(2,4,12,0.08) 0 2px 8px, rgba(2,4,12,0.04) 0 8px 24px",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.boxShadow = "rgba(2,4,12,0.15) 0 4px 16px, rgba(2,4,12,0.08) 0 16px 40px";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "";
              e.currentTarget.style.boxShadow = "rgba(2,4,12,0.08) 0 2px 8px, rgba(2,4,12,0.04) 0 8px 24px";
            }}
          >
            {/* Preview glyph */}
            <div style={{
              fontSize: 48, lineHeight: 1, marginBottom: 20,
            }}>
              {p.preview}
            </div>

            {/* Tag */}
            <div style={{
              display: "inline-block",
              background: p.tagColor + "18",
              color: p.tagColor,
              border: `1px solid ${p.tagColor}40`,
              borderRadius: 999,
              padding: "2px 10px",
              fontSize: 10, fontWeight: 700,
              letterSpacing: "0.1em", textTransform: "uppercase",
              marginBottom: 12,
            }}>
              {p.tag}
            </div>

            {/* Title */}
            <h2 style={{
              fontFamily: "var(--di-font-serif, Georgia, serif)",
              fontWeight: 700, fontSize: 26, letterSpacing: "-0.015em",
              color: "var(--di-ink, #0c0d10)", margin: "0 0 10px",
            }}>
              {p.label}
            </h2>

            {/* Description */}
            <p style={{
              fontFamily: "var(--di-font-serif, Georgia, serif)",
              fontSize: 15, lineHeight: 1.55,
              color: "var(--di-ink-3, #4a5261)", margin: "0 0 24px",
            }}>
              {p.desc}
            </p>

            {/* CTA */}
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              fontFamily: "var(--di-font-ui, sans-serif)",
              fontSize: 12, fontWeight: 600,
              color: p.tagColor,
              letterSpacing: "0.06em", textTransform: "uppercase",
            }}>
              View Prototype <span style={{ fontSize: 14 }}>→</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
