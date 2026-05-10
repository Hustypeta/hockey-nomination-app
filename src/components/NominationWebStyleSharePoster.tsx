"use client";

import { forwardRef, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { Player, LineupStructure } from "@/types";
import { NOMINATION_WEB_POSTER_H, NOMINATION_WEB_POSTER_W } from "@/lib/sharePosterLayout";
import { SITE_BRAND, SITE_LOGO_URL } from "@/lib/siteBranding";
import { buildNominationWebStyleRoster, type NominationWebStyleRow } from "@/lib/nominationWebStyleRoster";

const CZ_NAVY = "#082552";
const CZ_RED_CORE = "#c8102e";
/** Stejné jako `--accent-blue` na hokejlineup.cz (globální značková modrá). */
const LINEUP_BLUE = "#003087";
/** Tmavší modrá jako v UI (`from-[#003087]` → `to-[#002266]`). */
const LINEUP_BLUE_DEEP = "#002266";

/** Pozadí: tmavší „lineup“ modrá → brand #003087 → červená (bez pastelové sky blue). */
const SURFACE_BG = `
    linear-gradient(165deg,
      #04142f 0%,
      #082552 22%,
      ${LINEUP_BLUE} 46%,
      #c91832 62%,
      #7a1120 92%),
    radial-gradient(circle at 118% -12%, rgba(0,70,158,0.42) 0%, transparent 52%),
    radial-gradient(circle at -28% 108%, rgba(2,8,26,0.85) 0%, transparent 58%)`;

/** Cílová typografie soupisky; výšku dorovnává `rosterScale` (bez ořezu). */
const ROSTER_NAME_PX = 36;
const ROSTER_CLUB_PX = 22;
const ROSTER_DASH_PX = 16;
const ROSTER_SECTION_GAP_MAIN = 12;

const formatCsDate = (d: Date) =>
  new Intl.DateTimeFormat("cs-CZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);

function SectionRibbon({ children }: { children: string }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 11,
        padding: "7px 20px 7px 15px",
        borderRadius: "999px",
        background: `linear-gradient(90deg, ${LINEUP_BLUE_DEEP} 0%, ${LINEUP_BLUE} 55%, ${CZ_RED_CORE} 100%)`,
        boxShadow:
          "0 0 0 1px rgba(255,255,255,0.2), inset 0 2px 0 rgba(255,255,255,0.22), 0 10px 24px rgba(0,28,74,0.35)",
      }}
    >
      <span
        style={{
          display: "block",
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: `#fff`,
          boxShadow: `inset 0 0 0 2px ${LINEUP_BLUE}, 0 0 12px rgba(125,211,252,0.35)`,
        }}
        aria-hidden
      />
      <span
        style={{
          fontWeight: 900,
          fontSize: 15,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "#f8fafc",
        }}
      >
        {children}
      </span>
    </div>
  );
}

function PlayerChip({ row }: { row: NominationWebStyleRow }) {
  return (
    <div
      style={{
        padding: "11px 13px",
        borderRadius: 14,
        background:
          "linear-gradient(145deg, rgba(255,255,255,0.12) 0%, rgba(6,28,72,0.42) 100%)",
        boxShadow:
          "0 0 0 1px rgba(255,255,255,0.14), inset 0 1px 0 rgba(255,255,255,0.1), 0 8px 22px rgba(0,12,40,0.45)",
      }}
    >
      <div
        style={{
          fontSize: ROSTER_NAME_PX,
          lineHeight: 1.05,
          fontWeight: 900,
          letterSpacing: "0.025em",
          textTransform: "uppercase",
          color: "#fff",
          wordBreak: "break-word",
          textShadow: `1px 1px 0 ${CZ_NAVY}, 0 0 12px rgba(200,16,46,0.35)`,
        }}
      >
        {row.name}
      </div>
      <div style={{ marginTop: 5, marginLeft: 1 }}>
        <span
          style={{ color: "rgba(255,255,255,0.5)", marginRight: 8, fontSize: ROSTER_DASH_PX }}
          aria-hidden
        >
          —
        </span>
        <em
          style={{
            fontSize: ROSTER_CLUB_PX,
            fontStyle: "italic",
            fontWeight: 600,
            color: "#e8f6ff",
            wordBreak: "break-word",
          }}
        >
          {row.club}
        </em>
      </div>
    </div>
  );
}

