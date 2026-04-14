"use client";

import type { Position } from "@/types";
import { poolPositionSquareLabel } from "@/lib/poolPositionLabel";

function positionAccentClass(position: Position) {
  if (position === "G") return "text-sky-300 ring-sky-500/25";
  if (position === "D") return "text-blue-200 ring-blue-400/20";
  return "text-red-200 ring-red-500/20";
}

/** Stejná velikost „dlaždice“; délka štítku (G / LW/RW / …) řídí jen velikost písma — přehledné v poolu. */
function positionTileTextClass(size: "sm" | "md" | "lg", label: string) {
  const L = label.length;
  if (size === "sm") {
    if (L <= 2) return "text-lg font-bold tracking-wide";
    if (L <= 4) return "text-[11px] font-bold leading-tight tracking-wide";
    return "max-w-full px-0.5 text-center text-[8px] font-bold leading-tight tracking-wide";
  }
  if (size === "md") {
    if (L <= 2) return "text-xl font-bold tracking-wide";
    if (L <= 4) return "text-sm font-bold leading-tight tracking-wide";
    return "max-w-full px-0.5 text-center text-[9px] font-bold leading-tight tracking-wide";
  }
  if (L <= 2) return "text-2xl font-bold tracking-wide";
  if (L <= 4) return "text-base font-bold leading-tight tracking-wide";
  return "max-w-full px-0.5 text-center text-[10px] font-bold leading-tight tracking-wide";
}

export function PlayerAvatar({
  name,
  position,
  role,
  size = "md",
  imageUrl,
}: {
  name: string;
  position: Position;
  /** LW, C, RW, … */
  role?: string | null;
  size?: "sm" | "md" | "lg";
  imageUrl?: string | null;
}) {
  const label = poolPositionSquareLabel({ position, role });
  const szBox =
    size === "sm" ? "h-10 w-10" : size === "lg" ? "h-12 w-12" : "h-11 w-11";
  const L = label.length;
  const overlayLabelClass =
    size === "sm"
      ? L <= 2
        ? "text-[10px] leading-none"
        : L <= 4
          ? "text-[8px] leading-tight"
          : "px-0.5 text-[7px] leading-tight"
      : size === "lg"
        ? L <= 2
          ? "text-[11px] leading-none"
          : L <= 4
            ? "text-[9px] leading-tight"
            : "px-0.5 text-[8px] leading-tight"
        : L <= 2
          ? "text-[10px] leading-none"
          : L <= 4
            ? "text-[8px] leading-tight"
            : "px-0.5 text-[7px] leading-tight";

  if (imageUrl) {
    return (
      <div
        className={`relative shrink-0 overflow-hidden rounded-xl bg-[#0a0e17] shadow-[0_4px_20px_rgba(0,0,0,0.35)] ring-1 ring-white/15 ${szBox}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt={name} className="h-full w-full object-cover object-top" />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
          aria-hidden
        />
        <span
          className={`pointer-events-none absolute inset-x-0 bottom-0.5 flex items-center justify-center font-display font-bold uppercase tracking-wide text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)] ${overlayLabelClass}`}
        >
          {label}
        </span>
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label={`${name}, ${label}`}
      className={`
        flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-b from-white/[0.07] to-[#05070c]
        shadow-[0_4px_16px_rgba(0,0,0,0.45)] ring-1 ring-inset ${positionAccentClass(position)} ${szBox}
      `}
    >
      <span
        className={`
          select-none font-display uppercase leading-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)]
          ${positionTileTextClass(size, label)}
        `}
      >
        {label}
      </span>
    </div>
  );
}
