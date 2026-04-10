"use client";

import { useId } from "react";

const VB = "0 0 100 120";

/** Obrys dresu včetně krátkých rukávů (ramena nejsou „nahá“). */
const PATH_SKATER =
  "M 39 9 C 35 7.5 29 8 25 10.5 L 15.5 20.5 L 7 24 L 3.5 36 L 4.2 45 L 8.5 51 L 14 51.5 L 14.5 76 C 15.2 98 17.5 110 23.5 114.5 L 76.5 114.5 C 82.5 110 84.8 98 85.5 76 L 86 51.5 L 91.5 51 L 95.8 45 L 96.5 36 L 93 24 L 84.5 20.5 L 75 10.5 C 71 8 65 7.5 61 9 L 54.5 7.5 L 50 17.5 L 45.5 7.5 L 39 9 Z";

const PATH_GOALIE =
  "M 34 8 C 28 6 22 8 17 12 L 4 22 L 0.5 38 L 1.5 50 L 5.5 58 L 9 59 L 7 84 C 8 104 11 112 18 116 L 82 116 C 89 112 92 104 93 84 L 91 59 L 94.5 50 L 98.5 38 L 96 22 L 83 12 C 78 8 72 6 66 8 L 59 6 L 50 17 L 41 6 L 34 8 Z";

type JerseySilhouetteShapeProps = {
  kind: "skater" | "goalie";
  empty?: boolean;
  /** Sestavovač: domácí dres ČR (červený základ, modrý yoke, bílé lemy – fan / Nike IIHF). */
  visualPreset?: "default" | "lineup";
  className?: string;
};

