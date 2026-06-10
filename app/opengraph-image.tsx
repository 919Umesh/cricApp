import { ImageResponse } from "next/og";

export const alt = "Silly Point — Nepali cricket, lovingly roasted";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #881337 0%, #4c0519 60%, #1e1b4b 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 36, display: "flex" }}>🏏 Silly Point</div>
        <div
          style={{
            marginTop: 28,
            fontSize: 84,
            fontWeight: 700,
            lineHeight: 1.05,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <span>Nepali cricket,</span>
          <span style={{ color: "#fda4af" }}>lovingly roasted.</span>
        </div>
        <div style={{ marginTop: 32, fontSize: 28, opacity: 0.85, display: "flex" }}>
          Golden ducks · Collapses · Memes · Zero malice
        </div>
      </div>
    ),
    { ...size },
  );
}
