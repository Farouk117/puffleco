import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "linear-gradient(135deg, #fffaf1 0%, #ffe2a5 48%, #e99500 100%)",
          color: "#15110b",
          fontFamily: "Georgia, serif",
          padding: 64,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -70,
            top: -70,
            width: 360,
            height: 360,
            borderRadius: 180,
            background: "rgba(255,255,255,0.48)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 80,
            bottom: 76,
            width: 310,
            height: 190,
            borderRadius: 80,
            background: "#f4b34e",
            boxShadow: "0 20px 0 #a85d00, 0 42px 0 #ffd47a, 0 64px 0 #a85d00",
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", width: 760 }}>
          <div style={{ fontSize: 34, letterSpacing: 8, fontFamily: "Arial, sans-serif", fontWeight: 900, color: "#a85d00" }}>
            GOURMET PANCAKES · PUFF PUFF
          </div>
          <div style={{ marginTop: 28, fontSize: 96, lineHeight: 0.93, fontWeight: 900, letterSpacing: -5 }}>
            The Pufflette.co
          </div>
          <div style={{ marginTop: 28, fontSize: 34, fontFamily: "Arial, sans-serif", lineHeight: 1.35, color: "#3a2a17" }}>
            Freshly made boxes, premium toppings included, delivered across Abuja.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
