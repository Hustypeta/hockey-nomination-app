import { ImageResponse } from "next/og";

export const alt = "Sdílená nominace — LineUp";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Statický náhled pro odkazy /share?z=… (stejná „rodina“ jako nominace). */
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(165deg, #0f1728 0%, #05080f 45%, #1a0a0c 100%)",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(0,48,135,0.35), transparent 55%), radial-gradient(ellipse 40% 35% at 100% 80%, rgba(200,16,46,0.2), transparent 50%)",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
            padding: 48,
            textAlign: "center",
          }}
        >
          <span style={{ color: "#c8102e", fontSize: 28, fontWeight: 700, letterSpacing: "0.2em" }}>
            ČESKÁ REPREZENTACE
          </span>
          <span style={{ color: "#ffffff", fontSize: 64, fontWeight: 800, lineHeight: 1.1 }}>
            Sdílená nominace
          </span>
          <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 26, fontWeight: 700, letterSpacing: "0.12em" }}>
            LineUp · MS 2026
          </span>
          <span style={{ color: "rgba(255,255,255,0.72)", fontSize: 30, maxWidth: 900, lineHeight: 1.4 }}>
            Podívej se na sestavu a porovnej ji se svou.
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
