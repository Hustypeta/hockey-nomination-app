"use client";

import type { Player } from "@/types";
import { jerseyNumberForPlayer } from "@/lib/jerseyNumber";
import { CZ_JERSEY_BACK_BLANK_SRC } from "@/lib/jerseyPhotoAsset";

function lastName(name: string) {
  const parts = name.trim().split(/\s+/);
  return parts[parts.length - 1] || name;
}

export type PremiumJerseySize = "compact" | "skater" | "goalie";

const SIZE_STYLES: Record<
  PremiumJerseySize,
  {
    root: string;
    pos: string;
    num: string;
    name: string;
    emptyName: string;
    emptyNum: string;
    cap: string;
    asst: string;
    clear: string;
  }
> = {
  compact: {
    root: "w-[124px]",
    pos: "left-[7%] top-[5%] z-20 flex h-6 w-6 items-center justify-center rounded-md bg-[#c8102e] font-sans text-[9px] font-bold leading-none text-white shadow-[0_2px_8px_rgba(0,0,0,0.4)]",
    num: "font-jersey-print text-[34px] font-bold leading-[0.82] tabular-nums tracking-[-0.02em] text-white sm:text-[36px]",
    name: "font-jersey-print max-w-[96%] break-words text-center text-[11px] font-semibold uppercase leading-tight tracking-[0.12em] text-white line-clamp-2 sm:text-[12px]",
    emptyName:
      "select-none font-jersey-print text-[10px] font-semibold uppercase leading-tight tracking-[0.2em] text-white/35 sm:text-[11px]",
    emptyNum:
      "select-none font-jersey-print mt-1 text-[28px] font-bold leading-none tabular-nums text-white/25 sm:text-[30px]",
    cap: "absolute -right-0.5 -top-1 z-30 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-[#c8102e] to-[#8a0b20] font-display text-[9px] font-bold text-white shadow-md ring-2 ring-white",
    asst: "absolute -bottom-0.5 -left-0.5 z-30 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-br from-[#003087] to-[#001a4d] font-display text-[8px] font-bold text-white shadow-md ring-2 ring-white/90",
    clear:
      "absolute right-[5%] top-[3%] z-20 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#c8102e] bg-transparent text-[#c8102e] transition-colors duration-200 hover:bg-[#c8102e] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f0f0f0]",
  },
  skater: {
    root: "w-[158px]",
    pos: "left-[8%] top-[5%] z-20 flex h-7 w-7 items-center justify-center rounded-md bg-[#c8102e] font-sans text-[10px] font-bold leading-none text-white shadow-[0_2px_8px_rgba(0,0,0,0.4)]",
    num: "font-sans text-[48px] font-black leading-[0.85] tabular-nums tracking-tight text-white sm:text-[52px]",
    name: "max-w-[94%] break-words text-center font-sans text-[14px] font-bold uppercase leading-tight tracking-wide text-white line-clamp-2 sm:text-[15px]",
    emptyName:
      "select-none font-jersey-print text-[11px] font-semibold uppercase leading-tight tracking-[0.18em] text-white/35 sm:text-[12px]",
    emptyNum:
      "select-none font-jersey-print mt-1 text-[34px] font-bold leading-none tabular-nums text-white/25 sm:text-[38px]",
    cap: "absolute -right-0.5 -top-1 z-30 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[#c8102e] to-[#8a0b20] font-display text-[11px] font-bold text-white shadow-md ring-2 ring-white",
    asst: "absolute -bottom-0.5 -left-0.5 z-30 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-[#003087] to-[#001a4d] font-display text-[9px] font-bold text-white shadow-md ring-2 ring-white/90",
    clear:
      "absolute right-[6%] top-[4%] z-20 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#c8102e] bg-transparent text-[#c8102e] transition-colors duration-200 hover:bg-[#c8102e] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f0f0f0]",
  },
  goalie: {
    root: "w-[178px]",
    pos: "left-[8%] top-[5%] z-20 flex h-8 w-8 items-center justify-center rounded-md bg-[#c8102e] font-sans text-[11px] font-bold leading-none text-white shadow-[0_2px_8px_rgba(0,0,0,0.4)]",
    num: "font-sans text-[50px] font-black leading-[0.85] tabular-nums tracking-tight text-white sm:text-[54px]",
    name: "max-w-[94%] break-words text-center font-sans text-[13px] font-bold uppercase leading-tight tracking-wide text-white line-clamp-2 sm:text-[14px]",
    emptyName:
      "select-none font-jersey-print text-[11px] font-semibold uppercase leading-tight tracking-[0.18em] text-white/35 sm:text-[12px]",
    emptyNum:
      "select-none font-jersey-print mt-1 text-[36px] font-bold leading-none tabular-nums text-white/25 sm:text-[40px]",
    cap: "absolute -right-0.5 -top-1 z-30 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#c8102e] to-[#8a0b20] font-display text-xs font-bold text-white shadow-md ring-2 ring-white",
    asst: "absolute -bottom-0.5 -left-0.5 z-30 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[#003087] to-[#001a4d] font-display text-[10px] font-bold text-white shadow-md ring-2 ring-white/90",
    clear:
      "absolute right-[6%] top-[4%] z-20 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#c8102e] bg-transparent text-[#c8102e] transition-colors duration-200 hover:bg-[#c8102e] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f0f0f0]",
  },
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
  const ghostNumText = (() => {
    const t = (emptyPlaceholder ?? "").replace(/\d/g, "").trim();
    return t.length > 0 && t.length <= 2 ? t : "00";
  })();
  const numStr = !empty ? jerseyNumberForPlayer(player) : "";
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
    : "hover:scale-[1.06] hover:-translate-y-1 hover:shadow-[0_0_20px_6px_rgba(200,16,46,0.6),0_16px_40px_rgba(0,0,0,0.45)]";

  return (
    <div
      className={`
        premium-jersey-slot-card relative mx-auto shrink-0 ${sz.root}
        ${motion} ${hoverFx} ${stateRing} ${className}
      `}
    >
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
            absolute inset-0 h-full w-full object-contain object-top drop-shadow-[0_10px_28px_rgba(0,0,0,0.55)]
            ${empty ? "opacity-[0.62] saturate-[0.88]" : ""}
          `}
        />

        <div className={`absolute ${sz.pos}`}>{positionLabel}</div>

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
            pointer-events-none absolute inset-0 z-[15] flex flex-col items-center px-2
            ${size === "compact" ? "justify-start pt-[30%]" : size === "goalie" ? "justify-start pt-[29%]" : "justify-start pt-[31%]"}
          `}
        >
          {!empty ? (
            <>
              <span
                className={sz.name}
                style={{
                  textShadow:
                    "0 1px 2px rgba(0,0,0,0.95), 0 2px 8px rgba(0,0,0,0.75), 0 0 1px rgba(0,0,0,1)",
                }}
              >
                {lastName(player.name)}
              </span>
              {numStr ? (
                <span
                  className={`${sz.num} mt-0.5 sm:mt-1`}
                  style={{
                    textShadow:
                      "0 1px 2px rgba(0,0,0,0.95), 0 2px 10px rgba(0,0,0,0.8), 0 0 1px rgba(0,0,0,1)",
                  }}
                >
                  {numStr}
                </span>
              ) : null}
            </>
          ) : (
            <div className="mt-[18%] flex flex-col items-center" aria-hidden>
              <span className={sz.emptyName}>—</span>
              <span className={sz.emptyNum}>{ghostNumText}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
