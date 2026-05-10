"use client";

import { forwardRef, useMemo } from "react";
import type { Player, LineupStructure } from "@/types";
import { SHARE_POSTER_WIDTH_PX } from "@/lib/sharePosterLayout";
import { SITE_BRAND, SITE_LOGO_URL } from "@/lib/siteBranding";
import { buildNominationWebStyleRoster, type NominationWebStyleRow } from "@/lib/nominationWebStyleRoster";

/** Světlejší modrá / červená ve smyslu vlajky ČR (bez ostrého bílého panelu). */
const FLAG_BLUE = "#4788cf";
const FLAG_BLUE_SOFT = "#6aaee6";
const FLAG_RED_SOFT = "#e56b78";
const FLAG_RED_BRIGHT = "#f0808c";
const CZ_NAVY_LINE = "#0a2a52";
const CZ_NAVY_CAPS = "#041c3f";

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
        marginBottom: 22,
        background: `linear-gradient(90deg, ${CZ_NAVY_LINE} 0%, #174a82 100%)`,
        borderLeft: "6px solid #d4243a",
        boxShadow:
          "0 4px 18px rgba(4,28,63,0.45), inset 0 1px 0 rgba(255,255,255,0.22)",
        color: "#f0f9ff",
        fontWeight: 800,
        fontSize: 22,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        padding: "12px 52px 12px 18px",
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
        margin: "0 0 14px 0",
        lineHeight: 1.28,
        fontSize: 44,
      }}
    >
      <span
        style={{
          fontWeight: 900,
          color: "#ffffff",
          letterSpacing: "0.065em",
          textTransform: "uppercase",
          textShadow:
            "0 2px 0 rgba(12,74,148,0.55), 0 3px 12px rgba(180,35,52,0.45), 0 1px 2px rgba(0,0,0,0.35)",
        }}
      >
        {row.name}
      </span>
      <span style={{ color: "#fff7ed", padding: "0 0.28em", fontWeight: 800 }} aria-hidden>
        —
      </span>
      <em style={{ fontStyle: "italic", color: "#f1f7ff", fontSize: 28, fontWeight: 650 }}>
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

  /** Diagonála světle modrá → červená jako zjednodušená vlajka (bez „bílého pruhu"). */
  const bgLayers = `
    linear-gradient(121deg,
      ${FLAG_BLUE} 0%,
      ${FLAG_BLUE_SOFT} 34%,
      ${FLAG_RED_SOFT} 35%,
      ${FLAG_RED_BRIGHT} 72%,
      ${FLAG_BLUE_SOFT} 100%),
    radial-gradient(circle at 92% -8%, rgba(255,248,246,0.28) 0%, transparent 45%),
    radial-gradient(circle at 8% 100%, rgba(20,74,148,0.35) 0%, transparent 55%),
    repeating-linear-gradient(115deg,
      rgba(255,255,255,0.035) 0px,
      rgba(255,255,255,0.035) 1px,
      transparent 1px,
      transparent 11px)`;

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
        backgroundColor: FLAG_BLUE,
        backgroundImage: bgLayers,
        color: "#fdfefe",
        textRendering: "geometricPrecision",
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
        fontFamily:
          '"Segoe UI", ui-sans-serif, system-ui, -apple-system, Roboto, "Helvetica Neue", Arial, sans-serif',
      }}
    >
      {/* Bez bílé plochy: jen slabý vignette pro hloubku */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          pointerEvents: "none",
          inset: 0,
          background:
            "radial-gradient(ellipse 116% 90% at 50% -6%, transparent 54%, rgba(6,38,94,0.18) 100%)",
          zIndex: 0,
        }}
      />

      <div style={{ position: "relative", zIndex: 1, padding: "40px 44px 36px 40px" }}>
        <header
          style={{
            display: "flex",
            alignItems: "stretch",
            justifyContent: "space-between",
            gap: 20,
            marginBottom: 32,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoSrc}
              alt=""
              decoding="async"
              style={{
                height: 112,
                width: "auto",
                objectFit: "contain",
                display: "block",
                filter:
                  "drop-shadow(3px 4px 0 rgba(212,36,58,0.35)) drop-shadow(-2px -2px 0 rgba(4,74,148,0.45)) drop-shadow(0 12px 28px rgba(0,0,0,0.35))",
              }}
            />
            <div
              aria-hidden
              style={{
                width: 5,
                alignSelf: "stretch",
                minHeight: 100,
                background: `linear-gradient(180deg, ${CZ_NAVY_LINE} 0%, #d4243a 52%, ${FLAG_BLUE_SOFT} 100%)`,
                borderRadius: 2,
                boxShadow:
                  "0 0 0 2px rgba(255,248,246,0.35), inset 0 1px 0 rgba(255,255,255,0.55)",
              }}
            />
          </div>
          <div style={{ flex: 1, minWidth: 0, textAlign: "right", paddingLeft: 10 }}>
            <p
              style={{
                margin: 0,
                fontSize: 58,
                lineHeight: 1.02,
                fontWeight: 900,
                letterSpacing: "0.03em",
                textTransform: "uppercase",
                color: CZ_NAVY_CAPS,
                wordBreak: "break-word",
                textShadow:
                  "0 3px 0 rgba(244,237,239,0.55), -1px -1px 0 rgba(218,239,254,0.45), 0 6px 20px rgba(0,46,118,0.25)",
              }}
            >
              NOMINACE MS 2026
            </p>
            {titleLine ? (
              <p
                style={{
                  margin: "14px 0 0",
                  fontSize: 26,
                  fontWeight: 800,
                  color: CZ_NAVY_LINE,
                  lineHeight: 1.35,
                  textAlign: "right",
                  marginLeft: "auto",
                  wordBreak: "break-word",
                  textShadow:
                    "0 1px 0 rgba(253,246,246,0.35), 0 0 18px rgba(255,255,255,0.25)",
                }}
              >
                {titleLine}
              </p>
            ) : null}
          </div>
        </header>

        <div style={{ maxWidth: "94%" }}>
          <section style={{ marginBottom: 26 }}>
            <BannerLabel>BRANKÁŘI</BannerLabel>
            <div>{goalies.map((row, i) => <PlayerLine key={`g-${i}`} row={row} />)}</div>
          </section>

          <section style={{ marginBottom: 26 }}>
            <BannerLabel>OBRÁNCI</BannerLabel>
            <div>{defense.map((row, i) => <PlayerLine key={`d-${i}`} row={row} />)}</div>
          </section>

          <section style={{ marginBottom: 12 }}>
            <BannerLabel>ÚTOČNÍCI</BannerLabel>
            <div>{forwards.map((row, i) => <PlayerLine key={`f-${i}`} row={row} />)}</div>
          </section>
        </div>

        <footer
          style={{
            marginTop: 22,
            paddingTop: 16,
            borderTop: "2px solid rgba(4,40,94,0.35)",
            maxWidth: "92%",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 18,
              fontWeight: 800,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: CZ_NAVY_LINE,
              textShadow: "0 1px 0 rgba(253,246,246,0.6)",
            }}
          >
            {SITE_BRAND}
          </p>
          <p style={{ margin: "8px 0 0", fontSize: 20, fontWeight: 600, color: CZ_NAVY_LINE }}>
            Sestaveno {dateLabel}
            {host ? (
              <>
                {" "}
                · <span style={{ color: "#fffaf0", fontWeight: 800 }}>{host}</span>
              </>
            ) : null}
          </p>
        </footer>
      </div>
    </div>
  );
});
