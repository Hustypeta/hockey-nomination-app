"use client";

import { msFantasyAvatarPath } from "@/lib/msFantasyAvatars";

type MsFantasyPlayerAvatarProps = {
  playerId: string;
  /** CSS délka (např. 2.75rem, 44px) */
  size?: string;
  variant?: "circle" | "shield";
  className?: string;
};

export function MsFantasyPlayerAvatar({
  playerId,
  size = "2.75rem",
  variant = "circle",
  className = "",
}: MsFantasyPlayerAvatarProps) {
  const src = msFantasyAvatarPath(playerId);
  const shieldClip = "polygon(7% 0, 93% 0, 100% 16%, 100% 84%, 93% 100%, 7% 100%, 0 84%, 0 16%)";

  return (
    <div
      className={[
        "relative shrink-0 overflow-hidden bg-slate-950 shadow-[0_10px_32px_rgba(0,0,0,0.5)] ring-2 ring-cyan-200/35",
        variant === "circle" ? "rounded-full" : "rounded-lg",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        width: size,
        height: size,
        clipPath: variant === "shield" ? shieldClip : undefined,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- lokální SVG placeholdery */}
      <img
        src={src}
        alt=""
        width={96}
        height={96}
        className="h-full w-full object-cover"
        loading="lazy"
        decoding="async"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/25 via-transparent to-black/20"
        aria-hidden
      />
    </div>
  );
}
