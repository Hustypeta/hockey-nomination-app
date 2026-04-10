"use client";

import type { Position } from "@/types";

const POS_GRAD: Record<Position, string> = {
  G: "from-sky-600 to-blue-900",
  D: "from-[#003087] to-slate-900",
  F: "from-[#c8102e] to-rose-950",
};

function initials(name: string) {
  const p = name.trim().split(/\s+/);
  if (p.length >= 2) return (p[0][0] + p[p.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export function PlayerAvatar({
  name,
  position,
  size = "md",
  imageUrl,
}: {
  name: string;
  position: Position;
  size?: "sm" | "md" | "lg";
  imageUrl?: string | null;
}) {
  const sz =
    size === "sm" ? "h-10 w-10 text-xs" : size === "lg" ? "h-16 w-16 text-lg" : "h-12 w-12 text-sm";

  if (imageUrl) {
    return (
      <div
        className={`relative shrink-0 overflow-hidden rounded-xl bg-[#0a0e17] shadow-[0_4px_20px_rgba(0,0,0,0.35)] ring-1 ring-white/15 ${sz}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt="" className="h-full w-full object-cover object-top" />
        <div
          className={`pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent`}
          aria-hidden
        />
      </div>
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br font-bold text-white shadow-inner ring-1 ring-white/10 ${POS_GRAD[position]} ${sz}`}
    >
      {initials(name)}
    </div>
  );
}
