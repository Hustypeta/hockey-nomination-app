"use client";

import type { Position } from "@/types";
import { JerseySilhouetteShape } from "@/components/JerseySilhouetteShape";

function positionLabel(position: Position, role?: string | null) {
  const r = role?.trim();
  if (r) return r.toUpperCase();
  return position;
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
  const label = positionLabel(position, role);
  const szBox =
    size === "sm" ? "h-10 w-10" : size === "lg" ? "h-16 w-16" : "h-12 w-12";
  const szText =
    size === "sm"
      ? "text-[8px] leading-tight"
      : size === "lg"
        ? "text-[10px] leading-tight"
        : "text-[9px] leading-tight";

  const isG = position === "G";

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
          className={`pointer-events-none absolute inset-x-0 bottom-0.5 flex items-center justify-center font-display font-bold uppercase tracking-wide text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)] ${szText}`}
        >
          {label}
        </span>
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label={name}
      className={`relative shrink-0 overflow-hidden rounded-xl bg-[#06080d] shadow-[0_4px_16px_rgba(0,0,0,0.45)] ring-1 ring-white/12 ${szBox}`}
    >
      <div className="absolute inset-0 flex items-end justify-center overflow-hidden pb-3">
        <JerseySilhouetteShape
          kind={isG ? "goalie" : "skater"}
          visualPreset="lineup"
          className="h-[155%] w-[155%] max-w-none shrink-0 -translate-x-0 translate-y-1"
        />
      </div>
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] bg-gradient-to-t from-black/85 via-black/50 to-transparent pt-3 pb-0.5"
        aria-hidden
      />
      <span
        className={`pointer-events-none absolute inset-x-0 bottom-0.5 z-[2] flex items-center justify-center font-display font-bold uppercase tracking-wide text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.95)] ${szText}`}
      >
        {label}
      </span>
    </div>
  );
}
