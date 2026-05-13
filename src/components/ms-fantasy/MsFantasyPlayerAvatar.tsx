"use client";

import { msFantasyAvatarId, msFantasyAvatarSpriteStyle } from "@/lib/msFantasyAvatars";

type MsFantasyPlayerAvatarProps = {
  playerId: string;
  /** CSS délka (např. 2.75rem, 44px) — včetně rámečku u `premium`. */
  size?: string;
  variant?: "circle" | "shield";
  /** `premium` = konický „kovový“ lem + silnější světlo (karty na ledu / soupiska). */
  frame?: "default" | "premium";
  className?: string;
};

export function MsFantasyPlayerAvatar({
  playerId,
  size = "2.75rem",
  variant = "circle",
  frame = "default",
  className = "",
}: MsFantasyPlayerAvatarProps) {
  const aid = msFantasyAvatarId(playerId);
  const shieldClip = "polygon(7% 0, 93% 0, 100% 16%, 100% 84%, 93% 100%, 7% 100%, 0 84%, 0 16%)";

  const overlays = (
    <>
      <div
        className="h-full w-full bg-slate-900"
        style={msFantasyAvatarSpriteStyle(playerId)}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.22] via-transparent to-black/25"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12),inset_0_-18px_24px_rgba(0,0,0,0.35)]"
        aria-hidden
      />
    </>
  );

  if (frame === "premium" && variant === "circle") {
    return (
      <div
        data-ms-fantasy-avatar={aid}
        className={[
          "relative shrink-0 rounded-full bg-[conic-gradient(from_210deg,#00B4FF,#7dd3fc,#0ea5e9,#0369a1,#00B4FF)] p-[3px] shadow-[0_0_22px_rgba(0,180,255,0.38),0_10px_26px_rgba(0,0,0,0.5)]",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        style={{ width: size, height: size }}
      >
        <div className="relative h-full w-full overflow-hidden rounded-full bg-slate-950 ring-1 ring-black/50">
          {overlays}
        </div>
      </div>
    );
  }

  return (
    <div
      data-ms-fantasy-avatar={aid}
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
      {overlays}
    </div>
  );
}