export function JerseySilhouetteShape({
  kind,
  empty = false,
  visualPreset = "default",
  className = "",
}: JerseySilhouetteShapeProps) {
  const uid = useId().replace(/:/g, "");
  const gradId = `jg-${uid}`;
  const shineId = `js-${uid}`;
  const clipId = `jc-${uid}`;
  const filtId = `jf-${uid}`;
  const edgeId = `je-${uid}`;
  const innerGlowId = `jig-${uid}`;
  const path = kind === "goalie" ? PATH_GOALIE : PATH_SKATER;
  const lineup = visualPreset === "lineup";

  if (empty) {
    return (
      <svg viewBox={VB} className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <defs>
          <linearGradient id={`${gradId}-e`} x1="0" y1="0" x2="100" y2="120" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="rgba(255,255,255,0.12)" />
            <stop offset="50%" stopColor="rgba(0,63,135,0.35)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.08)" />
          </linearGradient>
          {lineup ? (
            <radialGradient id={innerGlowId} cx="50%" cy="40%" r="58%">
              <stop offset="0%" stopColor="rgba(200,16,46,0.12)" />
              <stop offset="45%" stopColor="rgba(0,48,135,0.08)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0)" />
            </radialGradient>
          ) : null}
        </defs>
        {lineup ? (
          <>
            <path d={path} fill={`url(#${innerGlowId})`} stroke="none" />
            <path
              d={path}
              fill="rgba(6,10,20,0.35)"
              stroke="rgba(255,255,255,0.28)"
              strokeWidth="1.15"
              strokeDasharray="5 4"
              strokeLinejoin="round"
            />
            <path
              d={path}
              fill="none"
              stroke="rgba(200,16,46,0.2)"
              strokeWidth="1.6"
              strokeDasharray="5 4"
              strokeLinejoin="round"
              opacity="0.85"
            />
          </>
        ) : (
          <path
            d={path}
            fill="rgba(18,22,32,0.65)"
            stroke={`url(#${gradId}-e)`}
            strokeWidth="1.25"
            strokeDasharray="4 3.5"
            strokeLinejoin="round"
          />
        )}
      </svg>
    );
  }

  return (
    <svg viewBox={VB} className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <linearGradient id={gradId} x1="50" y1="0" x2="50" y2="120" gradientUnits="userSpaceOnUse">
          {lineup ? (
            <>
              {/* Modrý yoke nahoře, pak převaha červené (oficiální červený domácí dres repre) */}
              <stop offset="0%" stopColor="#1e4a8c" />
              <stop offset="8%" stopColor="#173d78" />
              <stop offset="16%" stopColor="#123060" />
              <stop offset="22%" stopColor="#c8102e" />
              <stop offset="35%" stopColor="#d91428" />
              <stop offset="55%" stopColor="#e0182e" />
              <stop offset="78%" stopColor="#c8102e" />
              <stop offset="100%" stopColor="#7f0c18" />
            </>
          ) : (
            <>
              <stop offset="0%" stopColor="#1a5fbf" />
              <stop offset="38%" stopColor="#0c4a9e" />
              <stop offset="72%" stopColor="#003f87" />
              <stop offset="100%" stopColor="#001f45" />
            </>
          )}
        </linearGradient>
        <linearGradient id={shineId} x1="22" y1="8" x2="78" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity={lineup ? "0.14" : "0.22"} />
          <stop offset="45%" stopColor="#ffffff" stopOpacity="0.04" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={edgeId} x1="50" y1="0" x2="50" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="rgba(255,255,255,0.45)" />
          <stop offset="18%" stopColor="rgba(0,48,135,0.5)" />
          <stop offset="45%" stopColor="rgba(255,255,255,0.12)" />
          <stop offset="72%" stopColor="rgba(200,16,46,0.45)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.22)" />
        </linearGradient>
        <filter id={filtId} x="-30%" y="-25%" width="160%" height="150%">
          <feDropShadow
            dx="0"
            dy="5"
            stdDeviation={lineup ? "5" : "3.5"}
            floodColor="#000"
            floodOpacity={lineup ? "0.62" : "0.45"}
          />
        </filter>
        <clipPath id={clipId}>
          <path d={path} />
        </clipPath>
      </defs>

      <g filter={`url(#${filtId})`}>
        <path d={path} fill={`url(#${gradId})`} stroke="rgba(0,0,0,0.65)" strokeWidth="1.1" strokeLinejoin="round" />
        <path
          d={path}
          fill="none"
          stroke={`url(#${edgeId})`}
          strokeWidth={lineup ? "0.75" : "0.85"}
          strokeLinejoin="round"
          opacity={lineup ? "0.95" : "1"}
        />
        <path d={path} fill={`url(#${shineId})`} />
      </g>

      <g clipPath={`url(#${clipId})`} pointerEvents="none">
        {kind === "skater" ? (
          lineup ? (
            <>
              {/* Rukáv: modrý „cap“ (yoke), červené tělo, bílý náplet – jako u fan dresů ČR */}
              <rect x="4" y="27" width="11" height="9.5" fill="#1a4d9e" rx="0.45" opacity="0.97" />
              <rect x="4" y="35.5" width="11" height="18" fill="#d21231" rx="0.38" opacity="0.99" />
              <rect x="4" y="52" width="11" height="3.8" fill="#ffffff" rx="0.22" opacity="0.9" />
              <rect x="85" y="27" width="11" height="9.5" fill="#1a4d9e" rx="0.45" opacity="0.97" />
              <rect x="85" y="35.5" width="11" height="18" fill="#d21231" rx="0.38" opacity="0.99" />
              <rect x="85" y="52" width="11" height="3.8" fill="#ffffff" rx="0.22" opacity="0.9" />
            </>
          ) : (
            <>
              <rect x="4" y="26" width="3.2" height="30" fill="#c8102e" rx="0.4" opacity="0.95" />
              <rect x="8" y="26" width="3.2" height="30" fill="#f4f7fb" rx="0.4" opacity="0.98" />
              <rect x="12" y="26" width="3.2" height="30" fill="#003087" rx="0.4" opacity="0.98" />
              <rect x="84.8" y="26" width="3.2" height="30" fill="#c8102e" rx="0.4" opacity="0.95" />
              <rect x="88.8" y="26" width="3.2" height="30" fill="#f4f7fb" rx="0.4" opacity="0.98" />
              <rect x="92.8" y="26" width="3.2" height="30" fill="#003087" rx="0.4" opacity="0.98" />
            </>
          )
        ) : lineup ? (
          <>
            <rect x="1" y="25" width="10.5" height="10.5" fill="#1a4d9e" rx="0.5" opacity="0.97" />
            <rect x="1" y="34.5" width="10.5" height="19.5" fill="#d21231" rx="0.4" opacity="0.99" />
            <rect x="1" y="52.5" width="10.5" height="4.2" fill="#ffffff" rx="0.24" opacity="0.9" />
            <rect x="88.5" y="25" width="10.5" height="10.5" fill="#1a4d9e" rx="0.5" opacity="0.97" />
            <rect x="88.5" y="34.5" width="10.5" height="19.5" fill="#d21231" rx="0.4" opacity="0.99" />
            <rect x="88.5" y="52.5" width="10.5" height="4.2" fill="#ffffff" rx="0.24" opacity="0.9" />
          </>
        ) : (
          <>
            <rect x="1.5" y="24" width="4" height="34" fill="#c8102e" rx="0.45" opacity="0.95" />
            <rect x="6.5" y="24" width="4" height="34" fill="#f4f7fb" rx="0.45" opacity="0.98" />
            <rect x="11.5" y="24" width="4" height="34" fill="#003087" rx="0.45" opacity="0.98" />
            <rect x="84.1" y="24" width="4" height="34" fill="#c8102e" rx="0.45" opacity="0.95" />
            <rect x="89.1" y="24" width="4" height="34" fill="#f4f7fb" rx="0.45" opacity="0.98" />
            <rect x="94.1" y="24" width="4" height="34" fill="#003087" rx="0.45" opacity="0.98" />
          </>
        )}
        {lineup ? (
          <>
            {/* Bílý lem výstřihu (V) */}
            <path
              d="M 42.5 10.5 L 50 20 L 57.5 10.5"
              fill="none"
              stroke="#ffffff"
              strokeWidth="0.55"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.42"
            />
            {/* Hrana modrého yoke vs červené tělo */}
            <path
              d="M 12.5 33.5 Q 50 40.5 87.5 33.5"
              fill="none"
              stroke="#ffffff"
              strokeWidth="0.55"
              strokeLinecap="round"
              opacity="0.48"
            />
          </>
        ) : null}
        <path
          d="M 14 107 L 86 107"
          stroke={lineup ? "#f5f5f5" : "#c8102e"}
          strokeWidth={lineup ? "1.05" : "1.85"}
          strokeLinecap="round"
          opacity={lineup ? "0.65" : "0.92"}
        />
        <path
          d="M 14 109.5 L 86 109.5"
          stroke="#c8102e"
          strokeWidth={lineup ? "1.25" : "0"}
          strokeLinecap="round"
          opacity={lineup ? "0.92" : "0"}
        />
        <path
          d="M 16 111 L 84 111"
          stroke="#ffffff"
          strokeWidth="0.65"
          strokeLinecap="round"
          opacity={lineup ? "0.45" : "0.22"}
        />
        {lineup ? (
          <path
            d="M 50 26 L 50 100"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="11"
            strokeLinecap="round"
          />
        ) : null}
      </g>
    </svg>
  );
}
