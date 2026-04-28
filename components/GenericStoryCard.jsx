"use client";
import { useState, useEffect, useRef } from "react";

/* Source → domain mapping for favicons */
const SOURCE_DOMAINS = {
  WSJ: "wsj.com", "Wall Street Journal": "wsj.com",
  Bloomberg: "bloomberg.com", FT: "ft.com", "Financial Times": "ft.com",
  CNBC: "cnbc.com", Reuters: "reuters.com", MarketWatch: "marketwatch.com",
  NYT: "nytimes.com", "New York Times": "nytimes.com",
  CNN: "cnn.com", TIME: "time.com", Forbes: "forbes.com",
  "New Scientist": "newscientist.com", "The Economist": "economist.com",
  AP: "apnews.com", Axios: "axios.com",
  "The Verge": "theverge.com", TechCrunch: "techcrunch.com",
  Wired: "wired.com", "Ars Technica": "arstechnica.com",
  CoinDesk: "coindesk.com", "The Block": "theblock.co",
  Decrypt: "decrypt.co", Politico: "politico.com",
  Nature: "nature.com", Science: "science.org", ScienceDaily: "sciencedaily.com",
  "MIT Tech Review": "technologyreview.com", "Foreign Affairs": "foreignaffairs.com",
  "Al Jazeera": "aljazeera.com", PitchBook: "pitchbook.com",
  Crunchbase: "crunchbase.com", "The Information": "theinformation.com",
};

function getFaviconUrl(source) {
  if (!source) return null;
  const domain = SOURCE_DOMAINS[source] || SOURCE_DOMAINS[source.split(" ")[0]];
  if (!domain) return null;
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=16`;
}

/* Infer sentiment from text */
function inferSentiment(headline, summary) {
  const text = `${headline || ""} ${summary || ""}`.toLowerCase();
  const bullish = ["surges","gains","rises","beats","jumps","record","invests","expands","grows","upgrades","rally","advances","profit","boosts","launches","wins","breakthrough","breakthrough","soars","rallies"];
  const bearish = ["falls","drops","cuts","loses","warns","decline","recession","concern","tariff","fears","struggle","miss","layoffs","bankruptcy","plunges","tumbles","risks","crash","slumps","crisis"];
  const bullCount = bullish.filter(w => text.includes(w)).length;
  const bearCount = bearish.filter(w => text.includes(w)).length;
  if (bullCount > bearCount && bullCount > 0) return "bullish";
  if (bearCount > bullCount && bearCount > 0) return "bearish";
  return "neutral";
}

/* Rank → left border opacity */
function rankBorderOpacity(rank) {
  return Math.max(0.15, 1.0 - (rank - 1) * 0.07);
}

/* Seed for stable image generation (legacy fallback) */
function seedFromString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/* Fallback URL — used only for pre-existing stories without story.image. */
function buildFallbackImageUrl(headline, topic, imagePromptStyle) {
  const base = imagePromptStyle || "editorial news illustration, muted professional tones";
  const prompt = `${(headline || "").split(" ").slice(0, 6).join(" ")}, ${topic || "news"}, ${base}, no text`;
  const seed = seedFromString(headline || "");
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=900&height=700&seed=${seed}&nologo=true&model=turbo`;
}

/* AI image with shimmer + emoji fallback + 20s timeout */
function StoryImage({ headline, topic, accentColor, accentDim, imagePromptStyle, image }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const timerRef = useRef(null);

  const src = image || buildFallbackImageUrl(headline, topic, imagePromptStyle);

  useEffect(() => {
    timerRef.current = setTimeout(() => { if (!loaded) setError(true); }, 20000);
    return () => clearTimeout(timerRef.current);
  }, [loaded]);

  if (error) {
    return (
      <div style={{
        height: 160, borderRadius: 8, marginBottom: 4, flexShrink: 0,
        background: accentDim || "rgba(100,100,100,0.08)",
        border: "1px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 48,
      }}>📰</div>
    );
  }

  return (
    <div style={{ position: "relative", height: 160, marginBottom: 4, flexShrink: 0 }}>
      {!loaded && <div className="shimmer" style={{ position: "absolute", inset: 0, borderRadius: 8 }} />}
      <img
        src={src} alt={headline}
        onLoad={() => { clearTimeout(timerRef.current); setLoaded(true); }}
        onError={() => { clearTimeout(timerRef.current); setError(true); }}
        style={{
          width: "100%", height: 160, objectFit: "cover", borderRadius: 8,
          opacity: loaded ? 1 : 0, transition: "opacity 0.4s ease", display: "block",
        }}
      />
    </div>
  );
}

