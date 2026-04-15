"use client";

import type { Player } from "@/types";
import { jerseyNameplateNameProps, jerseyNumberStyle } from "@/lib/jerseyNameplate";
import { jerseyNumberForPlayer } from "@/lib/jerseyNumber";
import { CZ_JERSEY_BACK_BLANK_SRC, CZ_JERSEY_CARD_IMG_BASE } from "@/lib/jerseyPhotoAsset";

export type LineupJerseySize = "compact" | "skater" | "goalie";

function lastName(name: string) {
  const parts = name.trim().split(/\s+/);
  return parts[parts.length - 1] || name;
}

/** Jednotná šířka karty — hráči, brankáři i náhradníci. Jméno řeší `jerseyNameplateNameProps`. */
const LINEUP_CARD_UNIFIED = {
  width: "max-w-[7.1rem] sm:max-w-[7.1rem]",
  number: "jersey-back-number-text text-[1.55rem] sm:text-[1.75rem] max-w-[92%] text-center",
  overlayTop: "justify-start px-2 pt-[26%]",
} as const;

const widthClass: Record<LineupJerseySize, string> = {
  compact: LINEUP_CARD_UNIFIED.width,
  skater: LINEUP_CARD_UNIFIED.width,
  goalie: LINEUP_CARD_UNIFIED.width,
};

const numberClass: Record<LineupJerseySize, string> = {
  compact: LINEUP_CARD_UNIFIED.number,
  skater: LINEUP_CARD_UNIFIED.number,
  goalie: LINEUP_CARD_UNIFIED.number,
};

/** Stejné vertikální zarovnání jako `PremiumJerseySlotCard` / exportní `Nhl25JerseyCard`. */
const overlayTopClass: Record<LineupJerseySize, string> = {
  compact: LINEUP_CARD_UNIFIED.overlayTop,
  skater: LINEUP_CARD_UNIFIED.overlayTop,
  goalie: LINEUP_CARD_UNIFIED.overlayTop,
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
  const emptyUnfocused = empty && !isSelected;
  const kind: "skater" | "goalie" =
    empty ? (size === "goalie" ? "goalie" : "skater") : player.position === "G" ? "goalie" : "skater";
  const showAssistant = isAssistant && !empty && !isCaptain;
  const w = widthClass[size];
  const numStr = !empty ? jerseyNumberForPlayer(player) : "";
  const numCls = numberClass[size];
  const topOverlay = overlayTopClass[size];
  const ln = !empty ? lastName(player.name) : "";
  const namePlate = !empty ? jerseyNameplateNameProps(ln) : null;

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
            -right-0.5 -top-0.5 h-6 w-6 text-[11px]
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
            -left-0.5 -top-0.5 h-6 w-6 text-[11px]
          `}
          aria-label="Asistent kapitána"
        >
          A
        </span>
      )}

      <div
        className={`
          flex flex-col gap-1 rounded-[10px] border border-white/[0.12] bg-[#060a12] p-[5px]
          shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_12px_32px_rgba(0,0,0,0.55)]
          ${disableMotion ? "" : "transition-[box-shadow,transform] duration-300 ease-out"}
          ${hoverInner}
        `}
      >
        <div className="flex min-h-[1rem] shrink-0 items-center justify-center px-0.5">
          <span
            className={`
              relative rounded border border-[#003087]/40 bg-[#0a0508]/95 px-2 py-0.5 font-display text-[10px] font-bold
              uppercase tracking-[0.18em] text-white/90 shadow-[0_0_12px_rgba(0,0,0,0.85)]
              before:absolute before:inset-y-0 before:left-0 before:w-[2px] before:rounded-l before:bg-[#c8102e]
              before:content-['']
              ${emptyUnfocused ? "opacity-50" : ""}
            `}
          >
            {positionLabel}
          </span>
        </div>

        <div className="relative overflow-hidden rounded-[8px]">
          <div
            className={`relative aspect-[100/120] w-full bg-black ${empty ? "ring-1 ring-inset ring-white/10" : ""}`}
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
                ${CZ_JERSEY_CARD_IMG_BASE} drop-shadow-[0_6px_16px_rgba(0,0,0,0.65)]
                ${empty ? (emptyUnfocused ? "opacity-[0.38] saturate-[0.55] brightness-[0.9]" : "opacity-[0.74] saturate-[0.9]") : ""}
              `}
            />

            {!empty ? (
              <div
                className={`pointer-events-none absolute inset-0 z-[15] flex flex-col items-center ${topOverlay}`}
              >
                {namePlate ? (
                  <span className={namePlate.className} style={namePlate.style}>
                    {ln}
                  </span>
                ) : null}
                {numStr ? (
                  <span className={`mt-px ${numCls}`} style={jerseyNumberStyle(ln, "card")}>
                    {numStr}
                  </span>
                ) : null}
                {player.position === "F" && player.role ? (
                  <span
                    className="mt-1 rounded border border-white/25 bg-black/55 px-1.5 py-0.5 font-display text-[9px] font-bold uppercase tracking-wider text-white"
                  >
                    {player.role}
                  </span>
                ) : null}
                {player.position === "G" ? (
                  <span
                    className="mt-1 font-display text-[10px] font-bold uppercase tracking-[0.12em] text-sky-100"
                    style={{ textShadow: "0 1px 2px rgba(0,0,0,0.85)" }}
                  >
                    G
                  </span>
                ) : null}
              </div>
            ) : (
              <div
                className="pointer-events-none absolute inset-0 z-[15] flex flex-col items-center justify-center px-1 pt-[26%] pb-[22%]"
                aria-hidden
              >
                <span
                  className={`max-w-[95%] text-center font-display text-[clamp(0.95rem,4.5vw,1.55rem)] font-black uppercase leading-none tracking-[0.06em] drop-shadow-[0_2px_8px_rgba(0,0,0,0.75)] ${
                    emptyUnfocused ? "text-white/[0.22]" : "text-white/[0.48]"
                  }`}
                >
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
