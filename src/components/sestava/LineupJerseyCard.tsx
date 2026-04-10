"use client";

import type { Player } from "@/types";
import { CzechHockeyCrest } from "@/components/CzechHockeyCrest";
import { jerseyNumberForPlayer } from "@/lib/jerseyNumber";
import { GoalieButterflySilhouette, SkaterPortraitSilhouette } from "@/components/sestava/HockeySilhouettes";

export type LineupJerseySize = "compact" | "skater" | "goalie";

function lastName(name: string) {
  const parts = name.trim().split(/\s+/);
  return parts[parts.length - 1] || name;
}

const widthClass: Record<LineupJerseySize, string> = {
  compact: "max-w-[5.35rem] sm:max-w-[5.75rem]",
  skater: "max-w-[6.15rem] sm:max-w-[6.65rem]",
  goalie: "max-w-[7.85rem] sm:max-w-[8.75rem]",
};

const nameClass: Record<LineupJerseySize, string> = {
  compact: "text-[9px] sm:text-[10px]",
  skater: "text-[10px] sm:text-[11px]",
  goalie: "text-[11px] sm:text-[12px]",
};

const badgeClass: Record<LineupJerseySize, string> = {
  compact: "text-[7px] px-1 py-px",
  skater: "text-[7.5px] px-1.5 py-0.5",
  goalie: "text-[8px] px-1.5 py-0.5",
};

const crestClass: Record<LineupJerseySize, string> = {
  compact: "h-3 w-[0.65rem]",
  skater: "h-[1rem] w-[0.85rem]",
  goalie: "h-5 w-[1rem]",
};

const ovrClass: Record<LineupJerseySize, string> = {
  compact: "text-[1.1rem] sm:text-[1.2rem]",
  skater: "text-[1.25rem] sm:text-[1.4rem]",
  goalie: "text-[1.45rem] sm:text-[1.6rem]",
};

export interface LineupJerseyCardProps {
  player?: Player | null;
  positionLabel: string;
  size?: LineupJerseySize;
  isCaptain?: boolean;
  isAssistant?: boolean;
  isSelected?: boolean;
  className?: string;
  /** Export / plakát: bez SVG siluet, jen gradient (jako NHL „player bar“). */
  portraitStyle?: "silhouette" | "gradient";
  /** Bez animací a hoveru — pro statický PNG. */
  disableMotion?: boolean;
}

