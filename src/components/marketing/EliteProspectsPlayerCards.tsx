"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { Download } from "lucide-react";
import { CZ_JERSEY_BACK_BLANK_SRC, CZ_JERSEY_CARD_IMG_BASE } from "@/lib/jerseyPhotoAsset";
import { SHARE_POSTER_CAPTURE_PIXEL_RATIO } from "@/lib/sharePosterLayout";
import type { Player } from "@/types";

type EliteProspectsStats = {
  seasonLabel: string;
  rows: Array<{
    team: string;
    league: string;
    phase?: "RS" | "PO";
    gp?: number;
    g?: number;
    a?: number;
    pts?: number;
    pim?: number;
    plusMinus?: number;
  }>;
};

type PlayerCardModel = {
  player: Player;
  stats?: EliteProspectsStats;
};

type PlayerCardVariant = "clean" | "promo";

function fmt(v: number | null | undefined) {
  return v === null || v === undefined ? "—" : String(v);
}

/** +/- pro IG — kladné s „+“, záporné i nula bez zbytečných mezer */
function fmtPlusMinus(v: number | null | undefined) {
  if (v === null || v === undefined) return "—";
  if (!Number.isFinite(v)) return "—";
  if (v > 0) return `+${v}`;
  return String(v);
}

/** Jednotné české popisky fáze — vizuálně oddělené od řádku tým · liga (bez překryvu). */
function StatPhaseBanner(s: { team: string; league: string; phase?: "RS" | "PO"; dense?: boolean }) {
  const phaseLabel = s.phase === "PO" ? "Play off" : "Základní část";
  const subtitle = s.league?.trim() ? `${s.team.trim()} · ${s.league.trim()}` : s.team.trim();
  const pillText = s.dense ? "text-[15px] tracking-[0.12em]" : "text-[17px] tracking-[0.14em]";
  const subtitleText = s.dense ? "text-[21px] leading-snug" : "text-[24px] leading-snug";
  const pillPad = s.dense ? "px-3 py-1.5" : "px-4 py-2";
  const phaseWrap =
    s.phase === "PO"
      ? `rounded-full border-[3px] border-neutral-950 bg-gradient-to-r from-[#fff7d6] via-[#ffeaa7] to-[#fcd34d] ${pillPad} font-black uppercase text-neutral-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]`
      : `rounded-full border-[3px] border-neutral-950 bg-gradient-to-r from-[#dbeafe] via-[#bfdbfe] to-[#93c5fd] ${pillPad} font-black uppercase text-neutral-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]`;

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <span className={`inline-flex w-fit ${phaseWrap} ${pillText}`}>{phaseLabel}</span>
      <p
        className={`min-w-0 whitespace-nowrap font-black tracking-tight text-neutral-950 ${subtitleText}`}
        title={subtitle}
      >
        {subtitle}
      </p>
    </div>
  );
}

/** Dres bez rámečku — rámeček má až celá karta. */
function IgJerseyHero({ player, size = "normal" }: { player: Player; size?: "normal" | "compact" }) {
  const w = size === "compact" ? "w-[350px] max-w-[350px]" : "w-[400px] max-w-[400px]";
  return (
    <div
      className="relative mx-auto w-fit max-w-full"
      aria-label={player.name}
    >
      <div className={`relative mx-auto ${w} overflow-hidden rounded-[18px]`}>
        <div className="relative aspect-[100/120] w-full bg-transparent">
          {/* eslint-disable-next-line @next/next/no-img-element -- static jersey */}
          <img
            src={CZ_JERSEY_BACK_BLANK_SRC}
            alt=""
            width={560}
            height={672}
            decoding="async"
            className={`${CZ_JERSEY_CARD_IMG_BASE} drop-shadow-[0_6px_18px_rgba(0,0,0,0.35)]`}
          />
        </div>
      </div>
    </div>
  );
}

