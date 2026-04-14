"use client";

import type { Player } from "@/types";
import { jerseyNumberForPlayer } from "@/lib/jerseyNumber";
import { CZ_JERSEY_BACK_BLANK_SRC, CZ_JERSEY_CARD_IMG_BASE } from "@/lib/jerseyPhotoAsset";

export type Nhl25JerseySize = "compact" | "skater" | "goalie";

function lastName(name: string) {
  const parts = name.trim().split(/\s+/);
  return parts[parts.length - 1] || name;
}

function nhlNameplateExtra(last: string): string {
  const n = last.length;
  if (n <= 8) return "max-w-[90%]";
  if (n <= 11) return "max-w-[92%] !text-[10px] sm:!text-[11px] lg:!text-[12px] !leading-tight";
  return "max-w-[94%] !text-[9px] sm:!text-[10px] lg:!text-[11px] !leading-tight line-clamp-2";
}

/** Jednotná velikost karty — útok, obrana, G, náhradníci (export / share). */
const NHL25_CARD_UNIFIED = {
  width: "max-w-[8rem] sm:max-w-[8.5rem] lg:max-w-[9rem]",
  number: "jersey-back-number-text text-[1.6rem] sm:text-[1.8rem] lg:text-[1.95rem]",
  name: "jersey-nameplate-text max-w-[90%] text-center text-[11px] sm:text-[12px] lg:text-[13px]",
} as const;

const widthClass: Record<Nhl25JerseySize, string> = {
  compact: NHL25_CARD_UNIFIED.width,
  skater: NHL25_CARD_UNIFIED.width,
  goalie: NHL25_CARD_UNIFIED.width,
};

const numberClass: Record<Nhl25JerseySize, string> = {
  compact: NHL25_CARD_UNIFIED.number,
  skater: NHL25_CARD_UNIFIED.number,
  goalie: NHL25_CARD_UNIFIED.number,
};

const nameClass: Record<Nhl25JerseySize, string> = {
  compact: NHL25_CARD_UNIFIED.name,
  skater: NHL25_CARD_UNIFIED.name,
  goalie: NHL25_CARD_UNIFIED.name,
};

/** Stejné vertikální zarovnání jako `PremiumJerseySlotCard` (fotopodklad zadní strany). */
const overlayTopClass: Record<Nhl25JerseySize, string> = {
  compact: "justify-start pt-[31%]",
  skater: "justify-start pt-[31%]",
  goalie: "justify-start pt-[31%]",
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
            h-6 w-6 text-[11px]
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
            h-5 w-5 text-[9px]
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
                <span className={`text-center leading-tight ${nhlNameplateExtra(lastName(player.name))} ${nmCls}`}>
                  {lastName(player.name)}
                </span>
                {numStr ? <span className={`mt-px ${numCls}`}>{numStr}</span> : null}
              </div>
            ) : (
              <div
                className="pointer-events-none absolute inset-0 z-[15] flex flex-col items-center justify-center px-1 pt-[24%] pb-[22%]"
                aria-hidden
              >
                <span className="max-w-[95%] text-center font-display text-[clamp(0.95rem,5vw,1.65rem)] font-black uppercase leading-none tracking-[0.06em] text-white/[0.38] drop-shadow-[0_2px_8px_rgba(0,0,0,0.75)]">
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