export function LineupJerseyCard({
  player,
  positionLabel,
  size = "skater",
  isCaptain = false,
  isAssistant = false,
  isSelected = false,
  className = "",
  portraitStyle = "silhouette",
  disableMotion = false,
}: LineupJerseyCardProps) {
  const empty = !player;
  const kind: "skater" | "goalie" =
    empty ? (size === "goalie" ? "goalie" : "skater") : player.position === "G" ? "goalie" : "skater";
  const showAssistant = isAssistant && !empty && !isCaptain;
  const w = widthClass[size];
  const numStr = !empty ? jerseyNumberForPlayer(player) : "";
  const nmCls = nameClass[size];
  const bgCls = badgeClass[size];
  const crestSz = crestClass[size];
  const ovrCls = ovrClass[size];

  const motionCls = disableMotion
    ? ""
    : "group/jersey transition-[transform,filter,box-shadow] duration-300 ease-out will-change-transform";
  const enterCls = !disableMotion && !empty ? "jersey-slot-enter-animate" : "";
  const hoverInner = disableMotion
    ? ""
    : "group-hover/jersey:scale-[1.03] group-hover/jersey:shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_16px_40px_rgba(0,0,0,0.6),0_0_28px_rgba(34,211,238,0.12)]";

  return (
    <div
      className={`
        jersey-slot-root relative mx-auto min-w-0 w-full ${w} ${motionCls} ${className}
        ${isSelected ? "jersey-slot-selected rounded-xl ring-2 ring-cyan-400/75 ring-offset-2 ring-offset-[#080d14]" : "rounded-xl"}
        ${enterCls}
      `}
    >
      {isCaptain && !empty && (
        <span
          className={`
            absolute z-30 flex items-center justify-center rounded-full bg-gradient-to-br from-[#c8102e] to-[#7a0a1c]
            font-display font-bold text-white shadow-[0_0_16px_rgba(200,16,46,0.75)] ring-2 ring-white/70
            ${size === "goalie" ? "-right-0.5 -top-1 h-7 w-7 text-xs" : "-right-0.5 -top-0.5 h-6 w-6 text-[11px]"}
          `}
          aria-label="Kapitán"
        >
          C
        </span>
      )}

      {showAssistant && (
        <span
          className={`
            absolute z-30 flex items-center justify-center rounded-full bg-gradient-to-br from-[#003087] to-[#001233]
            font-display font-bold text-white shadow-[0_0_16px_rgba(0,48,135,0.65)] ring-2 ring-white/45
            ${size === "goalie" ? "-left-0.5 -top-1 h-7 w-7 text-xs" : "-left-0.5 -top-0.5 h-6 w-6 text-[11px]"}
          `}
          aria-label="Asistent kapitána"
        >
          A
        </span>
      )}

      <div
        className={`
          relative overflow-hidden rounded-[10px] border border-white/[0.12]
          bg-[#060a12]
          shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_12px_32px_rgba(0,0,0,0.55)]
          ${disableMotion ? "" : "transition-[box-shadow,transform] duration-300 ease-out"}
          ${hoverInner}
        `}
      >
        <div
          className={`
            absolute left-1/2 top-1.5 z-20 -translate-x-1/2
            rounded border border-[#003087]/40 bg-[#0a0508]/95 font-display font-bold uppercase tracking-[0.18em] text-white/90
            shadow-[0_0_12px_rgba(0,0,0,0.85)]
            ${bgCls}
            before:absolute before:inset-y-0 before:left-0 before:w-[2px] before:rounded-l before:bg-[#c8102e]
            before:content-['']
          `}
        >
          {positionLabel}
        </div>

        {/* Horní „portrét“ — NHL inspirace */}
        <div
          className={`
            relative aspect-[4/5] w-full overflow-hidden
            bg-gradient-to-b from-[#1a3a62]/55 via-[#0c1524] to-[#12080c]/90
          `}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.14]"
            style={{
              backgroundImage:
                "linear-gradient(115deg, rgba(200,16,46,0.5) 0%, transparent 42%, transparent 58%, rgba(0,48,135,0.45) 100%)",
            }}
            aria-hidden
          />

          {!empty ? (
            <CzechHockeyCrest
              className={`
                pointer-events-none absolute right-1 top-8 z-[8]
                drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]
                ${crestSz}
              `}
            />
          ) : null}

          {numStr ? (
            <div
              className={`
                pointer-events-none absolute left-1 top-7 z-[9] font-display font-bold tabular-nums leading-none text-white
                drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]
                ${ovrCls}
              `}
            >
              {numStr}
            </div>
          ) : null}

          {portraitStyle === "silhouette" ? (
            <div className="absolute inset-x-0 bottom-0 top-9 flex items-end justify-center pb-0.5">
              {kind === "goalie" ? (
                <GoalieButterflySilhouette
                  muted={empty}
                  className={`h-[92%] w-full max-w-none px-0.5 ${empty ? "opacity-50" : ""}`}
                />
              ) : (
                <SkaterPortraitSilhouette
                  muted={empty}
                  className={`h-[94%] w-auto max-w-[min(100%,5.5rem)] ${empty ? "opacity-45" : ""}`}
                />
              )}
            </div>
          ) : (
            <div
              className="pointer-events-none absolute inset-x-2 bottom-2 top-9 rounded-lg bg-gradient-to-t from-black/55 via-[#0a1528]/25 to-transparent ring-1 ring-white/[0.06]"
              aria-hidden
            />
          )}

          {empty ? (
            <div
              className="pointer-events-none absolute inset-x-2 bottom-2 rounded-md border border-dashed border-white/20 bg-black/25 py-1 text-center"
              aria-hidden
            >
              <span className="font-display text-[10px] font-bold uppercase tracking-wider text-white/25">
                {positionLabel}
              </span>
            </div>
          ) : null}
        </div>

        {/* Spodní pás se jménem */}
        <div className="border-t border-white/[0.08] bg-gradient-to-b from-[#080c14] to-[#04060a] px-1 py-1.5">
          {!empty ? (
            <p
              className={`
                truncate text-center font-display font-bold uppercase leading-tight tracking-wide text-white/92
                ${nmCls}
              `}
              style={{ textShadow: "0 1px 3px rgba(0,0,0,0.95)" }}
            >
              {lastName(player.name)}
            </p>
          ) : (
            <p className={`text-center font-display font-semibold uppercase text-white/22 ${nmCls}`}>—</p>
          )}
        </div>
      </div>
    </div>
  );
}
