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

/** Tmavě modrá + silnější „halo“ — čitelné i přes fotku v pozadí. */
const IG_PROMO_TEXT =
  "text-[#001f3d] [text-shadow:0_2px_0_rgba(255,255,255,0.92),0_0_1px_rgba(255,255,255,0.95),0_4px_22px_rgba(147,197,253,0.65)]";
const IG_PROMO_TEXT_SOFT =
  "text-[#002d54] [text-shadow:0_1px_0_rgba(255,255,255,0.88),0_3px_16px_rgba(147,197,253,0.55)]";

const IG_OUTLINE =
  "rounded-[28px] border-[5px] border-neutral-950 bg-black/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_14px_44px_rgba(0,0,0,0.58)] ring-2 ring-white/40";
const IG_FRAME_INNER = "overflow-hidden rounded-[18px] ring-2 ring-neutral-950/80";

function fmt(v: number | null | undefined) {
  return v === null || v === undefined ? "—" : String(v);
}

function statRowBadge(s: { team: string; league: string; phase?: "RS" | "PO" }) {
  const phase =
    s.phase === "PO" ? (
      <span
        className={`rounded-full border-[3px] border-neutral-950 bg-black/30 px-3 py-1.5 text-[14px] font-black uppercase tracking-[0.14em] ${IG_PROMO_TEXT}`}
      >
        PO
      </span>
    ) : (
      <span
        className={`rounded-full border-[3px] border-neutral-950 bg-black/30 px-3 py-1.5 text-[14px] font-black uppercase tracking-[0.14em] ${IG_PROMO_TEXT}`}
      >
        RS
      </span>
    );
  return (
    <div className={`flex min-w-0 flex-wrap items-center gap-2 text-[20px] font-bold ${IG_PROMO_TEXT}`}>
      {phase}
      <span className="truncate">{s.league ? `${s.team} · ${s.league}` : s.team}</span>
    </div>
  );
}

/**
 * Dres v kompletním rámu (horní + spodní okraj) — menší šířka, ať se rámy s statistikami nepřekrývají na PNG.
 */
function IgJerseyHero({ player, size = "normal" }: { player: Player; size?: "normal" | "compact" }) {
  const w = size === "compact" ? "w-[420px] max-w-[420px]" : "w-[470px] max-w-[470px]";
  return (
    <div
      className={`relative mx-auto w-fit max-w-full ${IG_OUTLINE} p-4`}
      aria-label={player.name}
    >
      <div className={`relative mx-auto ${w} ${IG_FRAME_INNER}`}>
        <div className="relative aspect-[100/120] w-full bg-black/20">
          {/* eslint-disable-next-line @next/next/no-img-element -- static jersey */}
          <img
            src={CZ_JERSEY_BACK_BLANK_SRC}
            alt=""
            width={560}
            height={672}
            decoding="async"
            className={`${CZ_JERSEY_CARD_IMG_BASE} drop-shadow-[0_8px_22px_rgba(0,0,0,0.45)]`}
          />
        </div>
      </div>
    </div>
  );
}

