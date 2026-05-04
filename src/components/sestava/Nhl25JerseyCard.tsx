"use client";

import type { Player } from "@/types";
import { jerseyNameOnJersey } from "@/lib/jerseyDisplayName";
import {
  jerseyNameplateNameProps,
  jerseyNumberStyle,
  splitNameplateLines,
} from "@/lib/jerseyNameplate";
import { jerseyNumberForPlayer } from "@/lib/jerseyNumber";
import { CZ_JERSEY_BACK_BLANK_SRC, CZ_JERSEY_CARD_IMG_BASE } from "@/lib/jerseyPhotoAsset";
import { JerseyCornerFlagCz, JerseyFlagCzInline } from "@/components/sestava/JerseyCornerFlagCz";

export type Nhl25JerseySize = "compact" | "skater" | "goalie";

/** Jednotná velikost karty — útok, obrana, G, náhradníci (export / share). Jméno řeší `jerseyNameplateNameProps`. */
const NHL25_CARD_UNIFIED = {
  width: "max-w-[9.5rem] sm:max-w-[10rem] lg:max-w-[10.5rem]",
  number:
    "jersey-back-number-text text-[1.28rem] sm:text-[1.42rem] lg:text-[1.52rem] max-w-[92%] text-center",
} as const;

/** Plakát soupisky — bez bílého rámu kolem dresu lze siluetu výrazně zvětšit. */
const NHL25_POSTER_CARD = {
  width: "max-w-[10.25rem] sm:max-w-[10.85rem] lg:max-w-[11.35rem]",
} as const;

const widthClass: Record<Nhl25JerseySize, string> = {
  compact: NHL25_CARD_UNIFIED.width,
  skater: NHL25_CARD_UNIFIED.width,
  goalie: NHL25_CARD_UNIFIED.width,
};

const numberClass: Record<Nhl25JerseySize, string> = {
  compact: NHL25_CARD_UNIFIED.number,
  skater: NHL25_CARD_UNIFIED.number,
  goalie: NHL25_CARD_UNIFIED.number,
};

/** Číslo na exportním plakátu — jedna velikost (bez sm:), capture nemusí trefit breakpointy. */
const POSTER_EXPORT_NUMBER =
  "jersey-back-number-text jersey-back-number-text--woven text-[2.72rem] max-w-[92%] text-center leading-none";

/** Potisk pod horním okrajem — štítek pozice je nad fotkou, ne přes ni. */
const overlayTopClass: Record<Nhl25JerseySize, string> = {
  compact: "justify-start px-1.5 pt-[25%]",
  skater: "justify-start px-1.5 pt-[25%]",
  goalie: "justify-start px-1.5 pt-[25%]",
};

export interface Nhl25JerseyCardProps {
  player?: Player | null;
  positionLabel: string;
  size?: Nhl25JerseySize;
  /** `poster` = číslo jen na zádech, příjmení pod siluetou u vlajky (sdílecí plakát). */
  nameplateVariant?: "card" | "poster";
  /** Zvětšení jména+čísla na dresu (např. IG promo). */
  typographyScale?: number;
  isCaptain?: boolean;
  isAssistant?: boolean;
  isSelected?: boolean;
  className?: string;
  disableMotion?: boolean;
}

