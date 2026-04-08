"use client";

import { useId } from "react";

const VB = "0 0 100 120";

/** Hladší obrys dresu (ramena, výstřih, sukně). */
const PATH_SKATER =
  "M 39 9 C 35 7.5 29 8 25 10.5 L 15.5 20.5 C 12.5 26 11.5 32 12 38 L 14.5 76 C 15.2 98 17.5 110 23.5 114.5 L 76.5 114.5 C 82.5 110 84.8 98 85.5 76 L 88 38 C 88.5 32 87.5 26 84.5 20.5 L 75 10.5 C 71 8 65 7.5 61 9 L 54.5 7.5 L 50 17.5 L 45.5 7.5 L 39 9 Z";

const PATH_GOALIE =
  "M 34 8 C 28 6 22 8 17 12 L 7 26 C 4 34 3 42 4 50 L 7 84 C 8 104 11 112 18 116 L 82 116 C 89 112 92 104 93 84 L 96 50 C 97 42 96 34 93 26 L 83 12 C 78 8 72 6 66 8 L 59 6 L 50 17 L 41 6 L 34 8 Z";

type JerseySilhouetteShapeProps = {
  kind: "skater" | "goalie";
  empty?: boolean;
  className?: string;
};

export function JerseySilhouetteShape({
  kind,
  empty = false,
  className = "",
}: JerseySilhouetteShapeProps) {
  const uid = useId().replace(/:/g, "");
  const gradId = `jg-${uid}`;
  const shineId = `js-${uid}`;
  const clipId = `jc-${uid}`;
  const filtId = `jf-${uid}`;
  const path = kind === "goalie" ? PATH_GOALIE : PATH_SKATER;

  if (empty) {
    return (
      <svg viewBox={VB} className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <defs>
          <linearGradient id={`${gradId}-e`} x1="0" y1="0" x2="100" y2="120" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="rgba(255,255,255,0.12)" />
            <stop offset="50%" stopColor="rgba(0,63,135,0.35)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.08)" />
          </linearGradient>
        </defs>
        <path
          d={path}
          fill="rgba(18,22,32,0.65)"
          stroke={`url(#${gradId}-e)`}
          strokeWidth="1.25"
          strokeDasharray="4 3.5"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg viewBox={VB} className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <linearGradient id={gradId} x1="50" y1="0" x2="50" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1a5fbf" />
          <stop offset="38%" stopColor="#0c4a9e" />
          <stop offset="72%" stopColor="#003f87" />
          <stop offset="100%" stopColor="#001f45" />
        </linearGradient>
        <linearGradient id={shineId} x1="22" y1="8" x2="78" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.22" />
          <stop offset="45%" stopColor="#ffffff" stopOpacity="0.04" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <filter id={filtId} x="-25%" y="-20%" width="150%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="3.5" floodColor="#000" floodOpacity="0.45" />
        </filter>
        <clipPath id={clipId}>
          <path d={path} />
        </clipPath>
      </defs>

      <g filter={`url(#${filtId})`}>
        <path d={path} fill={`url(#${gradId})`} stroke="rgba(0,26,58,0.85)" strokeWidth="0.85" strokeLinejoin="round" />
        <path d={path} fill={`url(#${shineId})`} />
      </g>

      <g clipPath={`url(#${clipId})`} pointerEvents="none">
        {kind === "skater" ? (
          <>
            <rect x="10" y="29" width="2.8" height="28" fill="#d62a45" rx="0.35" opacity="0.92" />
            <rect x="13.5" y="29" width="2.8" height="28" fill="#f4f7fb" rx="0.35" opacity="0.95" />
            <rect x="17" y="29" width="2.8" height="28" fill="#0a3d7a" rx="0.35" opacity="0.95" />
            <rect x="80.2" y="29" width="2.8" height="28" fill="#d62a45" rx="0.35" opacity="0.92" />
            <rect x="83.7" y="29" width="2.8" height="28" fill="#f4f7fb" rx="0.35" opacity="0.95" />
            <rect x="87.2" y="29" width="2.8" height="28" fill="#0a3d7a" rx="0.35" opacity="0.95" />
          </>
        ) : (
          <>
            <rect x="6" y="27" width="3.4" height="32" fill="#d62a45" rx="0.4" opacity="0.92" />
            <rect x="10.5" y="27" width="3.4" height="32" fill="#f4f7fb" rx="0.4" opacity="0.95" />
            <rect x="15" y="27" width="3.4" height="32" fill="#0a3d7a" rx="0.4" opacity="0.95" />
            <rect x="81.6" y="27" width="3.4" height="32" fill="#d62a45" rx="0.4" opacity="0.92" />
            <rect x="86.1" y="27" width="3.4" height="32" fill="#f4f7fb" rx="0.4" opacity="0.95" />
            <rect x="90.6" y="27" width="3.4" height="32" fill="#0a3d7a" rx="0.4" opacity="0.95" />
          </>
        )}
        <path
          d="M 14 107 L 86 107"
          stroke="#c41e3a"
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity="0.9"
        />
        <path
          d="M 16 111 L 84 111"
          stroke="#ffffff"
          strokeWidth="0.7"
          strokeLinecap="round"
          opacity="0.25"
        />
      </g>
    </svg>
  );
}
