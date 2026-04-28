"use client";
import { useState, useEffect } from "react";

const FONTS = {
  classic:   { name: "Classic",   body: "'Source Serif 4', Georgia, serif",  head: "'Source Serif 4', Georgia, serif" },
  modern:    { name: "Modern",    body: "'Source Serif 4', Georgia, serif",  head: "'IBM Plex Serif', Georgia, serif" },
  editorial: { name: "Editorial", body: "'Lora', Georgia, serif",            head: "'Libre Caslon Text', Georgia, serif" },
  sans:      { name: "Sans",      body: "'Inter', system-ui, sans-serif",    head: "'Inter', system-ui, sans-serif" },
};

const GLASS_STYLES = [
  { id: "rounded", label: "Rounded", radius: "22px", shadow: null,   desc: "Soft & friendly" },
  { id: "boxy",    label: "Boxy",    radius: "6px",  shadow: null,   desc: "Structured edges" },
  { id: "sharp",   label: "Sharp",   radius: "0px",  shadow: null,   desc: "Hard editorial" },
  { id: "pill",    label: "Pill",    radius: "40px", shadow: null,   desc: "Bubbly & airy" },
  { id: "flat",    label: "Flat",    radius: "6px",  shadow: "none", desc: "No depth, clean border" },
];

export default function ProtoTweaks({ onClose, initialGlassStyle = "rounded" }) {
  const [tweaks, setTweaks] = useState({
    density: "balanced",
    typography: "classic",
    glassStyle: initialGlassStyle,
  });

  useEffect(() => {
    const font = FONTS[tweaks.typography] || FONTS.classic;
    const glass = GLASS_STYLES.find(g => g.id === tweaks.glassStyle) || GLASS_STYLES[0];
    const root = document.documentElement;
    root.style.setProperty("--di-font-body", font.body);
    root.style.setProperty("--di-font-head", font.head);
    root.style.setProperty("--di-glass-radius", glass.radius);
    // Flat: zero out both shadow variables. Other styles: remove overrides so CSS defaults kick in.
    if (glass.shadow === "none") {
      root.style.setProperty("--di-card-shadow", "none");
      root.style.setProperty("--di-card-hover-shadow", "none");
    } else {
      root.style.removeProperty("--di-card-shadow");
      root.style.removeProperty("--di-card-hover-shadow");
    }
  }, [tweaks.typography, tweaks.glassStyle]);

  function update(patch) { setTweaks(t => ({ ...t, ...patch })); }

  return (
    <div className="di-tweaks">
      <h5>Design Tweaks <button className="close" onClick={onClose}>×</button></h5>

      {/* Density */}
      <div className="group">
        <label>Density</label>
        <div className="opts">
          {["compact", "balanced", "spacious"].map(d => (
            <button key={d} className={"opt" + (tweaks.density === d ? " active" : "")}
              onClick={() => update({ density: d })}>{d}</button>
          ))}
        </div>
      </div>

      {/* Typography */}
      <div className="group">
        <label>Typography</label>
        <div className="opts">
          {Object.entries(FONTS).map(([k, f]) => (
            <button key={k} className={"opt" + (tweaks.typography === k ? " active" : "")}
              onClick={() => update({ typography: k })} style={{ fontFamily: f.head }}>{f.name}</button>
          ))}
        </div>
      </div>

      {/* Overall — glass style */}
      <div className="group">
        <label>Overall</label>
        <div className="opts" style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {GLASS_STYLES.map(g => (
            <button
              key={g.id}
              className={"opt" + (tweaks.glassStyle === g.id ? " active" : "")}
              onClick={() => update({ glassStyle: g.id })}
              title={g.desc}
              style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2, padding: "5px 10px" }}
            >
              <span style={{ fontWeight: 600 }}>{g.label}</span>
              <span style={{
                fontSize: 9, fontWeight: 400,
                color: tweaks.glassStyle === g.id ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.4)",
                letterSpacing: "0.04em",
              }}>{g.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
