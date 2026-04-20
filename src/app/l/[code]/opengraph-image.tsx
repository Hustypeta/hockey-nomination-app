import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";
import { SITE_BRAND } from "@/lib/siteBranding";

export const alt = "Sdílená nominace — Lineup";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const row = await prisma.shareLink.findUnique({ where: { code } });

  const label = row?.title?.trim() || "Sdílená nominace";

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
          <span style={{ color: "#ffffff", fontSize: 56, fontWeight: 800, lineHeight: 1.15, maxWidth: 1000 }}>
            {label}
          </span>
          <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 26, fontWeight: 700, letterSpacing: "0.12em" }}>
            Lineup · MS 2026
          </span>
          <span style={{ color: "rgba(255,255,255,0.72)", fontSize: 28, maxWidth: 900, lineHeight: 1.4 }}>
            Podívej se na sestavu a porovnej ji se svou.
          </span>
          <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 20 }}>{SITE_BRAND}</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
