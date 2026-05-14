"use client";

import Link from "next/link";
import { FlagMark } from "@/components/flags/FlagMark";
import { useCallback, useEffect, useMemo, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { ArrowLeft, ArrowRight, Check, Loader2, Lock, Users } from "lucide-react";
import { motion } from "framer-motion";
import {
  MS_FANTASY_CAP,
  MS_FANTASY_TEAM_SIZE,
  isMsFantasyLineupSubmissionEnabled,
  isMsFantasySchedulePauseDaySlug,
} from "@/lib/msFantasyConfig";
import { MS_FANTASY_ROSTER_TEAM_OPTIONS, MS_FANTASY_TIER_CODES } from "@/lib/msFantasyRosterFilters";
import { MsFantasyIceRink } from "./MsFantasyIceRink";
import { MsFantasyGlassPanel } from "./MsFantasyFrozenArenaShell";
import { MsFantasyMatchSchedule } from "./MsFantasyMatchSchedule";
import { MsFantasyPlayerAvatar } from "./MsFantasyPlayerAvatar";

export type MsFantasyRosterPlayer = {
  id: string;
  code: string;
  name: string;
  team: string;
  jerseyNumber: number | null;
  position: string;
  tier: string;
  salary: number;
};

type GameDayPayload = {
  id: string;
  slug: string;
  title: string;
  lockAt: string;
  isLocked: boolean;
  matches?: unknown;
};

type SlotPlayer = MsFantasyRosterPlayer | null;

/** Pořadí slotů: 0 = G, 1–2 = D, 3–5 = F — stejné jako vizuální „squad“ na ledě. */
const SLOT_G = 0;
const SLOTS_D = [1, 2] as const;
const SLOTS_F = [3, 4, 5] as const;

function formationSlotsFromPicks(picks: Array<MsFantasyRosterPlayer | null | undefined>): SlotPlayer[] {
  const out: SlotPlayer[] = Array.from({ length: MS_FANTASY_TEAM_SIZE }, () => null);
  const flat = picks.filter((x): x is MsFantasyRosterPlayer => Boolean(x));
  const g = flat.find((p) => p.position === "G");
  const ds = flat.filter((p) => p.position === "D");
  const fs = flat.filter((p) => p.position === "F");
  if (g) out[SLOT_G] = g;
  ds.slice(0, 2).forEach((p, i) => {
    out[SLOTS_D[i]] = p;
  });
  fs.slice(0, 3).forEach((p, i) => {
    out[SLOTS_F[i]] = p;
  });
  return out;
}

const fantasySubmissionsEnabled = isMsFantasyLineupSubmissionEnabled();

function SalaryRingGauge({ pct, over }: { pct: number; over: boolean }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const dash = (Math.min(100, Math.max(0, pct)) / 100) * circumference;
  const stroke = over ? "#fb7185" : "#22d3ee";
  return (
    <div className="relative h-[4.75rem] w-[4.75rem] shrink-0" aria-hidden>
      <svg
        viewBox="0 0 72 72"
        className={[
          "h-full w-full -rotate-90",
          over ? "drop-shadow-[0_0_12px_rgba(251,113,133,0.35)]" : "drop-shadow-[0_0_14px_rgba(34,211,238,0.45)]",
        ].join(" ")}
      >
        <circle cx="36" cy="36" r={radius} fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth="7" />
        <circle
          cx="36"
          cy="36"
          r={radius}
          fill="none"
          stroke={stroke}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          className="transition-[stroke-dasharray] duration-500 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className={`font-mono text-[0.72rem] font-bold tabular-nums leading-none ${over ? "text-red-200" : "text-cyan-100"}`}
        >
          {Math.round(Math.min(100, pct))}%
        </span>
      </div>
    </div>
  );
}

type MsFantasyRosterPanelProps = {
  day: GameDayPayload;
  layout: "sidebar" | "sheet";
  posFilter: string;
  setPosFilter: (v: string) => void;
  teamFilter: string;
  setTeamFilter: (v: string) => void;
  tierFilter: string;
  setTierFilter: (v: string) => void;
  hasExtraRosterFilters: boolean;
  q: string;
  setQ: (v: string) => void;
  rosterLoading: boolean;
  roster: MsFantasyRosterPlayer[];
  rosterSkip: number | null;
  loadMoreRoster: () => Promise<void>;
  picksIds: string[];
  addPlayer: (p: MsFantasyRosterPlayer) => void;
};

function MsFantasyRosterPanel({
  day,
  layout,
  posFilter,
  setPosFilter,
  teamFilter,
  setTeamFilter,
  tierFilter,
  setTierFilter,
  hasExtraRosterFilters,
  q,
  setQ,
  rosterLoading,
  roster,
  rosterSkip,
  loadMoreRoster,
  picksIds,
  addPlayer,
}: MsFantasyRosterPanelProps) {
  const listScrollClass =
    layout === "sidebar" ? "max-h-[min(70vh,28rem)] overflow-y-auto" : "overflow-visible";

  return (
    <>
      <div className="border-b border-cyan-500/15 pb-3 sm:pb-4">
        <h2 className="font-display text-base font-bold uppercase tracking-[0.14em] text-white sm:text-lg lg:text-xl">
          Soupiska MS
        </h2>
        <p className="mt-1 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-cyan-200/50">
          Oficiální pool hráčů
        </p>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 sm:mt-4">
        {[["", "Vše"], ["G", "G"], ["D", "D"], ["F", "F"]].map(([v, lbl]) => (
          <button
            key={lbl}
            type="button"
            onClick={() => setPosFilter(v)}
            className={`
                rounded-full px-3 py-1.5 text-[0.7rem] font-bold uppercase tracking-wide transition touch-manipulation sm:px-3.5 sm:text-xs
                ${posFilter === v ? "bg-gradient-to-r from-[#00B4FF]/35 to-cyan-400/25 text-white shadow-[0_0_20px_rgba(0,180,255,0.25)] ring-1 ring-cyan-300/40" : "border border-white/[0.1] bg-white/[0.04] text-slate-400 hover:border-cyan-400/30 hover:bg-white/[0.07] hover:text-slate-200"}
              `}
          >
            {lbl}
          </button>
        ))}
      </div>

      <div className="mt-3 space-y-3 sm:mt-4">
        <div>
          <span className="mb-1.5 block text-[0.65rem] font-bold uppercase tracking-wider text-slate-500 sm:mb-2">Repre</span>
          <div className="-mx-0.5 flex max-w-full gap-1.5 overflow-x-auto px-0.5 pb-1 pt-0.5 [scrollbar-width:thin]">
            <button
              type="button"
              onClick={() => setTeamFilter("")}
              className={[
                "shrink-0 touch-manipulation rounded-full px-2.5 py-1.5 text-[0.7rem] font-bold uppercase tracking-wide transition sm:px-3 sm:text-xs",
                teamFilter === ""
                  ? "bg-gradient-to-r from-[#00B4FF]/35 to-cyan-400/25 text-white shadow-[0_0_20px_rgba(0,180,255,0.25)] ring-1 ring-cyan-300/40"
                  : "border border-white/[0.1] bg-white/[0.04] text-slate-400 hover:border-cyan-400/30 hover:bg-white/[0.07] hover:text-slate-200",
              ].join(" ")}
            >
              Vše
            </button>
            {MS_FANTASY_ROSTER_TEAM_OPTIONS.map((t) => {
              const on = teamFilter === t.code;
              return (
                <button
                  key={t.code}
                  type="button"
                  onClick={() => setTeamFilter(on ? "" : t.code)}
                  title={t.labelCs}
                  className={[
                    "shrink-0 touch-manipulation rounded-full px-2.5 py-1.5 text-[0.7rem] font-bold uppercase tracking-wide transition sm:px-3 sm:text-xs",
                    on
                      ? "bg-gradient-to-r from-[#00B4FF]/35 to-cyan-400/25 text-white shadow-[0_0_20px_rgba(0,180,255,0.25)] ring-1 ring-cyan-300/40"
                      : "border border-white/[0.1] bg-white/[0.04] text-slate-400 hover:border-cyan-400/30 hover:bg-white/[0.07] hover:text-slate-200",
                  ].join(" ")}
                >
                  {t.code}
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <span className="mb-1.5 block text-[0.65rem] font-bold uppercase tracking-wider text-slate-500 sm:mb-2">Platový tier</span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setTierFilter("")}
              className={[
                "touch-manipulation rounded-full px-3 py-1.5 text-[0.7rem] font-bold uppercase tracking-wide transition sm:text-xs",
                tierFilter === ""
                  ? "bg-gradient-to-r from-[#00B4FF]/35 to-cyan-400/25 text-white shadow-[0_0_20px_rgba(0,180,255,0.25)] ring-1 ring-cyan-300/40"
                  : "border border-white/[0.1] bg-white/[0.04] text-slate-400 hover:border-cyan-400/30 hover:bg-white/[0.07] hover:text-slate-200",
              ].join(" ")}
            >
              Vše
            </button>
            {MS_FANTASY_TIER_CODES.map((t) => {
              const on = tierFilter === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTierFilter(on ? "" : t)}
                  className={[
                    "touch-manipulation rounded-full px-3 py-1.5 text-[0.7rem] font-bold uppercase tracking-wide transition sm:text-xs",
                    on
                      ? "bg-gradient-to-r from-[#00B4FF]/35 to-cyan-400/25 text-white shadow-[0_0_20px_rgba(0,180,255,0.25)] ring-1 ring-cyan-300/40"
                      : "border border-white/[0.1] bg-white/[0.04] text-slate-400 hover:border-cyan-400/30 hover:bg-white/[0.07] hover:text-slate-200",
                  ].join(" ")}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {hasExtraRosterFilters ? (
        <button
          type="button"
          onClick={() => {
            setTeamFilter("");
            setTierFilter("");
          }}
          className="mt-2 text-xs font-semibold text-[#00B4FF] hover:underline"
        >
          Zrušit filtry repre / tier
        </button>
      ) : null}

      <p className="mt-2 text-[0.65rem] leading-relaxed text-slate-600">
        Klubová liga u fantasy poolu zatím v datech není — jen reprezentace, tier a pozice z importu MS.
      </p>

      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Hledat jméno…"
        className="
            mt-3 w-full rounded-xl border border-cyan-500/20 bg-black/55 px-3 py-2.5 text-base text-white shadow-inner outline-none backdrop-blur-md placeholder:text-slate-600 sm:text-sm
            focus:border-cyan-400/55 focus:ring-2 focus:ring-cyan-400/30
          "
        autoCapitalize="off"
        autoCorrect="off"
        enterKeyHint="search"
      />

      <div
        className={[
          "mt-3 space-y-2 rounded-2xl border border-cyan-500/15 bg-slate-950/40 p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_12px_48px_rgba(0,0,0,0.45)] backdrop-blur-xl",
          listScrollClass,
        ].join(" ")}
      >
        {rosterLoading && roster.length === 0 ? (
          <div className="px-3 py-6 text-center text-sm text-slate-500">
            <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin text-[#00B4FF]" />
            Načítám hráče…
          </div>
        ) : roster.length === 0 ? (
          <p className="px-3 py-10 text-center text-sm leading-relaxed text-slate-500">
            V poolu zatím nejsou hráči, nebo nesedí filtr — po seedu/importu se tu objeví soupiska MS.
          </p>
        ) : (
          <>
            {roster.map((p) => {
              const inLineup = picksIds.includes(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  disabled={day.isLocked}
                  onClick={() => addPlayer(p)}
                  className={`
                      pool-card-interactive group flex w-full items-center gap-3 rounded-xl border px-2.5 py-2.5 text-left touch-manipulation active:scale-[0.99]
                      disabled:pointer-events-none disabled:opacity-40
                      ${
                        inLineup
                          ? "border-cyan-400/50 bg-gradient-to-r from-cyan-500/22 via-[#00B4FF]/14 to-transparent shadow-[0_0_32px_rgba(0,200,255,0.28)] ring-1 ring-cyan-300/50 hover:border-cyan-300/70"
                          : "border-white/[0.06] bg-gradient-to-r from-white/[0.06] to-transparent hover:border-cyan-400/45 hover:from-cyan-500/15 hover:via-[#00B4FF]/10 hover:to-transparent"
                      }
                    `}
                >
                  <div className="relative shrink-0">
                    <MsFantasyPlayerAvatar playerId={p.id} variant="circle" frame="premium" size="2.65rem" />
                    <span className="absolute -bottom-0.5 -right-0.5 z-10 scale-90">
                      <FlagMark code={p.team} className="h-3.5 w-5 ring-1 ring-black/40" />
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">{p.name}</p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[0.7rem] text-slate-400">
                      <span className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[0.65rem] font-bold text-slate-300">{p.team}</span>
                      {p.jerseyNumber != null ? <span className="tabular-nums">#{p.jerseyNumber}</span> : null}
                      <span>·</span>
                      <span>
                        tier <strong className="text-slate-200">{p.tier}</strong>
                      </span>
                      <span>·</span>
                      <span className="tabular-nums font-semibold text-[#7ee0ff]">{p.salary}</span>
                    </p>
                  </div>
                  {inLineup ? (
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#00B4FF]/25 text-[#b8f8ff] shadow-[0_0_16px_rgba(0,180,255,0.35)] ring-1 ring-cyan-300/50">
                      <Check className="h-4 w-4 stroke-[3]" aria-hidden />
                    </span>
                  ) : (
                    <span className="shrink-0 rounded-lg bg-[#00B4FF]/15 px-2 py-1 text-[0.65rem] font-bold uppercase tracking-wide text-[#9ae9ff] ring-1 ring-[#00B4FF]/25 transition group-hover:bg-[#00B4FF]/22">
                      +
                    </span>
                  )}
                </button>
              );
            })}
            {rosterSkip !== null ? (
              <button
                type="button"
                disabled={rosterLoading}
                onClick={() => void loadMoreRoster()}
                className="mt-2 w-full touch-manipulation rounded-lg border border-white/[0.1] py-2.5 text-xs font-semibold text-slate-400 hover:bg-white/[0.04] sm:py-2"
              >
                {rosterLoading ? "Načítám…" : "Další řádky"}
              </button>
            ) : null}
          </>
        )}
      </div>
    </>
  );
}

export function MsFantasyDayEditor({ slug }: { slug: string }) {
  const { status } = useSession();
  const [day, setDay] = useState<GameDayPayload | null>(null);
  const [dayErr, setDayErr] = useState<string | null>(null);
  const [slots, setSlots] = useState<SlotPlayer[]>(() =>
    Array.from({ length: MS_FANTASY_TEAM_SIZE }, () => null)
  );
  const [activeIx, setActiveIx] = useState(0);

  const [q, setQ] = useState("");
  const [posFilter, setPosFilter] = useState("");
  const [teamFilter, setTeamFilter] = useState("");
  const [tierFilter, setTierFilter] = useState("");
  const [roster, setRoster] = useState<MsFantasyRosterPlayer[]>([]);
  const [rosterSkip, setRosterSkip] = useState<number | null>(null);
  const [rosterLoading, setRosterLoading] = useState(false);

  const [saveState, setSaveState] = useState<"idle" | "saving" | "ok" | "err">("idle");
  const [saveErr, setSaveErr] = useState<string | null>(null);
  const [mobileRosterOpen, setMobileRosterOpen] = useState(false);

  const salaryUsed = useMemo(() => slots.reduce((s, p) => s + (p?.salary ?? 0), 0), [slots]);
  const salaryCapPct = useMemo(
    () => Math.min(100, Math.round((salaryUsed / MS_FANTASY_CAP) * 1000) / 10),
    [salaryUsed]
  );
  const salaryOverCap = salaryUsed > MS_FANTASY_CAP;
  const salaryBarGradient = salaryOverCap
    ? "from-red-500 via-red-400 to-rose-600"
    : salaryCapPct >= 95
      ? "from-amber-400 via-amber-300 to-orange-500"
      : "from-sky-500 via-[#00B4FF] to-cyan-400";
  const picksIds = useMemo(() => slots.map((p) => p?.id).filter(Boolean) as string[], [slots]);
  const goalieCount = useMemo(() => slots.filter((s) => s?.position === "G").length, [slots]);
  const hasExtraRosterFilters = Boolean(teamFilter || tierFilter);

  const appendRosterQueryParams = useCallback(
    (sp: URLSearchParams) => {
      if (q.trim()) sp.set("q", q.trim());
      if (posFilter) sp.set("position", posFilter);
      if (teamFilter) sp.set("team", teamFilter);
      if (tierFilter) sp.set("tier", tierFilter);
    },
    [q, posFilter, teamFilter, tierFilter]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/fantasy/game-days/${encodeURIComponent(slug)}`, { cache: "no-store" });
        if (!res.ok) {
          setDayErr(res.status === 404 ? "Tento fantasy den neexistuje." : "Den se nepodařilo načíst.");
          return;
        }
        const data = (await res.json()) as { day: GameDayPayload };
        if (!cancelled) {
          setDay(data.day);
          setDayErr(null);
        }
      } catch {
        if (!cancelled) setDayErr("Bez připojení k serveru.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    if (status !== "authenticated" || !day?.id) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/fantasy/my-lineup?gameDayId=${encodeURIComponent(day.id)}`, {
          cache: "no-store",
        });
        if (res.status === 401 || !res.ok) return;
        const data = (await res.json()) as {
          lineup: { picks: Array<MsFantasyRosterPlayer | null>; pickIds: string[] } | null;
        };
        if (cancelled || !data.lineup?.pickIds?.length) return;
        const next = formationSlotsFromPicks(data.lineup!.picks);
        setSlots(next);
      } catch {
        /* prázdné sloty */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [status, day?.id]);

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(() => {
      (async () => {
        setRosterLoading(true);
        try {
          const sp = new URLSearchParams();
          appendRosterQueryParams(sp);
          sp.set("skip", "0");
          sp.set("take", "60");
          const res = await fetch(`/api/fantasy/roster?${sp}`, { cache: "no-store" });
          if (!res.ok || cancelled) return;
          const data = (await res.json()) as {
            players: MsFantasyRosterPlayer[];
            nextSkip: number | null;
          };
          if (cancelled) return;
          setRoster(data.players);
          setRosterSkip(data.nextSkip ?? null);
        } finally {
          if (!cancelled) setRosterLoading(false);
        }
      })();
    }, 280);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [appendRosterQueryParams]);

  const loadMoreRoster = useCallback(async () => {
    if (rosterSkip == null) return;
    setRosterLoading(true);
    try {
      const sp = new URLSearchParams();
      appendRosterQueryParams(sp);
      sp.set("skip", String(rosterSkip));
      sp.set("take", "60");
      const res = await fetch(`/api/fantasy/roster?${sp}`, { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { players: MsFantasyRosterPlayer[]; nextSkip: number | null };
      setRoster((prev) => [...prev, ...data.players]);
      setRosterSkip(data.nextSkip ?? null);
    } finally {
      setRosterLoading(false);
    }
  }, [appendRosterQueryParams, rosterSkip]);

  useEffect(() => {
    if (!mobileRosterOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileRosterOpen]);

  const clearSlot = useCallback((i: number) => {
    setSlots((prev) => {
      const n = [...prev];
      n[i] = null;
      return n;
    });
    setActiveIx(i);
    setSaveState("idle");
    setSaveErr(null);
  }, []);

  /** Na mobilu (<lg, stejně jako skrytý sidebar) otevři soupisku po tapu na prázdný slot („Přidat“). */
  const handleSelectSlot = useCallback(
    (i: number) => {
      setActiveIx(i);
      if (!day || day.isLocked) return;
      if (typeof window === "undefined") return;
      if (!window.matchMedia("(max-width: 1023px)").matches) return;
      if (!slots[i]?.id) setMobileRosterOpen(true);
    },
    [day, slots]
  );

  const addPlayer = useCallback(
    (p: MsFantasyRosterPlayer) => {
      if (!day || day.isLocked) return;

      const already = picksIds.includes(p.id);
      if (already) return;

      setSlots((prev) => {
        const n = [...prev];
        for (let i = 0; i < n.length; i++) {
          if (n[i]?.id === p.id) n[i] = null;
        }

        if (p.position === "G") {
          for (let i = 1; i < n.length; i++) {
            if (n[i]?.position === "G") n[i] = null;
          }
          n[SLOT_G] = p;
          return n;
        }

        if (p.position === "D") {
          const empty = SLOTS_D.find((i) => !n[i]);
          const ix = empty ?? (activeIx === 1 || activeIx === 2 ? activeIx : SLOTS_D[0]);
          n[ix] = p;
          return n;
        }

        if (p.position === "F") {
          const empty = SLOTS_F.find((i) => !n[i]);
          const ix = empty ?? (activeIx >= 3 && activeIx <= 5 ? activeIx : SLOTS_F[0]);
          n[ix] = p;
          return n;
        }

        return n;
      });

      setSaveErr(null);
      setSaveState("idle");
      setMobileRosterOpen(false);
    },
    [activeIx, day, picksIds]
  );

  const save = useCallback(async () => {
    if (!day || day.isLocked) return;
    if (status !== "authenticated") {
      void signIn("google", { callbackUrl: `/fantasy/${slug}` });
      return;
    }
    if (salaryUsed > MS_FANTASY_CAP) {
      setSaveErr(`Platový strop ${MS_FANTASY_CAP} kreditů je překročen — uprav sestavu.`);
      setSaveState("err");
      return;
    }
    const pickIds = picksIds;
    if (pickIds.length !== MS_FANTASY_TEAM_SIZE) {
      setSaveErr(`Vyber všech ${MS_FANTASY_TEAM_SIZE} hráčů.`);
      setSaveState("err");
      return;
    }
    setSaveState("saving");
    setSaveErr(null);
    try {
      const res = await fetch("/api/fantasy/my-lineup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameDayId: day.id, pickIds }),
      });
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setSaveErr(typeof j.error === "string" ? j.error : "Odeslání se nepodařilo.");
        setSaveState("err");
        return;
      }
      setSaveState("ok");
    } catch {
      setSaveErr("Bez připojení k serveru.");
      setSaveState("err");
    }
  }, [day, picksIds, slug, status, salaryUsed]);

  if (dayErr) {
    return (
      <div className="mx-auto max-w-xl px-4 py-14 text-center">
        <p className="text-slate-300">{dayErr}</p>
        <Link href="/fantasy" className="mt-6 inline-flex text-[#00B4FF] hover:underline">
          Zpět na fantasy přehled
        </Link>
      </div>
    );
  }

  if (!day) {
    return (
      <div className="mx-auto flex max-w-xl justify-center px-4 py-20 text-slate-500">
        <Loader2 className="h-8 w-8 animate-spin text-[#00B4FF]" aria-label="Načítám…" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-3 pb-[calc(5.25rem+env(safe-area-inset-bottom,0px))] pt-4 sm:gap-5 sm:px-5 sm:pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] sm:pt-6 lg:flex-row lg:gap-8 lg:pb-8 lg:pt-8">
      <div className="min-w-0 flex-1 space-y-4">
        <section className="relative overflow-hidden rounded-3xl border border-cyan-500/20 bg-gradient-to-b from-[#070c18]/98 via-[#060a14]/98 to-[#020308]/98 p-4 shadow-[0_0_80px_rgba(0,120,200,0.1),0_24px_80px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.06)] sm:p-5">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-500/12 blur-3xl" />
          <div className="pointer-events-none absolute -left-20 bottom-0 h-52 w-52 rounded-full bg-[#c8102e]/12 blur-3xl" />

          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-5">
            <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-end sm:gap-5">
              <div className="min-w-0 flex-1">
                <p className="font-display text-[0.65rem] font-bold uppercase tracking-[0.22em] text-slate-500 sm:text-xs">
                  Platový strop
                </p>
                <p className="font-mono text-xl font-bold text-white tabular-nums sm:text-2xl">
                  <span className={salaryOverCap ? "text-red-300" : "text-[#7eefff]"}>{salaryUsed}</span>
                  <span className="text-slate-500"> / </span>
                  <span className="text-slate-300">{MS_FANTASY_CAP}</span>
                </p>
                <div className="mt-2.5 h-2.5 w-full max-w-full overflow-hidden rounded-full bg-black/50 ring-1 ring-cyan-500/15 sm:max-w-md">
                  <motion.div
                    className={`h-full rounded-full bg-gradient-to-r ${salaryBarGradient} shadow-[0_0_16px_rgba(0,212,255,0.45)]`}
                    initial={false}
                    animate={{ width: `${salaryCapPct}%` }}
                    transition={{ type: "spring", stiffness: 260, damping: 28 }}
                  />
                </div>
                <p className="mt-1.5 text-[0.65rem] text-slate-500">
                  {salaryOverCap
                    ? "Překročen strop — odeslání je uzamčeno."
                    : salaryCapPct >= 95
                      ? "Blízko stropu — zbývá málo kapacity."
                      : "Kapacita pod kontrolou."}
                </p>
              </div>
              <div className="flex justify-center sm:shrink-0 sm:justify-start sm:pb-1">
                <SalaryRingGauge pct={salaryCapPct} over={salaryOverCap} />
              </div>
            </div>
            <div className="flex w-full shrink-0 flex-col items-stretch gap-2 sm:w-auto sm:items-end">
              {status === "authenticated" ? (
                <button
                  type="button"
                  disabled={
                    day.isLocked ||
                    saveState === "saving" ||
                    !fantasySubmissionsEnabled ||
                    salaryOverCap
                  }
                  title={
                    salaryOverCap
                      ? `Platový strop ${MS_FANTASY_CAP} překročen (${salaryUsed} kreditů) — odeber hráče nebo vyměň za levnější.`
                      : undefined
                  }
                  onClick={() => void save()}
                  className="ms-fantasy-save-shimmer group relative flex min-h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl border border-cyan-300/25 bg-gradient-to-r from-[#005a8c] via-[#00B4FF] to-[#38bdf8] px-5 py-3 text-xs font-display font-bold uppercase tracking-[0.14em] text-[#03050a] shadow-[0_0_32px_rgba(0,200,255,0.5),inset_0_1px_0_rgba(255,255,255,0.35)] transition hover:scale-[1.02] hover:shadow-[0_0_44px_rgba(0,220,255,0.6)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40 touch-manipulation sm:w-auto sm:min-h-0"
                >
                  {salaryOverCap ? (
                    <Lock className="h-4 w-4 shrink-0 opacity-95" aria-hidden />
                  ) : (
                    <svg className="h-4 w-4 shrink-0 opacity-90" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path
                        d="M5 18c2-6 4-10 8-14l2 2c-3 3-5 7-6 12M7 20l3-2M15 6l2 2"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                  {saveState === "saving"
                    ? "Odesílám…"
                    : !fantasySubmissionsEnabled
                      ? "Odesílání vypnuto"
                      : salaryOverCap
                        ? "Strop překročen"
                        : "Odeslat do soutěže"}
                  {!salaryOverCap && saveState !== "saving" && fantasySubmissionsEnabled ? (
                    <ArrowRight className="h-4 w-4 shrink-0 opacity-95" aria-hidden />
                  ) : null}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={day.isLocked || !fantasySubmissionsEnabled}
                  onClick={() => void signIn("google", { callbackUrl: `/fantasy/${slug}` })}
                  className="w-full touch-manipulation rounded-xl border border-[#00B4FF]/45 bg-[#00B4FF]/10 px-4 py-3 text-xs font-semibold text-[#9ae9ff] shadow-[0_0_18px_rgba(0,180,255,0.15)] transition hover:bg-[#00B4FF]/18 disabled:opacity-40 sm:w-auto sm:py-2.5"
                >
                  {!fantasySubmissionsEnabled ? "Přihlášení (odesílání vypnuto)" : "Přihlásit a odeslat"}
                </button>
              )}
              {saveState === "ok" ? <span className="text-xs text-emerald-400">Odesláno.</span> : null}
              {saveState === "err" && saveErr ? (
                <span className="max-w-[18rem] text-left text-xs text-red-300 sm:text-right">{saveErr}</span>
              ) : null}
            </div>
          </div>

          <div className="mt-3 border-t border-white/[0.08] pt-3 sm:mt-4 sm:pt-4">
            <MsFantasyIceRink
              slots={slots}
              activeIx={activeIx}
              isLocked={day.isLocked}
              onSelectSlot={handleSelectSlot}
              onClearSlot={clearSlot}
              salaryUsed={salaryUsed}
              salaryCap={MS_FANTASY_CAP}
              salaryOverCap={salaryOverCap}
            />
          </div>

          <MsFantasyGlassPanel className="mt-4 border-t border-white/[0.08] p-4 sm:mt-5 sm:p-5" glow="subtle">
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
              <Link href="/fantasy" className="font-semibold text-cyan-300 hover:text-cyan-200 hover:underline">
                ← Hrací dny
              </Link>
              <span className="text-slate-600" aria-hidden>
                ·
              </span>
              <Link href="/fantasy/pravidla" className="font-semibold text-cyan-300 hover:text-cyan-200 hover:underline">
                Pravidla a body
              </Link>
            </p>
            <p className="mt-3 font-display text-xs font-bold uppercase tracking-[0.24em] text-cyan-200/90">MS 2026</p>
            <h1 className="mt-1 font-display text-3xl font-bold tracking-wide text-white drop-shadow-[0_2px_20px_rgba(0,0,0,0.4)] sm:text-4xl">
              {day.title}
            </h1>
            {isMsFantasySchedulePauseDaySlug(day.slug) ? null : (
              <p className="mt-3 text-sm text-slate-300">
                Uzávěrka fantasy (nelze měnit sestavu po tomto okamžiku):{" "}
                <strong className="font-medium text-white">
                  {new Date(day.lockAt).toLocaleString("cs-CZ", {
                    timeZone: "Europe/Prague",
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </strong>
                . Odpovídá začátku prvního zápasu daného dne v programu MS (čas dle CEST v aréně).
              </p>
            )}
            <div className="mt-3 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 sm:px-4 sm:py-3">
              <p className="font-display text-[0.58rem] font-bold uppercase tracking-[0.16em] text-slate-500 sm:text-[0.62rem]">
                Zápasy na tento den
              </p>
              <MsFantasyMatchSchedule
                matchesRaw={day.matches ?? []}
                showSourceLink
                omitEmptyDayDeadlineHint={isMsFantasySchedulePauseDaySlug(day.slug)}
                className="mt-2"
              />
            </div>
            <p className="mt-3 text-sm text-slate-300">
              {day.isLocked ? (
                <span className="text-amber-200">Den je uzavřený.</span>
              ) : !fantasySubmissionsEnabled ? (
                <span className="text-amber-200">
                  Den je otevřený jen k prohlížení — odesílání sestav je vypnuté.
                </span>
              ) : (
                <span className="text-emerald-200">Můžeš upravovat sestavu.</span>
              )}
            </p>
            {!day.isLocked && !fantasySubmissionsEnabled ? (
              <p className="mt-3 rounded-lg border border-amber-500/35 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
                Odevzdávání fantasy sestav na server je zatím vypnuté (správce prostředí). Skládání v prohlížeči můžeš
                zkoušet; tlačítko odeslání zůstane neaktivní, dokud se funkce nezapne.
              </p>
            ) : null}
            {slots.some((s) => s?.id) && goalieCount !== 1 ? (
              <p className="mt-3 rounded-lg border border-amber-500/35 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
                Pro platné odeslání musí být v sestavě přesně jeden brankář (G). Aktuálně:{" "}
                {goalieCount === 0 ? "žádný" : goalieCount >= 2 ? `${goalieCount} (stačí jeden)` : String(goalieCount)}.
              </p>
            ) : null}
          </MsFantasyGlassPanel>
        </section>
      </div>

      <aside className="hidden w-full shrink-0 lg:block lg:max-w-[22.5rem] lg:border-l lg:border-cyan-500/15 lg:pl-6">
        <div className="lg:sticky lg:top-24 lg:max-h-[calc(100dvh-6rem)] lg:overflow-y-auto lg:pb-4 lg:pr-1">
          <MsFantasyGlassPanel glow="cyan" className="p-4 shadow-[0_0_48px_rgba(0,180,255,0.1)] sm:p-5">
            <MsFantasyRosterPanel
              day={day}
              layout="sidebar"
              posFilter={posFilter}
              setPosFilter={setPosFilter}
              teamFilter={teamFilter}
              setTeamFilter={setTeamFilter}
              tierFilter={tierFilter}
              setTierFilter={setTierFilter}
              hasExtraRosterFilters={hasExtraRosterFilters}
              q={q}
              setQ={setQ}
              rosterLoading={rosterLoading}
              roster={roster}
              rosterSkip={rosterSkip}
              loadMoreRoster={loadMoreRoster}
              picksIds={picksIds}
              addPlayer={addPlayer}
            />
          </MsFantasyGlassPanel>
        </div>
      </aside>

      <div
        className={`pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center px-3 pb-[max(0.65rem,env(safe-area-inset-bottom,0px))] pt-2 lg:hidden ${mobileRosterOpen ? "hidden" : ""}`}
      >
        <button
          type="button"
          onClick={() => setMobileRosterOpen(true)}
          className="pointer-events-auto flex w-full max-w-md min-h-[3.25rem] touch-manipulation items-center justify-center gap-2 rounded-2xl border border-cyan-400/35 bg-gradient-to-r from-[#0a1628]/95 via-[#0c1a2e]/98 to-[#05080f]/95 px-4 py-3 text-sm font-bold text-white shadow-[0_-8px_40px_rgba(0,0,0,0.45),0_0_28px_rgba(0,180,255,0.2)] backdrop-blur-md active:scale-[0.99]"
        >
          <Users className="h-5 w-5 shrink-0 text-cyan-200" aria-hidden />
          Soupiska MS — vybrat hráče
        </button>
      </div>

      {mobileRosterOpen ? (
        <div
          className="fixed inset-0 z-[52] flex max-h-[100dvh] min-h-0 flex-col overflow-hidden bg-[#05080f] lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ms-fantasy-mobile-roster-title"
        >
          <div className="flex shrink-0 items-center gap-2 border-b border-white/10 px-3 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
            <button
              type="button"
              onClick={() => setMobileRosterOpen(false)}
              className="flex touch-manipulation items-center gap-2 rounded-xl border border-white/12 bg-white/[0.06] px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-white/[0.1]"
            >
              <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
              Zpět k ledu
            </button>
            <h2 id="ms-fantasy-mobile-roster-title" className="min-w-0 flex-1 truncate text-center font-display text-base font-bold text-white">
              Soupiska MS
            </h2>
            <button
              type="button"
              onClick={() => setMobileRosterOpen(false)}
              className="rounded-xl border border-white/12 bg-white/[0.06] px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10"
              aria-label="Zavřít"
            >
              Hotovo
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pt-2 pb-4 sm:px-4">
            <MsFantasyRosterPanel
              day={day}
              layout="sheet"
              posFilter={posFilter}
              setPosFilter={setPosFilter}
              teamFilter={teamFilter}
              setTeamFilter={setTeamFilter}
              tierFilter={tierFilter}
              setTierFilter={setTierFilter}
              hasExtraRosterFilters={hasExtraRosterFilters}
              q={q}
              setQ={setQ}
              rosterLoading={rosterLoading}
              roster={roster}
              rosterSkip={rosterSkip}
              loadMoreRoster={loadMoreRoster}
              picksIds={picksIds}
              addPlayer={addPlayer}
            />
          </div>
          <div className="relative z-[1] flex shrink-0 justify-center border-t border-white/[0.1] bg-[#05080f]/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <button
              type="button"
              onClick={() => setMobileRosterOpen(false)}
              className="flex w-full max-w-md min-h-12 touch-manipulation items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#003087]/90 to-[#002056] px-3 py-3 text-sm font-bold text-white shadow-lg shadow-black/40 active:scale-[0.99]"
            >
              <ArrowLeft className="h-5 w-5 shrink-0" aria-hidden />
              Hotovo — zpět k sestavě na ledu
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
