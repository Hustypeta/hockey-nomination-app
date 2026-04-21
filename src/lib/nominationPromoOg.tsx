import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const NOMINATION_PROMO_OG_SIZE = { width: 1200, height: 630 } as const;

export const NOMINATION_PROMO_OG_ALT = "Sestav si nominaci a vyhraj dres — Lineup · MS 2026";

/** Náhled odkazu (OG / Facebook / X) — logo + výzva k soutěži o dres. */
export async function renderNominationPromoOg() {
  let logoDataUrl: string | undefined;
  try {
    const logoPath = join(process.cwd(), "public", "images", "logo.png");
    const buf = await readFile(logoPath);
    logoDataUrl = `data:image/png;base64,${buf.toString("base64")}`;
  } catch {
    /* bez loga jen text */
  }

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
            gap: 36,
            padding: 48,
            textAlign: "center",
            maxWidth: 1040,
          }}
        >
          {logoDataUrl ? (
            <img
              src={logoDataUrl}
              alt=""
              height={176}
              width={520}
              style={{
                height: 176,
                width: "auto",
                maxWidth: 560,
                objectFit: "contain",
              }}
            />
          ) : null}
          <span
            style={{
              color: "#ffffff",
              fontSize: 54,
              fontWeight: 800,
              lineHeight: 1.18,
              letterSpacing: "-0.02em",
            }}
          >
            Sestav si nominaci a vyhraj dres
          </span>
          <span
            style={{
              color: "rgba(255,255,255,0.55)",
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: "0.14em",
            }}
          >
            Lineup · MS 2026
          </span>
        </div>
      </div>
    ),
    { ...NOMINATION_PROMO_OG_SIZE }
  );
}
