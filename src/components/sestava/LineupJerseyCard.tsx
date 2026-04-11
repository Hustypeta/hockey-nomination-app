"use client";

import type { Player } from "@/types";
import { CzechHockeyCrest } from "@/components/CzechHockeyCrest";
import { JerseySilhouetteShape } from "@/components/JerseySilhouetteShape";
import { jerseyNumberForPlayer } from "@/lib/jerseyNumber";

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
  goalie: "h-7 w-[1.35rem]",
};

const numberClass: Record<LineupJerseySize, string> = {
  compact: "text-[1.35rem] sm:text-[1.5rem]",
  skater: "text-[1.55rem] sm:text-[1.75rem]",
  goalie: "text-[1.85rem] sm:text-[2.05rem]",
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
  const crestSz = crestClass[size];
  const numCls = numberClass[size];

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
        <div
          className={`
            absolute left-1/2 top-1 z-20 -translate-x-1/2
            rounded border border-[#003087]/40 bg-[#0a0508]/95 font-display font-bold uppercase tracking-[0.18em] text-white/90
            shadow-[0_0_12px_rgba(0,0,0,0.85)]
            ${bgCls}
            before:absolute before:inset-y-0 before:left-0 before:w-[2px] before:rounded-l before:bg-[#c8102e]
            before:content-['']
          `}
        >
          {positionLabel}
        </div>

        <div className="relative overflow-hidden rounded-[8px] pt-[1.05rem]">
          <JerseySilhouetteShape
            kind={kind}
            empty={empty}
            visualPreset="lineup"
            className="relative z-0 block h-auto w-full drop-shadow-[0_6px_16px_rgba(0,0,0,0.65)]"
          />

          {!empty ? (
            <>
              <CzechHockeyCrest
                className={`
                  pointer-events-none absolute left-[10%] top-[calc(1.05rem+6%)] z-[8]
                  drop-shadow-[0_1px_4px_rgba(0,0,0,0.9),0_0_8px_rgba(0,0,0,0.45)]
                  ${crestSz}
                `}
              />
              <div className="pointer-events-none absolute inset-0 top-[1.05rem] flex flex-col items-center justify-center px-0.5 pt-[5%]">
                {numStr ? (
                  <span
                    className={`
                      jersey-number leading-[0.92] font-display font-bold tabular-nums tracking-tight text-white
                      drop-shadow-[0_2px_8px_rgba(0,0,0,0.95),0_0_20px_rgba(255,255,255,0.06)]
                      ${numCls}
                    `}
                  >
                    {numStr}
                  </span>
                ) : null}
                <span
                  className={`
                    max-w-[94%] truncate text-center font-display font-semibold uppercase leading-tight text-white/95
                    ${numStr ? "mt-0.5" : ""}
                    ${nmCls}
                  `}
                  style={{ textShadow: "0 1px 4px rgba(0,0,0,0.95)" }}
                >
                  {lastName(player.name)}
                </span>
                {player.position === "F" && player.role ? (
                  <span
                    className={`mt-0.5 rounded border border-white/15 bg-black/45 px-1 py-px font-display font-bold uppercase tracking-wider text-white/95 ${
                      size === "goalie" ? "text-[8px]" : "text-[7px]"
                    }`}
                  >
                    {player.role}
                  </span>
                ) : null}
                {player.position === "G" ? (
                  <span
                    className={`mt-0.5 font-display font-bold uppercase tracking-[0.12em] text-sky-200/95 ${
                      size === "goalie" ? "text-[9px]" : "text-[8px]"
                    }`}
                    style={{ textShadow: "0 1px 2px rgba(0,0,0,0.85)" }}
                  >
                    G
                  </span>
                ) : null}
              </div>
            </>
          ) : (
            <div
              className="pointer-events-none absolute inset-0 top-[1.05rem] flex items-center justify-center px-1 pt-[6%]"
              aria-hidden
            >
              <span className="font-display text-[clamp(1.1rem,4vw,1.65rem)] font-bold leading-none tracking-tight text-white/[0.12]">
                {positionLabel}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
