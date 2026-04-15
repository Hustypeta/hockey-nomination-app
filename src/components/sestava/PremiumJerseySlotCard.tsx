"use client";

import type { Player } from "@/types";
import { jerseyNameplateNameProps, jerseyNumberStyle } from "@/lib/jerseyNameplate";
import { jerseyNumberForPlayer } from "@/lib/jerseyNumber";
import { CZ_JERSEY_BACK_BLANK_SRC, CZ_JERSEY_CARD_IMG_BASE } from "@/lib/jerseyPhotoAsset";

function lastName(name: string) {
  const parts = name.trim().split(/\s+/);
  return parts[parts.length - 1] || name;
}

export type PremiumJerseySize = "compact" | "skater" | "goalie";

/** Jedna šířka a typografie pro všechny sloty (útok, obrana, G, náhradníci). Rozdíl jen `kind` u obrázku. */
const PREMIUM_SLOT_UNIFIED = {
  root: "w-[128px]",
  num: "jersey-back-number-text mt-px max-w-[92%] text-center text-[32px] sm:text-[36px]",
  emptyName:
    "select-none font-jersey-print text-[11px] font-semibold uppercase leading-tight tracking-[0.18em] text-white/35 sm:text-[12px]",
  emptyNum:
    "select-none font-jersey-print mt-1 text-[26px] font-bold leading-none tabular-nums text-white/25 sm:text-[30px]",
  cap: "absolute right-10 top-1.5 z-30 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-[#c8102e] to-[#8a0b20] font-display text-[10px] font-bold text-white shadow-md ring-2 ring-white",
  asst: "absolute bottom-2 left-2 z-30 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-[#003087] to-[#001a4d] font-display text-[9px] font-bold text-white shadow-md ring-2 ring-white/90",
  clear:
    "absolute right-2 top-2 z-40 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#c8102e] bg-transparent text-[#c8102e] transition-colors duration-200 hover:bg-[#c8102e] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f0f0f0]",
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
}: PremiumJerseySlotCardProps) {
  const sz = SIZE_STYLES[size];
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
          relative aspect-[100/120] w-full overflow-hidden rounded-[10px] bg-black
          ${
            empty
              ? emptyUnfocused
                ? "ring-1 ring-inset ring-white/[0.07]"
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
            ${CZ_JERSEY_CARD_IMG_BASE} drop-shadow-[0_10px_28px_rgba(0,0,0,0.55)]
            ${empty ? (emptyUnfocused ? "opacity-[0.36] saturate-[0.52] brightness-[0.88]" : "opacity-[0.78] saturate-[0.95]") : ""}
          `}
        />

        <div
          className={`absolute left-1/2 top-[2.5%] z-20 -translate-x-1/2 ${emptyUnfocused ? "opacity-50 saturate-[0.55]" : ""}`}
        >
          <span
            className={`
              rounded border border-[#003087]/40 bg-[#0a0508]/95 px-2 py-0.5 font-display text-[9px] font-bold uppercase
              tracking-[0.14em] text-white/90 shadow-[0_0_12px_rgba(0,0,0,0.85)]
            `}
          >
            {positionLabel}
          </span>
        </div>

        {isCaptain && !empty && (
          <span className={sz.cap} aria-label="Kapitán">
            C
          </span>
        )}
        {showAssistant && (
          <span className={sz.asst} aria-label="Asistent kapitána">
            A
          </span>
        )}

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
            pointer-events-none absolute inset-0 z-[15] flex flex-col items-center px-1.5
            ${empty ? "justify-center pt-[22%] pb-[22%]" : "justify-start px-1.5 pt-[27%]"}
          `}
        >
          {!empty ? (
            <>
              {namePlate ? (
                <span className={namePlate.className} style={namePlate.style}>
                  {ln}
                </span>
              ) : null}
              {numStr ? (
                <span className={sz.num} style={jerseyNumberStyle(ln, "premium")}>
                  {numStr}
                </span>
              ) : null}
            </>
          ) : (
            <span
              className={`max-w-[96%] text-center font-display text-[clamp(0.95rem,4.8vw,1.5rem)] font-black uppercase leading-none tracking-[0.06em] drop-shadow-[0_2px_8px_rgba(0,0,0,0.75)] ${
                emptyUnfocused ? "text-white/[0.2]" : "text-white/[0.52]"
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
