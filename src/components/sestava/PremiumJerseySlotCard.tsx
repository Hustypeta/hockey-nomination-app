"use client";

import type { Player } from "@/types";
import { jerseyNameplateNameProps, jerseyNumberStyle } from "@/lib/jerseyNameplate";
import { jerseyNumberForPlayer } from "@/lib/jerseyNumber";
import { CZ_JERSEY_BACK_BLANK_SRC, CZ_JERSEY_CARD_IMG_BASE } from "@/lib/jerseyPhotoAsset";
import { JerseyCornerFlagCz } from "@/components/sestava/JerseyCornerFlagCz";

function lastName(name: string) {
  const parts = name.trim().split(/\s+/);
  return parts[parts.length - 1] || name;
}

export type PremiumJerseySize = "compact" | "skater" | "goalie";

/** Jedna šířka a typografie pro všechny sloty (útok, obrana, G, náhradníci). Rozdíl jen `kind` u obrázku. */
const PREMIUM_SLOT_UNIFIED = {
  root: "w-[92px] min-[380px]:w-[100px] sm:w-[112px] lg:w-[128px]",
  emptyName:
    "select-none font-jersey-print text-[9px] font-semibold uppercase leading-tight tracking-[0.18em] text-white/35 min-[380px]:text-[10px] sm:text-[12px]",
  emptyNum:
    "select-none font-jersey-print mt-1 text-[20px] font-bold leading-none tabular-nums text-white/25 min-[380px]:text-[22px] sm:text-[26px] lg:text-[30px]",
  capUnderNum:
    "mt-2 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#c8102e] to-[#8a0b20] font-display text-[10px] font-bold text-white shadow-md ring-2 ring-white sm:h-6 sm:w-6 sm:text-[11px]",
  asstUnderNum:
    "mt-2 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#003087] to-[#001a4d] font-display text-[9px] font-bold text-white shadow-md ring-2 ring-white/90 sm:h-6 sm:w-6 sm:text-[10px]",
  clear:
    "absolute right-1 top-1 z-40 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#c8102e] bg-transparent text-[#c8102e] transition-colors duration-200 hover:bg-[#c8102e] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f0f0f0] sm:right-2 sm:top-2 sm:h-6 sm:w-6",
} as const;

const SIZE_STYLES: Record<PremiumJerseySize, typeof PREMIUM_SLOT_UNIFIED> = {
  compact: PREMIUM_SLOT_UNIFIED,
  skater: PREMIUM_SLOT_UNIFIED,
  goalie: PREMIUM_SLOT_UNIFIED,
};

export interface PremiumJerseySlotCardProps {
  player?: Player | null;
  /** Štítek pozice (LW, C, G, …). */
  positionLabel: string;
  kind?: "skater" | "goalie";
  /** Velikost karty ve slotu (editor vs. kompaktní X / náhradníci). */
  size?: PremiumJerseySize;
  /** Prázdný slot zobrazí `positionLabel` uprostřed. */
  emptyPlaceholder?: string;
  isSelected?: boolean;
  /** Zvýraznění cílového slotu při DnD. */
  isDragOver?: boolean;
  isCaptain?: boolean;
  isAssistant?: boolean;
  onClear?: () => void;
  className?: string;
  /** Vypne hover animace (např. export PNG). */
  disableMotion?: boolean;
  /** NHL25 světlý panel — světlý led za dres místo tmavého `.squad-ice-fill`. */
  lightRinkSurface?: boolean;
}

/**
 * Prémiová „NHL 25“ karta slotu — prázdný PNG podklad + dynamické jméno a číslo.
 */
