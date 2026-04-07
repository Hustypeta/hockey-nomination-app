"use client";

import type { Player } from "@/types";
import { HockeySilhouette } from "@/components/HockeySilhouette";

export type JerseyVariant = "white" | "red";

export interface NationalJerseyProps {
  variant?: JerseyVariant;
  size?: "sm" | "md" | "lg";
  player?: Player | null;
  placeholderLabel?: string;
  isCaptain?: boolean;
  isSelected?: boolean;
  className?: string;
}

function lastName(name: string) {
  const parts = name.trim().split(/\s+/);
  return parts[parts.length - 1] || name;
}

const sizeClasses = {
  sm: "w-[4.25rem] min-h-[5.5rem] text-[10px]",
  md: "w-[6.5rem] min-h-[7.75rem] text-xs",
  lg: "w-[8rem] min-h-[9.5rem] text-sm",
};

const siloSize = {
  sm: "h-12 w-10",
  md: "h-16 w-[3.25rem]",
  lg: "h-[4.5rem] w-14",
};

/**
 * Karta hráče se siluetou (místo dresu) – národní barvy v rámečku.
 */
export function NationalJersey({
  variant = "white",
  size = "md",
  player,
  placeholderLabel,
  isCaptain = false,
  isSelected = false,
  className = "",
}: NationalJerseyProps) {
  const empty = !player;
  const sz = sizeClasses[size];
  const sil = siloSize[size];

  return (
    <div
      className={`
        relative flex flex-col items-stretch ${sz} ${className}
        transition-transform duration-200
        ${empty ? "opacity-90" : ""}
      `}
    >
      {isCaptain && !empty && (
        <span
          className="absolute -top-1 -right-1 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-[#003f87] text-[11px] font-bold text-white shadow-md ring-2 ring-white/90"
          aria-label="Kapitán"
        >
          C
        </span>
      )}

      <div
        className={`
          relative flex min-h-0 flex-1 flex-col items-center overflow-hidden rounded-2xl border-2
          shadow-[0_6px_16px_rgba(0,0,0,0.35)]
          ${isSelected ? "ring-2 ring-amber-400 ring-offset-2 ring-offset-[#0c0e12]" : ""}
          ${
            empty
              ? "border-dashed border-white/35 bg-[#151922]/95 text-white/45"
              : variant === "white"
                ? "border-[#003f87] bg-gradient-to-b from-slate-100 via-white to-slate-200 text-[#0c0e12]"
                : "border-white/90 bg-gradient-to-b from-[#e0203a] via-[#b81830] to-[#6b1018] text-white"
          }
        `}
      >
        <div className="flex flex-1 flex-col items-center justify-center px-1 pb-1 pt-2">
          {empty ? (
            <span className="font-display text-[10px] uppercase tracking-wide text-white/50">
              {placeholderLabel ?? "—"}
            </span>
          ) : (
            <>
              <HockeySilhouette
                kind={player.position === "G" ? "goalie" : "skater"}
                className={`${sil} shrink-0 opacity-90`}
              />
              <div
                className="mt-1 max-w-full truncate text-center font-display text-[10px] font-bold leading-tight tracking-wide md:text-[12px] lg:text-sm"
                style={{
                  textShadow:
                    variant === "white"
                      ? "0 1px 0 rgba(255,255,255,0.6)"
                      : "0 1px 2px rgba(0,0,0,0.5)",
                }}
              >
                {lastName(player.name)}
              </div>
              {player.position !== "G" && player.role && (
                <div
                  className={`mt-0.5 rounded px-1 py-px font-display text-[8px] uppercase tracking-wider md:text-[9px] ${
                    variant === "white"
                      ? "bg-[#003f87]/15 text-[#003f87]"
                      : "bg-black/25 text-white/95"
                  }`}
                >
                  {player.role}
                </div>
              )}
              {player.position === "G" && (
                <div
                  className={`mt-0.5 font-display text-[8px] uppercase tracking-wider md:text-[9px] ${
                    variant === "white" ? "text-[#003f87]" : "text-white/90"
                  }`}
                >
                  G
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
