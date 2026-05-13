"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { MS_FANTASY_CAP, MS_FANTASY_TEAM_SIZE, isMsFantasyLineupSubmissionEnabled } from "@/lib/msFantasyConfig";
import { MS_FANTASY_ROSTER_TEAM_OPTIONS, MS_FANTASY_TIER_CODES } from "@/lib/msFantasyRosterFilters";
import { MsFantasyIceRink } from "./MsFantasyIceRink";

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
        setSaveErr(typeof j.error === "string" ? j.error : "Uložení se nepodařilo.");
        setSaveState("err");
        return;
      }
      setSaveState("ok");
    } catch {
      setSaveErr("Bez připojení k serveru.");
      setSaveState("err");
    }
  }, [day, picksIds, slug, status]);

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
        <div>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
            <Link href="/fantasy" className="font-semibold text-[#00B4FF] hover:underline">
              ← Hrací dny
            </Link>
            <span className="text-slate-600" aria-hidden>
              ·
            </span>
            <Link href="/fantasy/pravidla" className="font-semibold text-[#00B4FF] hover:underline">
              Pravidla a body
            </Link>
          </p>
          <h1 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">{day.title}</h1>
          <p className="mt-2 text-sm text-slate-400">
            Uzávěrka:{" "}
            <strong className="font-medium text-slate-200">
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
              <span className="text-amber-200">den je otevřený jen k prohlížení — ukládání sestav je vypnuté</span>
            ) : (
              <span className="text-emerald-200">můžeš upravovat sestavu</span>
            )}
          </p>
          {!day.isLocked && !fantasySubmissionsEnabled ? (
            <p className="mt-3 rounded-lg border border-amber-500/35 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
              Odevzdávání fantasy sestav na server je zatím vypnuté (správce prostředí). Skládání v prohlížeči můžeš
              zkoušet; tlačítko uložení zůstane neaktivní, dokud se funkce nezapne.
            </p>
          ) : null}
          {slots.some((s) => s?.id) && goalieCount !== 1 ? (
            <p className="mt-3 rounded-lg border border-amber-500/35 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
              Pro platné uložení musí být v sestavě přesně jeden brankář (G). Aktuálně:{" "}
              {goalieCount === 0 ? "žádný" : goalieCount >= 2 ? `${goalieCount} (stačí jeden)` : String(goalieCount)}.
            </p>
          ) : null}
        </div>

        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-5">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Salary cap</p>
              <p className="font-mono text-lg text-white tabular-nums">
                <span className={salaryUsed > MS_FANTASY_CAP ? "text-red-300" : "text-[#7ee0ff]"}>{salaryUsed}</span>
                <span className="text-slate-500"> / </span>
                <span>{MS_FANTASY_CAP}</span>
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              {status === "authenticated" ? (
                <button
                  type="button"
                  disabled={day.isLocked || saveState === "saving" || !fantasySubmissionsEnabled}
                  onClick={() => void save()}
                  className="
                    rounded-lg bg-gradient-to-r from-[#0090cc] to-[#00B4FF] px-4 py-2.5 text-xs font-display font-bold uppercase tracking-[0.12em]
                    text-[#03050a] shadow-[0_0_22px_rgba(0,180,255,0.35)] transition disabled:opacity-40
                    hover:brightness-110
                  "
                >
                  {saveState === "saving" ? "Ukládám…" : !fantasySubmissionsEnabled ? "Ukládání vypnuto" : "Uložit sestavu"}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={day.isLocked || !fantasySubmissionsEnabled}
                  onClick={() => void signIn("google", { callbackUrl: `/fantasy/${slug}` })}
                  className="rounded-lg border border-[#00B4FF]/40 px-4 py-2 text-xs font-semibold text-[#00B4FF] hover:bg-[#00B4FF]/10 disabled:opacity-40"
                >
                  {!fantasySubmissionsEnabled ? "Přihlášení (ukládání vypnuto)" : "Přihlásit a uložit"}
                </button>
              )}
              {saveState === "ok" ? <span className="text-xs text-emerald-400">Uloženo.</span> : null}
              {saveState === "err" && saveErr ? (
                <span className="max-w-[18rem] text-right text-xs text-red-300">{saveErr}</span>
              ) : null}
            </div>
          </div>

          <MsFantasyIceRink
            slots={slots}
            activeIx={activeIx}
            isLocked={day.isLocked}
            onSelectSlot={setActiveIx}
            onClearSlot={clearSlot}
          />
        </section>
      </div>

      <aside className="w-full shrink-0 lg:max-w-sm lg:border-l lg:border-white/[0.08] lg:pl-8">
        <h2 className="font-display text-sm font-bold uppercase tracking-[0.14em] text-slate-500">Soupiska MS</h2>

        <div className="mt-3 flex flex-wrap gap-2">
          {[["", "Vše"], ["G", "G"], ["D", "D"], ["F", "F"]].map(([v, lbl]) => (
            <button
              key={lbl}
              type="button"
              onClick={() => setPosFilter(v)}
              className={`
                rounded-full px-3 py-1 text-xs font-semibold transition
                ${posFilter === v ? "bg-[#00B4FF]/20 text-[#7ee0ff]" : "border border-white/[0.1] bg-white/[0.04] text-slate-400 hover:border-[#00B4FF]/35"}
              `}
            >
              {lbl}
            </button>
          ))}
        </div>

        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-[0.65rem] font-bold uppercase tracking-wider text-slate-500">Repre</span>
            <select
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
              className="w-full rounded-xl border border-white/[0.1] bg-[#080c14]/95 px-3 py-2 text-sm text-white outline-none focus:border-[#00B4FF]/45 focus:ring-1 focus:ring-[#00B4FF]/30"
            >
              <option value="">Všechny země</option>
              {MS_FANTASY_ROSTER_TEAM_OPTIONS.map((t) => (
                <option key={t.code} value={t.code}>
                  {t.labelCs} ({t.code})
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-[0.65rem] font-bold uppercase tracking-wider text-slate-500">Platový tier</span>
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="w-full rounded-xl border border-white/[0.1] bg-[#080c14]/95 px-3 py-2 text-sm text-white outline-none focus:border-[#00B4FF]/45 focus:ring-1 focus:ring-[#00B4FF]/30"
            >
              <option value="">Všechny tiery</option>
              {MS_FANTASY_TIER_CODES.map((t) => (
                <option key={t} value={t}>
                  Tier {t}
                </option>
              ))}
            </select>
          </label>
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
            mt-3 w-full rounded-xl border border-white/[0.1] bg-[#080c14]/95 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600
            focus:border-[#00B4FF]/45 focus:ring-1 focus:ring-[#00B4FF]/30
          "
          autoCapitalize="off"
          autoCorrect="off"
        />

        <div className="mt-3 max-h-[min(70vh,28rem)] space-y-1 overflow-y-auto rounded-xl border border-white/[0.08] bg-black/25 p-2">
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
                      flex w-full items-center gap-2 rounded-lg border border-transparent px-2 py-2 text-left transition
                      hover:border-[#00B4FF]/35 hover:bg-white/[0.05] disabled:pointer-events-none disabled:opacity-40
                      ${inLineup ? "opacity-35" : ""}
                    `}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#00B4FF]/14 font-mono text-[0.7rem] font-bold text-[#7ee0ff]">
                      {p.position}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">{p.name}</p>
                      <p className="text-[0.7rem] text-slate-500">
                        {p.jerseyNumber != null ? `#${p.jerseyNumber} · ` : null}
                        {p.team} · tier {p.tier} · <span className="tabular-nums text-[#00B4FF]">{p.salary}</span>
                      </p>
                    </div>
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
