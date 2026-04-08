"use client";

import type { Player } from "@/types";
import { CzechHockeyCrest } from "@/components/CzechHockeyCrest";
import { JerseySilhouetteShape } from "@/components/JerseySilhouetteShape";

export interface NationalJerseyProps {
  size?: "xs" | "sm" | "md" | "lg";
  player?: Player | null;
  placeholderLabel?: string;
  /** U prázdného slotu: tvar siluety (brankář = širší dres). */
  jerseyShape?: "skater" | "goalie";
  isCaptain?: boolean;
  isSelected?: boolean;
  className?: string;
}

function lastName(name: string) {
  const parts = name.trim().split(/\s+/);
  return parts[parts.length - 1] || name;
}

const sizeWidths = {
  xs: "w-[3.35rem]",
  sm: "w-[4.35rem]",
  md: "w-[6.5rem]",
  lg: "w-[8rem]",
};

const crestSize = {
  xs: "h-2.5 w-2.5",
  sm: "h-3 w-3",
  md: "h-3.5 w-3.5",
  lg: "h-4 w-4",
};

const textName = {
  xs: "text-[7px]",
  sm: "text-[8px]",
  md: "text-[10px]",
  lg: "text-xs",
};

/**
 * Celý „dres“ je jedna silueta (vyplněný obrys), ne bílá karta s postavou uvnitř.
 */
export function NationalJersey({
  size = "md",
  player,
  placeholderLabel,
  jerseyShape = "skater",
  isCaptain = false,
  isSelected = false,
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
    <div
      className={`
        relative ${w} ${className}
        transition-transform duration-200
        ${empty ? "opacity-[0.92]" : ""}
      `}
    >
      {isCaptain && !empty && (
        <span
          className={`absolute z-20 flex items-center justify-center rounded-full bg-[#c41e3a] font-bold text-white shadow-md ring-2 ring-white/90 ${
            size === "xs"
              ? "-right-0.5 -top-0.5 h-3.5 w-3.5 text-[7px] ring-1"
              : "-right-1 -top-1 h-5 w-5 text-[10px]"
          }`}
          aria-label="Kapitán"
        >
          C
        </span>
      )}

      <div
        className={`
          relative overflow-visible rounded-lg
          ${isSelected ? "ring-2 ring-amber-400 ring-offset-2 ring-offset-[#0c0e12]" : ""}
        `}
      >
        <JerseySilhouetteShape
          kind={kind}
          empty={empty}
          className="block h-auto w-full"
        />

        {empty ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-1 pt-2">
            <span className="text-center font-display text-[8px] font-semibold uppercase leading-tight tracking-wide text-white/65">
              {placeholderLabel ?? "—"}
            </span>
          </div>
        ) : (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-stretch">
            <CzechHockeyCrest
              className={`${crest} absolute left-[10%] top-[9%] z-10 shrink-0 drop-shadow-[0_0_4px_rgba(255,255,255,0.95),0_1px_2px_rgba(0,0,0,0.5)]`}
              aria-hidden
            />
            <div className="mt-auto flex flex-col items-center px-1 pb-[10%] pt-0 text-center">
              <div
                className={`max-w-full truncate font-display font-bold leading-tight tracking-wide text-white ${nameCls}`}
                style={{ textShadow: "0 1px 2px rgba(0,0,0,0.75)" }}
              >
                {lastName(player.name)}
              </div>
              {player.position !== "G" && player.role && (
                <div
                  className={`mt-0.5 rounded px-1 py-px font-display font-semibold uppercase tracking-wider text-white/95 ${
                    size === "lg" ? "text-[9px]" : "text-[7px]"
                  } bg-black/25`}
                  style={{ textShadow: "0 1px 1px rgba(0,0,0,0.6)" }}
                >
                  {player.role}
                </div>
              )}
              {player.position === "G" && (
                <div
                  className={`mt-0.5 font-display font-bold uppercase tracking-wider text-[#ffb4b4] ${
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
