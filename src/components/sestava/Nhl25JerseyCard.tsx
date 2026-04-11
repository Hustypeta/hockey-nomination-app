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
  compact: "text-[1.65rem] sm:text-[1.85rem]",
  skater: "text-[2rem] sm:text-[2.35rem]",
  goalie: "text-[2.35rem] sm:text-[2.65rem]",
};

const nameClass: Record<Nhl25JerseySize, string> = {
  compact: "text-[9px] sm:text-[10px]",
  skater: "text-[10px] sm:text-[11px]",
  goalie: "text-[11px] sm:text-[12px]",
};

const crestClass: Record<Nhl25JerseySize, string> = {
  compact: "h-3 w-[0.65rem]",
  skater: "h-[1.05rem] w-[0.88rem]",
  goalie: "h-8 w-[1.45rem]",
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
            absolute left-2 top-2 z-20 rounded border border-slate-300/90 bg-white px-1.5 py-0.5
            font-display text-[9px] font-bold tracking-wide text-slate-900 shadow-sm
            sm:text-[10px]
          `}
        >
          {positionLabel}
        </div>

        <div className="relative overflow-hidden rounded-[8px] bg-gradient-to-b from-white/80 to-slate-100/90 pt-[1.35rem] shadow-inner">
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
                  pointer-events-none absolute left-[9%] top-[calc(1.35rem+5%)] z-[8]
                  drop-shadow-[0_1px_3px_rgba(0,0,0,0.35)]
                  ${crestSz}
                `}
              />
              <div className="pointer-events-none absolute inset-0 top-[1.35rem] flex flex-col items-center justify-center px-0.5 pt-[4%]">
                {numStr ? (
                  <span
                    className={`
                      jersey-number-nhl leading-[0.88] font-display font-bold tabular-nums tracking-tight text-white
                      ${numCls}
                    `}
                  >
                    {numStr}
                  </span>
                ) : null}
                <span
                  className={`
                    max-w-[96%] truncate text-center font-display font-bold uppercase leading-tight text-white
                    drop-shadow-[0_2px_6px_rgba(0,0,0,0.85)]
                    ${numStr ? "mt-0.5" : ""}
                    ${nmCls}
                  `}
                >
                  {lastName(player.name)}
                </span>
                {player.position === "F" && player.role ? (
                  <span
                    className={`mt-0.5 rounded border border-white/35 bg-black/25 px-1 py-px font-display font-bold uppercase text-white/95 ${
                      size === "goalie" ? "text-[8px]" : "text-[7px]"
                    }`}
                  >
                    {player.role}
                  </span>
                ) : null}
                {player.position === "G" ? (
                  <span
                    className={`mt-0.5 font-display font-bold uppercase tracking-[0.14em] text-sky-100 ${
                      size === "goalie" ? "text-[9px]" : "text-[8px]"
                    }`}
                    style={{ textShadow: "0 1px 3px rgba(0,0,0,0.75)" }}
                  >
                    G
                  </span>
                ) : null}
              </div>
            </>
          ) : (
            <div
              className="pointer-events-none absolute inset-0 top-[1.35rem] flex items-center justify-center px-1"
              aria-hidden
            >
              <span className="select-none font-display text-[clamp(1.75rem,8vw,2.75rem)] font-black uppercase leading-none tracking-tighter text-slate-300/90">
                {positionLabel.replace(/\d/g, "").trim() || positionLabel}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
