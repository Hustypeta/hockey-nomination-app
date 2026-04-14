"use client";

import type { Player } from "@/types";
import { jerseyNumberForPlayer } from "@/lib/jerseyNumber";
import { CZ_JERSEY_BACK_BLANK_SRC, CZ_JERSEY_CARD_IMG_BASE } from "@/lib/jerseyPhotoAsset";

export type Nhl25JerseySize = "compact" | "skater" | "goalie";

function lastName(name: string) {
  const parts = name.trim().split(/\s+/);
  return parts[parts.length - 1] || name;
}

const widthClass: Record<Nhl25JerseySize, string> = {
  compact: "max-w-[7.25rem] sm:max-w-[7.75rem]",
  skater: "max-w-[9.25rem] sm:max-w-[10rem] lg:max-w-[10.5rem]",
  goalie: "max-w-[11.25rem] sm:max-w-[12rem] lg:max-w-[12.5rem]",
};

const numberClass: Record<Nhl25JerseySize, string> = {
  compact: "jersey-back-number-text text-[1.55rem] sm:text-[1.7rem]",
  skater: "jersey-back-number-text text-[1.85rem] sm:text-[2.05rem] lg:text-[2.2rem]",
  goalie: "jersey-back-number-text text-[1.65rem] sm:text-[1.85rem] lg:text-[2rem]",
};

const nameClass: Record<Nhl25JerseySize, string> = {
  compact: "jersey-nameplate-text jersey-nameplate-text--compact max-w-[90%] text-center text-[10px] sm:text-[11px]",
  skater: "jersey-nameplate-text max-w-[90%] text-center text-[11px] sm:text-[12px] lg:text-[13px]",
  goalie: "jersey-nameplate-text max-w-[88%] text-center text-[10px] sm:text-[11px] lg:text-[12px]",
};

const badgeShadow = {
  textShadow: "0 1px 2px rgba(0,0,0,0.9), 0 2px 6px rgba(0,0,0,0.65)",
} as const;

/** Stejné vertikální zarovnání jako `PremiumJerseySlotCard` (fotopodklad zadní strany). */
const overlayTopClass: Record<Nhl25JerseySize, string> = {
  compact: "justify-start pt-[26%]",
  skater: "justify-start pt-[27%]",
  goalie: "justify-start pt-[25%]",
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

      <div className="nhl25-jersey-card-frame nhl25-jersey-card-frame--filled relative rounded-[11px] p-[6px]">
        <div
          className={`
            absolute left-2 top-2 z-20 rounded border border-[#11457e]/35 bg-[#11457e] px-1.5 py-0.5
            font-display text-[11px] font-bold tracking-wide text-white shadow-sm
            sm:text-[12px]
          `}
        >
          {positionLabel}
        </div>

        <div className="relative overflow-hidden rounded-[8px] bg-black shadow-inner">
          <div
            className={`relative aspect-[100/120] w-full bg-black ${empty ? "ring-1 ring-inset ring-white/12" : ""}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- stejný statický podklad jako v editoru */}
            <img
              src={CZ_JERSEY_BACK_BLANK_SRC}
              alt=""
              width={400}
              height={480}
              decoding="async"
              data-jersey-kind={kind}
              className={`
                ${CZ_JERSEY_CARD_IMG_BASE} drop-shadow-[0_8px_20px_rgba(0,0,0,0.45)]
                ${empty ? "opacity-[0.62] saturate-[0.88]" : ""}
              `}
            />

            {!empty ? (
              <div
                className={`pointer-events-none absolute inset-0 z-[15] flex flex-col items-center px-1 ${overlayTopClass[size]}`}
              >
                <span className={`leading-tight ${nmCls}`}>{lastName(player.name)}</span>
                {numStr ? <span className={`mt-0.5 ${numCls}`}>{numStr}</span> : null}
                {player.position === "F" && player.role ? (
                  <span
                    className={`mt-1 rounded border border-white/35 bg-black/35 px-1.5 py-0.5 font-display font-bold uppercase text-white/95 ${
                      size === "goalie" ? "text-[10px]" : "text-[9px]"
                    }`}
                    style={badgeShadow}
                  >
                    {player.role}
                  </span>
                ) : null}
                {player.position === "G" ? (
                  <span
                    className={`mt-1 font-display font-bold uppercase tracking-[0.14em] text-white/95 ${
                      size === "goalie" ? "text-[11px]" : "text-[10px]"
                    }`}
                    style={badgeShadow}
                  >
                    G
                  </span>
                ) : null}
              </div>
            ) : (
              <div
                className={`pointer-events-none absolute inset-0 z-[15] flex flex-col items-center px-1 ${overlayTopClass[size]}`}
                aria-hidden
              >
                <span className="max-w-[96%] text-center font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-white/35 sm:text-[12px]">
                  —
                </span>
                <span className="mt-0.5 select-none font-display text-[clamp(1.35rem,6vw,2.25rem)] font-bold tabular-nums leading-none text-white/25">
                  00
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