export function PremiumJerseySlotCard({
  player,
  positionLabel,
  kind = "skater",
  size = "skater",
  emptyPlaceholder,
  isSelected = false,
  isDragOver = false,
  isCaptain = false,
  isAssistant = false,
  onClear,
  className = "",
  disableMotion = false,
  lightRinkSurface = false,
}: PremiumJerseySlotCardProps) {
  const sz = SIZE_STYLES[size];
  const iceFill = lightRinkSurface ? "squad-ice-surface-light" : "squad-ice-fill";
  const showAssistant = isAssistant && !!player && !isCaptain;
  const empty = !player;
  /** Prázdný slot bez výběru — výrazně vybledlý oproti vybranému / obsazenému. */
  const emptyUnfocused = empty && !isSelected;
  const numStr = !empty ? jerseyNumberForPlayer(player) : "";
  const ln = !empty ? lastName(player.name) : "";
  const namePlate = !empty ? jerseyNameplateNameProps(ln, "premium") : null;
  const emptyCenterLabel = (emptyPlaceholder ?? positionLabel).trim() || "?";
  const showClear = !empty && typeof onClear === "function";

  const motion = disableMotion
    ? ""
    : "transition-[transform,box-shadow,filter] duration-[250ms] [transition-timing-function:cubic-bezier(0.4,0,0.2,1)] will-change-transform";

  const stateRing =
    isDragOver || isSelected
      ? isDragOver
        ? "shadow-[0_0_0_2px_rgba(212,175,55,0.95),0_0_28px_rgba(212,175,55,0.45),inset_0_0_20px_rgba(212,175,55,0.12)]"
        : "shadow-[0_0_0_2.5px_rgba(212,175,55,0.95),0_0_32px_rgba(212,175,55,0.42),inset_0_0_20px_rgba(212,175,55,0.14)]"
      : "";

  const hoverFx = disableMotion
    ? ""
    : lightRinkSurface
      ? "hover:scale-[1.03] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,100,130,0.18)]"
      : "hover:scale-[1.03] hover:-translate-y-0.5 hover:shadow-[0_0_16px_4px_rgba(200,16,46,0.45),0_12px_28px_rgba(0,0,0,0.38)]";

  return (
    <div
      className={`
        premium-jersey-slot-card relative mx-auto shrink-0 ${sz.root}
        ${motion} ${hoverFx} ${stateRing} ${className}
      `}
    >
      <div
        className={`
          ${iceFill} relative aspect-[100/120] w-full overflow-hidden rounded-[10px]
          ${
            empty
              ? emptyUnfocused
                ? lightRinkSurface
                  ? "ring-1 ring-inset ring-slate-300/50"
                  : "ring-1 ring-inset ring-white/[0.07]"
                : lightRinkSurface
                  ? "ring-1 ring-inset ring-cyan-400/45"
                  : "ring-1 ring-inset ring-white/18"
              : ""
          }
        `}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- lokální statický podklad */}
        <img
          src={CZ_JERSEY_BACK_BLANK_SRC}
          alt=""
          width={400}
          height={480}
          decoding="async"
          data-jersey-kind={kind}
          className={`
            ${CZ_JERSEY_CARD_IMG_BASE} ${lightRinkSurface ? "drop-shadow-[0_4px_14px_rgba(15,60,80,0.2)]" : "drop-shadow-[0_6px_18px_rgba(0,0,0,0.42)]"}
            ${empty ? (emptyUnfocused ? "opacity-[0.36] saturate-[0.52] brightness-[0.88]" : "opacity-[0.78] saturate-[0.95]") : ""}
          `}
        />

        <div
          className={`absolute bottom-2 left-2 z-20 max-w-[calc(100%-2.5rem)] sm:bottom-2.5 sm:left-2.5 ${emptyUnfocused ? "opacity-50 saturate-[0.55]" : ""}`}
        >
          <span
            className={`
              inline-flex rounded-md px-2.5 py-1 font-display text-[10px] font-bold uppercase tracking-[0.12em] min-[380px]:text-[11px] sm:px-3 sm:py-1.5 sm:text-xs
              ${
                lightRinkSurface
                  ? "border border-cyan-800/25 bg-white/95 text-slate-800 shadow-[0_2px_8px_rgba(15,60,80,0.12)]"
                  : "border border-[#003087]/50 bg-[#0a0508]/95 text-white/95 shadow-[0_2px_10px_rgba(0,0,0,0.65)]"
              }
            `}
          >
            {positionLabel}
          </span>
        </div>

        {!empty ? <JerseyCornerFlagCz /> : null}

        {showClear ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClear?.();
            }}
            className={sz.clear}
            aria-label="Odebrat hráče ze slotu"
          >
            <span className="relative block h-3 w-3" aria-hidden>
              <span className="absolute left-1/2 top-1/2 block h-0.5 w-[14px] -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-full bg-current" />
              <span className="absolute left-1/2 top-1/2 block h-0.5 w-[14px] -translate-x-1/2 -translate-y-1/2 -rotate-45 rounded-full bg-current" />
            </span>
          </button>
        ) : null}

        <div
          className={`
            pointer-events-none absolute inset-0 z-[15] flex flex-col items-center px-1
            ${empty ? "justify-center pt-[22%] pb-[22%]" : "justify-start px-1 pb-[18%] pt-[31%] sm:pb-[16%] sm:pt-[32%]"}
          `}
        >
          {!empty ? (
            <>
              {namePlate && namePlate.lines.length > 0 ? (
                <div className="flex w-full max-w-full flex-col items-center gap-y-px">
                  {namePlate.lines.map((line, idx) => (
                    <span
                      key={idx}
                      className={`${namePlate.className}${lightRinkSurface ? " jersey-nameplate-text--on-light-ice" : ""}`}
                      style={namePlate.style}
                    >
                      {line}
                    </span>
                  ))}
                </div>
              ) : null}
              {numStr ? (
                <span
                  className={`mt-2 max-w-[92%] text-center text-[17px] min-[380px]:text-[19px] sm:text-[22px] lg:text-[24px] xl:text-[26px] jersey-back-number-text ${lightRinkSurface ? "jersey-back-number-text--on-light-ice" : "jersey-back-number-text--woven"}`}
                  style={jerseyNumberStyle(ln, "premium")}
                >
                  {numStr}
                </span>
              ) : null}
              {isCaptain ? (
                <span className={sz.capUnderNum} aria-label="Kapitán">
                  C
                </span>
              ) : null}
              {showAssistant ? (
                <span className={sz.asstUnderNum} aria-label="Asistent kapitána">
                  A
                </span>
              ) : null}
            </>
          ) : (
            <span
              className={`max-w-[96%] text-center font-display text-[clamp(0.95rem,4.8vw,1.5rem)] font-black uppercase leading-none tracking-[0.06em] ${
                lightRinkSurface
                  ? emptyUnfocused
                    ? "text-slate-400/80 drop-shadow-none"
                    : "text-slate-600 drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]"
                  : emptyUnfocused
                    ? "text-white/[0.2] drop-shadow-[0_2px_8px_rgba(0,0,0,0.75)]"
                    : "text-white/[0.52] drop-shadow-[0_2px_8px_rgba(0,0,0,0.75)]"
              }`}
              aria-hidden
            >
              {emptyCenterLabel}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
