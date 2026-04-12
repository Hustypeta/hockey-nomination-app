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

export interface PremiumJerseySlotCardProps {
  player?: Player | null;
  /** Štítek pozice (LW, C, G, …). */
  positionLabel: string;
  kind?: "skater" | "goalie";
  /** Prázdný slot zobrazí `positionLabel` uprostřed. */
  emptyPlaceholder?: string;
  isSelected?: boolean;
  /** Zvýraznění cílového slotu při DnD. */
  isDragOver?: boolean;
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
  emptyPlaceholder,
  isSelected = false,
  isDragOver = false,
  onClear,
  className = "",
  disableMotion = false,
}: PremiumJerseySlotCardProps) {
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
        premium-jersey-slot-card relative mx-auto w-[158px] shrink-0
        ${motion} ${hoverFx} ${stateRing} ${className}
      `}
    >
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

        {/* Pozice — levý horní roh (28×28) */}
        <div
          className={`
            absolute left-[8%] top-[5%] z-20 flex h-7 w-7 items-center justify-center rounded-md
            bg-[#c8102e] font-sans text-[10px] font-bold leading-none text-white shadow-[0_2px_8px_rgba(0,0,0,0.4)]
          `}
        >
          {positionLabel}
        </div>

        {showClear ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClear?.();
            }}
            className={`
              absolute right-[6%] top-[4%] z-20 flex h-6 w-6 items-center justify-center rounded-full
              border-2 border-[#c8102e] bg-transparent text-[#c8102e] transition-colors duration-200
              hover:bg-[#c8102e] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
              focus-visible:outline-[#f0f0f0]
            `}
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
                  className="font-sans text-[52px] font-black leading-[0.9] tabular-nums tracking-tight text-white sm:text-[56px]"
                  style={{
                    textShadow:
                      "0 0 12px #c8102e, 0 0 2px rgba(200,16,46,0.8), 0 2px 6px rgba(0,0,0,0.85)",
                  }}
                >
                  {numStr}
                </span>
              ) : null}
              <span
                className={`
                  mt-1 max-w-[94%] truncate text-center font-sans text-[15px] font-bold leading-tight text-[#e0e0e0] sm:text-[16px]
                  ${numStr ? "" : "mt-0"}
                `}
                style={{ letterSpacing: "-0.5px", textShadow: "0 1px 4px rgba(0,0,0,0.9)" }}
              >
                {lastName(player.name)}
              </span>
            </>
          ) : (
            <span
              className="select-none font-sans text-[42px] font-bold leading-none text-[#64748b] opacity-60"
              aria-hidden
            >
              {placeholder}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
