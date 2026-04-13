"use client";

import { useId } from "react";
import type { Player } from "@/types";
import { jerseyNumberForPlayer } from "@/lib/jerseyNumber";
import { PREMIUM_PATH_GOALIE, PREMIUM_PATH_SKATER } from "@/components/sestava/premiumJerseyPaths";

const VB = "0 0 100 120";

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
    empty: string;
    cap: string;
    asst: string;
    clear: string;
  }
> = {
  compact: {
    root: "w-[124px]",
    pos: "left-[7%] top-[5%] z-20 flex h-6 w-6 items-center justify-center rounded-md bg-[#c8102e] font-sans text-[9px] font-bold leading-none text-white shadow-[0_2px_8px_rgba(0,0,0,0.4)]",
    num: "font-sans text-[36px] font-black leading-[0.9] tabular-nums tracking-tight text-white sm:text-[38px]",
    name: "mt-1 max-w-[96%] break-words text-center font-sans text-[12px] font-bold leading-tight text-[#e0e0e0] line-clamp-3 sm:text-[13px]",
    empty: "select-none font-sans text-[30px] font-bold leading-none text-[#64748b] opacity-60 sm:text-[32px]",
    cap: "absolute -right-0.5 -top-1 z-30 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-[#c8102e] to-[#8a0b20] font-display text-[9px] font-bold text-white shadow-md ring-2 ring-white",
    asst: "absolute -bottom-0.5 -left-0.5 z-30 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-br from-[#003087] to-[#001a4d] font-display text-[8px] font-bold text-white shadow-md ring-2 ring-white/90",
    clear:
      "absolute right-[5%] top-[3%] z-20 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#c8102e] bg-transparent text-[#c8102e] transition-colors duration-200 hover:bg-[#c8102e] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f0f0f0]",
  },
  skater: {
    root: "w-[158px]",
    pos: "left-[8%] top-[5%] z-20 flex h-7 w-7 items-center justify-center rounded-md bg-[#c8102e] font-sans text-[10px] font-bold leading-none text-white shadow-[0_2px_8px_rgba(0,0,0,0.4)]",
    num: "font-sans text-[52px] font-black leading-[0.9] tabular-nums tracking-tight text-white sm:text-[56px]",
    name: "mt-1 max-w-[94%] break-words text-center font-sans text-[15px] font-bold leading-tight text-[#e0e0e0] line-clamp-3 sm:text-[16px]",
    empty: "select-none font-sans text-[42px] font-bold leading-none text-[#64748b] opacity-60",
    cap: "absolute -right-0.5 -top-1 z-30 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[#c8102e] to-[#8a0b20] font-display text-[11px] font-bold text-white shadow-md ring-2 ring-white",
    asst: "absolute -bottom-0.5 -left-0.5 z-30 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-[#003087] to-[#001a4d] font-display text-[9px] font-bold text-white shadow-md ring-2 ring-white/90",
    clear:
      "absolute right-[6%] top-[4%] z-20 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#c8102e] bg-transparent text-[#c8102e] transition-colors duration-200 hover:bg-[#c8102e] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f0f0f0]",
  },
  goalie: {
    root: "w-[178px]",
    pos: "left-[8%] top-[5%] z-20 flex h-8 w-8 items-center justify-center rounded-md bg-[#c8102e] font-sans text-[11px] font-bold leading-none text-white shadow-[0_2px_8px_rgba(0,0,0,0.4)]",
    num: "font-sans text-[54px] font-black leading-[0.9] tabular-nums tracking-tight text-white sm:text-[58px]",
    name: "mt-1 max-w-[94%] break-words text-center font-sans text-[14px] font-bold leading-tight text-[#e0e0e0] line-clamp-3 sm:text-[15px]",
    empty: "select-none font-sans text-[40px] font-bold leading-none text-[#64748b] opacity-60 sm:text-[44px]",
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
 * Prémiová „NHL 25“ karta slotu — dres (SVG), trikolorní gradient, bez fotek.
 * Samostatná verze pro náhled / postupnou integraci do MOJE SESTAVA.
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
  const uid = useId().replace(/:/g, "");
  const gBody = `pjb-${uid}`;
  const gGloss = `pjg-${uid}`;
  const gTrim = `pjt-${uid}`;
  const path = kind === "goalie" ? PREMIUM_PATH_GOALIE : PREMIUM_PATH_SKATER;
  const empty = !player;
  const placeholder = (emptyPlaceholder ?? positionLabel).replace(/\d/g, "").trim() || positionLabel;
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
      <div className="relative aspect-[100/120] w-full overflow-visible">
        <svg
          viewBox={VB}
          className="absolute inset-0 h-full w-full drop-shadow-[0_10px_28px_rgba(0,0,0,0.55)]"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <defs>
            <linearGradient id={gBody} x1="50" y1="0" x2="50" y2="120" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0a1428" />
              <stop offset="100%" stopColor="#1e2a44" />
            </linearGradient>
            <linearGradient id={gGloss} x1="18" y1="8" x2="82" y2="72" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="rgba(255,255,255,0.2)" />
              <stop offset="35%" stopColor="rgba(255,255,255,0.06)" />
              <stop offset="70%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
            <linearGradient id={gTrim} x1="0" y1="0" x2="100" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#c8102e" />
              <stop offset="50%" stopColor="#f0f0f0" />
              <stop offset="100%" stopColor="#c8102e" />
            </linearGradient>
          </defs>

          {empty ? (
            <path
              d={path}
              fill="rgba(255,255,255,0.06)"
              stroke="#64748b"
              strokeWidth="1.35"
              strokeDasharray="5 4"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          ) : (
            <>
              <path d={path} fill={`url(#${gBody})`} stroke="#f0f0f0" strokeWidth="1.05" strokeLinejoin="round" />
              <path
                d={path}
                fill={`url(#${gGloss})`}
                stroke="none"
                style={{ mixBlendMode: "soft-light" }}
              />
              <path
                d={path}
                fill="none"
                stroke="#c8102e"
                strokeWidth="0.95"
                strokeLinejoin="round"
                opacity={0.88}
              />
              <path
                d={path}
                fill="none"
                stroke={`url(#${gTrim})`}
                strokeWidth="0.35"
                strokeLinejoin="round"
                opacity={0.55}
              />
            </>
          )}
        </svg>

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

        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center px-2 pt-[22%]">
          {!empty ? (
            <>
              {numStr ? (
                <span
                  className={sz.num}
                  style={{
                    textShadow:
                      "0 0 12px #c8102e, 0 0 2px rgba(200,16,46,0.8), 0 2px 6px rgba(0,0,0,0.85)",
                  }}
                >
                  {numStr}
                </span>
              ) : null}
              <span
                className={`${sz.name} ${numStr ? "" : "mt-0"}`}
                style={{ letterSpacing: "-0.5px", textShadow: "0 1px 4px rgba(0,0,0,0.9)" }}
              >
                {lastName(player.name)}
              </span>
            </>
          ) : (
            <span className={sz.empty} aria-hidden>
              {placeholder}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
