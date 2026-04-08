"use client";

import type { Player } from "@/types";
import { HockeySilhouette } from "@/components/HockeySilhouette";
import { CzechHockeyCrest } from "@/components/CzechHockeyCrest";

export interface NationalJerseyProps {
  size?: "xs" | "sm" | "md" | "lg";
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
  xs: "w-[3.2rem] min-h-[4.35rem] text-[7px]",
  sm: "w-[4.25rem] min-h-[5.5rem] text-[10px]",
  md: "w-[6.5rem] min-h-[7.75rem] text-xs",
  lg: "w-[8rem] min-h-[9.5rem] text-sm",
};

const siloSize = {
  xs: "h-8 w-[1.85rem]",
  sm: "h-11 w-[2.35rem]",
  md: "h-[3.75rem] w-[2.95rem]",
  lg: "h-[4.25rem] w-[3.35rem]",
};

const crestSize = {
  xs: "h-2.5 w-2.5",
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

/** Inspirace domácím dresem ČR (Nike/repliky): bílé tělo, pruhy na rukávech, erb na hrudi, modrý lem. */
export function NationalJersey({
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
  const crest = crestSize[size];

  const sleeveStripes = {
    background:
      "repeating-linear-gradient(180deg, #c41e3a 0px, #c41e3a 3px, #ffffff 3px, #ffffff 5.5px, #003f87 5.5px, #003f87 8.5px, #ffffff 8.5px, #ffffff 10px)",
  };

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
          className={`absolute z-20 flex items-center justify-center rounded-full bg-[#003f87] font-bold text-white shadow-md ring-2 ring-white/90 ${
            size === "xs"
              ? "-top-0.5 -right-0.5 h-4 w-4 text-[8px] ring-1"
              : "-top-1 -right-1 h-6 w-6 text-[11px]"
          }`}
          aria-label="Kapitán"
        >
          C
        </span>
      )}

      <div
        className={`
          relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border-2 border-[#003f87]
          shadow-[0_6px_16px_rgba(0,63,135,0.22)]
          ${isSelected ? "ring-2 ring-amber-400 ring-offset-2 ring-offset-[#0c0e12]" : ""}
          ${empty ? "border-dashed border-white/40 bg-[#151922]/95 text-white/45" : "bg-[#f7f9fc]"}
        `}
      >
        {!empty && (
          <>
            {/* Rukávy – typické červeno-bílo-modré prstence (viz repliky domácího dresu) */}
            <div
              className="pointer-events-none absolute bottom-[10%] left-0 top-[14%] w-[13%] rounded-l-[0.35rem] opacity-95"
              style={sleeveStripes}
              aria-hidden
            />
            <div
              className="pointer-events-none absolute bottom-[10%] right-0 top-[14%] w-[13%] rounded-r-[0.35rem] opacity-95"
              style={sleeveStripes}
              aria-hidden
            />
            {/* Límec / výstřih s modrým lemem */}
            <div
              className="pointer-events-none absolute left-1/2 top-0 z-[1] h-3 w-[48%] -translate-x-1/2 rounded-b-md border-b-2 border-[#003f87] bg-white shadow-sm"
              aria-hidden
            />
            {/* Jemný stín těla dresu */}
            <div
              className="pointer-events-none absolute inset-[6%] rounded-xl bg-gradient-to-b from-white via-white to-[#e8eef5]/90"
              aria-hidden
            />
          </>
        )}

        <div
          className={`relative z-[2] flex flex-1 flex-col items-center justify-center px-[18%] pb-1 pt-2 ${
            empty ? "pt-3" : ""
          }`}
        >
          {empty ? (
            <span className="font-display text-[10px] uppercase tracking-wide text-white/50">
              {placeholderLabel ?? "—"}
            </span>
          ) : (
            <>
              <CzechHockeyCrest className={`${crest} mb-0.5 shrink-0 drop-shadow-sm`} />
              <HockeySilhouette
                kind={player.position === "G" ? "goalie" : "skater"}
                className={`${sil} shrink-0`}
              />
              <div
                className="mt-1 max-w-full truncate text-center font-display text-[10px] font-bold leading-tight tracking-wide text-[#0c0e12] md:text-[12px] lg:text-sm"
                style={{ textShadow: "0 1px 0 rgba(255,255,255,0.95)" }}
              >
                {lastName(player.name)}
              </div>
              {player.position !== "G" && player.role && (
                <div className="mt-0.5 rounded px-1 py-px font-display text-[8px] uppercase tracking-wider text-[#003f87] md:text-[9px] bg-[#003f87]/12">
                  {player.role}
                </div>
              )}
              {player.position === "G" && (
                <div className="mt-0.5 font-display text-[8px] font-semibold uppercase tracking-wider text-[#c41e3a] md:text-[9px]">
                  G
                </div>
              )}
            </>
          )}
        </div>

        {!empty && (
          <div
            className="pointer-events-none absolute bottom-0 left-[13%] right-[13%] h-0.5 bg-[#c41e3a]/90"
            aria-hidden
          />
        )}
      </div>
    </div>
  );
}
