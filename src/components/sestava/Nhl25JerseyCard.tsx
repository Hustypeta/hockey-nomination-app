"use client";

import type { Player } from "@/types";
import { CzechHockeyCrest } from "@/components/CzechHockeyCrest";
import { JerseySilhouetteShape } from "@/components/JerseySilhouetteShape";
import { jerseyNumberForPlayer } from "@/lib/jerseyNumber";

export type Nhl25JerseySize = "compact" | "skater" | "goalie";

function lastName(name: string) {
  const parts = name.trim().split(/\s+/);
  return parts[parts.length - 1] || name;
}

const widthClass: Record<Nhl25JerseySize, string> = {
  compact: "max-w-[6rem] sm:max-w-[6.35rem]",
  skater: "max-w-[7.35rem] sm:max-w-[8rem]",
  goalie: "max-w-[9.25rem] sm:max-w-[10rem]",
};

const numberClass: Record<Nhl25JerseySize, string> = {
  compact: "text-[1.85rem] sm:text-[2rem]",
  skater: "text-[2.15rem] sm:text-[2.45rem]",
  goalie: "text-[2.5rem] sm:text-[2.8rem]",
};

const nameClass: Record<Nhl25JerseySize, string> = {
  compact: "text-[11px] sm:text-[12px]",
  skater: "text-[12px] sm:text-[13px]",
  goalie: "text-[13px] sm:text-[14px]",
};

const crestClass: Record<Nhl25JerseySize, string> = {
  compact: "h-7 w-[1.85rem]",
  skater: "h-9 w-[2.35rem]",
  goalie: "h-11 w-[2.85rem]",
};

export interface Nhl25JerseyCardProps {
  player?: Player | null;
  positionLabel: string;
  size?: Nhl25JerseySize;
  isCaptain?: boolean;
  isAssistant?: boolean;
  isSelected?: boolean;
  className?: string;
  disableMotion?: boolean;
}

export function Nhl25JerseyCard({
  player,
  positionLabel,
  size = "skater",
  isCaptain = false,
  isAssistant = false,
  isSelected = false,
  className = "",
  disableMotion = false,
}: Nhl25JerseyCardProps) {
  const empty = !player;
  const kind: "skater" | "goalie" =
    empty ? (size === "goalie" ? "goalie" : "skater") : player.position === "G" ? "goalie" : "skater";
  const showAssistant = isAssistant && !empty && !isCaptain;
  const w = widthClass[size];
  const numStr = !empty ? jerseyNumberForPlayer(player) : "";
  const numCls = numberClass[size];
  const nmCls = nameClass[size];
  const crestSz = crestClass[size];

  const motionCls = disableMotion
    ? ""
    : "transition-[transform,box-shadow] duration-300 ease-out will-change-transform hover:-translate-y-0.5";

  return (
    <div
      className={`
        nhl25-jersey-card-root relative mx-auto min-w-0 w-full ${w} ${motionCls} ${className}
        ${
          isSelected
            ? "rounded-xl ring-2 ring-cyan-500 ring-offset-2 ring-offset-slate-100"
            : "rounded-xl"
        }
      `}
    >
      {isCaptain && !empty && (
        <span
          className={`
            absolute -right-0.5 -top-1 z-30 flex items-center justify-center rounded-full
            bg-gradient-to-br from-[#c8102e] to-[#8a0b20] font-display text-xs font-bold text-white
            shadow-md ring-2 ring-white
            ${size === "goalie" ? "h-7 w-7" : "h-6 w-6 text-[11px]"}
          `}
          aria-label="Kapitán"
        >
          C
        </span>
      )}

      {showAssistant && (
        <span
          className={`
            absolute -bottom-0.5 -left-0.5 z-30 flex items-center justify-center rounded-full
            bg-gradient-to-br from-[#003087] to-[#001a4d] font-display text-[10px] font-bold text-white
            shadow-md ring-2 ring-white/90
            ${size === "goalie" ? "h-6 w-6" : "h-5 w-5 text-[9px]"}
          `}
          aria-label="Asistent kapitána"
        >
          A
        </span>
      )}

      <div
        className={`
          nhl25-jersey-card-frame relative rounded-[11px] p-[6px]
          ${empty ? "nhl25-jersey-card-frame--empty" : "nhl25-jersey-card-frame--filled"}
        `}
      >
        <div
          className={`
            absolute left-2 top-2 z-20 rounded border border-[#11457e]/35 bg-[#11457e] px-1.5 py-0.5
            font-display text-[11px] font-bold tracking-wide text-white shadow-sm
            sm:text-[12px]
          `}
        >
          {positionLabel}
        </div>

        <div className="relative overflow-hidden rounded-[8px] bg-gradient-to-b from-white via-[#fafafa] to-[#f0f2f4] pt-[1.45rem] shadow-inner">
          <JerseySilhouetteShape
            kind={kind}
            empty={empty}
            visualPreset="nhl25"
            className="relative z-0 block h-auto w-full drop-shadow-[0_8px_20px_rgba(15,23,42,0.18)]"
          />

          {!empty ? (
            <>
              <CzechHockeyCrest
                className={`
                  pointer-events-none absolute left-1/2 top-[calc(1.45rem+4%)] z-[8] -translate-x-1/2
                  drop-shadow-[0_1px_4px_rgba(0,0,0,0.2)]
                  ${crestSz}
                `}
              />
              <div className="pointer-events-none absolute inset-0 top-[1.45rem] flex flex-col items-center justify-end px-1 pb-[10%] pt-[28%]">
                {numStr ? (
                  <span
                    className={`
                      jersey-number-nhl leading-[0.88] font-display font-bold tabular-nums tracking-tight text-[#11457e]
                      ${numCls}
                    `}
                  >
                    {numStr}
                  </span>
                ) : null}
                <span
                  className={`
                    max-w-[96%] truncate text-center font-display font-bold uppercase leading-tight text-[#0f172a]
                    ${numStr ? "mt-0.5" : ""}
                    ${nmCls}
                  `}
                >
                  {lastName(player.name)}
                </span>
                {player.position === "F" && player.role ? (
                  <span
                    className={`mt-1 rounded border border-[#11457e]/50 bg-white px-1.5 py-0.5 font-display font-bold uppercase text-[#0f172a] ${
                      size === "goalie" ? "text-[10px]" : "text-[9px]"
                    }`}
                  >
                    {player.role}
                  </span>
                ) : null}
                {player.position === "G" ? (
                  <span
                    className={`mt-1 font-display font-bold uppercase tracking-[0.14em] text-[#0f172a] ${
                      size === "goalie" ? "text-[11px]" : "text-[10px]"
                    }`}
                  >
                    G
                  </span>
                ) : null}
              </div>
            </>
          ) : (
            <div
              className="pointer-events-none absolute inset-0 top-[1.45rem] flex items-center justify-center px-1"
              aria-hidden
            >
              <span className="select-none font-display text-[clamp(1.75rem,8vw,2.75rem)] font-black uppercase leading-none tracking-tighter text-[#11457e]/25">
                {positionLabel.replace(/\d/g, "").trim() || positionLabel}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
