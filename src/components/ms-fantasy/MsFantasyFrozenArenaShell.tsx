"use client";

import type { ReactNode } from "react";

/** Skleněný panel — karty / sekce jako na referenčním mocku fantasy */
export function MsFantasyGlassPanel({
  children,
  className = "",
  glow = "cyan",
}: {
  children: ReactNode;
  className?: string;
  glow?: "cyan" | "subtle";
}) {
  const glowClass =
    glow === "cyan"
      ? "shadow-[0_0_48px_rgba(0,200,255,0.12),inset_0_1px_0_rgba(255,255,255,0.14)]"
      : "shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]";
  return (
    <div
      className={[
        "rounded-3xl border border-white/[0.14] bg-gradient-to-br from-white/[0.09] via-white/[0.04] to-white/[0.02] backdrop-blur-2xl",
        glowClass,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
