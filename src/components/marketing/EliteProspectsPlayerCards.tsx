"use client";

import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Download } from "lucide-react";
import { jerseyNameOnJersey } from "@/lib/jerseyDisplayName";
import { splitNameplateLines } from "@/lib/jerseyNameplate";
import { jerseyNumberForPlayer } from "@/lib/jerseyNumber";
import { CZ_JERSEY_BACK_BLANK_SRC, CZ_JERSEY_CARD_IMG_BASE } from "@/lib/jerseyPhotoAsset";
import {
  captureElementToCanvas,
  canvasToPngDataUrl,
  downloadDataUrl,
} from "@/lib/captureSharePoster";
import { SHARE_POSTER_CAPTURE_PIXEL_RATIO } from "@/lib/sharePosterLayout";
import { SITE_LOGO_URL } from "@/lib/siteBranding";
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

function fmt(v: number | null | undefined) {
  return v === null || v === undefined ? "—" : String(v);
}

function statRowBadge(s: { team: string; league: string; phase?: "RS" | "PO" }) {
  const phase =
    s.phase === "PO" ? (
      <span className="rounded-full border border-[#FF1E2E]/25 bg-[#FF1E2E]/10 px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-white/85">
        PO
      </span>
    ) : (
      <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-white/70">
        RS
      </span>
    );
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-2 text-[14px] font-semibold text-white/80">
      {phase}
      <span className="truncate">{s.league ? `${s.team} · ${s.league}` : s.team}</span>
    </div>
  );
}

function IgJerseyHero({ player }: { player: Player }) {
  const ln = jerseyNameOnJersey(player.name);
  const lines = splitNameplateLines(ln);
  const num = jerseyNumberForPlayer(player);
  const longestLine = Math.max(1, ...lines.map((t) => [...t].length));
  /** Kratší horní hranice = delší jména zůstanou na červeném těle dresu, ne na rukávech. */
  const nameMaxPx = Math.round(Math.min(46, Math.max(22, 300 / longestLine)));
  const numMaxPx = Math.round(Math.min(64, Math.max(34, nameMaxPx * 1.38)));
  const nameStroke = nameMaxPx >= 34 ? "1.75px" : "1.35px";
  const numStroke = numMaxPx >= 52 ? "2px" : "1.5px";
  return (
    <div className="relative mx-auto w-[560px] max-w-[560px] overflow-hidden rounded-[22px] border border-white/14 bg-white/[0.06] shadow-[0_28px_90px_rgba(0,0,0,0.55)]">
      <div className="relative aspect-[100/120] w-full bg-gradient-to-b from-white/8 to-black/15">
        {/* eslint-disable-next-line @next/next/no-img-element -- static jersey */}
        <img
          src={CZ_JERSEY_BACK_BLANK_SRC}
          alt=""
          width={560}
          height={672}
          decoding="async"
          className={`${CZ_JERSEY_CARD_IMG_BASE} drop-shadow-[0_14px_40px_rgba(0,0,0,0.55)]`}
        />
        {/* Větší vlajka než tisk na assetu — sedí na bílý yok (stín překryje případný malý motiv pod ní). */}
        <div
          className="pointer-events-none absolute left-1/2 top-[14.5%] z-[1] -translate-x-1/2 drop-shadow-[0_2px_10px_rgba(0,0,0,0.4)]"
          aria-hidden
        >
          <svg
            viewBox="0 0 3 2"
            className="block h-[42px] w-[63px] rounded-[3px] ring-1 ring-black/25 sm:h-[48px] sm:w-[72px]"
            aria-hidden
          >
            <rect fill="#ffffff" width="3" height="2" />
            <rect fill="#d7141a" y="1" width="3" height="1" />
            <polygon fill="#11457e" points="0,0 1.5,1 0,2" />
          </svg>
        </div>
        <div className="pointer-events-none absolute inset-0 z-[2] flex flex-col items-center pt-[38%]">
          <div className="flex w-full max-w-[68%] flex-col items-center px-1">
            {lines.map((t, i) => (
              <div
                key={i}
                className="w-full text-center font-display font-black uppercase tracking-[0.045em] text-white"
                style={{
                  fontSize: `clamp(20px, 3.6vw, ${nameMaxPx}px)`,
                  lineHeight: 1.02,
                  textShadow:
                    "0 2px 0 rgba(0,0,0,0.55), 0 0 12px rgba(0,0,0,0.38)",
                  WebkitTextStroke: `${nameStroke} rgba(0,45,84,0.88)`,
                }}
              >
                {t}
              </div>
            ))}
          </div>
          <div
            className="mt-1.5 font-display font-black tabular-nums text-white"
            style={{
              fontSize: `clamp(30px, 4.5vw, ${numMaxPx}px)`,
              lineHeight: 0.95,
              textShadow: "0 2px 0 rgba(0,0,0,0.55), 0 0 14px rgba(0,0,0,0.35)",
              WebkitTextStroke: `${numStroke} rgba(0,45,84,0.88)`,
            }}
          >
            {num}
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element -- export přes html-to-image */}
          <img
            src={SITE_LOGO_URL}
            alt=""
            width={1000}
            height={280}
            className="mt-3 h-[252px] w-full max-w-[520px] object-contain opacity-95 drop-shadow-[0_2px_14px_rgba(0,0,0,0.55)] sm:mt-4 sm:h-[296px] sm:max-w-[540px]"
          />
        </div>
      </div>
    </div>
  );
}

