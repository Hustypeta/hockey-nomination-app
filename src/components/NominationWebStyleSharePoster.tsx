"use client";

import { forwardRef, useMemo } from "react";
import type { Player, LineupStructure } from "@/types";
import { SHARE_POSTER_WIDTH_PX } from "@/lib/sharePosterLayout";
import { SITE_BRAND, SITE_LOGO_URL } from "@/lib/siteBranding";
import { buildNominationWebStyleRoster, type NominationWebStyleRow } from "@/lib/nominationWebStyleRoster";

export interface NominationWebStyleSharePosterProps {
  players: Player[];
  lineup: LineupStructure;
  nominationTitle?: string | null;
  siteUrl?: string;
  footerInstantIso?: string | null;
}

const formatCsDate = (d: Date) =>
  new Intl.DateTimeFormat("cs-CZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);

function BannerLabel({ children }: { children: string }) {
  return (
    <div
      style={{
        display: "inline-block",
        marginBottom: 14,
        backgroundColor: "#ffffff",
        color: "#0a0a0a",
        fontWeight: 800,
        fontSize: 12,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        padding: "7px 40px 7px 16px",
        borderRadius: "0 999px 999px 0",
      }}
    >
      {children}
    </div>
  );
}

function PlayerLine({ row }: { row: NominationWebStyleRow }) {
  return (
    <p
      style={{
        margin: "0 0 7px 0",
        lineHeight: 1.38,
        fontSize: 16,
      }}
    >
      <span
        style={{
          fontWeight: 800,
          color: "#ffffff",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}
      >
        {row.name}
      </span>
      <span style={{ color: "rgba(255,255,255,0.82)", padding: "0 0.35em" }} aria-hidden>
        —
      </span>
      <em style={{ fontStyle: "italic", color: "#c9c9c9", fontSize: 14, fontWeight: 500 }}>
        {row.club}
      </em>
    </p>
  );
}

export const NominationWebStyleSharePoster = forwardRef<
  HTMLDivElement,
  NominationWebStyleSharePosterProps
>(function NominationWebStyleSharePoster(
  {
    players,
    lineup,
    nominationTitle = null,
    siteUrl = "",
    footerInstantIso = null,
  },
  ref
) {
  const host = siteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const titleLine = nominationTitle?.trim() ?? "";

  const dateLabel =
    footerInstantIso != null
      ? formatCsDate(new Date(footerInstantIso))
      : formatCsDate(new Date());

  const { goalies, defense, forwards } = useMemo(
    () => buildNominationWebStyleRoster(players, lineup),
    [players, lineup]
  );

  const origin = siteUrl.replace(/\/$/, "");
  const logoSrc = origin.length > 0 ? `${origin}${SITE_LOGO_URL}` : SITE_LOGO_URL;

  const bgLayers = `
    radial-gradient(circle at 18% 8%, rgba(255,255,255,0.07) 0%, transparent 38%),
    radial-gradient(circle at 92% 88%, rgba(0,24,72,0.22) 0%, transparent 42%),
    repeating-linear-gradient(115deg,
      rgba(255,255,255,0.018) 0px,
      rgba(255,255,255,0.018) 1px,
      transparent 1px,
      transparent 10px),
    repeating-linear-gradient(-25deg,
      rgba(0,0,0,0.12) 0px,
      transparent 2px,
      transparent 22px)`;

  return (
    <div
      ref={ref}
      className="nomination-web-style-share-poster"
      style={{
        position: "relative",
        width: SHARE_POSTER_WIDTH_PX,
        maxWidth: SHARE_POSTER_WIDTH_PX,
        flexShrink: 0,
        overflow: "hidden",
        backgroundColor: "#3a1018",
        backgroundImage: bgLayers,
        color: "#f4f4f4",
        textRendering: "optimizeLegibility",
        WebkitFontSmoothing: "antialiased",
        fontFamily:
          '"Segoe UI", ui-sans-serif, system-ui, -apple-system, Roboto, "Helvetica Neue", Arial, sans-serif',
      }}
    >
      {/* Bílý dekorativní tah vpravo (částečný „Y“, zjednodušeně nakloněný blok). */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          pointerEvents: "none",
          width: "48%",
          height: "158%",
          right: "-10%",
          top: "-28%",
          background: "rgba(255,252,248,0.94)",
          transform: "rotate(17deg)",
          borderRadius: 6,
          boxShadow: "-24px 0 80px rgba(0,0,0,0.18), inset -2px 0 0 rgba(255,255,255,0.35)",
          zIndex: 0,
        }}
      />
      {/* Jemné černení vpravo, aby byl kontrast fotky/masky (bez konkrétního PNG hráče). */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          pointerEvents: "none",
          inset: 0,
          background:
            "linear-gradient(90deg, rgba(0,0,0,0) 52%, rgba(0,0,0,0.18) 100%)",
          zIndex: 0,
        }}
      />

      <div style={{ position: "relative", zIndex: 1, padding: "36px 40px 32px 36px" }}>
        <header
          style={{
            display: "flex",
            alignItems: "stretch",
            justifyContent: "space-between",
            gap: 16,
            marginBottom: 28,
            maxWidth: "82%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoSrc}
              alt=""
              decoding="async"
              style={{
                height: 56,
                width: "auto",
                objectFit: "contain",
                display: "block",
                filter: "drop-shadow(0 10px 18px rgba(0,0,0,0.35))",
              }}
            />
            <div
              aria-hidden
              style={{
                width: 3,
                alignSelf: "stretch",
                minHeight: 52,
                background: "rgba(255,255,255,0.94)",
                borderRadius: 1,
              }}
            />
          </div>
          <div style={{ flex: 1, minWidth: 0, textAlign: "right", paddingLeft: 8 }}>
            <p
              style={{
                margin: 0,
                fontSize: 56,
                lineHeight: 0.94,
                fontWeight: 900,
                letterSpacing: "0.02em",
                textTransform: "uppercase",
                color: "#ffffff",
                wordBreak: "break-word",
              }}
            >
              NOMINACE
            </p>
            {titleLine ? (
              <p
                style={{
                  margin: "14px 0 0",
                  fontSize: 15,
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.72)",
                  lineHeight: 1.35,
                  textAlign: "right",
                  maxWidth: 420,
                  marginLeft: "auto",
                  wordBreak: "break-word",
                }}
              >
                {titleLine}
              </p>
            ) : null}
          </div>
        </header>

        <div style={{ maxWidth: "58%" }}>
          <section style={{ marginBottom: 26 }}>
            <BannerLabel>BRANKÁŘI</BannerLabel>
            <div>{goalies.map((row, i) => <PlayerLine key={`g-${i}`} row={row} />)}</div>
          </section>

          <section style={{ marginBottom: 26 }}>
            <BannerLabel>OBRÁNCI</BannerLabel>
            <div>{defense.map((row, i) => <PlayerLine key={`d-${i}`} row={row} />)}</div>
          </section>

          <section style={{ marginBottom: 14 }}>
            <BannerLabel>ÚTOČNÍCI</BannerLabel>
            <div>{forwards.map((row, i) => <PlayerLine key={`f-${i}`} row={row} />)}</div>
          </section>
        </div>

        <footer
          style={{
            marginTop: 22,
            paddingTop: 16,
            borderTop: "1px solid rgba(255,255,255,0.12)",
            maxWidth: "70%",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              color: "#c8102e",
            }}
          >
            MS 2026 · {SITE_BRAND}
          </p>
          <p style={{ margin: "6px 0 0", fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
            Sestaveno {dateLabel}
            {host ? (
              <>
                {" "}
                · <span style={{ color: "rgba(180,218,255,0.9)" }}>{host}</span>
              </>
            ) : null}
          </p>
        </footer>
      </div>
    </div>
  );
});