function StatsTable({ s }: { s: EliteProspectsStats }) {
  const headers = ["GP", "G", "A", "TP", "PIM", "+/-"] as const;
  return (
    <div className={`w-full ${IG_OUTLINE} p-5 sm:p-6`}>
      <div className="flex items-center justify-between gap-4">
        <div className={`text-[40px] font-black uppercase tracking-[0.1em] ${IG_PROMO_TEXT}`}>Statistiky</div>
        <div
          className={`rounded-full border-[3px] border-neutral-950 bg-black/25 px-7 py-3.5 text-[32px] font-black tracking-[0.04em] ring-1 ring-white/30 ${IG_PROMO_TEXT}`}
        >
          <span className={`font-bold normal-case ${IG_PROMO_TEXT_SOFT}`}>Sezóna </span>
          <span className={`font-black uppercase tracking-[0.12em] ${IG_PROMO_TEXT}`}>{s.seasonLabel}</span>
        </div>
      </div>

      <div className="mt-5 space-y-5">
        {s.rows.map((r, idx) => (
          <div key={idx} className="space-y-2.5">
            {statRowBadge(r)}
            <div className="grid grid-cols-6 gap-2.5">
              {headers.map((h) => (
                <div
                  key={h}
                  className="rounded-2xl border-[3px] border-neutral-950 bg-black/15 px-2 py-2.5 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] ring-1 ring-white/20"
                >
                  <div className={`text-[20px] font-black uppercase tracking-[0.1em] ${IG_PROMO_TEXT_SOFT}`}>
                    {h}
                  </div>
                  <div
                    className={`mt-2 font-display text-[50px] font-black tabular-nums leading-none tracking-tight ${IG_PROMO_TEXT}`}
                  >
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
  /** Od 2 řádků statistik už zmenšit dres — jinak se rámy s tabulkou vizuálně „lepí“. */
  const denseStats = (s?.rows.length ?? 0) >= 2;
  return (
    <div
      ref={ref}
      className="relative h-[1350px] w-[1080px] overflow-hidden rounded-[44px] border border-white/15 bg-transparent shadow-none"
    >
      <div className="relative z-10 flex h-full min-h-0 flex-col px-14 pb-12 pt-10">
        <div className="flex items-end">
          <div className="min-w-0">
            <p
              className={`font-display text-[88px] font-black leading-[0.98] tracking-[0.01em] ${IG_PROMO_TEXT}`}
            >
              {m.player.name}
            </p>
            <p className={`mt-3 text-[40px] font-bold ${IG_PROMO_TEXT}`}>
              {m.player.club} · {m.player.league}
            </p>
          </div>
        </div>

        <div className="mt-5 flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="flex min-h-0 min-w-0 flex-1 items-center justify-center py-2">
            <IgJerseyHero player={m.player} size={denseStats ? "compact" : "normal"} />
          </div>
          <div className={`w-full shrink-0 ${denseStats ? "mt-10 pt-2" : "mt-12 pt-2"}`}>
            {s ? (
              <StatsTable s={s} />
            ) : (
              <div
                className={`w-full p-10 text-center text-[28px] font-bold ${IG_OUTLINE} ${IG_PROMO_TEXT}`}
              >
                Doplňte statistiky…
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex w-full items-center justify-end pr-2 sm:pr-6">
          <a
            href="https://hokejlineup.cz"
            target="_blank"
            rel="noopener noreferrer"
            className={`font-display text-[36px] font-black tracking-[0.05em] underline underline-offset-[8px] decoration-2 decoration-neutral-950/50 transition hover:decoration-[#0050a8] ${IG_PROMO_TEXT}`}
          >
            hokejlineup.cz
          </a>
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

function EliteProspectsPlayerCardsContent({ initialPlayerId }: { initialPlayerId: string }) {
  const cardCaptureRef = useRef<HTMLDivElement>(null);
  const [pngBusy, setPngBusy] = useState(false);
  const router = useRouter();
  const pathname = usePathname() || "/promo/hraci";
  const [idParam, setIdParam] = useState(() => initialPlayerId.trim());
  const scale = useScaleToFit(1080, 1350);

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

  const handleDownloadPng = useCallback(async () => {
    const el = cardCaptureRef.current;
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
          const x = row as any;
          if (typeof x.id !== "string") continue;
          if (typeof x.name !== "string") continue;
          if (typeof x.position !== "string") continue;
          if (typeof x.club !== "string") continue;
          if (typeof x.league !== "string") continue;
          parsed.push(x as Player);
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
              className={`inline-flex items-center justify-center rounded-xl border border-white/12 bg-white/[0.05] px-3 py-2 text-sm font-semibold hover:bg-white/[0.08] ${IG_PROMO_TEXT}`}
            >
              ← Předchozí
            </button>
            <button
              type="button"
              onClick={() => setPlayerId(ids[(activeIdx + 1) % ids.length] ?? ids[0] ?? "")}
              className={`inline-flex items-center justify-center rounded-xl border border-white/12 bg-white/[0.05] px-3 py-2 text-sm font-semibold hover:bg-white/[0.08] ${IG_PROMO_TEXT}`}
            >
              Další →
            </button>
          </div>

          <div className="flex items-center gap-2">
            <label
              className={`flex min-w-0 flex-1 items-center gap-2 text-xs font-semibold sm:hidden ${IG_PROMO_TEXT_SOFT}`}
            >
              Hráč
              <select
                className={`min-w-0 flex-1 rounded-xl border border-white/12 bg-white/[0.05] px-3 py-2 text-sm font-semibold ${IG_PROMO_TEXT}`}
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
                        : `border-white/10 bg-white/[0.04] hover:bg-white/[0.07] ${IG_PROMO_TEXT_SOFT}`
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

export function EliteProspectsPlayerCards({ initialPlayerId = "" }: { initialPlayerId?: string }) {
  return <EliteProspectsPlayerCardsContent initialPlayerId={initialPlayerId} />;
}
