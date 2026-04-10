"use client";

import type { Position } from "@/types";

const POS_GRAD: Record<Position, string> = {
  G: "from-sky-600 to-blue-900",
  D: "from-[#003087] to-slate-900",
  F: "from-[#c8102e] to-rose-950",
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
      ? "text-[11px] leading-tight"
      : size === "lg"
        ? "text-lg leading-none"
        : "text-sm leading-tight";

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
      className={`flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br font-display font-bold uppercase leading-none tracking-wide text-white shadow-inner ring-1 ring-white/10 ${POS_GRAD[position]} ${szBox} ${szText}`}
    >
      <span className="max-w-[92%] text-center">{label}</span>
    </div>
  );
}
