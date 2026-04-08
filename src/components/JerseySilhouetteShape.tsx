"use client";

import { useId } from "react";

/** Obrys pole / útočníka – úzké rukávy, výstřih do V. */
const PATH_SKATER =
  "M 40 12 L 50 24 L 60 12 L 72 16 L 84 28 L 88 42 L 85 54 L 82 76 L 79 102 L 74 116 L 26 116 L 21 102 L 18 76 L 15 54 L 12 42 L 16 28 L 28 16 Z";

/** Širší střih pro brankáře. */
const PATH_GOALIE =
  "M 36 10 L 50 22 L 64 10 L 78 15 L 92 30 L 96 46 L 92 62 L 88 84 L 84 112 L 78 118 L 22 118 L 16 112 L 12 84 L 8 62 L 4 46 L 8 30 L 22 15 Z";

type JerseySilhouetteShapeProps = {
  kind: "skater" | "goalie";
  /** Prázdný slot – jen obrys (čárkovaně), bez výplně trikolory. */
  empty?: boolean;
  className?: string;
};

/**
 * Jeden souvislý tvar dresu jako silueta (žádná postava uvnitř).
 * viewBox 0 0 100 120 — škálovat přes className (w-full h-auto).
 */
export function JerseySilhouetteShape({
  kind,
  empty = false,
  className = "",
}: JerseySilhouetteShapeProps) {
  const uid = useId().replace(/:/g, "");
  const gradId = `jersey-grad-${uid}`;
  const clipId = `jersey-clip-${uid}`;
  const path = kind === "goalie" ? PATH_GOALIE : PATH_SKATER;

  if (empty) {
    return (
      <svg
        viewBox="0 0 100 120"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <path
          d={path}
          fill="rgba(21,25,34,0.55)"
          stroke="rgba(255,255,255,0.28)"
          strokeWidth="1.4"
          strokeDasharray="5 4"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 100 120"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient
          id={gradId}
          x1="50"
          y1="0"
          x2="50"
          y2="120"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#1560b8" />
          <stop offset="45%" stopColor="#003f87" />
          <stop offset="100%" stopColor="#00264d" />
        </linearGradient>
        <clipPath id={clipId}>
          <path d={path} />
        </clipPath>
      </defs>

      <path
        d={path}
        fill={`url(#${gradId})`}
        stroke="#001a35"
        strokeWidth="0.9"
        strokeLinejoin="round"
      />

      <g clipPath={`url(#${clipId})`} pointerEvents="none">
        {kind === "skater" ? (
          <>
            <rect x="9" y="30" width="3.2" height="26" fill="#c41e3a" rx="0.4" />
            <rect x="13" y="30" width="3.2" height="26" fill="#f2f5fa" rx="0.4" />
            <rect x="17" y="30" width="3.2" height="26" fill="#003f87" rx="0.4" />
            <rect x="79.8" y="30" width="3.2" height="26" fill="#c41e3a" rx="0.4" />
            <rect x="83.8" y="30" width="3.2" height="26" fill="#f2f5fa" rx="0.4" />
            <rect x="87.8" y="30" width="3.2" height="26" fill="#003f87" rx="0.4" />
          </>
        ) : (
          <>
            <rect x="5" y="28" width="4" height="30" fill="#c41e3a" rx="0.4" />
            <rect x="10" y="28" width="4" height="30" fill="#f2f5fa" rx="0.4" />
            <rect x="15" y="28" width="4" height="30" fill="#003f87" rx="0.4" />
            <rect x="81" y="28" width="4" height="30" fill="#c41e3a" rx="0.4" />
            <rect x="86" y="28" width="4" height="30" fill="#f2f5fa" rx="0.4" />
            <rect x="91" y="28" width="4" height="30" fill="#003f87" rx="0.4" />
          </>
        )}
        <path
          d="M 12 108 L 88 108"
          stroke="#c41e3a"
          strokeWidth="2"
          strokeOpacity="0.95"
        />
        <path
          d="M 14 112 L 86 112"
          stroke="#f2f5fa"
          strokeWidth="0.9"
          strokeOpacity="0.35"
        />
      </g>
    </svg>
  );
}
