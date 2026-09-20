"use client";

import type { Player } from "@/types";
import { jerseyNameForPlayer } from "@/lib/jerseyDisplayName";
import { jerseyNameplateNameProps, jerseyNumberStyle } from "@/lib/jerseyNameplate";
import { jerseyNumberForPlayer } from "@/lib/jerseyNumber";
import {
  CZ_JERSEY_CARD_IMG_BASE,
  jerseyBlankSrcForPool,
  jerseyKitAttrForPool,
  jerseyNameModifierClassForPool,
  jerseyNumberModifierClassForPool,
  jerseyTeamAttrForPool,
} from "@/lib/jerseyPhotoAsset";
import { JerseyCornerFlagCz, JerseyFlagCzInline } from "@/components/sestava/JerseyCornerFlagCz";

export type Nhl25JerseySize = "compact" | "skater" | "goalie";

/** Jednotná velikost karty — útok, obrana, G, náhradníci (export / share). Jméno řeší `jerseyNameplateNameProps`. */
const NHL25_CARD_UNIFIED = {
  width: "max-w-[9.5rem] sm:max-w-[10rem] lg:max-w-[10.5rem]",
  number:
    "jersey-back-number-text text-[1.28rem] sm:text-[1.42rem] lg:text-[1.52rem] max-w-[92%] text-center",
} as const;

