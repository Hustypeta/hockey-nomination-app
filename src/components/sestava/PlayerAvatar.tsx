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
}: {
  name: string;
  position: Position;
  size?: "sm" | "md" | "lg";
}) {
  const sz = size === "sm" ? "h-10 w-10 text-xs" : size === "lg" ? "h-16 w-16 text-lg" : "h-12 w-12 text-sm";
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br font-bold text-white shadow-inner ring-1 ring-white/10 ${POS_GRAD[position]} ${sz}`}
    >
      {initials(name)}
    </div>
  );
}
