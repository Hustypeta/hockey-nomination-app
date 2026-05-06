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

const IG_OUTLINE =
  "rounded-[28px] border-[5px] border-neutral-950 bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_14px_44px_rgba(0,0,0,0.12)] ring-2 ring-black/10";
const IG_FRAME_INNER = "overflow-hidden rounded-[18px] ring-2 ring-neutral-950/90";

function fmt(v: number | null | undefined) {
  return v === null || v === undefined ? "—" : String(v);
}

function statRowBadge(s: { team: string; league: string; phase?: "RS" | "PO" }) {
  const phase =
    s.phase === "PO" ? (
      <span
        className="rounded-full border-[3px] border-neutral-950 bg-white px-3 py-1.5 text-[16px] font-black uppercase tracking-[0.14em] text-black"
      >
        PO
      </span>
    ) : (
      <span
        className="rounded-full border-[3px] border-neutral-950 bg-white px-3 py-1.5 text-[16px] font-black uppercase tracking-[0.14em] text-black"
      >
        RS
      </span>
    );
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-2 text-[26px] font-black text-black">
      {phase}
      <span className="min-w-0 whitespace-normal break-words leading-snug">
        {s.league ? `${s.team} · ${s.league}` : s.team}
      </span>
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
  const headers = ["GP", "G", "A", "TP", "PIM", "+/-"] as const;
  return (
    <div className="w-full rounded-[28px] border-[5px] border-neutral-950 bg-white p-5 shadow-[0_16px_44px_rgba(0,0,0,0.10)] sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="text-[52px] font-black uppercase tracking-[0.1em] text-black">Statistiky</div>
        <div
          className="rounded-full border-[3px] border-neutral-950 bg-white px-7 py-3.5 text-[40px] font-black tracking-[0.04em] text-black"
        >
          <span className="font-bold normal-case text-neutral-800">Sezóna </span>
          <span className="font-black uppercase tracking-[0.12em] text-black">{s.seasonLabel}</span>
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
                  className="rounded-2xl border-[3px] border-neutral-950 bg-white px-2 py-2.5 text-center shadow-[inset_0_1px_0_rgba(0,0,0,0.04)]"
                >
                  <div className="text-[30px] font-black uppercase tracking-[0.1em] text-neutral-800">
                    {h}
                  </div>
                  <div
                    className="mt-2 font-display text-[66px] font-black tabular-nums leading-none tracking-tight text-black"
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

const PlayerIgCard = forwardRef<HTMLDivElement, { m: PlayerCardModel }>(function PlayerIgCard(props, ref) {
  const { m, variant = "clean" } = props as { m: PlayerCardModel; variant?: PlayerCardVariant };
  const s = m.stats;
  /** Od 2 řádků statistik už zmenšit dres — jinak se rámy s tabulkou vizuálně „lepí“. */
  const denseStats = (s?.rows.length ?? 0) >= 2;
  const topText =
    variant === "promo"
      ? "text-white [text-shadow:0_3px_0_rgba(0,0,0,0.80),0_14px_40px_rgba(0,0,0,0.35)]"
      : "text-black";
  const topTextSoft = variant === "promo" ? "text-white/90" : "text-neutral-900";
  const clubLeague = formatClubLeague(m.player);
  const nameLen = prettyText(m.player.name).length;
  const nameFont =
    nameLen >= 16 ? "text-[84px]" : nameLen >= 13 ? "text-[90px]" : "text-[96px]";
  const clubLen = clubLeague.length;
  const clubFont = clubLen >= 30 ? "text-[38px]" : clubLen >= 22 ? "text-[42px]" : "text-[44px]";
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
      <div className="relative z-10 flex h-full min-h-0 flex-col px-14 pb-12 pt-10">
        <div className="flex items-end">
          <div className="min-w-0">
            <p
              className={`font-display ${nameFont} font-black leading-[0.96] tracking-[0.01em] ${topText}`}
            >
              {m.player.name}
            </p>
            {/* Club/league is rendered below the jersey as a "card strip" to keep layout consistent. */}
          </div>
        </div>

        <div className="mt-8 flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="flex min-h-0 min-w-0 flex-1 items-center justify-center pb-12 pt-6">
            <IgJerseyHero player={m.player} size={denseStats ? "compact" : "normal"} />
          </div>
          {clubLeague ? (
            <div className="mt-2 mb-6 flex w-full items-center justify-center px-6">
              <div
                className={`max-w-full rounded-full border-[3px] border-neutral-950 px-6 py-3 text-center font-display ${clubFont} font-black leading-none tracking-tight whitespace-normal ${
                  variant === "promo"
                    ? "bg-white/12 text-white [text-shadow:0_3px_0_rgba(0,0,0,0.80)]"
                    : "bg-white text-neutral-950"
                }`}
              >
                {clubLeague}
              </div>
            </div>
          ) : null}
          <div className={`w-full shrink-0 ${denseStats ? "mt-8 pt-2" : "mt-10 pt-2"}`}>
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

        <div className="mt-6 flex w-full items-center justify-end pr-2 sm:pr-6">
          <a
            href="https://hokejlineup.cz"
            target="_blank"
            rel="noopener noreferrer"
            className={`font-display text-[36px] font-black tracking-[0.05em] underline underline-offset-[8px] decoration-2 transition hover:decoration-[#0050a8] ${
              variant === "promo"
                ? "text-white decoration-white/60 [text-shadow:0_3px_0_rgba(0,0,0,0.80)]"
                : "text-black decoration-neutral-950/50"
            }`}
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
