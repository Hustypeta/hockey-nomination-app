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
        marginBottom: 16,
        background: "linear-gradient(180deg, #ffffff 0%, #e0f7ff 100%)",
        boxShadow: "0 0 0 1px rgba(125,211,252,0.45), 0 10px 28px rgba(0,0,0,0.25)",
        color: "#0f172a",
        fontWeight: 800,
        fontSize: 15,
        letterSpacing: "0.13em",
        textTransform: "uppercase",
        padding: "8px 44px 8px 18px",
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
        margin: "0 0 10px 0",
        lineHeight: 1.32,
        fontSize: 27,
      }}
    >
      <span
        style={{
          fontWeight: 800,
          color: "#ffffff",
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          textShadow: "0 1px 14px rgba(0,0,0,0.35)",
        }}
      >
        {row.name}
      </span>
      <span style={{ color: "#67e8f9", padding: "0 0.32em", fontWeight: 700 }} aria-hidden>
        —
      </span>
      <em style={{ fontStyle: "italic", color: "#bff3ff", fontSize: 19, fontWeight: 600 }}>
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
    radial-gradient(ellipse 72% 54% at 12% 14%, rgba(255,96,139,0.48) 0%, transparent 52%),
    radial-gradient(circle at 88% 92%, rgba(56,189,248,0.26) 0%, transparent 48%),
    radial-gradient(circle at 26% 90%, rgba(251,211,141,0.16) 0%, transparent 44%),
    repeating-linear-gradient(115deg,
      rgba(255,255,255,0.038) 0px,
      rgba(255,255,255,0.038) 1px,
      transparent 1px,
      transparent 10px),
    repeating-linear-gradient(-25deg,
      rgba(0,0,0,0.065) 0px,
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
        textRendering: "geometricPrecision",
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
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
          background:
            "linear-gradient(145deg, rgba(255,252,255,0.99) 0%, rgba(224,246,255,0.95) 55%, rgba(255,255,255,0.92) 100%)",
          transform: "rotate(17deg)",
          borderRadius: 6,
          boxShadow:
            "-32px 0 100px rgba(200,16,46,0.32), -8px 0 42px rgba(56,189,248,0.14), inset -2px 0 0 rgba(255,255,255,0.75)",
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
            "linear-gradient(90deg, rgba(0,0,0,0) 46%, rgba(15,23,42,0.07) 72%, rgba(15,23,42,0.11) 100%)",
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
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(207,250,254,0.82) 100%)",
                boxShadow: "0 0 0 1px rgba(255,255,255,0.3), 0 10px 34px rgba(0,0,0,0.18)",
                borderRadius: 1,
              }}
            />
          </div>
          <div style={{ flex: 1, minWidth: 0, textAlign: "right", paddingLeft: 8 }}>
            <p
              style={{
                margin: 0,
                fontSize: 44,
                lineHeight: 1.03,
                fontWeight: 900,
                letterSpacing: "0.02em",
                textTransform: "uppercase",
                color: "#0f172a",
                wordBreak: "break-word",
                textShadow: "0 1px 0 rgba(255,255,255,0.85), 0 0 32px rgba(255,255,255,0.55)",
              }}
            >
              NOMINACE MS 2026
            </p>
            {titleLine ? (
              <p
                style={{
                  margin: "12px 0 0",
                  fontSize: 17,
                  fontWeight: 600,
                  color: "#334155",
                  lineHeight: 1.35,
                  textAlign: "right",
                  maxWidth: 440,
                  marginLeft: "auto",
                  wordBreak: "break-word",
                }}
              >
                {titleLine}
              </p>
            ) : null}
          </div>
        </header>

        <div style={{ maxWidth: "62%" }}>
          <section style={{ marginBottom: 22 }}>
            <BannerLabel>BRANKÁŘI</BannerLabel>
            <div>{goalies.map((row, i) => <PlayerLine key={`g-${i}`} row={row} />)}</div>
          </section>

          <section style={{ marginBottom: 22 }}>
            <BannerLabel>OBRÁNCI</BannerLabel>
            <div>{defense.map((row, i) => <PlayerLine key={`d-${i}`} row={row} />)}</div>
          </section>

          <section style={{ marginBottom: 10 }}>
            <BannerLabel>ÚTOČNÍCI</BannerLabel>
            <div>{forwards.map((row, i) => <PlayerLine key={`f-${i}`} row={row} />)}</div>
          </section>
        </div>

        <footer
          style={{
            marginTop: 18,
            paddingTop: 14,
            borderTop: "1px solid rgba(255,255,255,0.24)",
            maxWidth: "72%",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#ff8fb8",
            }}
          >
            {SITE_BRAND}
          </p>
          <p style={{ margin: "6px 0 0", fontSize: 12, color: "rgba(255,255,255,0.82)" }}>
            Sestaveno {dateLabel}
            {host ? (
              <>
                {" "}
                · <span style={{ color: "#7dd3fc", fontWeight: 700 }}>{host}</span>
              </>
            ) : null}
          </p>
        </footer>
      </div>
    </div>
  );
});