function PlayerColumns({ rows, columns = 2 }: { rows: NominationWebStyleRow[]; columns?: 2 | 3 }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        columnGap: 13,
        rowGap: 10,
      }}
    >
      {rows.map((row, i) => (
        <PlayerChip key={`${row.name}-${row.club}-${i}`} row={row} />
      ))}
    </div>
  );
}

export interface NominationWebStyleSharePosterProps {
  players: Player[];
  lineup: LineupStructure;
  nominationTitle?: string | null;
  siteUrl?: string;
  footerInstantIso?: string | null;
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
    footerInstantIso != null ? formatCsDate(new Date(footerInstantIso)) : formatCsDate(new Date());

  const { goalies, defense, forwards } = useMemo(
    () => buildNominationWebStyleRoster(players, lineup),
    [players, lineup]
  );

  const rosterViewportRef = useRef<HTMLDivElement>(null);
  const rosterBlockRef = useRef<HTMLDivElement>(null);
  const [rosterScale, setRosterScale] = useState(1);

  useLayoutEffect(() => {
    const vp = rosterViewportRef.current;
    const block = rosterBlockRef.current;
    if (!vp || !block) return;

    const fit = () => {
      const avail = vp.clientHeight;
      if (avail < 2) return;
      const need = block.scrollHeight;
      if (need < 1) return;
      const raw = (avail / need) * 0.99;
      setRosterScale(raw >= 0.999 ? 1 : Math.min(1, raw));
    };

    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(vp);
    ro.observe(block);
    return () => ro.disconnect();
  }, [goalies, defense, forwards, titleLine]);

  const origin = siteUrl.replace(/\/$/, "");
  const logoSrc = origin.length > 0 ? `${origin}${SITE_LOGO_URL}` : SITE_LOGO_URL;

  /** Plátno vyplněné po celé ploše 3:4 — sytá modrá + červená, bez bledého „praní“. */
  const surface = SURFACE_BG;

