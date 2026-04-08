"use client";

import type { Player } from "@/types";
import { CzechHockeyCrest } from "@/components/CzechHockeyCrest";
import { JerseySilhouetteShape } from "@/components/JerseySilhouetteShape";

export interface NationalJerseyProps {
  size?: "xs" | "sm" | "md" | "lg";
  player?: Player | null;
  placeholderLabel?: string;
  jerseyShape?: "skater" | "goalie";
  isCaptain?: boolean;
  /** Vybraný slot řeší rodič (Slot) – tady jen kvůli API. */
  isSelected?: boolean;
  className?: string;
}

function lastName(name: string) {
  const parts = name.trim().split(/\s+/);
  return parts[parts.length - 1] || name;
}

const sizeWidths = {
  xs: "w-[3.5rem]",
  sm: "w-[5rem]",
  md: "w-[6.75rem]",
  lg: "w-[8.35rem]",
};

const crestSize = {
  xs: "h-2.5 w-2.5",
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-[1.05rem] w-[1.05rem]",
};

const textName = {
  xs: "text-[8px] tracking-wide",
  sm: "text-[9px] tracking-wide",
  md: "text-[11px] tracking-wide",
  lg: "text-sm tracking-wide",
};

export function NationalJersey({
  size = "md",
  player,
  placeholderLabel,
  jerseyShape = "skater",
  isCaptain = false,
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

  return (
    <div className={`relative ${w} ${className} transition-transform duration-300 ease-out`}>
      {isCaptain && !empty && (
        <span
          className={`absolute z-20 flex items-center justify-center rounded-full bg-gradient-to-br from-[#c41e3a] to-[#8f1428] font-display font-bold text-white shadow-lg ring-2 ring-white/40 ${
            size === "xs"
              ? "-right-0.5 -top-0.5 h-4 w-4 text-[8px]"
              : "-right-1 -top-1 h-[1.35rem] w-[1.35rem] text-[10px]"
          }`}
          aria-label="Kapitán"
        >
          C
        </span>
      )}

      <div
        className={`
          relative overflow-hidden rounded-[14px] border border-white/[0.1]
          bg-gradient-to-b from-white/[0.07] via-white/[0.02] to-transparent
          p-[5px] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_6px_24px_rgba(0,0,0,0.35)]
        `}
      >
        <div className="overflow-hidden rounded-[10px] bg-[#06080d]/50 ring-1 ring-black/40">
          <JerseySilhouetteShape kind={kind} empty={empty} className="block h-auto w-full" />
        </div>

        {empty ? (
          <div className="pointer-events-none absolute inset-[5px] flex items-center justify-center rounded-[10px] px-1">
            <span className="text-center font-display text-[9px] font-semibold uppercase leading-tight tracking-[0.12em] text-white/55">
              {placeholderLabel ?? "—"}
            </span>
          </div>
        ) : (
          <div className="pointer-events-none absolute inset-[5px] flex flex-col rounded-[10px]">
            <CzechHockeyCrest
              className={`${crest} absolute left-[11%] top-[10%] z-10 drop-shadow-[0_0_6px_rgba(255,255,255,0.5),0_2px_4px_rgba(0,0,0,0.5)]`}
              aria-hidden
            />
            <div className="mt-auto flex flex-col items-center px-0.5 pb-[11%] pt-0 text-center">
              <div
                className={`max-w-[98%] truncate font-display font-semibold uppercase leading-tight text-white ${nameCls}`}
                style={{ textShadow: "0 1px 3px rgba(0,0,0,0.85), 0 0 12px rgba(0,0,0,0.4)" }}
              >
                {lastName(player.name)}
              </div>
              {player.position !== "G" && player.role && (
                <div
                  className={`mt-0.5 rounded-md border border-white/10 bg-black/35 px-1 py-px font-display font-semibold uppercase tracking-wider text-white/95 backdrop-blur-[2px] ${
                    size === "lg" ? "text-[9px]" : "text-[7px]"
                  }`}
                >
                  {player.role}
                </div>
              )}
              {player.position === "G" && (
                <div
                  className={`mt-0.5 font-display font-bold uppercase tracking-[0.15em] text-sky-200/95 ${
                    size === "lg" ? "text-[9px]" : "text-[7px]"
                  }`}
                  style={{ textShadow: "0 1px 2px rgba(0,0,0,0.8)" }}
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
