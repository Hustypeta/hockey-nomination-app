"use client";

import type { Player } from "@/types";
import { CzechHockeyCrest } from "@/components/CzechHockeyCrest";
import { JerseySilhouetteShape } from "@/components/JerseySilhouetteShape";

export interface NationalJerseyProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  player?: Player | null;
  placeholderLabel?: string;
  jerseyShape?: "skater" | "goalie";
  isCaptain?: boolean;
  isAssistant?: boolean;
  /** Vybraný slot řeší rodič (Slot) – tady jen kvůli API. */
  isSelected?: boolean;
  className?: string;
}

function lastName(name: string) {
  const parts = name.trim().split(/\s+/);
  return parts[parts.length - 1] || name;
}

/** w-full + max-w — ve 3 sloupcích v kartě lajny se dres zmenší, nepřekrývá sousedy */
const sizeWidths = {
  xs: "w-full max-w-[4.25rem]",
  sm: "w-full max-w-[6rem]",
  md: "w-full max-w-[8rem]",
  lg: "w-full max-w-[10.75rem]",
  xl: "w-full max-w-[12.25rem]",
};

const crestSize = {
  xs: "h-3 w-3",
  sm: "h-4 w-4",
  md: "h-[1.1rem] w-[1.1rem]",
  lg: "h-5 w-5",
  xl: "h-6 w-6",
};

const textName = {
  xs: "text-[11px] tracking-wide",
  sm: "text-[12px] tracking-wide",
  md: "text-sm tracking-wide",
  lg: "text-base tracking-wide",
  xl: "text-[17px] tracking-wide",
};

export function NationalJersey({
  size = "md",
  player,
  placeholderLabel,
  jerseyShape = "skater",
  isCaptain = false,
  isAssistant = false,
  isSelected: _isSelected = false,
  className = "",
}: NationalJerseyProps) {
  const empty = !player;
  const w = sizeWidths[size];
  const crest = crestSize[size];
  const nameCls = textName[size];

  const kind: "skater" | "goalie" = empty
    ? jerseyShape
    : player.position === "G"
      ? "goalie"
      : "skater";

  const showAssistant = isAssistant && !empty && !isCaptain;

  return (
    <div className={`relative mx-auto min-w-0 ${w} ${className} transition-transform duration-300 ease-out`}>
      {isCaptain && !empty && (
        <span
          className={`absolute z-20 flex items-center justify-center rounded-full bg-gradient-to-br from-[#c8102e] to-[#8a0b22] font-display font-bold text-white shadow-[0_0_20px_rgba(200,16,46,0.65)] ring-2 ring-white/60 ${
            size === "xs"
              ? "-right-0.5 -top-0.5 h-[1.1rem] w-[1.1rem] text-[8px]"
              : size === "xl"
                ? "-right-1 -top-1 h-8 w-8 text-sm"
                : "-right-1 -top-1 h-6 w-6 text-[11px]"
          }`}
          aria-label="Kapitán"
        >
          C
        </span>
      )}

      {showAssistant && (
        <span
          className={`absolute z-20 flex items-center justify-center rounded-full bg-gradient-to-br from-[#003087] to-[#001a52] font-display font-bold text-white shadow-[0_0_20px_rgba(0,48,135,0.65)] ring-2 ring-sky-300/50 ${
            size === "xs"
              ? "-left-0.5 -top-0.5 h-[1.1rem] w-[1.1rem] text-[8px]"
              : size === "xl"
                ? "-left-1 -top-1 h-8 w-8 text-sm"
                : "-left-1 -top-1 h-6 w-6 text-[11px]"
          }`}
          aria-label="Asistent kapitána"
        >
          A
        </span>
      )}

      <div
        className={`
          relative overflow-hidden rounded-[14px] border border-white/[0.14]
          bg-gradient-to-b from-white/[0.12] via-white/[0.04] to-transparent
          p-[6px] shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_12px_40px_rgba(0,0,0,0.5),0_0_24px_rgba(0,48,135,0.15)]
          ring-1 ring-[#003087]/25
        `}
      >
        <div className="overflow-hidden rounded-[11px] bg-[#06080d]/60 ring-1 ring-black/50">
          <JerseySilhouetteShape kind={kind} empty={empty} className="block h-auto w-full" />
        </div>

        {empty ? (
          <div className="pointer-events-none absolute inset-[6px] flex items-center justify-center rounded-[11px] px-1">
            <span className="text-center font-display text-[10px] font-semibold uppercase leading-tight tracking-[0.14em] text-white/50">
              {placeholderLabel ?? "—"}
            </span>
          </div>
        ) : (
          <div className="pointer-events-none absolute inset-[6px] flex flex-col rounded-[11px]">
            <CzechHockeyCrest
              className={`${crest} absolute left-[11%] top-[10%] z-10 drop-shadow-[0_0_8px_rgba(255,255,255,0.45),0_2px_4px_rgba(0,0,0,0.55)]`}
              aria-hidden
            />
            <div className="mt-auto flex flex-col items-center px-0.5 pb-[12%] pt-0 text-center">
              <div
                className={`max-w-[98%] truncate font-display font-semibold uppercase leading-tight text-white ${nameCls}`}
                style={{ textShadow: "0 1px 3px rgba(0,0,0,0.9), 0 0 14px rgba(0,0,0,0.45)" }}
              >
                {lastName(player.name)}
              </div>
              {player.position !== "G" && player.role && (
                <div
                  className={`mt-0.5 rounded-md border border-white/12 bg-black/40 px-1 py-px font-display font-semibold uppercase tracking-wider text-white/95 backdrop-blur-[2px] ${
                    size === "xl" ? "text-[11px]" : size === "lg" ? "text-[10px]" : "text-[8px]"
                  }`}
                >
                  {player.role}
                </div>
              )}
              {player.position === "G" && (
                <div
                  className={`mt-0.5 font-display font-bold uppercase tracking-[0.15em] text-sky-200/95 ${
                    size === "xl" ? "text-[11px]" : size === "lg" ? "text-[10px]" : "text-[8px]"
                  }`}
                  style={{ textShadow: "0 1px 2px rgba(0,0,0,0.85)" }}
                >
                  G
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
