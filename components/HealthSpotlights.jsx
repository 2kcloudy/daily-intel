"use client";
import { useState } from "react";

export default function HealthSpotlights({ items }) {
  if (!items || items.length === 0) return null;
  return (
    <div style={{
      background: "var(--watch-bg)",
      backdropFilter: "blur(20px) saturate(180%)",
      WebkitBackdropFilter: "blur(20px) saturate(180%)",
      border: "1px solid var(--watch-border)",
      borderRadius: 10,
      padding: "24px 28px",
      marginTop: 48,
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 10, marginBottom: 20,
      }}>
        <span style={{
          background: "var(--health-badge)",
          color: "var(--health)",
          padding: "4px 12px", borderRadius: 20,
          fontSize: 12, fontWeight: 700,
          letterSpacing: "0.08em", textTransform: "uppercase",
        }}>🌿 Expert Spotlights</span>
        <span style={{ color: "var(--text-muted)", fontSize: 13 }}>
          Influencers &amp; podcasts to follow
        </span>
      </div>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: 12,
      }}>
        {items.map((item, i) => (
          <div key={i} style={{
            background: "var(--watch-item-bg)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: "14px 18px",
          }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 8, marginBottom: 8,
            }}>
              <span style={{
                fontWeight: 700, fontSize: 14,
                color: "var(--health)",
              }}>{item.name}</span>
              {item.type && (
                <span style={{
                  fontSize: 10, fontWeight: 700,
                  color: "var(--text-muted)",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}>{item.type}</span>
              )}
            </div>
            <p style={{
              fontSize: 13,
              color: "var(--text-secondary)",
              lineHeight: 1.6,
              margin: 0,
            }}>{item.summary}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
