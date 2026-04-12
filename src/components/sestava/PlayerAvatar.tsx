"use client";

import type { Position } from "@/types";
import { poolPositionSquareLabel } from "@/lib/poolPositionLabel";

function positionAccentClass(position: Position) {
  if (position === "G") return "text-sky-300 ring-sky-500/25";
  if (position === "D") return "text-blue-200 ring-blue-400/20";
  return "text-red-200 ring-red-500/20";
}

function positionTileTextClass(size: "sm" | "md" | "lg", label: string) {
  const long = label.length > 4;
  if (size === "sm") {
    return long
      ? "max-w-[2.35rem] break-all text-center text-[10px] font-bold leading-tight tracking-wide"
      : "text-lg font-bold tracking-wide";
  }
  if (size === "md") {
    return long
      ? "max-w-[2.65rem] break-all text-center text-sm font-bold leading-tight tracking-wide"
      : "text-2xl font-bold tracking-wide";
  }
  return long
    ? "max-w-[3.25rem] px-0.5 text-center text-[1.05rem] font-bold leading-tight tracking-wide sm:max-w-[3.5rem] sm:text-[1.2rem]"
    : "text-[1.85rem] font-bold tracking-wide sm:text-[2.15rem]";
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
    size === "sm" ? "h-10 w-10" : size === "lg" ? "h-[4.75rem] w-[4.75rem]" : "h-12 w-12";
  const overlayLong = label.length > 4;
  const overlayLabelClass =
    size === "sm"
      ? overlayLong
        ? "max-w-full px-0.5 text-[7px] leading-tight"
        : "text-[8px] leading-tight"
      : size === "lg"
        ? overlayLong
          ? "max-w-full px-1 text-[9px] leading-tight tracking-wide"
          : "text-[12px] leading-none tracking-wide"
        : overlayLong
          ? "max-w-full px-0.5 text-[8px] leading-tight"
          : "text-[9px] leading-tight";

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
