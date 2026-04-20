import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "#0a0e1a", color: "#e8edf5", gap: 16, padding: 24,
    }}>
      <span style={{ fontSize: 48 }}>📰</span>
      <h2 style={{ fontSize: 24, fontWeight: 700 }}>No digest found for that date</h2>
      <p style={{ color: "#4a5a75" }}>That date doesn't exist in the archive yet.</p>
      <Link href="/" style={{
        background: "rgba(201,168,76,0.15)", color: "#c9a84c",
        padding: "10px 20px", borderRadius: 8, fontWeight: 600, fontSize: 14,
      }}>← Back to latest</Link>
    </div>
  );
}
