"use client";

import type { Player } from "@/types";
import { jerseyNumberForPlayer } from "@/lib/jerseyNumber";
import { CZ_JERSEY_BACK_BLANK_SRC, CZ_JERSEY_CARD_IMG_BASE } from "@/lib/jerseyPhotoAsset";

function lastName(name: string) {
  const parts = name.trim().split(/\s+/);
  return parts[parts.length - 1] || name;
}

/** Kratší písmo pro dlouhá příjmení — zůstane na „nášivce“. */
function nameplateOverflowClass(last: string): string {
  const n = last.length;
  if (n <= 8) return "";
  if (n <= 11) return " !text-[9px] sm:!text-[10px] !leading-tight";
  if (n <= 14) return " !text-[8px] sm:!text-[9px] !leading-tight";
  return " !text-[7px] sm:!text-[8px] !leading-tight break-words";
}

function numberOverflowClass(last: string): string {
  const n = last.length;
  if (n <= 11) return "";
  return " !text-[26px] sm:!text-[28px]";
}

export type PremiumJerseySize = "compact" | "skater" | "goalie";

/** Jedna šířka a typografie pro všechny sloty (útok, obrana, G, náhradníci). Rozdíl jen `kind` u obrázku. */
const PREMIUM_SLOT_UNIFIED = {
  root: "w-[128px]",
  pos: "left-[8%] top-[5%] z-20 flex h-6 w-6 items-center justify-center rounded-md bg-[#c8102e] font-sans text-[9px] font-bold leading-none text-white shadow-[0_2px_8px_rgba(0,0,0,0.4)]",
  num: "jersey-back-number-text text-[32px] sm:text-[36px]",
  name: "jersey-nameplate-text max-w-[90%] break-words text-center text-[11px] leading-tight line-clamp-2 sm:text-[12px]",
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
  const numStr = !empty ? jerseyNumberForPlayer(player) : "";
  const emptyCenterLabel = (emptyPlaceholder ?? positionLabel).trim() || "?";
  const showClear = !empty && typeof onClear === "function";

  const motion = disableMotion
    ? ""
    : "transition-[transform,box-shadow,filter] duration-[250ms] [transition-timing-function:cubic-bezier(0.4,0,0.2,1)] will-change-transform";

  const stateRing =
    isDragOver || isSelected
      ? isDragOver
        ? "shadow-[0_0_0_2px_rgba(212,175,55,0.95),0_0_28px_rgba(212,175,55,0.45),inset_0_0_20px_rgba(212,175,55,0.12)]"
        : "shadow-[0_0_0_2px_rgba(212,175,55,0.9),0_0_24px_rgba(212,175,55,0.35),inset_0_0_18px_rgba(212,175,55,0.1)]"
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
          ${empty ? "ring-1 ring-inset ring-white/12" : ""}
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
            ${empty ? "opacity-[0.62] saturate-[0.88]" : ""}
          `}
        />

        <div className={`absolute ${sz.pos}`}>{positionLabel}</div>

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
            ${empty ? "justify-center pt-[22%] pb-[22%]" : "justify-start pt-[31%]"}
          `}
        >
          {!empty ? (
            <>
              <span className={`${sz.name}${nameplateOverflowClass(lastName(player.name))}`}>
                {lastName(player.name)}
              </span>
              {numStr ? (
                <span
                  className={`${sz.num} mt-px max-w-[92%] text-center${numberOverflowClass(lastName(player.name))}`}
                >
                  {numStr}
                </span>
              ) : null}
            </>
          ) : (
            <span
              className="max-w-[96%] text-center font-display text-[clamp(0.95rem,4.8vw,1.5rem)] font-black uppercase leading-none tracking-[0.06em] text-white/[0.38] drop-shadow-[0_2px_8px_rgba(0,0,0,0.75)]"
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