export function Nhl25JerseyCard({
  player,
  positionLabel,
  size = "skater",
  isCaptain = false,
  isAssistant = false,
  isSelected = false,
  className = "",
  disableMotion = false,
  nameplateVariant = "card",
  typographyScale = 1,
}: Nhl25JerseyCardProps) {
  const empty = !player;
  const kind: "skater" | "goalie" =
    empty ? (size === "goalie" ? "goalie" : "skater") : player.position === "G" ? "goalie" : "skater";
  const showAssistant = isAssistant && !empty && !isCaptain;
  const w = nameplateVariant === "poster" ? NHL25_POSTER_CARD.width : widthClass[size];
  const numStr = !empty ? jerseyNumberForPlayer(player) : "";
  const numCls = nameplateVariant === "poster" ? POSTER_EXPORT_NUMBER : numberClass[size];
  const ln = !empty ? jerseyNameOnJersey(player.name) : "";
  const npVar = nameplateVariant === "poster" ? "poster" : "card";
  const namePlate =
    !empty && nameplateVariant !== "poster" ? jerseyNameplateNameProps(ln, npVar) : null;
  const hemLines =
    !empty && nameplateVariant === "poster" && ln ? splitNameplateLines(ln) : [];

  const scaledNameplateStyle =
    namePlate && typographyScale !== 1
      ? {
          ...namePlate.style,
          fontSize: namePlate.style?.fontSize
            ? `calc(${namePlate.style.fontSize} * ${typographyScale})`
            : undefined,
        }
      : namePlate?.style;

  const scaledNumberStyle =
    typographyScale !== 1
      ? {
          ...jerseyNumberStyle(ln, npVar),
          fontSize:
            jerseyNumberStyle(ln, npVar)?.fontSize !== undefined
              ? `calc(${String(jerseyNumberStyle(ln, npVar).fontSize)} * ${typographyScale})`
              : undefined,
        }
      : jerseyNumberStyle(ln, npVar);

  const motionCls = disableMotion
    ? ""
    : "transition-[transform,box-shadow] duration-300 ease-out will-change-transform hover:-translate-y-0.5";

  return (
    <div
      className={`
        nhl25-jersey-card-root relative mx-auto min-w-0 w-full ${w} ${motionCls} ${className}
        ${
          isSelected
            ? "rounded-xl ring-2 ring-cyan-500 ring-offset-2 ring-offset-slate-100"
            : "rounded-xl"
        }
      `}
    >
      {isCaptain && !empty && (
        <span
          className={`
            absolute -right-0.5 -top-1 z-30 flex items-center justify-center rounded-full
            bg-gradient-to-br from-[#c8102e] to-[#8a0b20] font-display text-xs font-bold text-white
            shadow-md ring-2 ring-white
            h-6 w-6 text-[11px]
          `}
          aria-label="Kapitán"
        >
          C
        </span>
      )}

      {showAssistant && (
        <span
          className={`
            absolute -bottom-0.5 -left-0.5 z-30 flex items-center justify-center rounded-full
            bg-gradient-to-br from-[#003087] to-[#001a4d] font-display text-[10px] font-bold text-white
            shadow-md ring-2 ring-white/90
            h-5 w-5 text-[9px]
          `}
          aria-label="Asistent kapitána"
        >
          A
        </span>
      )}

      <div
        className={
          nameplateVariant === "poster"
            ? "flex flex-col gap-1 bg-transparent p-0 shadow-none ring-0 border-0"
            : `nhl25-jersey-card-frame nhl25-jersey-card-frame--filled flex flex-col gap-1 rounded-[11px] p-[5px]`
        }
      >
        <div className="flex min-h-[1rem] shrink-0 items-center justify-center px-0.5">
          <span
            className={`
              rounded border border-[#11457e]/45 bg-[#11457e] font-display font-bold uppercase tracking-[0.14em] text-white shadow-sm
              ${nameplateVariant === "poster" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-[10px]"}
            `}
          >
            {positionLabel}
          </span>
        </div>

        {nameplateVariant === "poster" ? (
          <div className="relative w-full bg-transparent">
            <div
              className={`relative w-full overflow-hidden rounded-md bg-transparent ${hemLines.length > 0 ? "rounded-b-none" : ""}`}
            >
              <div
                className={`relative aspect-[100/120] w-full bg-transparent ${empty ? "ring-1 ring-inset ring-white/20" : ""}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- stejný statický podklad jako v editoru */}
                <img
                  src={CZ_JERSEY_BACK_BLANK_SRC}
                  alt=""
                  width={400}
                  height={480}
                  decoding="async"
                  data-jersey-kind={kind}
                  className={`
                ${CZ_JERSEY_CARD_IMG_BASE} drop-shadow-[0_10px_28px_rgba(0,0,0,0.55)]
                ${empty ? "opacity-[0.55] saturate-[0.85]" : ""}
              `}
                />
                <div
                  className={`pointer-events-none absolute inset-0 z-[15] flex flex-col items-center justify-start px-2 pt-[44%]`}
                >
                  {numStr ? (
                    <span className={`${numCls}`} style={jerseyNumberStyle(".", "poster")}>
                      {numStr}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
            {hemLines.length > 0 ? (
              <div className="pointer-events-none flex w-full min-w-0 items-center justify-center gap-1.5 pt-1">
                <span className="nhl25-poster-jersey-hem-name flex min-w-0 max-w-full flex-col items-center justify-center gap-0.5 text-center leading-snug">
                  {hemLines.map((line, idx) => (
                    <span
                      key={idx}
                      className="block w-full text-center font-display text-[11px] font-black uppercase leading-[1.1] [overflow-wrap:anywhere] sm:text-[11.5px]"
                    >
                      {line}
                    </span>
                  ))}
                </span>
                <JerseyFlagCzInline
                  width={22}
                  height={14}
                  className="shrink-0 self-center opacity-95 drop-shadow-[0_1px_3px_rgba(0,0,0,0.55)]"
                />
              </div>
            ) : null}
          </div>
        ) : (
          <div className="squad-ice-surface-light relative w-full overflow-hidden rounded-[8px] shadow-inner">
            <div
              className={`squad-ice-surface-light relative aspect-[100/120] w-full ${empty ? "ring-1 ring-inset ring-slate-300/50" : ""}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- stejný statický podklad jako v editoru */}
              <img
                src={CZ_JERSEY_BACK_BLANK_SRC}
                alt=""
                width={400}
                height={480}
                decoding="async"
                data-jersey-kind={kind}
                className={`
                ${CZ_JERSEY_CARD_IMG_BASE} drop-shadow-[0_8px_20px_rgba(0,0,0,0.45)]
                ${empty ? "opacity-[0.62] saturate-[0.88]" : ""}
              `}
              />

              {!empty ? (
                <>
                  <JerseyCornerFlagCz />
                  <div
                    className={`pointer-events-none absolute inset-0 z-[15] flex flex-col items-center px-1 ${overlayTopClass[size]}`}
                  >
                    {namePlate && namePlate.lines.length > 0 ? (
                      <span className="flex w-full min-w-0 flex-col items-center gap-[0.08em] max-w-full">
                        {namePlate.lines.map((line, idx) => (
                          <span key={idx} className={namePlate.className} style={scaledNameplateStyle}>
                            {line}
                          </span>
                        ))}
                      </span>
                    ) : null}
                    {numStr ? (
                      <span className={`mt-px ${numCls}`} style={scaledNumberStyle}>
                        {numStr}
                      </span>
                    ) : null}
                  </div>
                </>
              ) : (
                <div
                  className="pointer-events-none absolute inset-0 z-[15] flex flex-col items-center justify-center px-1 pt-[24%] pb-[22%]"
                  aria-hidden
                >
                  <span className="max-w-[95%] text-center font-display text-[clamp(0.95rem,5vw,1.65rem)] font-black uppercase leading-none tracking-[0.06em] text-white/[0.38] drop-shadow-[0_2px_8px_rgba(0,0,0,0.75)]">
                    {positionLabel}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