function StatsTable({ s }: { s: EliteProspectsStats }) {
  const headers = ["GP", "G", "A", "TP", "PIM", "+/-"] as const;
  return (
    <div className="w-full rounded-[34px] border border-white/12 bg-white/[0.06] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
      <div className="flex items-center justify-between gap-4">
        <div className="text-[16px] font-black uppercase tracking-[0.18em] text-white/75">Statistiky</div>
        <div className="rounded-full border border-white/14 bg-black/30 px-5 py-2.5 text-[16px] font-black tracking-[0.06em] text-white/75">
          <span className="font-semibold normal-case text-white/55">Sezóna </span>
          <span className="font-black uppercase tracking-[0.18em]">{s.seasonLabel}</span>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {s.rows.map((r, idx) => (
          <div key={idx} className="space-y-2">
            {statRowBadge(r)}
            <div className="grid grid-cols-6 gap-2">
              {headers.map((h) => (
                <div
                  key={h}
                  className="rounded-2xl border border-white/12 bg-black/20 px-3 py-2.5 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]"
                >
                  <div className="text-[10px] font-black uppercase tracking-[0.22em] text-white/65">
                    {h}
                  </div>
                  <div className="mt-1 font-display text-[28px] font-black tabular-nums leading-none text-white">
                    {h === "GP"
                      ? fmt(r.gp)
                      : h === "G"
                        ? fmt(r.g)
                        : h === "A"
                          ? fmt(r.a)
                          : h === "TP"
                            ? fmt(r.pts)
                            : h === "PIM"
                              ? fmt(r.pim)
                              : fmt(r.plusMinus)}
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

const PlayerIgCard = forwardRef<HTMLDivElement, { m: PlayerCardModel }>(function PlayerIgCard(props, ref) {
  const { m } = props;
  const s = m.stats;
  return (
    <div
      ref={ref}
      className="relative h-[1350px] w-[1080px] overflow-hidden rounded-[44px] border border-white/12 bg-[radial-gradient(ellipse_at_20%_-10%,rgba(0,229,255,0.14),transparent_55%),radial-gradient(ellipse_at_80%_-10%,rgba(255,30,46,0.14),transparent_55%),linear-gradient(180deg,#0A0E17_0%,#05080f_100%)] shadow-[0_40px_140px_rgba(0,0,0,0.65)]"
    >
      <div
        className="pointer-events-none absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-[#00E5FF]/14 blur-[110px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-48 -top-44 h-[520px] w-[520px] rounded-full bg-[#FF1E2E]/14 blur-[110px]"
        aria-hidden
      />

      <div className="relative z-10 flex h-full min-h-0 flex-col px-14 pb-12 pt-10">
        <div className="flex items-end">
          <div className="min-w-0">
            <p className="font-display text-[76px] font-black leading-[1.02] tracking-[0.02em] text-white">
              {m.player.name}
            </p>
            <p className="mt-2 text-[24px] font-semibold text-white/70">
              {m.player.club} · {m.player.league}
            </p>
          </div>
        </div>

        <div className="mt-6 flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="flex min-h-0 min-w-0 flex-1 items-center justify-center py-1">
            <IgJerseyHero player={m.player} />
          </div>
          <div className="w-full shrink-0 pt-5">
            {s ? (
              <StatsTable s={s} />
            ) : (
              <div className="w-full rounded-[34px] border border-white/12 bg-white/[0.06] p-10 text-center text-white/60">
                Doplňte statistiky…
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <Link
            href="https://hokejlineup.cz"
            target="_blank"
            rel="noopener noreferrer"
            className="font-display text-xl font-bold tracking-[0.06em] text-white/45 underline-offset-4 transition hover:text-cyan-300 hover:underline sm:text-2xl"
          >
            hokejlineup.cz
          </Link>
        </div>
      </div>
    </div>
  );
});

PlayerIgCard.displayName = "PlayerIgCard";

const MANUAL_STATS_BY_ID: Partial<Record<string, EliteProspectsStats>> = {
  // Vyplníš mi hodnoty a já je sem doplním 1:1 (GP, G, A, PTS, +/-, PIM + tým/ligu/season).
  "sedlak-lukas": {
    seasonLabel: "2025-26",
    rows: [
      {
        team: "HC Dynamo Pardubice - základní část",
        league: "",
        phase: "RS",
        gp: 49,
        g: 17,
        a: 35,
        pts: 52,
        plusMinus: 24,
        pim: 31,
      },
      {
        team: "HC Dynamo Pardubice - Play off",
        league: "",
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
        league: "Czechia",
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
        league: "Czechia",
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
      { team: "Färjestad BK", league: "SHL", phase: "PO", gp: 7, g: 5, a: 0, pts: 5, pim: 2, plusMinus: -4 },
    ],
  },
  melovsky: {
    seasonLabel: "2025-26",
    rows: [{ team: "Utica Comets", league: "AHL", phase: "RS", gp: 55, g: 10, a: 16, pts: 26, pim: 31, plusMinus: -2 }],
  },
  cernoch: {
    seasonLabel: "2025-26",
    rows: [
      { team: "HC Energie Karlovy Vary", league: "Czechia", phase: "RS", gp: 52, g: 15, a: 25, pts: 40, pim: 57, plusMinus: -2 },
      { team: "HC Energie Karlovy Vary", league: "Czechia", phase: "PO", gp: 15, g: 3, a: 6, pts: 9, pim: 10, plusMinus: -3 },
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
      { team: "HC Oceláři Třinec", league: "Czechia", phase: "RS", gp: 52, g: 12, a: 19, pts: 31, pim: 14, plusMinus: 16 },
      { team: "HC Oceláři Třinec", league: "Czechia", phase: "PO", gp: 19, g: 5, a: 12, pts: 17, pim: 12, plusMinus: 8 },
    ],
  },
  zacha: {
    seasonLabel: "2025-26",
    rows: [
      { team: "Boston Bruins", league: "NHL", phase: "RS", gp: 78, g: 30, a: 35, pts: 65, pim: 28, plusMinus: 4 },
      { team: "Boston Bruins", league: "NHL", phase: "PO", gp: 5, g: 1, a: 1, pts: 2, pim: 2, plusMinus: -4 },
    ],
  },
  hertl: {
    seasonLabel: "2025-26",
    rows: [
      { team: "Vegas Golden Knights", league: "NHL", phase: "RS", gp: 82, g: 24, a: 34, pts: 58, pim: 39, plusMinus: -17 },
      { team: "Vegas Golden Knights", league: "NHL", phase: "PO", gp: 5, g: 0, a: 2, pts: 2, pim: 0, plusMinus: -3 },
    ],
  },
  "faksa-radek": {
    seasonLabel: "2025-26",
    rows: [
      { team: "Dallas Stars", league: "NHL", phase: "RS", gp: 58, g: 2, a: 15, pts: 17, pim: 18, plusMinus: 2 },
      { team: "Dallas Stars", league: "NHL", phase: "PO", gp: 6, g: 0, a: 0, pts: 0, pim: 4, plusMinus: -3 },
    ],
  },
};

const PLAYERS: Array<{ player: Player }> = [
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
      name: "Melovský",
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
      name: "Černoch",
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
      name: "Sikora",
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
      name: "Tomášek",
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
      name: "Zacha",
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
      name: "Hertl",
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
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function EliteProspectsPlayerCards() {
  const cardCaptureRef = useRef<HTMLDivElement>(null);
  const [pngBusy, setPngBusy] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const idParam = (sp.get("p") ?? "").trim();
  const scale = useScaleToFit(1080, 1350);

  const base = useMemo(() => PLAYERS, []);
  const selected = useMemo(() => {
    if (!idParam) return base[0] ?? null;
    return base.find((x) => x.player.id === idParam) ?? base[0] ?? null;
  }, [base, idParam]);

  const ids = useMemo(() => base.map((x) => x.player.id), [base]);
  const activeIdx = selected ? Math.max(0, ids.indexOf(selected.player.id)) : 0;
  const setPlayerId = (id: string) => {
    const q = new URLSearchParams(sp.toString());
    if (id) q.set("p", id);
    else q.delete("p");
    const next = q.toString();
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
  };

  const handleDownloadPng = useCallback(async () => {
    const el = cardCaptureRef.current;
    if (!el) return;
    setPngBusy(true);
    try {
      await document.fonts.ready.catch(() => undefined);
      await new Promise<void>((r) =>
        requestAnimationFrame(() => requestAnimationFrame(() => r()))
      );
      const canvas = await captureElementToCanvas(el, {
        scale: SHARE_POSTER_CAPTURE_PIXEL_RATIO,
        backgroundColor: "#05080f",
      });
      const slug = selected?.player.id ?? "hrac";
      downloadDataUrl(canvasToPngDataUrl(canvas), `ms2026-promo-hrac-${slug}.png`);
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
      if (dbPlayers !== null) return;
      const r = await fetch("/api/players", { cache: "no-store" });
      if (!r.ok) return;
      const data: unknown = await r.json();
      if (cancelled) return;
      if (!Array.isArray(data)) return;
      const parsed: Player[] = [];
      for (const row of data) {
        if (!row || typeof row !== "object") continue;
        const x = row as any;
        if (typeof x.id !== "string") continue;
        if (typeof x.name !== "string") continue;
        if (typeof x.position !== "string") continue;
        if (typeof x.club !== "string") continue;
        if (typeof x.league !== "string") continue;
        parsed.push(x as Player);
      }
      setDbPlayers(parsed);
    }
    run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetch once per selected
  }, [selected?.player.id]);

  if (!selected) return null;

  const fromDb =
    dbPlayers?.find((p) => normName(p.name) === normName(selected.player.name)) ??
    dbPlayers?.find((p) => normName(p.name).includes(normName(selected.player.name))) ??
    null;

  const mergedPlayer: Player = {
    ...selected.player,
    ...(fromDb
      ? {
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
              className="inline-flex items-center justify-center rounded-xl border border-white/12 bg-white/[0.05] px-3 py-2 text-sm font-semibold text-white/85 hover:bg-white/[0.08]"
            >
              ← Předchozí
            </button>
            <button
              type="button"
              onClick={() => setPlayerId(ids[(activeIdx + 1) % ids.length] ?? ids[0] ?? "")}
              className="inline-flex items-center justify-center rounded-xl border border-white/12 bg-white/[0.05] px-3 py-2 text-sm font-semibold text-white/85 hover:bg-white/[0.08]"
            >
              Další →
            </button>
          </div>

          <div className="flex items-center gap-2">
            <label className="flex min-w-0 flex-1 items-center gap-2 text-xs font-semibold text-white/60 sm:hidden">
              Hráč
              <select
                className="min-w-0 flex-1 rounded-xl border border-white/12 bg-white/[0.05] px-3 py-2 text-sm font-semibold text-white/90"
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
                        ? "border-[#00E5FF]/35 bg-[#00E5FF]/10 text-[#67E8F9]"
                        : "border-white/10 bg-white/[0.04] text-white/60 hover:bg-white/[0.07]"
                    }`}
                    title={x.player.name}
                  >
                    {x.player.name}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            disabled={pngBusy}
            onClick={() => void handleDownloadPng()}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#00E5FF]/28 bg-[#00E5FF]/10 px-4 py-2.5 text-sm font-bold text-[#67E8F9] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition hover:bg-[#00E5FF]/16 disabled:cursor-not-allowed disabled:opacity-50 sm:ml-auto sm:w-auto"
          >
            <Download className="h-4 w-4 shrink-0" aria-hidden />
            {pngBusy ? "Generuji PNG…" : "Stáhnout PNG (1080×1350)"}
          </button>
        </div>
      </div>

      <div style={{ transform: `scale(${scale})`, transformOrigin: "top center" }}>
        <PlayerIgCard ref={cardCaptureRef} m={model} />
      </div>
    </div>
  );
}