function StatsTable({ s }: { s: EliteProspectsStats }) {
  /** Více řádků (RS+PO / více klubů) = menší typografie, aby se nic neťalo přes okraje na 1080px. */
  const dense = s.rows.length >= 2;
  const headers = ["GP", "G", "A", "B", "PIM", "+/-"] as const;
  const headSz = dense ? "text-[22px]" : "text-[26px]";
  const numSz = dense ? "text-[52px] mt-1.5" : "text-[62px] mt-2";
  const panelPad = dense ? "p-5" : "p-6";
  const blockGap = dense ? "space-y-4" : "space-y-5";
  const rowGap = dense ? "gap-2" : "gap-2.5";

  return (
    <div
      className={`w-full rounded-[32px] border-[5px] border-neutral-950 bg-gradient-to-b from-white via-white to-neutral-50 ${panelPad} shadow-[0_20px_56px_rgba(0,0,0,0.14),inset_0_1px_0_rgba(255,255,255,0.9)]`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div
          className={`font-black uppercase tracking-[0.12em] text-neutral-950 ${dense ? "text-[40px] leading-none" : "text-[48px] leading-none"}`}
        >
          Statistiky
        </div>
        <div
          className={`shrink-0 rounded-full border-[3px] border-neutral-950 bg-gradient-to-r from-neutral-900 to-neutral-950 px-5 py-2.5 text-white shadow-[0_12px_28px_rgba(0,0,0,0.28)] sm:px-7 sm:py-3 ${
            dense ? "text-[28px]" : "text-[34px]"
          } font-black tracking-[0.06em]`}
        >
          <span className="font-semibold normal-case text-white/85">Sezóna </span>
          <span className="uppercase tracking-[0.14em]">{s.seasonLabel}</span>
        </div>
      </div>

      <div className={`mt-5 ${blockGap}`}>
        {s.rows.map((r, idx) => (
          <div key={idx} className="space-y-3">
            <StatPhaseBanner team={r.team} league={r.league} phase={r.phase} dense={dense} />
            <div className={`grid grid-cols-6 ${rowGap}`}>
              {headers.map((h) => (
                <div
                  key={h}
                  className="flex min-h-[118px] flex-col justify-between rounded-2xl border-[3px] border-neutral-950 bg-white px-1.5 py-2 text-center shadow-[inset_0_2px_0_rgba(255,255,255,0.85),0_4px_0_rgba(0,0,0,0.06)] sm:min-h-[128px] sm:px-2 sm:py-2.5"
                >
                  <div className={`font-black uppercase tracking-[0.14em] text-neutral-600 ${headSz}`}>{h}</div>
                  <div
                    className={`font-display font-black tabular-nums leading-none tracking-tight text-neutral-950 drop-shadow-[0_1px_0_rgba(255,255,255,0.8)] ${numSz}`}
                  >
                    {h === "GP"
                      ? fmt(r.gp)
                      : h === "G"
                        ? fmt(r.g)
                        : h === "A"
                          ? fmt(r.a)
                          : h === "B"
                            ? fmt(r.pts)
                            : h === "PIM"
                              ? fmt(r.pim)
                              : fmtPlusMinus(r.plusMinus)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function prettyText(s: string | null | undefined): string {
  const t = String(s ?? "").trim();
  if (!t) return "";
  if (t === "—") return "";
  return t;
}

function formatClubLeague(player: Player): string {
  const club = prettyText(player.club);
  const league = prettyText(player.league);
  if (club && league) return `${club} · ${league}`;
  return club || league || "";
}

/** Jméno vždy na jeden řádek (IG 1080px) — podle délky zmenšíme písmo, aby se nic nelámalo ani neořezávalo. */
function promoCardNameFontClass(fullName: string): string {
  const n = prettyText(fullName).length;
  if (n >= 32) return "text-[36px]";
  if (n >= 28) return "text-[42px]";
  if (n >= 24) return "text-[48px]";
  if (n >= 21) return "text-[54px]";
  if (n >= 18) return "text-[60px]";
  if (n >= 16) return "text-[68px]";
  if (n >= 14) return "text-[76px]";
  if (n >= 12) return "text-[84px]";
  return "text-[92px]";
}

const PlayerIgCard = forwardRef<HTMLDivElement, { m: PlayerCardModel; variant?: PlayerCardVariant }>(
  function PlayerIgCard(props, ref) {
    const { m, variant = "clean" } = props;
  const s = m.stats;
  /** Od 2 řádků statistik už zmenšit dres — jinak se rámy s tabulkou vizuálně „lepí“. */
  const denseStats = (s?.rows.length ?? 0) >= 2;
  const topText =
    variant === "promo"
      ? "text-white [text-shadow:0_3px_0_rgba(0,0,0,0.80),0_14px_40px_rgba(0,0,0,0.35)]"
      : "text-black";
  const clubLeague = formatClubLeague(m.player);
  const nameFont = promoCardNameFontClass(m.player.name);
  const clubLen = clubLeague.length;
  const clubFont =
    clubLen >= 42 ? "text-[30px] leading-tight" : clubLen >= 30 ? "text-[34px] leading-tight" : clubLen >= 22 ? "text-[38px] leading-tight" : "text-[40px] leading-tight";
    return (
    <div
      ref={ref}
      className={`relative h-[1350px] w-[1080px] overflow-hidden rounded-[44px] border-[6px] border-neutral-950 shadow-[0_28px_90px_rgba(0,0,0,0.18)] ring-1 ring-black/10 ${
        variant === "promo" ? "bg-white" : "bg-white"
      }`}
    >
      {variant === "promo" ? (
        <div className="absolute inset-0" aria-hidden>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_15%,rgba(56,189,248,0.55),transparent_55%),radial-gradient(ellipse_at_80%_20%,rgba(200,16,46,0.55),transparent_55%),radial-gradient(ellipse_at_50%_85%,rgba(0,48,135,0.45),transparent_60%),linear-gradient(180deg,#0b1220_0%,#05080f_100%)]" />
          <div className="absolute inset-0 opacity-[0.22] [background-image:linear-gradient(135deg,rgba(255,255,255,0.20)_0%,rgba(255,255,255,0)_48%,rgba(255,255,255,0.16)_100%)]" />
          <div className="absolute inset-0 opacity-[0.10] [background-image:radial-gradient(rgba(255,255,255,0.55)_1px,transparent_1.6px)] [background-size:18px_18px]" />
        </div>
      ) : null}
      <div
        className="pointer-events-none absolute inset-0 rounded-[40px] ring-2 ring-white/65"
        aria-hidden
      />
      <div className="relative z-10 flex h-full min-h-0 flex-col px-11 pb-10 pt-9 sm:px-12">
        <div className="flex items-end">
          <div className="min-w-0 max-w-full flex-1 overflow-hidden pr-2">
            <p
              className={`font-display ${nameFont} max-w-full font-black leading-none tracking-tight whitespace-nowrap text-left ${topText}`}
              title={prettyText(m.player.name)}
            >
              {m.player.name}
            </p>
          </div>
        </div>

        <div className="mt-6 flex min-h-0 flex-1 flex-col overflow-visible">
          <div
            className={`flex min-h-0 min-w-0 flex-1 items-center justify-center ${denseStats ? "pb-6 pt-4" : "pb-10 pt-6"}`}
          >
            <IgJerseyHero player={m.player} size={denseStats ? "compact" : "normal"} />
          </div>
          {clubLeague ? (
            <div className={`flex w-full items-center justify-center px-4 ${denseStats ? "mb-4 mt-1" : "mb-5 mt-2"}`}>
              <div
                className={`max-w-[min(100%,940px)] rounded-full border-[3px] border-neutral-950 px-5 py-2.5 text-center font-display ${clubFont} font-black tracking-tight whitespace-nowrap ${
                  variant === "promo"
                    ? "bg-white/14 text-white shadow-[0_10px_28px_rgba(0,0,0,0.35)] [text-shadow:0_2px_0_rgba(0,0,0,0.75)]"
                    : "bg-white text-neutral-950 shadow-[0_8px_22px_rgba(0,0,0,0.08)]"
                }`}
                title={clubLeague}
              >
                {clubLeague}
              </div>
            </div>
          ) : null}
          <div className={`w-full shrink-0 pb-1 ${denseStats ? "mt-2" : "mt-4"}`}>
            {s ? (
              <StatsTable s={s} />
            ) : (
              <div
                className="w-full rounded-[28px] border-[5px] border-neutral-950 bg-white p-10 text-center text-[30px] font-black text-black shadow-[0_16px_44px_rgba(0,0,0,0.10)]"
              >
                Doplňte statistiky…
              </div>
            )}
          </div>
        </div>

        <div className="mt-auto flex w-full items-center justify-end pr-1 pt-3 sm:pr-4">
          <a
            href="https://hokejlineup.cz"
            target="_blank"
            rel="noopener noreferrer"
            className={`font-display text-[32px] font-black tracking-[0.06em] underline underline-offset-[10px] decoration-[3px] transition hover:opacity-95 sm:text-[34px] ${
              variant === "promo"
                ? "text-white decoration-white/55 [text-shadow:0_3px_0_rgba(0,0,0,0.82)]"
                : "text-neutral-950 decoration-neutral-950/45"
            }`}
          >
            hokejlineup.cz
          </a>
        </div>
      </div>
    </div>
    );
  }
);

PlayerIgCard.displayName = "PlayerIgCard";

const MANUAL_STATS_BY_ID: Partial<Record<string, EliteProspectsStats>> = {
  /** Promo karty — řádky mají jen klub + ligu; fáze je vždy „Základní část“ / „Play off“. */
  "cervenka-roman": {
    seasonLabel: "2025-26",
    rows: [
      {
        team: "HC Dynamo Pardubice",
        league: "Extraliga",
        phase: "RS",
        gp: 43,
        g: 19,
        a: 41,
        pts: 60,
        pim: 28,
        plusMinus: 26,
      },
      {
        team: "HC Dynamo Pardubice",
        league: "Extraliga",
        phase: "PO",
        gp: 17,
        g: 14,
        a: 11,
        pts: 25,
        pim: 4,
        plusMinus: 10,
      },
    ],
  },
  "sedlak-lukas": {
    seasonLabel: "2025-26",
    rows: [
      {
        team: "HC Dynamo Pardubice",
        league: "Extraliga",
        phase: "RS",
        gp: 49,
        g: 17,
        a: 35,
        pts: 52,
        plusMinus: 24,
        pim: 31,
      },
      {
        team: "HC Dynamo Pardubice",
        league: "Extraliga",
        phase: "PO",
        gp: 17,
        g: 8,
        a: 14,
        pts: 22,
        plusMinus: 13,
        pim: 14,
      },
    ],
  },
  sikora: {
    seasonLabel: "2025-26",
    rows: [
      {
        team: "HC Oceláři Třinec",
        league: "Extraliga",
        phase: "RS",
        gp: 24,
        g: 3,
        a: 6,
        pts: 9,
        pim: 8,
        plusMinus: -6,
      },
      {
        team: "HC Oceláři Třinec",
        league: "Extraliga",
        phase: "PO",
        gp: 10,
        g: 1,
        a: 1,
        pts: 2,
        pim: 11,
        plusMinus: -2,
      },
    ],
  },
  "tomasek-david": {
    seasonLabel: "2025-26",
    rows: [
      { team: "Edmonton Oilers", league: "NHL", phase: "RS", gp: 22, g: 3, a: 2, pts: 5, pim: 10, plusMinus: -6 },
      { team: "Färjestad BK", league: "SHL", phase: "RS", gp: 19, g: 8, a: 11, pts: 19, pim: 10, plusMinus: 1 },
    ],
  },
  melovsky: {
    seasonLabel: "2025-26",
    rows: [{ team: "Utica Comets", league: "AHL", phase: "RS", gp: 55, g: 10, a: 16, pts: 26, pim: 31, plusMinus: -2 }],
  },
  cernoch: {
    seasonLabel: "2025-26",
    rows: [
      { team: "HC Energie Karlovy Vary", league: "Extraliga", phase: "RS", gp: 52, g: 15, a: 25, pts: 40, pim: 57, plusMinus: -2 },
      { team: "HC Energie Karlovy Vary", league: "Extraliga", phase: "PO", gp: 15, g: 3, a: 6, pts: 9, pim: 10, plusMinus: -3 },
    ],
  },
  jasek: {
    seasonLabel: "2025-26",
    rows: [
      { team: "Ilves", league: "Liiga", phase: "RS", gp: 56, g: 10, a: 40, pts: 50, pim: 45, plusMinus: 25 },
      { team: "Ilves", league: "Liiga", phase: "PO", gp: 13, g: 2, a: 7, pts: 9, pim: 4, plusMinus: 6 },
    ],
  },
  "kovarcik-michal": {
    seasonLabel: "2025-26",
    rows: [
      { team: "HC Oceláři Třinec", league: "Extraliga", phase: "RS", gp: 52, g: 12, a: 19, pts: 31, pim: 14, plusMinus: 16 },
      { team: "HC Oceláři Třinec", league: "Extraliga", phase: "PO", gp: 19, g: 5, a: 12, pts: 17, pim: 12, plusMinus: 8 },
    ],
  },
  zacha: {
    seasonLabel: "2025-26",
    rows: [
      { team: "Boston Bruins", league: "NHL", phase: "RS", gp: 78, g: 30, a: 35, pts: 65, pim: 28, plusMinus: 4 },
      { team: "Boston Bruins", league: "NHL", phase: "PO", gp: 6, g: 1, a: 2, pts: 3, pim: 2, plusMinus: -7 },
    ],
  },
  hertl: {
    seasonLabel: "2025-26",
    rows: [
      { team: "Vegas Golden Knights", league: "NHL", phase: "RS", gp: 82, g: 24, a: 34, pts: 58, pim: 39, plusMinus: -17 },
      { team: "Vegas Golden Knights", league: "NHL", phase: "PO", gp: 7, g: 0, a: 2, pts: 2, pim: 0, plusMinus: -3 },
    ],
  },
  "faksa-radek": {
    seasonLabel: "2025-26",
    rows: [
      { team: "Dallas Stars", league: "NHL", phase: "RS", gp: 58, g: 2, a: 15, pts: 17, pim: 18, plusMinus: 2 },
      { team: "Dallas Stars", league: "NHL", phase: "PO", gp: 6, g: 0, a: 0, pts: 0, pim: 4, plusMinus: -3 },
    ],
  },
  "klapka-adam": {
    seasonLabel: "2025-26",
    rows: [
      {
        team: "Calgary Flames",
        league: "NHL",
        phase: "RS",
        gp: 79,
        g: 6,
        a: 12,
        pts: 18,
        pim: 112,
        plusMinus: -12,
      },
    ],
  },
  "vozenilek-daniel": {
    seasonLabel: "2025-26",
    rows: [
      {
        team: "EV Zug",
        league: "NL",
        phase: "RS",
        gp: 36,
        g: 4,
        a: 9,
        pts: 13,
        pim: 51,
        plusMinus: -5,
      },
      {
        team: "EV Zug",
        league: "NL",
        phase: "PO",
        gp: 5,
        g: 0,
        a: 2,
        pts: 2,
        pim: 4,
        plusMinus: 2,
      },
    ],
  },
  "blumel-matej": {
    seasonLabel: "2025-26",
    rows: [
      {
        team: "Providence Bruins",
        league: "AHL",
        phase: "RS",
        gp: 58,
        g: 21,
        a: 31,
        pts: 52,
        pim: 20,
        plusMinus: 23,
      },
      {
        team: "Providence Bruins",
        league: "AHL",
        phase: "PO",
        gp: 4,
        g: 2,
        a: 0,
        pts: 2,
        pim: 0,
        plusMinus: -1,
      },
    ],
  },
  "beranek-ondrej": {
    seasonLabel: "2025-26",
    rows: [
      {
        team: "HC Energie Karlovy Vary",
        league: "Extraliga",
        phase: "RS",
        gp: 45,
        g: 18,
        a: 14,
        pts: 32,
        pim: 22,
        plusMinus: -5,
      },
      {
        team: "HC Energie Karlovy Vary",
        league: "Extraliga",
        phase: "PO",
        gp: 9,
        g: 4,
        a: 2,
        pts: 6,
        pim: 0,
        plusMinus: -1,
      },
    ],
  },
  "kubalik-dominik": {
    seasonLabel: "2025-26",
    rows: [
      {
        team: "EV Zug",
        league: "NL",
        phase: "RS",
        gp: 49,
        g: 22,
        a: 17,
        pts: 39,
        pim: 22,
        plusMinus: -7,
      },
      {
        team: "EV Zug",
        league: "NL",
        phase: "PO",
        gp: 4,
        g: 1,
        a: 0,
        pts: 1,
        pim: 0,
        plusMinus: -3,
      },
    ],
  },
  "chmelar-jaroslav": {
    seasonLabel: "2025-26",
    rows: [
      {
        team: "New York Rangers",
        league: "NHL",
        phase: "RS",
        gp: 28,
        g: 4,
        a: 2,
        pts: 6,
        pim: 11,
        plusMinus: -2,
      },
      {
        team: "Hartford Wolf Pack",
        league: "AHL",
        phase: "RS",
        gp: 46,
        g: 8,
        a: 17,
        pts: 25,
        pim: 42,
        plusMinus: -7,
      },
    ],
  },
  "kaut-martin": {
    seasonLabel: "2025-26",
    rows: [
      {
        team: "HC Dynamo Pardubice",
        league: "Extraliga",
        phase: "RS",
        gp: 17,
        g: 5,
        a: 5,
        pts: 10,
        pim: 0,
        plusMinus: 3,
      },
      {
        team: "HC Dynamo Pardubice",
        league: "Extraliga",
        phase: "PO",
        gp: 16,
        g: 2,
        a: 6,
        pts: 8,
        pim: 4,
        plusMinus: 3,
      },
    ],
  },
  "flek-jakub": {
    seasonLabel: "2025-26",
    rows: [
      {
        team: "HC Kometa Brno",
        league: "Extraliga",
        phase: "RS",
        gp: 50,
        g: 24,
        a: 20,
        pts: 44,
        pim: 4,
        plusMinus: -1,
      },
      {
        team: "HC Kometa Brno",
        league: "Extraliga",
        phase: "PO",
        gp: 8,
        g: 2,
        a: 3,
        pts: 5,
        pim: 2,
        plusMinus: 0,
      },
    ],
  },
  "mandat-jan": {
    seasonLabel: "2025-26",
    rows: [
      {
        team: "HC Dynamo Pardubice",
        league: "Extraliga",
        phase: "RS",
        gp: 52,
        g: 9,
        a: 14,
        pts: 23,
        pim: 33,
        plusMinus: 15,
      },
      {
        team: "HC Dynamo Pardubice",
        league: "Extraliga",
        phase: "PO",
        gp: 17,
        g: 5,
        a: 4,
        pts: 9,
        pim: 6,
        plusMinus: 8,
      },
    ],
  },
};

const PLAYERS: Array<{ player: Player }> = [
  {
    player: {
      id: "cervenka-roman",
      name: "Roman Červenka",
      position: "F",
      role: "RW",
      club: "—",
      league: "—",
      jerseyNumber: 10,
      pick_rate: 0,
    },
  },
  {
    player: {
      id: "sedlak-lukas",
      name: "Lukáš Sedlák",
      position: "F",
      role: "C",
      club: "—",
      league: "—",
      jerseyNumber: 26,
      pick_rate: 0,
    },
  },
  {
    player: {
      id: "melovsky",
      name: "Matyáš Melovský",
      position: "F",
      role: "LW",
      club: "—",
      league: "—",
      jerseyNumber: 18,
      pick_rate: 0,
    },
  },
  {
    player: {
      id: "cernoch",
      name: "Jiří Černoch",
      position: "F",
      role: "RW",
      club: "—",
      league: "—",
      jerseyNumber: 23,
      pick_rate: 0,
    },
  },
  {
    player: {
      id: "sikora",
      name: "Petr Sikora",
      position: "F",
      role: "LW",
      club: "—",
      league: "—",
      jerseyNumber: 11,
      pick_rate: 0,
    },
  },
  {
    player: {
      id: "tomasek-david",
      name: "David Tomášek",
      position: "F",
      role: "C",
      club: "—",
      league: "—",
      jerseyNumber: 86,
      pick_rate: 0,
    },
  },
  {
    player: {
      id: "jasek",
      name: "Jašek",
      position: "F",
      role: "C",
      club: "—",
      league: "—",
      jerseyNumber: 19,
      pick_rate: 0,
    },
  },
  {
    player: {
      id: "kovarcik-michal",
      name: "Michal Kovařčík",
      position: "F",
      role: "C",
      club: "—",
      league: "—",
      jerseyNumber: 90,
      pick_rate: 0,
    },
  },
  {
    player: {
      id: "filip",
      name: "Filip",
      position: "F",
      role: "RW",
      club: "—",
      league: "—",
      jerseyNumber: 14,
      pick_rate: 0,
    },
  },
  {
    player: {
      id: "zacha",
      name: "Pavel Zacha",
      position: "F",
      role: "C",
      club: "—",
      league: "—",
      jerseyNumber: 37,
      pick_rate: 0,
    },
  },
  {
    player: {
      id: "hertl",
      name: "Tomáš Hertl",
      position: "F",
      role: "C",
      club: "—",
      league: "—",
      jerseyNumber: 48,
      pick_rate: 0,
    },
  },
  {
    player: {
      id: "faksa-radek",
      name: "Radek Faksa",
      position: "F",
      role: "C",
      club: "Dallas Stars",
      league: "NHL",
      jerseyNumber: 12,
      pick_rate: 0,
    },
  },
  {
    player: {
      id: "klapka-adam",
      name: "Adam Klapka",
      position: "F",
      role: "RW",
      club: "—",
      league: "—",
      jerseyNumber: 43,
      pick_rate: 0,
    },
  },
  {
    player: {
      id: "vozenilek-daniel",
      name: "Daniel Voženílek",
      position: "F",
      role: "RW",
      club: "—",
      league: "—",
      jerseyNumber: 95,
      pick_rate: 0,
    },
  },
  {
    player: {
      id: "blumel-matej",
      name: "Matěj Blümel",
      position: "F",
      role: "LW",
      club: "—",
      league: "—",
      jerseyNumber: 95,
      pick_rate: 0,
    },
  },
  {
    player: {
      id: "beranek-ondrej",
      name: "Ondřej Beránek",
      position: "F",
      role: "RW",
      club: "—",
      league: "—",
      jerseyNumber: 8,
      pick_rate: 0,
    },
  },
  {
    player: {
      id: "kubalik-dominik",
      name: "Dominik Kubalík",
      position: "F",
      role: "LW",
      club: "—",
      league: "—",
      jerseyNumber: 81,
      pick_rate: 0,
    },
  },
  {
    player: {
      id: "chmelar-jaroslav",
      name: "Jaroslav Chmelař",
      position: "F",
      role: "RW",
      club: "New York Rangers",
      league: "NHL",
      jerseyNumber: 49,
      pick_rate: 0,
    },
  },
  {
    player: {
      id: "kaut-martin",
      name: "Martin Kaut",
      position: "F",
      role: "RW",
      club: "HC Dynamo Pardubice",
      league: "Extraliga",
      jerseyNumber: 61,
      pick_rate: 0,
    },
  },
  {
    player: {
      id: "flek-jakub",
      name: "Jakub Flek",
      position: "F",
      role: "LW/RW",
      club: "HC Kometa Brno",
      league: "Extraliga",
      jerseyNumber: 19,
      pick_rate: 0,
    },
  },
  {
    player: {
      id: "mandat-jan",
      name: "Jan Mandát",
      position: "F",
      role: "RW",
      club: "HC Dynamo Pardubice",
      league: "Extraliga",
      jerseyNumber: 89,
      pick_rate: 0,
    },
  },
];

function useScaleToFit(targetW: number, targetH: number) {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const apply = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const s = Math.min(vw / targetW, (vh - 24) / targetH, 1);
      setScale(Number.isFinite(s) && s > 0 ? s : 1);
    };
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, [targetW, targetH]);
  return scale;
}

function normName(s: string) {
  try {
    return String(s ?? "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  } catch {
    return String(s ?? "")
      .toLowerCase()
      .trim();
  }
}

function lastNameKey(fullName: string): string {
  const n = normName(fullName);
  if (!n) return "";
  const parts = n.split(" ").filter(Boolean);
  return parts[parts.length - 1] ?? "";
}

function guessDbPlayer(db: Player[], promo: Player): Player | null {
  const promoNorm = normName(promo.name);
  const promoLast = lastNameKey(promo.name);
  const promoHasSpace = promoNorm.includes(" ");
  const promoNo = promo.jerseyNumber ?? null;

  // 1) exact full-name match
  const exact = db.find((p) => normName(p.name) === promoNorm);
  if (exact) return exact;

  // 2) full name contains (handles "Pastrňák" -> "David Pastrňák", etc.)
  if (promoNorm) {
    const incl = db.find((p) => normName(p.name).includes(promoNorm));
    if (incl) return incl;
  }

  // 3) if promo has only one word, match by last name (+ jerseyNumber tiebreak)
  if (!promoHasSpace && promoLast) {
    const candidates = db.filter((p) => lastNameKey(p.name) === promoLast);
    if (candidates.length === 1) return candidates[0] ?? null;
    if (candidates.length > 1 && promoNo !== null) {
      const withNo = candidates.find((p) => (p.jerseyNumber ?? null) === promoNo);
      if (withNo) return withNo;
    }
    return candidates[0] ?? null;
  }

  return null;
}

function EliteProspectsPlayerCardsContent({ initialPlayerId }: { initialPlayerId: string }) {
  const cardCaptureCleanRef = useRef<HTMLDivElement>(null);
  const cardCapturePromoRef = useRef<HTMLDivElement>(null);
  const [pngBusy, setPngBusy] = useState(false);
  const router = useRouter();
  const pathname = usePathname() || "/promo/hraci";
  const [idParam, setIdParam] = useState(() => initialPlayerId.trim());
  const scale = useScaleToFit(1080, 1350);
  const uiText = "text-neutral-950";
  const uiTextSoft = "text-neutral-700";

  /** Statický shell nemusí mít správné `?p=` — před prvním malováním sjednotit s adresní řádkem. */
  useLayoutEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("p")?.trim() ?? "";
    if (fromUrl) setIdParam(fromUrl);
  }, []);

  useEffect(() => {
    const onPop = () => {
      const p = new URLSearchParams(window.location.search).get("p")?.trim() ?? "";
      setIdParam(p);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const base = useMemo(() => PLAYERS, []);
  const selected = useMemo(() => {
    if (!idParam) return base[0] ?? null;
    return base.find((x) => x.player.id === idParam) ?? base[0] ?? null;
  }, [base, idParam]);

  const ids = useMemo(() => base.map((x) => x.player.id), [base]);
  const activeIdx = selected ? Math.max(0, ids.indexOf(selected.player.id)) : 0;
  const setPlayerId = useCallback(
    (id: string) => {
      const nextId = id.trim();
      setIdParam(nextId);
      const q = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
      if (nextId) q.set("p", nextId);
      else q.delete("p");
      const next = q.toString();
      router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
    },
    [pathname, router]
  );

  const downloadCard = useCallback(async (variant: PlayerCardVariant) => {
    const el = variant === "promo" ? cardCapturePromoRef.current : cardCaptureCleanRef.current;
    if (!el) return;
    setPngBusy(true);
    try {
      const { captureElementToCanvas, canvasToPngDataUrl, downloadDataUrl } = await import(
        "@/lib/captureSharePoster"
      );
      await document.fonts.ready.catch(() => undefined);
      await new Promise<void>((r) =>
        requestAnimationFrame(() => requestAnimationFrame(() => r()))
      );
      const canvas = await captureElementToCanvas(el, {
        scale: SHARE_POSTER_CAPTURE_PIXEL_RATIO,
        backgroundColor: null,
      });
      const slug = selected?.player.id ?? "hrac";
      downloadDataUrl(
        canvasToPngDataUrl(canvas),
        `ms2026-promo-hrac-${slug}${variant === "promo" ? "-promo" : ""}.png`
      );
    } catch (err) {
      console.error(err);
      window.alert("Generování PNG se nepovedlo. Zkus to prosím znovu.");
    } finally {
      setPngBusy(false);
    }
  }, [selected?.player.id]);

  const [dbPlayers, setDbPlayers] = useState<Player[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        const r = await fetch("/api/players", { cache: "no-store" });
        if (!r.ok) {
          if (!cancelled) setDbPlayers([]);
          return;
        }
        const data: unknown = await r.json();
        if (cancelled) return;
        if (!Array.isArray(data)) {
          if (!cancelled) setDbPlayers([]);
          return;
        }
        const parsed: Player[] = [];
        for (const row of data) {
          if (!row || typeof row !== "object") continue;
          const x = row as Record<string, unknown>;
          if (typeof x.id !== "string") continue;
          if (typeof x.name !== "string") continue;
          if (typeof x.position !== "string") continue;
          if (typeof x.club !== "string") continue;
          if (typeof x.league !== "string") continue;
          parsed.push(x as unknown as Player);
        }
        if (!cancelled) setDbPlayers(parsed);
      } catch {
        if (!cancelled) setDbPlayers([]);
      }
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!selected) return null;

  const fromDb = dbPlayers && dbPlayers.length ? guessDbPlayer(dbPlayers, selected.player) : null;

  const mergedPlayer: Player = {
    ...selected.player,
    ...(fromDb
      ? {
          name: fromDb.name?.trim() || selected.player.name,
          club: fromDb.club,
          league: fromDb.league,
          jerseyNumber: selected.player.jerseyNumber ?? fromDb.jerseyNumber ?? null,
          imageUrl: fromDb.imageUrl ?? selected.player.imageUrl ?? null,
        }
      : {}),
  };

  const model: PlayerCardModel = {
    player: mergedPlayer,
    stats: (() => {
      const s = MANUAL_STATS_BY_ID[selected.player.id];
      if (!s) return undefined;
      return {
        ...s,
        rows: s.rows.map((r) => ({
          ...r,
          team: r.team?.trim() ? r.team : mergedPlayer.club,
          league:
            r.league === ""
              ? ""
              : r.league?.trim()
                ? r.league
                : mergedPlayer.league,
        })),
      };
    })(),
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full flex-col items-center justify-start gap-3 px-3 py-3">
      <div className="w-full max-w-6xl">
        <div className="flex flex-col items-stretch justify-between gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:flex-row sm:flex-wrap sm:items-center">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setPlayerId(ids[(activeIdx - 1 + ids.length) % ids.length] ?? ids[0] ?? "")}
              className={`inline-flex items-center justify-center rounded-xl border border-neutral-950/15 bg-white px-3 py-2 text-sm font-semibold hover:bg-neutral-50 ${uiText}`}
            >
              ← Předchozí
            </button>
            <button
              type="button"
              onClick={() => setPlayerId(ids[(activeIdx + 1) % ids.length] ?? ids[0] ?? "")}
              className={`inline-flex items-center justify-center rounded-xl border border-neutral-950/15 bg-white px-3 py-2 text-sm font-semibold hover:bg-neutral-50 ${uiText}`}
            >
              Další →
            </button>
          </div>

          <div className="flex items-center gap-2">
            <label
              className={`flex min-w-0 flex-1 items-center gap-2 text-xs font-semibold sm:hidden ${uiTextSoft}`}
            >
              Hráč
              <select
                className={`min-w-0 flex-1 rounded-xl border border-neutral-950/15 bg-white px-3 py-2 text-sm font-semibold ${uiText}`}
                value={selected.player.id}
                onChange={(e) => setPlayerId(e.target.value)}
              >
                {base.map((x) => (
                  <option key={x.player.id} value={x.player.id}>
                    {x.player.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="hidden max-w-[46rem] flex-1 flex-wrap items-center justify-end gap-2 sm:flex">
              {base.map((x) => {
                const on = x.player.id === selected.player.id;
                return (
                  <button
                    key={x.player.id}
                    type="button"
                    onClick={() => setPlayerId(x.player.id)}
                    className={`rounded-full border px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] transition ${
                      on
                        ? "border-neutral-950/40 bg-neutral-950 text-white"
                        : `border-neutral-950/10 bg-white hover:bg-neutral-50 ${uiTextSoft}`
                    }`}
                    title={x.player.name}
                  >
                    {x.player.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex w-full flex-col gap-2 sm:ml-auto sm:w-auto sm:flex-row">
            <button
              type="button"
              disabled={pngBusy}
              onClick={() => void downloadCard("promo")}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-950/20 bg-neutral-950 px-4 py-2.5 text-sm font-black text-white shadow-[0_16px_44px_rgba(0,0,0,0.18)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              <Download className="h-4 w-4 shrink-0" aria-hidden />
              {pngBusy ? "Generuji…" : "Stáhnout PNG (promo pozadí)"}
            </button>
            <button
              type="button"
              disabled={pngBusy}
              onClick={() => void downloadCard("clean")}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-950/25 bg-white px-4 py-2.5 text-sm font-black text-neutral-950 shadow-[inset_0_1px_0_rgba(0,0,0,0.06)] transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              <Download className="h-4 w-4 shrink-0" aria-hidden />
              {pngBusy ? "Generuji…" : "Stáhnout PNG (bez pozadí)"}
            </button>
          </div>
        </div>
      </div>

      <div style={{ transform: `scale(${scale})`, transformOrigin: "top center" }}>
        <PlayerIgCard ref={cardCaptureCleanRef} m={model} variant="clean" />
        <div className="pointer-events-none absolute -left-[99999px] top-0 opacity-0" aria-hidden>
          <PlayerIgCard ref={cardCapturePromoRef} m={model} variant="promo" />
        </div>
      </div>
    </div>
  );
}

export function EliteProspectsPlayerCards({ initialPlayerId = "" }: { initialPlayerId?: string }) {
  return <EliteProspectsPlayerCardsContent initialPlayerId={initialPlayerId} />;
}