export default function GenericStoryCard({
  rank = 1, headline, summary, source, url, topic, image,
  compact = false, isTrending = false,
  config = {},
}) {
  const [hovered, setHovered] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const sentiment = inferSentiment(headline, summary);
  const faviconUrl = getFaviconUrl(source);

  const {
    accentColor = "#b8921a",
    accentColorLight = "#c9a84c",
    accentDim = "rgba(184,146,26,0.10)",
    accentBadgeBg = "rgba(184,146,26,0.09)",
    imagePromptStyle,
  } = config;

  const borderOpacity = rankBorderOpacity(rank);
  const rankBorderColor = accentColor.startsWith("#")
    ? `${accentColor}${Math.round(borderOpacity * 255).toString(16).padStart(2, "0")}`
    : accentColor;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url || window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  if (compact) {
    return (
      <article
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: "var(--bg-card)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          border: hovered ? `1px solid ${accentColorLight}` : "1px solid var(--glass-border)",
          borderLeft: `3px solid ${rankBorderColor}`,
          borderRadius: 10,
          padding: "12px 16px",
          boxShadow: hovered ? "var(--shadow-card-hover)" : "var(--shadow-card)",
          transition: "all 0.2s",
          display: "flex", alignItems: "center", gap: 12,
          cursor: "default",
        }}
      >
        <span style={{
          background: accentBadgeBg, color: accentColor,
          width: 24, height: 24, borderRadius: 5, fontSize: 11, fontWeight: 700,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>{rank}</span>
        {topic && (
          <span style={{
            fontSize: 10, fontWeight: 700, textTransform: "uppercase",
            letterSpacing: "0.06em", color: accentColor,
            background: accentBadgeBg, padding: "2px 7px", borderRadius: 12,
            flexShrink: 0, whiteSpace: "nowrap",
          }}>{topic}</span>
        )}
        <span style={{
          fontSize: 14, fontWeight: 600, color: "var(--text-primary)",
          lineHeight: 1.4, flex: 1, minWidth: 0,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>{headline}</span>
        <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, flexShrink: 0 }}>
          {source}
        </span>
        {url && (
          <a href={url} target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 12, color: accentColor, fontWeight: 600, flexShrink: 0 }}>
            →
          </a>
        )}
      </article>
    );
  }

  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "var(--bg-card)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        border: hovered ? `1px solid ${accentColorLight}` : "1px solid var(--glass-border)",
        borderLeft: `3px solid ${rankBorderColor}`,
        borderRadius: 14,
        overflow: "hidden",
        padding: "18px 20px 20px",
        boxShadow: hovered ? "var(--shadow-card-hover)" : "var(--shadow-card)",
        transition: "border-color 0.2s, box-shadow 0.25s",
        display: "flex", flexDirection: "column", gap: 12,
        cursor: "default",
      }}
    >
      {/* AI Image */}
      <StoryImage
        headline={headline} topic={topic}
        accentColor={accentColor} accentDim={accentDim}
        imagePromptStyle={imagePromptStyle}
        image={image}
      />

      {/* Top row: rank + topic + sentiment + trending */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        <span style={{
          background: accentBadgeBg, color: accentColor,
          width: 26, height: 26, borderRadius: 6, fontSize: 12, fontWeight: 700,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>{rank}</span>

        {topic && (
          <span style={{
            background: "rgba(100,100,100,0.08)", color: "var(--text-secondary)",
            padding: "3px 10px", borderRadius: 20,
            fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
          }}>{topic}</span>
        )}

        {/* Sentiment badge */}
        {sentiment === "bullish" && (
          <span style={{
            background: "rgba(22,134,61,0.10)", color: "#16863d",
            padding: "3px 8px", borderRadius: 20, fontSize: 10, fontWeight: 700,
          }}>🟢 Bullish</span>
        )}
        {sentiment === "bearish" && (
          <span style={{
            background: "rgba(185,28,28,0.10)", color: "#b91c1c",
            padding: "3px 8px", borderRadius: 20, fontSize: 10, fontWeight: 700,
          }}>🔴 Bearish</span>
        )}

        {/* Trending badge */}
        {isTrending && (
          <span style={{
            background: "rgba(245,158,11,0.10)", color: "#d97706",
            padding: "3px 8px", borderRadius: 20, fontSize: 10, fontWeight: 700,
          }}>🔥 Trending</span>
        )}
      </div>

      {/* Headline */}
      <h2 style={{
        fontSize: 15.5, fontWeight: 700, color: "var(--text-primary)",
        lineHeight: 1.45, letterSpacing: "-0.01em",
      }}>{headline}</h2>

      {/* Summary */}
      <p style={{
        fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.75,
        flexGrow: 1,
        ...(expanded ? {} : {}),
      }}>{summary}</p>

      {/* Expanded drawer */}
      {expanded && (
        <div style={{
          background: "var(--bg-elevated)",
          borderRadius: 10, padding: "14px 16px",
          border: "1px solid var(--border)",
          display: "flex", flexDirection: "column", gap: 10,
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Why This Matters
          </div>
          <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7 }}>
            {summary}
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {url && (
              <a href={url} target="_blank" rel="noopener noreferrer" style={{
                background: accentColor, color: "#fff",
                padding: "7px 16px", borderRadius: 8,
                fontSize: 13, fontWeight: 600, textDecoration: "none",
                display: "inline-flex", alignItems: "center", gap: 5,
              }}>
                Read Full Article →
              </a>
            )}
            <button onClick={handleCopy} style={{
              background: "var(--bg-card)", border: "1px solid var(--border)",
              color: "var(--text-secondary)", padding: "7px 14px",
              borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}>
              {copied ? "✓ Copied" : "Copy Link"}
            </button>
          </div>
        </div>
      )}

      {/* Card footer */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderTop: "1px solid var(--border)", paddingTop: 12, marginTop: 2,
        gap: 8,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {faviconUrl && (
            <img src={faviconUrl} alt="" width={14} height={14}
              style={{ borderRadius: 2, flexShrink: 0 }}
              onError={e => { e.target.style.display = "none"; }}
            />
          )}
          <span style={{
            fontSize: 11, color: "var(--text-muted)", fontWeight: 600,
            textTransform: "uppercase", letterSpacing: "0.06em",
          }}>{source}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: 12, color: "var(--text-muted)", fontWeight: 600,
              padding: "2px 0",
            }}
          >
            {expanded ? "Less ↑" : "More ↓"}
          </button>
          {url && (
            <a href={url} target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 13, color: accentColor, fontWeight: 600 }}>
              Read →
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