/** Plakát soupisky — silueta zůstane pod šířku buňky i při větších gap-x v mřížce. */
const NHL25_POSTER_CARD = {
  width: "max-w-[8.85rem] sm:max-w-[9.5rem] lg:max-w-[10.1rem]",
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
  "jersey-back-number-text jersey-back-number-text--woven text-[2.48rem] max-w-[92%] text-center leading-none";

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
  /** Duplicitní příjmení v soupisce → iniciála („M. Kovařčík“). */
  ambiguousJerseyLastKeys?: ReadonlySet<string> | null;
  /** Skryje štítek pozice (LW, G, …) — exportní plakát celé sestavy. */
  hidePositionLabel?: boolean;
  /** U varianty `poster` nezobrazí vlajku u jména pod dresem. */
  hidePosterFlag?: boolean;
  /** Stejná velikost jména na exportním plakátu (zmenší jen extrémně dlouhá). */
  posterUniformNames?: boolean;
  /** Pool editoru (repre_a, elh:HC Dynamo Pardubice, …) — volí PNG dresu. */
  poolKey?: string | null;
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
  ambiguousJerseyLastKeys,
  hidePositionLabel = false,
  hidePosterFlag = false,
  posterUniformNames = false,
  poolKey,
}: Nhl25JerseyCardProps) {
  const empty = !player;
  const kind: "skater" | "goalie" =
    empty ? (size === "goalie" ? "goalie" : "skater") : player.position === "G" ? "goalie" : "skater";
  const resolvedPoolKey = poolKey ?? player?.poolKey;
  const jerseySrc = jerseyBlankSrcForPool(resolvedPoolKey, kind);
  const jerseyKit = jerseyKitAttrForPool(resolvedPoolKey);
  const jerseyTeam = jerseyTeamAttrForPool(resolvedPoolKey);
  const numberMod = jerseyNumberModifierClassForPool(resolvedPoolKey);
  const nameMod = jerseyNameModifierClassForPool(resolvedPoolKey);
  const jerseyImageSize = { width: 400, height: 480 };
  const showAssistant = isAssistant && !empty && !isCaptain;
  const w = nameplateVariant === "poster" ? NHL25_POSTER_CARD.width : widthClass[size];
  const numStr = !empty ? jerseyNumberForPlayer(player) : "";
  const numCls = `${nameplateVariant === "poster" ? POSTER_EXPORT_NUMBER : numberClass[size]}${
    numberMod ? ` ${numberMod}` : ""
  }`;
  const ln = !empty ? jerseyNameForPlayer(player, ambiguousJerseyLastKeys) : "";
  const npVar = nameplateVariant === "poster" ? "poster" : "card";
  const namePlate =
    !empty && nameplateVariant !== "poster"
      ? jerseyNameplateNameProps(ln, npVar)
      : null;
  const hemPlate =
    !empty && nameplateVariant === "poster" && ln
      ? jerseyNameplateNameProps(ln, "poster", {
          uniformPosterSize: posterUniformNames,
          uniformFontPx: 18,
          leadershipExtraScore: isCaptain || showAssistant ? 2.4 : 0,
        })
      : null;

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

  const capBesideName =
    "ml-0.5 inline-flex h-[0.95em] min-w-[0.95em] shrink-0 items-center justify-center self-center rounded-[2px] bg-gradient-to-br from-[#c8102e] to-[#8a0b20] px-[0.12em] font-display text-[0.72em] font-black leading-none text-white shadow-sm ring-1 ring-white/70";
  const asstBesideName =
    "ml-0.5 inline-flex h-[0.95em] min-w-[0.95em] shrink-0 items-center justify-center self-center rounded-[2px] bg-gradient-to-br from-[#003087] to-[#001a4d] px-[0.12em] font-display text-[0.68em] font-black leading-none text-white shadow-sm ring-1 ring-white/60";

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
      data-jersey-team={jerseyTeam}
      data-jersey-kit={jerseyKit}
      data-jersey-kind={kind}
    >
      <div
        className={
          nameplateVariant === "poster"
            ? "flex flex-col gap-1 bg-transparent p-0 shadow-none ring-0 border-0"
            : `nhl25-jersey-card-frame nhl25-jersey-card-frame--filled flex flex-col gap-1 rounded-[11px] p-[5px]`
        }
      >
        <div className={`flex shrink-0 items-center justify-center px-0.5 ${hidePositionLabel ? "hidden" : "min-h-[1rem]"}`}>
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
              className={`relative w-full overflow-visible rounded-md bg-transparent ${hemPlate && hemPlate.lines.length > 0 ? "rounded-b-none" : ""}`}
            >
              <div
                className={`relative aspect-[100/120] w-full overflow-visible bg-transparent ${empty ? "ring-1 ring-inset ring-white/20" : ""}`}
              >
                <div className="poster-jersey-silhouette relative h-full w-full overflow-visible">
                  {/* eslint-disable-next-line @next/next/no-img-element -- stejný statický podklad jako v editoru */}
                  <img
                    src={jerseySrc}
                    alt=""
                    width={jerseyImageSize.width}
                    height={jerseyImageSize.height}
                    decoding="async"
                    data-jersey-kind={kind}
                    data-jersey-kit={jerseyKit}
                    data-jersey-team={jerseyTeam}
                    className={`
                ${CZ_JERSEY_CARD_IMG_BASE} drop-shadow-[0_10px_28px_rgba(0,0,0,0.55)]
                ${empty ? "opacity-[0.55] saturate-[0.85]" : ""}
              `}
                  />
                  <div className="jersey-print-overlay jersey-print-overlay--poster-number pointer-events-none absolute inset-0 z-[15] flex flex-col items-center justify-start px-2 pt-[40%]">
                    {numStr ? (
                      <span className={`${numCls}`} style={jerseyNumberStyle(ln || numStr, "poster")}>
                        {numStr}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
            {hemPlate && hemPlate.lines.length > 0 ? (
              <div className="pointer-events-none mx-auto flex w-max max-w-none items-center justify-center gap-0.5 overflow-visible px-0 pb-1.5 pt-1.5">
                <span className="nhl25-poster-jersey-hem-name flex w-max max-w-none flex-col items-center justify-center gap-0.5 overflow-visible text-center leading-snug">
                  {hemPlate.lines.map((line, idx) => (
                    <span key={idx} className={hemPlate.className} style={hemPlate.style}>
                      {line}
                    </span>
                  ))}
                </span>
                {isCaptain ? (
                  <span
                    className="inline-flex h-3 min-w-3 shrink-0 items-center justify-center self-center overflow-visible rounded-[2px] bg-gradient-to-br from-[#c8102e] to-[#8a0b20] px-px font-display text-[8px] font-black leading-none text-white ring-1 ring-white/75"
                    aria-label="Kapitán"
                  >
                    C
                  </span>
                ) : null}
                {showAssistant ? (
                  <span
                    className="inline-flex h-3 min-w-3 shrink-0 items-center justify-center self-center overflow-visible rounded-[2px] bg-gradient-to-br from-[#003087] to-[#001a4d] px-px font-display text-[8px] font-black leading-none text-white ring-1 ring-white/65"
                    aria-label="Asistent kapitána"
                  >
                    A
                  </span>
                ) : null}
                {!hidePosterFlag ? (
                  <JerseyFlagCzInline
                    width={28}
                    height={17}
                    className="shrink-0 self-center opacity-95 drop-shadow-[0_1px_3px_rgba(0,0,0,0.55)]"
                  />
                ) : null}
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
                src={jerseySrc}
                alt=""
                width={jerseyImageSize.width}
                height={jerseyImageSize.height}
                decoding="async"
                data-jersey-kind={kind}
                data-jersey-kit={jerseyKit}
                data-jersey-team={jerseyTeam}
                className={`
                ${CZ_JERSEY_CARD_IMG_BASE} drop-shadow-[0_8px_20px_rgba(0,0,0,0.45)]
                ${empty ? "opacity-[0.62] saturate-[0.88]" : ""}
              `}
              />

              {!empty ? (
                <>
                  {kind !== "goalie" ? <JerseyCornerFlagCz /> : null}
                  <div
                    className={`jersey-print-overlay pointer-events-none absolute inset-0 z-[15] flex flex-col items-center px-1 ${overlayTopClass[size]}`}
                  >
                    {namePlate && namePlate.lines.length > 0 ? (
                      <div className="flex w-full max-w-full items-center justify-center gap-x-0.5">
                        <span className="flex min-w-0 max-w-[calc(100%-1.1em)] flex-col items-center gap-[0.08em]">
                          {namePlate.lines.map((line, idx) => (
                            <span
                              key={idx}
                              className={`${namePlate.className}${nameMod ? ` ${nameMod}` : ""}`}
                              style={scaledNameplateStyle}
                            >
                              {line}
                            </span>
                          ))}
                        </span>
                        {isCaptain ? (
                          <span className={capBesideName} aria-label="Kapitán">
                            C
                          </span>
                        ) : null}
                        {showAssistant ? (
                          <span className={asstBesideName} aria-label="Asistent kapitána">
                            A
                          </span>
                        ) : null}
                      </div>
                    ) : (
                      <>
                        {isCaptain ? (
                          <span className={capBesideName} aria-label="Kapitán">
                            C
                          </span>
                        ) : null}
                        {showAssistant ? (
                          <span className={asstBesideName} aria-label="Asistent kapitána">
                            A
                          </span>
                        ) : null}
                      </>
                    )}
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
