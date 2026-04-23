"use client";
import { useState, useEffect } from "react";

const TWEAK_DEFAULTS = {
  density: "balanced",
  heroVariant: "editorial",
  showIndices: true,
  accent: "emerald",
  typography: "classic",
};

const ACCENTS = {
  emerald: { name: "Emerald", pos: "#008533", neg: "#c8352c", hero: "#008533" },
  crimson: { name: "Crimson", pos: "#0b7a3b", neg: "#b8211a", hero: "#b8211a" },
  cobalt:  { name: "Cobalt",  pos: "#0a7d3a", neg: "#c8352c", hero: "#1247a8" },
  amber:   { name: "Amber",   pos: "#0a7d3a", neg: "#c8352c", hero: "#b2560a" },
  ink:     { name: "Ink",     pos: "#0a7d3a", neg: "#c8352c", hero: "#0c0d10" },
};

const FONTS = {
  classic:   { name: "Classic",   body: "'Source Serif 4', Georgia, serif",  head: "'Source Serif 4', Georgia, serif" },
  modern:    { name: "Modern",    body: "'Source Serif 4', Georgia, serif",  head: "'IBM Plex Serif', Georgia, serif" },
  editorial: { name: "Editorial", body: "'Lora', Georgia, serif",            head: "'Libre Caslon Text', Georgia, serif" },
  sans:      { name: "Sans",      body: "'Inter', system-ui, sans-serif",    head: "'Inter', system-ui, sans-serif" },
};

export function useTweaks() {
  const [tweaks, setTweaks] = useState(TWEAK_DEFAULTS);

  useEffect(() => {
    const accent = ACCENTS[tweaks.accent] || ACCENTS.emerald;
    const font = FONTS[tweaks.typography] || FONTS.classic;
    const root = document.documentElement;
    root.style.setProperty("--di-pos", accent.pos);
    root.style.setProperty("--di-neg", accent.neg);
    root.style.setProperty("--di-accent", accent.hero);
    root.style.setProperty("--di-font-body", font.body);
    root.style.setProperty("--di-font-head", font.head);
  }, [tweaks.accent, tweaks.typography]);

  function update(patch) { setTweaks(t => ({ ...t, ...patch })); }
  return [tweaks, update];
}

export function TweaksPanel({ tweaks, update, onClose }) {
  return (
    <div className="di-tweaks">
      <h5>Design Tweaks <button className="close" onClick={onClose}>×</button></h5>
      <div className="group">
        <label>Density</label>
        <div className="opts">
          {["compact", "balanced", "spacious"].map(d => (
            <button key={d} className={"opt" + (tweaks.density === d ? " active" : "")}
              onClick={() => update({ density: d })}>{d}</button>
          ))}
        </div>
      </div>
      <div className="group">
        <label>Hero variant</label>
        <div className="opts">
          {[["editorial","Edit."],["dashboard","Dash"],["full","Full"],["terminal","Term"]].map(([k,l]) => (
            <button key={k} className={"opt" + (tweaks.heroVariant === k ? " active" : "")}
              onClick={() => update({ heroVariant: k })}>{l}</button>
          ))}
        </div>
      </div>
      <div className="group">
        <label>Accent</label>
        <div className="opts" style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {Object.entries(ACCENTS).map(([k, a]) => (
            <button key={k} className={"opt" + (tweaks.accent === k ? " active" : "")}
              onClick={() => update({ accent: k })} title={a.name}
              style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: a.hero, border: "1px solid rgba(0,0,0,0.15)" }} />
              {a.name}
            </button>
          ))}
        </div>
      </div>
      <div className="group">
        <label>Typography</label>
        <div className="opts">
          {Object.entries(FONTS).map(([k, f]) => (
            <button key={k} className={"opt" + (tweaks.typography === k ? " active" : "")}
              onClick={() => update({ typography: k })} style={{ fontFamily: f.head }}>{f.name}</button>
          ))}
        </div>
      </div>
      <div className="group">
        <label>Markets rail</label>
        <div className="opts">
          <button className={"opt" + (tweaks.showIndices ? " active" : "")} onClick={() => update({ showIndices: true })}>On</button>
          <button className={"opt" + (!tweaks.showIndices ? " active" : "")} onClick={() => update({ showIndices: false })}>Off</button>
        </div>
      </div>
    </div>
  );
}
