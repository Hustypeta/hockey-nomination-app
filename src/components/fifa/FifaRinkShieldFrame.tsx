"use client";

import { useId } from "react";
import {
  FIFA_RINK_SHIELD_POINTS,
  FIFA_RINK_SHIELD_VIEWBOX,
} from "@/lib/fifa/fifaRinkShield";

export { FIFA_RINK_SHIELD_POINTS };

/** Osmiúhelníkový FUT štít — vyplní čtvercový slot. */
export function FifaRinkShieldFrame() {
  const uid = useId().replace(/:/g, "");
  const fillId = `fifa-shield-fill-${uid}`;
  const sheenId = `fifa-shield-sheen-${uid}`;
  const strokeId = `fifa-shield-stroke-${uid}`;
  const glowId = `fifa-shield-glow-${uid}`;

  return (
    <svg
      className="fifa-rink-shield-svg"
      viewBox={`0 0 ${FIFA_RINK_SHIELD_VIEWBOX.w} ${FIFA_RINK_SHIELD_VIEWBOX.h}`}
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        {/* Hloubkový fill — tmavě modrá nahoře do černé dole, s nádechem azurové */}
        <linearGradient id={fillId} x1="0" y1="0" x2="0.25" y2="1">
          <stop offset="0%" stopColor="rgb(24, 40, 66)" stopOpacity="0.97" />
          <stop offset="42%" stopColor="rgb(11, 18, 34)" stopOpacity="0.98" />
          <stop offset="100%" stopColor="rgb(3, 5, 12)" stopOpacity="1" />
        </linearGradient>
        {/* Horní lesk (gloss) přes vrchní polovinu */}
        <linearGradient id={sheenId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.22)" />
          <stop offset="40%" stopColor="rgba(120,200,255,0.06)" />
          <stop offset="62%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
        {/* Dynamický azurový tah — světlejší vlevo nahoře, sytější vpravo dole */}
        <linearGradient id={strokeId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgb(186, 240, 255)" />
          <stop offset="45%" stopColor="rgb(56, 199, 236)" />
          <stop offset="100%" stopColor="rgb(20, 120, 190)" />
        </linearGradient>
        <filter id={glowId} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="1.8" />
        </filter>
      </defs>

      {/* Vnější záře */}
      <polygon
        points={FIFA_RINK_SHIELD_POINTS}
        fill="none"
        stroke="rgba(34, 211, 238, 0.55)"
        strokeWidth="3.4"
        strokeLinejoin="round"
        filter={`url(#${glowId})`}
        vectorEffect="nonScalingStroke"
      />
      {/* Tělo */}
      <polygon points={FIFA_RINK_SHIELD_POINTS} fill={`url(#${fillId})`} stroke="none" />
      {/* Horní lesk */}
      <polygon points={FIFA_RINK_SHIELD_POINTS} fill={`url(#${sheenId})`} stroke="none" opacity="0.9" />
      {/* Hlavní gradientový rám */}
      <polygon
        points={FIFA_RINK_SHIELD_POINTS}
        fill="none"
        stroke={`url(#${strokeId})`}
        strokeWidth="1.6"
        strokeLinejoin="round"
        vectorEffect="nonScalingStroke"
      />
    </svg>
  );
}
