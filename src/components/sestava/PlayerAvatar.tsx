"use client";

import type { Position } from "@/types";
import { GoalieButterflySilhouette, SkaterPortraitSilhouette } from "@/components/sestava/HockeySilhouettes";

const POS_GRAD: Record<Position, string> = {
  G: "from-sky-900/80 to-[#05080f]",
  D: "from-[#0a2450] to-[#05080f]",
  F: "from-[#3a0a14] to-[#05080f]",
};

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
  /** LW, C, RW, … — stejná velikost jako dřív iniciály */
  role?: string | null;
  size?: "sm" | "md" | "lg";
  imageUrl?: string | null;
}) {
  const label = positionLabel(position, role);
  const szBox =
    size === "sm" ? "h-10 w-10" : size === "lg" ? "h-16 w-16" : "h-12 w-12";
  const szText =
    size === "sm"
      ? "text-[9px] leading-tight"
      : size === "lg"
        ? "text-[11px] leading-tight"
        : "text-[10px] leading-tight";

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

  const isG = position === "G";

  return (
    <div
      role="img"
      aria-label={name}
      className={`relative shrink-0 overflow-hidden rounded-xl bg-gradient-to-b shadow-[0_4px_16px_rgba(0,0,0,0.4)] ring-1 ring-white/12 ${POS_GRAD[position]} ${szBox}`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.2]"
        style={{
          backgroundImage:
            "linear-gradient(120deg, rgba(200,16,46,0.35) 0%, transparent 45%, transparent 55%, rgba(0,48,135,0.3) 100%)",
        }}
      />
      <div className="absolute inset-0 flex items-end justify-center pb-4">
        {isG ? (
          <GoalieButterflySilhouette className="h-[135%] w-[135%] max-w-none -translate-y-1" />
        ) : (
          <SkaterPortraitSilhouette className="h-[130%] w-auto max-w-[120%] -translate-y-0.5" />
        )}
      </div>
      <span
        className={`pointer-events-none absolute inset-x-0 bottom-0.5 z-[1] flex items-center justify-center font-display font-bold uppercase tracking-wide text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.95)] ${szText}`}
      >
        {label}
      </span>
    </div>
  );
}
