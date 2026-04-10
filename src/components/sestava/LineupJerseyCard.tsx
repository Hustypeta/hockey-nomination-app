"use client";

import type { Player } from "@/types";
import { CzechHockeyCrest } from "@/components/CzechHockeyCrest";
import { JerseySilhouetteShape } from "@/components/JerseySilhouetteShape";
import { jerseyNumberForPlayer, pseudoJerseyNumberFromId } from "@/lib/jerseyNumber";

export type LineupJerseySize = "compact" | "skater" | "goalie";

function lastName(name: string) {
  const parts = name.trim().split(/\s+/);
  return parts[parts.length - 1] || name;
}

/** @deprecated použij `jerseyNumberForPlayer` nebo `pseudoJerseyNumberFromId` z `@/lib/jerseyNumber` */
export const jerseyDisplayNumber = pseudoJerseyNumberFromId;

const widthClass: Record<LineupJerseySize, string> = {
  compact: "max-w-[4.85rem] sm:max-w-[5.25rem]",
  skater: "max-w-[5.65rem] sm:max-w-[6.1rem]",
  goalie: "max-w-[7.25rem] sm:max-w-[8.15rem]",
};

const numberClass: Record<LineupJerseySize, string> = {
  compact: "text-[1.65rem] sm:text-[1.85rem]",
  skater: "text-[1.95rem] sm:text-[2.15rem]",
  goalie: "text-[2.35rem] sm:text-[2.65rem]",
};

const nameClass: Record<LineupJerseySize, string> = {
  compact: "text-[11px] sm:text-[13px]",
  skater: "text-[12px] sm:text-[14px]",
  goalie: "text-[13px] sm:text-[15px]",
};

const badgeClass: Record<LineupJerseySize, string> = {
  compact: "text-[8px] px-1 py-px",
  skater: "text-[8.5px] px-1.5 py-0.5",
  goalie: "text-[9px] px-2 py-0.5",
};

/** Erb na hrudi jako u oficiálních fan dresů (ČSLH / Nike IIHF). */
const crestClass: Record<LineupJerseySize, string> = {
  compact: "h-3 w-[0.65rem]",
  skater: "h-[1.1rem] w-[0.92rem]",
  goalie: "h-7 w-[1.35rem]",
};

export interface LineupJerseyCardProps {
  player?: Player | null;
  positionLabel: string;
  size?: LineupJerseySize;
  isCaptain?: boolean;
  isAssistant?: boolean;
  isSelected?: boolean;
  className?: string;
}

export function LineupJerseyCard({
  player,
  positionLabel,
  size = "skater",
  isCaptain = false,
  isAssistant = false,
  isSelected = false,
  className = "",
}: LineupJerseyCardProps) {
  const empty = !player;
  const kind: "skater" | "goalie" =
    empty ? (size === "goalie" ? "goalie" : "skater") : player.position === "G" ? "goalie" : "skater";
  const showAssistant = isAssistant && !empty && !isCaptain;
  const w = widthClass[size];
  const numStr = !empty ? jerseyNumberForPlayer(player) : "";
  const numCls = numberClass[size];
  const nmCls = nameClass[size];
  const bgCls = badgeClass[size];

  return (
    <div
      className={`
        jersey-slot-root group/jersey relative mx-auto min-w-0 w-full ${w} ${className}
        transition-[transform,filter] duration-300 ease-out
        will-change-transform
        ${isSelected ? "jersey-slot-selected" : ""}
        ${!empty ? "jersey-slot-enter-animate" : ""}
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
          relative rounded-[2px] p-[5px]
          shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_14px_36px_rgba(0,0,0,0.55)]
          transition-[box-shadow,transform] duration-300 ease-out
          group-hover/jersey:scale-[1.045]
          group-hover/jersey:shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_18px_44px_rgba(0,0,0,0.6),0_0_32px_rgba(200,16,46,0.32),0_0_44px_rgba(0,48,135,0.2)]
        `}
      >
        <div
          className={`
            pointer-events-none absolute left-1/2 top-1 z-20 -translate-x-1/2
            rounded border border-[#003087]/35 bg-[#0a0508]/95 font-display font-bold uppercase tracking-[0.2em] text-white/90
            shadow-[0_0_12px_rgba(0,0,0,0.85)]
            ${bgCls}
            before:absolute before:inset-y-0 before:left-0 before:w-[2px] before:rounded-l before:bg-[#c8102e]
            before:content-['']
          `}
        >
          {positionLabel}
        </div>

        <div className="relative overflow-visible pt-[1.1rem]">
          {!empty ? (
            <CzechHockeyCrest
              className={`
                pointer-events-none absolute left-[10%] top-[calc(1.1rem+5%)] z-[8]
                drop-shadow-[0_1px_4px_rgba(0,0,0,0.9),0_0_8px_rgba(0,0,0,0.45)]
                ${crestClass[size]}
              `}
            />
          ) : null}
          <JerseySilhouetteShape
            kind={kind}
            empty={empty}
            visualPreset="lineup"
            className="relative z-0 block h-auto w-full drop-shadow-[0_6px_16px_rgba(0,0,0,0.65)]"
          />

          {empty ? (
            <div
              className="pointer-events-none absolute inset-0 top-[1.1rem] flex items-center justify-center px-1 pt-[8%]"
              aria-hidden
            >
              <span className="font-display text-[clamp(1.75rem,5.5vw,2.85rem)] font-bold leading-none tracking-tight text-white/[0.1] transition-colors duration-300 group-hover/jersey:text-[#c8102e]/22">
                {positionLabel}
              </span>
            </div>
          ) : (
            <div className="pointer-events-none absolute inset-0 top-[1.1rem] flex flex-col items-center justify-center px-0.5 pt-[6%]">
              {numStr ? (
                <span
                  className={`
                    jersey-number leading-[0.92] font-display font-bold tabular-nums tracking-tight text-white
                    drop-shadow-[0_2px_8px_rgba(0,0,0,0.95),0_0_20px_rgba(255,255,255,0.06)]
                    transition-all duration-300 group-hover/jersey:scale-105 group-hover/jersey:text-white
                    group-hover/jersey:drop-shadow-[0_0_16px_rgba(200,16,46,0.45),0_2px_6px_rgba(0,0,0,0.9)]
                    ${numCls}
                  `}
                >
                  {numStr}
                </span>
              ) : null}
              <span
                className={`
                  max-w-[94%] truncate text-center font-display font-semibold uppercase leading-tight text-white/90
                  transition-all duration-300 group-hover/jersey:text-white group-hover/jersey:drop-shadow-[0_0_8px_rgba(255,255,255,0.25)]
                  ${numStr ? "mt-1" : ""}
                  ${nmCls}
                `}
                style={{ textShadow: "0 1px 4px rgba(0,0,0,0.95)" }}
              >
                {lastName(player.name)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
