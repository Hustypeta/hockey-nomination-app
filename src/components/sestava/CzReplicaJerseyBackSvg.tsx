"use client";

import { useId } from "react";

const VB = "0 0 100 120";

/** Obrys zadní strany (stejná geometrie jako u ostatních dresů v appce). */
const PATH_SKATER =
  "M 39 9 C 35 7.5 29 8 25 10.5 L 15.5 20.5 L 7 24 L 3.5 36 L 4.2 45 L 8.5 51 L 14 51.5 L 14.5 76 C 15.2 98 17.5 110 23.5 114.5 L 76.5 114.5 C 82.5 110 84.8 98 85.5 76 L 86 51.5 L 91.5 51 L 95.8 45 L 96.5 36 L 93 24 L 84.5 20.5 L 75 10.5 C 71 8 65 7.5 61 9 L 54.5 7.5 L 50 17.5 L 45.5 7.5 L 39 9 Z";

const PATH_GOALIE =
  "M 34 8 C 28 6 22 8 17 12 L 4 22 L 0.5 38 L 1.5 50 L 5.5 58 L 9 59 L 7 84 C 8 104 11 112 18 116 L 82 116 C 89 112 92 104 93 84 L 91 59 L 94.5 50 L 98.5 38 L 96 22 L 83 12 C 78 8 72 6 66 8 L 59 6 L 50 17 L 41 6 L 34 8 Z";

const RED = "#c8102e";
const NAVY = "#003087";
const NAVY_LIGHT = "#11457e";
const WHITE = "#f4f4f4";

type Props = {
  kind: "skater" | "goalie";
  /** Prázdný slot — jen obrys, slabší výplň. */
  empty?: boolean;
  className?: string;
};

/**
 * Vektorová zadní strana replikového domácího dresu ČR (bílý yoke, červené tělo, modré pruhy).
 * Žádný vypálený text — vhodné jako podklad pro dynamické jméno a číslo.
 */
export function CzReplicaJerseyBackSvg({ kind, empty = false, className = "" }: Props) {
  const uid = useId().replace(/:/g, "");
  const path = kind === "goalie" ? PATH_GOALIE : PATH_SKATER;
  const clipId = `czjb-clip-${uid}`;
  const gRed = `czjb-red-${uid}`;
  const gYoke = `czjb-yoke-${uid}`;
  const gMesh = `czjb-mesh-${uid}`;

  return (
    <svg viewBox={VB} className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
          <path d={path} />
        </clipPath>
        <linearGradient id={gRed} x1="50" y1="28" x2="50" y2="118" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#9e0c24" />
          <stop offset="45%" stopColor={RED} />
          <stop offset="100%" stopColor="#7a0718" />
        </linearGradient>
        <linearGradient id={gYoke} x1="50" y1="6" x2="50" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="55%" stopColor={WHITE} />
          <stop offset="100%" stopColor="#e8e8e8" />
        </linearGradient>
        <pattern id={gMesh} width="4" height="4" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.35" fill="rgba(255,255,255,0.04)" />
          <circle cx="3" cy="3" r="0.28" fill="rgba(0,0,0,0.06)" />
        </pattern>
      </defs>

      {empty ? (
        <path
          d={path}
          fill="rgba(255,255,255,0.07)"
          stroke="#64748b"
          strokeWidth="1.2"
          strokeDasharray="5 4"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      ) : (
        <>
          <path
            d={path}
            fill={`url(#${gRed})`}
            stroke="rgba(0,0,0,0.12)"
            strokeWidth="0.6"
            strokeLinejoin="round"
          />
          <g clipPath={`url(#${clipId})`}>
            {/* Bílý horní díl (ramena / yoke) — sleduje horní část obrysu dresu */}
            <path
              d={
                kind === "goalie"
                  ? "M 34 8 L 17 12 L 4 22 L 2 34 L 2 37 L 98 37 L 98 34 L 96 22 L 83 12 L 66 8 L 59 6 L 50 17 L 41 6 Z"
                  : "M 39 9 L 25 10.5 L 15.5 20.5 L 9 28 L 7 36 L 93 36 L 91 28 L 84.5 20.5 L 75 10.5 L 61 9 L 54.5 7.5 L 50 17.5 L 45.5 7.5 Z"
              }
              fill={`url(#${gYoke})`}
            />
            {/* Oddělovací linka trikolorního lemu */}
            <path
              d={kind === "goalie" ? "M 2 37.2 L 98 37.2" : "M 7 36.2 L 93 36.2"}
              stroke={NAVY}
              strokeWidth="0.85"
              strokeLinecap="round"
              opacity={0.95}
            />
            {/* Mini vlajka na yoke */}
            <g transform={kind === "goalie" ? "translate(46, 16)" : "translate(46, 17)"}>
              <rect x="0" y="0" width="2.4" height="5.5" fill="#ffffff" rx="0.2" />
              <rect x="2.4" y="0" width="2.4" height="5.5" fill="#d7141a" rx="0.2" />
              <rect x="4.8" y="0" width="2.4" height="5.5" fill={NAVY_LIGHT} rx="0.2" />
            </g>
            {/* Spodní lem — modrá + bílá linka */}
            <path d="M 16 110 L 84 110" stroke={NAVY} strokeWidth="1.4" strokeLinecap="round" opacity={0.9} />
            <path d="M 18 112.5 L 82 112.5" stroke="#f0f0f0" strokeWidth="0.9" strokeLinecap="round" opacity={0.85} />
            {/* Manžety rukávů (zjednodušeně) */}
            <g opacity={0.92}>
              <rect x="4" y="48" width="12" height="5" rx="0.8" fill="#f5f5f5" />
              <rect x="4" y="51.5" width="12" height="1.6" rx="0.3" fill={NAVY} />
              <rect x="84" y="48" width="12" height="5" rx="0.8" fill="#f5f5f5" />
              <rect x="84" y="51.5" width="12" height="1.6" rx="0.3" fill={NAVY} />
            </g>
            {/* Jemná „síťovina“ */}
            <rect x="0" y="0" width="100" height="120" fill={`url(#${gMesh})`} opacity={0.35} style={{ mixBlendMode: "soft-light" }} />
          </g>
          <path
            d={path}
            fill="none"
            stroke="rgba(255,255,255,0.18)"
            strokeWidth="0.45"
            strokeLinejoin="round"
            opacity={0.7}
          />
        </>
      )}
    </svg>
  );
}
