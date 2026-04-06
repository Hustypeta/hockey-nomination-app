"use client";

import type { Player } from "@/types";

export type JerseyVariant = "white" | "red";

export interface NationalJerseyProps {
  variant?: JerseyVariant;
  /** Interaktivní sestavovač: md · plakát / náhled: lg */
  size?: "sm" | "md" | "lg";
  player?: Player | null;
  /** Prázdný slot – např. „LW“ */
  placeholderLabel?: string;
  isCaptain?: boolean;
  /** Vybraný slot (amber rámeček) */
  isSelected?: boolean;
  className?: string;
}

function lastName(name: string) {
  const parts = name.trim().split(/\s+/);
  return parts[parts.length - 1] || name;
}

const sizeClasses = {
  sm: "w-[4.25rem] min-h-[5.25rem] text-[10px]",
  md: "w-[6.25rem] min-h-[7.5rem] text-xs",
  lg: "w-[7.75rem] min-h-[9.25rem] text-sm",
};

/**
 * Stylizovaný národní dres (bílý / červený) pro sestavu i export plakátu.
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

  return (
    <div
      className={`
        relative flex flex-col items-stretch ${sz} ${className}
        transition-transform duration-200
        ${empty ? "opacity-95" : ""}
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
          relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-t-[45%] rounded-b-xl
          border-2 shadow-[0_6px_16px_rgba(0,0,0,0.35)]
          ${isSelected ? "ring-2 ring-amber-400 ring-offset-2 ring-offset-[#0c0e12]" : ""}
          ${
            empty
              ? "border-dashed border-white/35 bg-[#151922]/90 text-white/45"
              : variant === "white"
                ? "border-[#003f87] bg-gradient-to-b from-white via-slate-50 to-slate-200 text-[#0c0e12]"
                : "border-white/90 bg-gradient-to-b from-[#d42a42] via-[#b81830] to-[#7a1020] text-white"
          }
        `}
      >
        {/* Ramena / pruhy */}
        <div
          className={`pointer-events-none absolute inset-x-0 top-[22%] h-2 ${
            empty
              ? "bg-white/10"
              : variant === "white"
                ? "bg-[#003f87]/25"
                : "bg-black/20"
          }`}
        />
        <div
          className={`pointer-events-none absolute inset-x-0 top-[30%] h-px ${
            empty ? "bg-white/15" : variant === "white" ? "bg-[#c41e3a]/35" : "bg-white/35"
          }`}
        />

        {/* Límec */}
        <div className="pointer-events-none flex justify-center pt-1.5">
          <div
            className={`h-2.5 w-[42%] rounded-b-full ${
              empty ? "bg-white/20" : variant === "white" ? "bg-[#003f87]/30" : "bg-black/25"
            }`}
          />
        </div>

        <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-1 pb-1.5 pt-1">
          {empty ? (
            <span className="font-display text-[10px] uppercase tracking-wide text-white/50">
              {placeholderLabel ?? "—"}
            </span>
          ) : (
            <>
              <div
                className="max-w-full truncate text-center font-display text-[11px] font-bold leading-tight tracking-wide md:text-[13px] lg:text-base"
                style={{
                  textShadow:
                    variant === "white"
                      ? "0 1px 0 rgba(255,255,255,0.8)"
                      : "0 1px 2px rgba(0,0,0,0.45)",
                }}
              >
                {lastName(player.name)}
              </div>
              {player.position !== "G" && player.role && (
                <div
                  className={`mt-0.5 rounded px-1 py-px font-display text-[9px] uppercase tracking-wider md:text-[10px] ${
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
                  className={`mt-0.5 font-display text-[9px] uppercase tracking-wider md:text-[10px] ${
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