  return (
    <div
      ref={ref}
      className="nomination-web-style-share-poster"
      style={{
        position: "relative",
        boxSizing: "border-box",
        width: NOMINATION_WEB_POSTER_W,
        maxWidth: NOMINATION_WEB_POSTER_W,
        height: NOMINATION_WEB_POSTER_H,
        minHeight: NOMINATION_WEB_POSTER_H,
        flexShrink: 0,
        overflow: "hidden",
        backgroundColor: LINEUP_BLUE,
        backgroundImage: surface,
        display: "flex",
        flexDirection: "column",
        color: "#fdfefe",
        textRendering: "geometricPrecision",
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
        fontFamily:
          '"Segoe UI", ui-sans-serif, system-ui, -apple-system, Roboto, "Helvetica Neue", Arial, sans-serif',
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 104% 90% at 50% -4%, transparent 50%, rgba(3,20,58,0.38) 100%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      {/* Jemný zlatý lem — prémiová linka */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: 0,
          left: 32,
          right: 32,
          height: 4,
          background: `linear-gradient(90deg, ${CZ_NAVY} 0%, #f59e0bcc 52%, ${CZ_RED_CORE} 100%)`,
          opacity: 0.95,
          borderRadius: 2,
          zIndex: 1,
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 2,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          padding: "24px 32px 20px",
        }}
      >
        <header style={{ flexShrink: 0, marginBottom: 12 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 14,
              paddingBottom: 12,
              borderBottom: "2px solid rgba(6,24,58,0.38)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoSrc}
                alt=""
                decoding="async"
                style={{
                  height: 78,
                  width: "auto",
                  objectFit: "contain",
                  display: "block",
                  filter: `drop-shadow(0 2px 0 ${CZ_RED_CORE}) drop-shadow(-1px -1px 0 ${CZ_NAVY}) drop-shadow(0 10px 24px rgba(0,0,0,0.35))`,
                }}
              />
              <div
                aria-hidden
                style={{
                  width: 4,
                  height: 66,
                  borderRadius: 2,
                  background: `linear-gradient(180deg, #fffef8 0%, ${CZ_RED_CORE} 48%, ${CZ_NAVY} 100%)`,
                  boxShadow: "0 0 0 1px rgba(255,255,255,0.4)",
                }}
              />
              <div>
                <p
                  style={{
                    margin: 0,
                    fontSize: 12,
                    fontWeight: 800,
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: "#ffffff",
                    textShadow: "0 1px 3px rgba(0,8,26,0.75), 0 0 1px rgba(0,0,0,0.6)",
                  }}
                >
                  Repre · MS 2026
                </p>
              </div>
            </div>
            <div style={{ textAlign: "right", flex: "1", minWidth: 0 }}>
              <p
                style={{
                  margin: 0,
                  fontSize: 32,
                  lineHeight: 0.96,
                  fontWeight: 900,
                  letterSpacing: "0.02em",
                  textTransform: "uppercase",
                  color: "#ffffff",
                  textShadow:
                    "0 2px 4px rgba(0,10,35,0.85), 0 3px 14px rgba(0,8,26,0.55), 0 0 1px rgba(0,0,0,0.5)",
                  wordBreak: "break-word",
                }}
              >
                NOMINACE
                <br />
                MS 2026
              </p>
              {titleLine ? (
                <p
                  style={{
                    margin: "10px 0 0",
                    marginLeft: "auto",
                    maxWidth: 420,
                    fontSize: 16,
                    fontWeight: 800,
                    color: "#0f2847",
                    lineHeight: 1.25,
                    wordBreak: "break-word",
                    textShadow: "0 1px 0 rgba(255,255,255,0.25)",
                  }}
                >
                  {titleLine}
                </p>
              ) : null}
            </div>
          </div>
        </header>

        {/* Soupiska: velké písmo + škálování, aby se vešla do pevné výšky bez ořezu */}
        <main
          style={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div
            ref={rosterViewportRef}
            style={{
              flex: 1,
              minHeight: 0,
              overflow: "hidden",
              width: "100%",
            }}
          >
            <div
              ref={rosterBlockRef}
              style={{
                width: "100%",
                transform: `scale(${rosterScale})`,
                transformOrigin: "top center",
                willChange: "transform",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: ROSTER_SECTION_GAP_MAIN,
                }}
              >
                <section style={{ flexShrink: 0 }}>
                  <SectionRibbon>BRANKÁŘI</SectionRibbon>
                  <PlayerColumns rows={goalies} columns={goalies.length <= 3 ? 3 : 2} />
                </section>
                <section style={{ flexShrink: 0 }}>
                  <SectionRibbon>OBRÁNCI</SectionRibbon>
                  <PlayerColumns rows={defense} columns={2} />
                </section>
                <section style={{ flexShrink: 0 }}>
                  <SectionRibbon>ÚTOČNÍCI</SectionRibbon>
                  <PlayerColumns rows={forwards} columns={3} />
                </section>
              </div>
            </div>
          </div>
        </main>

        <footer
          style={{
            flexShrink: 0,
            marginTop: 10,
            paddingTop: 10,
            borderTop: "2px solid rgba(6,24,58,0.42)",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 15,
              fontWeight: 900,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#0f2444",
              textShadow: "0 1px 0 rgba(253,246,246,0.65)",
            }}
          >
            {SITE_BRAND} · MS 2026
          </p>
          <p style={{ margin: "8px 0 0", fontSize: 15, fontWeight: 650, color: "#0f2444ee" }}>
            Sestaveno {dateLabel}
            {host ? (
              <>
                {" "}
                · <span style={{ color: CZ_NAVY, fontWeight: 800 }}>{host}</span>
              </>
            ) : null}
          </p>
        </footer>
      </div>
    </div>
  );
});
