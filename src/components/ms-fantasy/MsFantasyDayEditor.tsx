"use client";

import Link from "next/link";
import { FlagMark } from "@/components/flags/FlagMark";
import { useCallback, useEffect, useMemo, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { Loader2, Check, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { MS_FANTASY_CAP, MS_FANTASY_TEAM_SIZE, isMsFantasyLineupSubmissionEnabled } from "@/lib/msFantasyConfig";
import { MS_FANTASY_ROSTER_TEAM_OPTIONS, MS_FANTASY_TIER_CODES } from "@/lib/msFantasyRosterFilters";
import { MsFantasyIceRink } from "./MsFantasyIceRink";
import { MsFantasyGlassPanel } from "./MsFantasyFrozenArenaShell";
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
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 lg:flex-row lg:gap-10">
        <div className="min-w-0 flex-1 space-y-5">
          <MsFantasyGlassPanel className="p-5 sm:p-6" glow="subtle">
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
            <p className="mt-3 text-sm text-slate-300">
              Uzávěrka:{" "}
              <strong className="font-medium text-white">
                {new Date(day.lockAt).toLocaleString("cs-CZ", {
                  timeZone: "Europe/Prague",
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </strong>{" "}
              —{" "}
              {day.isLocked ? (
                <span className="text-amber-200">den je uzavřený</span>
              ) : !fantasySubmissionsEnabled ? (
                <span className="text-amber-200">den je otevřený jen k prohlížení — odesílání sestav je vypnuté</span>
              ) : (
                <span className="text-emerald-200">můžeš upravovat sestavu</span>
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

        <section className="relative overflow-hidden rounded-3xl border border-cyan-400/15 bg-gradient-to-b from-slate-900/85 via-[#0a101c]/92 to-[#05080f]/95 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.06)] sm:p-6">
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -left-20 bottom-0 h-48 w-48 rounded-full bg-[#c8102e]/10 blur-3xl" />

          <div className="relative mb-3 flex flex-wrap items-end justify-between gap-4 sm:mb-4">
            <div className="min-w-0 flex-1">
              <p className="font-display text-[0.65rem] font-bold uppercase tracking-[0.2em] text-slate-500 sm:text-xs">Platový strop</p>
              <p className="font-mono text-xl font-bold text-white tabular-nums sm:text-2xl">
                <span className={salaryOverCap ? "text-red-300" : "text-[#9ae9ff]"}>{salaryUsed}</span>
                <span className="text-slate-500"> / </span>
                <span className="text-slate-300">{MS_FANTASY_CAP}</span>
              </p>
              <div className="mt-2.5 h-2.5 w-full max-w-[14rem] overflow-hidden rounded-full bg-black/40 ring-1 ring-white/10 sm:max-w-xs">
                <motion.div
                  className={`h-full rounded-full bg-gradient-to-r ${salaryBarGradient} shadow-[0_0_14px_rgba(0,212,255,0.35)]`}
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
            <div className="flex shrink-0 flex-col items-end gap-1">
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
                  className="ms-fantasy-save-shimmer group relative flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-[#0077b6] via-[#00B4FF] to-[#48cae4] px-5 py-3 text-xs font-display font-bold uppercase tracking-[0.14em] text-[#03050a] shadow-[0_0_28px_rgba(0,180,255,0.45),inset_0_1px_0_rgba(255,255,255,0.35)] transition hover:scale-[1.02] hover:shadow-[0_0_36px_rgba(0,212,255,0.55)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40"
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
                </button>
              ) : (
                <button
                  type="button"
                  disabled={day.isLocked || !fantasySubmissionsEnabled}
                  onClick={() => void signIn("google", { callbackUrl: `/fantasy/${slug}` })}
                  className="rounded-xl border border-[#00B4FF]/45 bg-[#00B4FF]/10 px-4 py-2.5 text-xs font-semibold text-[#9ae9ff] shadow-[0_0_18px_rgba(0,180,255,0.15)] transition hover:bg-[#00B4FF]/18 disabled:opacity-40"
                >
                  {!fantasySubmissionsEnabled ? "Přihlášení (odesílání vypnuto)" : "Přihlásit a odeslat"}
                </button>
              )}
              {saveState === "ok" ? <span className="text-xs text-emerald-400">Odesláno.</span> : null}
              {saveState === "err" && saveErr ? (
                <span className="max-w-[18rem] text-right text-xs text-red-300">{saveErr}</span>
              ) : null}
            </div>
          </div>

          <div className="mt-4 border-t border-white/[0.08] pt-4 sm:mt-5 sm:pt-5">
            <MsFantasyIceRink
              slots={slots}
              activeIx={activeIx}
              isLocked={day.isLocked}
              onSelectSlot={setActiveIx}
              onClearSlot={clearSlot}
              salaryUsed={salaryUsed}
              salaryCap={MS_FANTASY_CAP}
              salaryOverCap={salaryOverCap}
            />
          </div>
        </section>
      </div>

      <aside className="w-full shrink-0 lg:max-w-sm lg:border-l lg:border-cyan-400/10 lg:pl-8">
        <div className="border-b border-white/[0.06] pb-4">
          <h2 className="font-display text-lg font-bold uppercase tracking-[0.12em] text-white sm:text-xl">Soupiska MS</h2>
          <p className="mt-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-slate-500">Oficiální pool hráčů</p>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[["", "Vše"], ["G", "G"], ["D", "D"], ["F", "F"]].map(([v, lbl]) => (
            <button
              key={lbl}
              type="button"
              onClick={() => setPosFilter(v)}
              className={`
                rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide transition
                ${posFilter === v ? "bg-gradient-to-r from-[#00B4FF]/35 to-cyan-400/25 text-white shadow-[0_0_20px_rgba(0,180,255,0.25)] ring-1 ring-cyan-300/40" : "border border-white/[0.1] bg-white/[0.04] text-slate-400 hover:border-cyan-400/30 hover:bg-white/[0.07] hover:text-slate-200"}
              `}
            >
              {lbl}
            </button>
          ))}
        </div>

        <div className="mt-4 space-y-3">
          <div>
            <span className="mb-2 block text-[0.65rem] font-bold uppercase tracking-wider text-slate-500">Repre</span>
            <div className="-mx-0.5 flex max-w-full gap-1.5 overflow-x-auto px-0.5 pb-1 pt-0.5 [scrollbar-width:thin]">
              <button
                type="button"
                onClick={() => setTeamFilter("")}
                className={[
                  "shrink-0 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition",
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
                      "shrink-0 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition",
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
            <span className="mb-2 block text-[0.65rem] font-bold uppercase tracking-wider text-slate-500">Platový tier</span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setTierFilter("")}
                className={[
                  "rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide transition",
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
                      "rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide transition",
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
            mt-3 w-full rounded-xl border border-white/[0.12] bg-slate-950/80 px-3 py-2.5 text-sm text-white shadow-inner outline-none backdrop-blur-sm placeholder:text-slate-600
            focus:border-[#00B4FF]/50 focus:ring-2 focus:ring-[#00B4FF]/35
          "
          autoCapitalize="off"
          autoCorrect="off"
        />

        <div className="mt-3 max-h-[min(70vh,28rem)] space-y-2 overflow-y-auto rounded-2xl border border-white/[0.08] bg-gradient-to-b from-slate-950/90 to-black/50 p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
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
                      pool-card-interactive group flex w-full items-center gap-3 rounded-xl border px-2.5 py-2.5 text-left
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
                  className="mt-2 w-full rounded-lg border border-white/[0.1] py-2 text-xs font-semibold text-slate-400 hover:bg-white/[0.04]"
                >
                  {rosterLoading ? "Načítám…" : "Další řádky"}
                </button>
              ) : null}
            </>
          )}
        </div>
      </aside>
    </div>
  );
}
