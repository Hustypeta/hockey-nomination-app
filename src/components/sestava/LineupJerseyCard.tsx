"use client";

import type { Player } from "@/types";
import { jerseyNumberForPlayer } from "@/lib/jerseyNumber";
import { CZ_JERSEY_BACK_BLANK_SRC } from "@/lib/jerseyPhotoAsset";

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
  compact: "text-[11px] sm:text-[12px]",
  skater: "text-[12px] sm:text-[13px]",
  goalie: "text-[13px] sm:text-[14px]",
};

const badgeClass: Record<LineupJerseySize, string> = {
  compact: "text-[9px] px-1.5 py-0.5",
  skater: "text-[10px] px-2 py-0.5",
  goalie: "text-[11px] px-2 py-0.5",
};

const numberClass: Record<LineupJerseySize, string> = {
  compact: "text-[1.55rem] sm:text-[1.7rem]",
  skater: "text-[1.75rem] sm:text-[1.95rem]",
  goalie: "text-[2rem] sm:text-[2.2rem]",
};

/** Stejné vertikální zarovnání jako `PremiumJerseySlotCard` / exportní `Nhl25JerseyCard`. */
const overlayTopClass: Record<LineupJerseySize, string> = {
  compact: "justify-start pt-[30%]",
  skater: "justify-start pt-[31%]",
  goalie: "justify-start pt-[29%]",
};

export interface LineupJerseyCardProps {
  player?: Player | null;
  positionLabel: string;
  size?: LineupJerseySize;
  isCaptain?: boolean;
  isAssistant?: boolean;
  isSelected?: boolean;
  className?: string;
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
  const numCls = numberClass[size];
  const topOverlay = overlayTopClass[size];

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
          relative rounded-[10px] border border-white/[0.12] bg-[#060a12] p-[5px]
          shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_12px_32px_rgba(0,0,0,0.55)]
          ${disableMotion ? "" : "transition-[box-shadow,transform] duration-300 ease-out"}
          ${hoverInner}
        `}
      >
        <div className="relative overflow-hidden rounded-[8px]">
          <div className="relative aspect-[100/120] w-full">
            {/* eslint-disable-next-line @next/next/no-img-element -- stejný statický podklad jako v editoru */}
            <img
              src={CZ_JERSEY_BACK_BLANK_SRC}
              alt=""
              width={400}
              height={480}
              decoding="async"
              data-jersey-kind={kind}
              className={`
                absolute inset-0 h-full w-full object-contain object-top drop-shadow-[0_6px_16px_rgba(0,0,0,0.65)]
                ${empty ? "opacity-[0.45] grayscale" : ""}
              `}
            />

            <div
              className={`
                absolute left-1/2 top-[4%] z-20 -translate-x-1/2
                rounded border border-[#003087]/40 bg-[#0a0508]/95 font-display font-bold uppercase tracking-[0.18em] text-white/90
                shadow-[0_0_12px_rgba(0,0,0,0.85)]
                ${bgCls}
                before:absolute before:inset-y-0 before:left-0 before:w-[2px] before:rounded-l before:bg-[#c8102e]
                before:content-['']
              `}
            >
              {positionLabel}
            </div>

            {!empty ? (
              <div
                className={`pointer-events-none absolute inset-0 z-[15] flex flex-col items-center px-1 ${topOverlay}`}
              >
                <span
                  className={`
                    max-w-[94%] truncate text-center font-display font-semibold uppercase leading-tight text-white/95
                    ${nmCls}
                  `}
                  style={{ textShadow: "0 1px 4px rgba(0,0,0,0.95)" }}
                >
                  {lastName(player.name)}
                </span>
                {numStr ? (
                  <span
                    className={`
                      jersey-number mt-0.5 leading-[0.92] font-display font-bold tabular-nums tracking-tight text-white
                      drop-shadow-[0_2px_8px_rgba(0,0,0,0.95),0_0_20px_rgba(255,255,255,0.06)]
                      ${numCls}
                    `}
                  >
                    {numStr}
                  </span>
                ) : null}
                {player.position === "F" && player.role ? (
                  <span
                    className={`mt-1 rounded border border-white/25 bg-black/55 px-1.5 py-0.5 font-display font-bold uppercase tracking-wider text-white ${
                      size === "goalie" ? "text-[10px]" : "text-[9px]"
                    }`}
                  >
                    {player.role}
                  </span>
                ) : null}
                {player.position === "G" ? (
                  <span
                    className={`mt-1 font-display font-bold uppercase tracking-[0.12em] text-sky-100 ${
                      size === "goalie" ? "text-[11px]" : "text-[10px]"
                    }`}
                    style={{ textShadow: "0 1px 2px rgba(0,0,0,0.85)" }}
                  >
                    G
                  </span>
                ) : null}
              </div>
            ) : (
              <div
                className="pointer-events-none absolute inset-0 z-[15] flex items-center justify-center px-1 pt-[21%]"
                aria-hidden
              >
                <span className="font-display text-[clamp(1.25rem,4.5vw,1.85rem)] font-bold leading-none tracking-tight text-white/25">
                  {positionLabel}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
