"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Calculator, ChevronLeft, ImageIcon, Save, Trophy } from "lucide-react";
import { MsFantasyPosterExportPanel } from "@/components/admin/MsFantasyPosterExportPanel";
import Link from "next/link";
import { toast } from "sonner";
import { AdminPasswordLoginForm } from "@/components/admin/AdminPasswordLoginForm";
import { AppLoadingScreen } from "@/components/AppLoadingScreen";
import { SiteHeader } from "@/components/site/SiteHeader";
import { MS_FANTASY_POINTS } from "@/lib/msFantasyConfig";
import type { FantasyAdminOverallStanding, FantasyAdminPickedPlayer } from "@/lib/msFantasyAdminTypes";
import { statRowToFantasyPoints } from "@/lib/msFantasyStatPreview";

type GameDayRow = {
  id: string | null;
  slug: string;
  title: string;
  lockAt: string;
  lineupCount: number;
  statsCount: number;
  resultsCount: number;
  inDatabase: boolean;
};

type DayPayload = {
  gameDay: { id: string; slug: string; title: string; lockAt: string };
  lineupCount: number;
  pickedPlayers: FantasyAdminPickedPlayer[];
  lineups: Array<{
    lineupId: string;
    userId: string;
    displayName: string;
    pickIds: string[];
    salarySpent: number;
    points: number | null;
    scoredAt: string | null;
  }>;
};

type PlayerDraft = FantasyAdminPickedPlayer;

function readError(data: unknown): string | undefined {
  if (typeof data !== "object" || data === null) return undefined;
  const e = (data as { error?: unknown }).error;
  return typeof e === "string" ? e : undefined;
}

function StatInput({
  label,
  value,
  onChange,
  min = 0,
  max = 99,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <label className="flex flex-col gap-0.5">
      <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-500">{label}</span>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-14 rounded-md border border-white/10 bg-black/40 px-2 py-1 text-center text-sm text-white"
      />
    </label>
  );
}

export function MsFantasyScoringAdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [days, setDays] = useState<GameDayRow[]>([]);
  const [slug, setSlug] = useState<string>("");
  const [day, setDay] = useState<DayPayload | null>(null);
  const [draft, setDraft] = useState<PlayerDraft[]>([]);
  const [overall, setOverall] = useState<FantasyAdminOverallStanding[]>([]);
  const [loadingOverall, setLoadingOverall] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [evaluatingAll, setEvaluatingAll] = useState(false);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  const loadOverall = useCallback(async () => {
    setLoadingOverall(true);
    try {
      const res = await fetch("/api/admin/fantasy/overall", { credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(readError(data) ?? "Nepodařilo se načíst celkové pořadí.");
        return;
      }
      setOverall((data as { overall?: FantasyAdminOverallStanding[] }).overall ?? []);
    } finally {
      setLoadingOverall(false);
    }
  }, []);

  const checkAuth = useCallback(async () => {
    const res = await fetch("/api/admin/fantasy/game-days", { credentials: "include" });
    setAuthed(res.ok);
    if (res.ok) {
      const data = (await res.json()) as { days: GameDayRow[] };
      const list = data.days ?? [];
      setDays(list);
      const withLineups = list.find((d) => d.lineupCount > 0);
      setSlug((prev) => prev || withLineups?.slug || list[0]?.slug || "");
      void loadOverall();
    }
  }, [loadOverall]);

  useEffect(() => {
    void checkAuth();
  }, [checkAuth]);

  const loadDay = useCallback(async (daySlug: string) => {
    if (!daySlug) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/fantasy/days/${encodeURIComponent(daySlug)}`, {
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(readError(data) ?? "Nepodařilo se načíst den.");
        return;
      }
      const payload = data as DayPayload;
      setDay(payload);
      setDraft(payload.pickedPlayers.map((p) => ({ ...p })));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authed && slug) void loadDay(slug);
  }, [authed, slug, loadDay]);

  const updatePlayer = (rosterPlayerId: string, patch: Partial<PlayerDraft>) => {
    setDraft((rows) =>
      rows.map((r) => {
        if (r.rosterPlayerId !== rosterPlayerId) return r;
        const next = { ...r, ...patch };
        next.fantasyPoints = statRowToFantasyPoints(next.position, next);
        return next;
      }),
    );
  };

  const saveStats = async () => {
    if (!slug) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/fantasy/days/${encodeURIComponent(slug)}/stats`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stats: draft.map((p) => ({
            rosterPlayerId: p.rosterPlayerId,
            goals: p.goals,
            assists: p.assists,
            plusMinus: p.plusMinus,
            wins: p.wins,
            goalsAgainst: p.goalsAgainst,
            shutouts: p.shutouts,
          })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(readError(data) ?? "Uložení selhalo.");
        return;
      }
      toast.success("Statistiky uloženy.");
      const refreshed = (data as { day?: DayPayload }).day;
      if (refreshed) {
        setDay(refreshed);
        setDraft(refreshed.pickedPlayers.map((p) => ({ ...p })));
      }
    } finally {
      setSaving(false);
    }
  };

  const runEvaluate = async () => {
    if (!slug) return;
    setEvaluating(true);
    try {
      const res = await fetch(`/api/admin/fantasy/days/${encodeURIComponent(slug)}/evaluate`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(readError(data) ?? "Vyhodnocení selhalo.");
        return;
      }
      const payload = data as { warning?: string | null };
      if (payload.warning) toast.warning(payload.warning);
      else toast.success("Den vyhodnocen a uložen do databáze.");
      void loadDay(slug);
      void loadOverall();
    } finally {
      setEvaluating(false);
    }
  };

  const runEvaluateAll = async () => {
    setEvaluatingAll(true);
    try {
      const res = await fetch("/api/admin/fantasy/evaluate-all", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(readError(data) ?? "Hromadné vyhodnocení selhalo.");
        return;
      }
      const payload = data as {
        daysEvaluated: number;
        warnings: string[];
        overall: FantasyAdminOverallStanding[];
      };
      setOverall(payload.overall ?? []);
      if (payload.warnings?.length) {
        toast.warning(`Vyhodnoceno ${payload.daysEvaluated} dnů. ${payload.warnings.join(" · ")}`);
      } else {
        toast.success(`Vyhodnoceno ${payload.daysEvaluated} herních dnů.`);
      }
      const resDays = await fetch("/api/admin/fantasy/game-days", { credentials: "include" });
      if (resDays.ok) {
        const daysData = (await resDays.json()) as { days: GameDayRow[] };
        setDays(daysData.days ?? []);
      }
      if (slug) void loadDay(slug);
    } finally {
      setEvaluatingAll(false);
    }
  };

  const selectedDayMeta = useMemo(() => days.find((d) => d.slug === slug), [days, slug]);

  if (authed === null) return <AppLoadingScreen tagline="Admin · Fantasy" message="Ověřuji přístup…" intro={null} />;

  if (!authed) {
    return (
      <AdminPasswordLoginForm
        title="Admin — Fantasy vyhodnocení"
        description="Přihlášení stejným heslem jako u ostatních admin stránek (cookie contest_admin)."
        onLoggedIn={checkAuth}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#05060f] text-white">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400/90">MS 2026</p>
            <h1 className="font-display text-2xl font-bold tracking-wide text-white sm:text-3xl">
              Fantasy — statistiky a body
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              Vyber den, u hráčů vybraných ve fantasy sestavách doplň statistiky dle pravidel (G{" "}
              {MS_FANTASY_POINTS.skater.goal}b, A {MS_FANTASY_POINTS.skater.assist}b, ±{" "}
              {MS_FANTASY_POINTS.skater.plusMinus}b · brankář V {MS_FANTASY_POINTS.goalie.win}b, GA{" "}
              {MS_FANTASY_POINTS.goalie.goalAgainst}b, SO {MS_FANTASY_POINTS.goalie.shutout}b), ulož a vyhodnoť oproti
              odevzdaným sestavám v DB.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-sky-300"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
            Úvod
          </Link>
        </div>

        <section className="mb-8 rounded-2xl border border-[#f1c40f]/25 bg-[#f1c40f]/[0.04] p-4 sm:p-5">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 font-display text-lg font-bold text-white">
                <Trophy className="h-5 w-5 text-[#f1c40f]" aria-hidden />
                Celkové vyhodnocení MS 2026
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                Součet bodů ze všech vyhodnocených herních dnů. Po uložení statistik klikni na vyhodnocení.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={evaluatingAll || loadingOverall}
                onClick={() => void loadOverall()}
                className="rounded-xl border border-white/15 px-3 py-2 text-xs font-semibold text-slate-300 hover:border-white/30 disabled:opacity-40"
              >
                {loadingOverall ? "Načítám…" : "Obnovit"}
              </button>
              <button
                type="button"
                disabled={evaluatingAll || days.every((d) => d.lineupCount === 0)}
                onClick={() => void runEvaluateAll()}
                className="inline-flex items-center gap-2 rounded-xl bg-[#f1c40f] px-4 py-2 text-xs font-bold text-[#05060f] disabled:opacity-40"
              >
                <Calculator className="h-4 w-4" aria-hidden />
                {evaluatingAll ? "Vyhodnocuji vše…" : "Vyhodnotit všechny dny"}
              </button>
            </div>
          </div>

          {loadingOverall && overall.length === 0 ? (
            <p className="text-sm text-slate-500">Načítám celkové pořadí…</p>
          ) : overall.length === 0 ? (
            <p className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-slate-400">
              Zatím není vyhodnocen žádný den. Doplň statistiky a spusť vyhodnocení.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-white/10">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.04] text-[10px] uppercase tracking-wider text-slate-500">
                    <th className="px-3 py-2 text-left">#</th>
                    <th className="px-3 py-2 text-left">Hráč</th>
                    <th className="px-3 py-2 text-right">Celkem bodů</th>
                    <th className="px-3 py-2 text-right">Dnů</th>
                    <th className="px-3 py-2 text-left">Rozpis</th>
                  </tr>
                </thead>
                <tbody>
                  {overall.map((row, i) => {
                    const expanded = expandedUserId === row.userId;
                    return (
                      <tr key={row.userId} className="border-b border-white/[0.06] align-top">
                        <td className="px-3 py-2.5 text-slate-500">{i + 1}</td>
                        <td className="px-3 py-2.5 font-medium text-white">{row.displayName}</td>
                        <td className="px-3 py-2.5 text-right font-display text-lg font-bold tabular-nums text-[#f1c40f]">
                          {row.totalPoints}
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums text-slate-400">{row.daysPlayed}</td>
                        <td className="px-3 py-2.5">
                          <button
                            type="button"
                            onClick={() => setExpandedUserId(expanded ? null : row.userId)}
                            className="text-xs font-semibold text-cyan-400/90 hover:text-cyan-300"
                          >
                            {expanded ? "Skrýt" : "Zobrazit"}
                          </button>
                          {expanded ? (
                            <ul className="mt-2 space-y-1 text-xs text-slate-400">
                              {row.days.map((d) => (
                                <li key={d.slug} className="flex justify-between gap-4 tabular-nums">
                                  <span>{d.title}</span>
                                  <span className="font-semibold text-cyan-200/90">{d.points}b</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="mt-1 text-[10px] text-slate-600">
                              {row.days.map((d) => `${d.title} ${d.points}b`).join(" · ")}
                            </p>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="mb-8 rounded-2xl border border-cyan-400/20 bg-cyan-500/[0.04] p-4 sm:p-5">
          <div className="mb-4">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-white">
              <ImageIcon className="h-5 w-5 text-cyan-300" aria-hidden />
              IG plakát — nejlepší den
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Export 1080×1080 ve fantasy grafice — sestava na ledě, statistiky hráčů a kapitál. Jméno vítěze doplníš před stažením.
            </p>
          </div>
          <MsFantasyPosterExportPanel />
        </section>

        <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.15em] text-slate-500">Statistiky po dnech</h2>

        <div className="mb-4 flex flex-wrap gap-2">
          {days.map((d) => (
            <button
              key={d.slug}
              type="button"
              onClick={() => setSlug(d.slug)}
              className={`rounded-xl border px-3 py-2 text-left text-xs transition ${
                slug === d.slug
                  ? "border-cyan-400/50 bg-cyan-500/15 text-white"
                  : "border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/20"
              }`}
            >
              <span className="block font-semibold">{d.title}</span>
              <span className="mt-0.5 text-[10px] text-slate-500">
                {d.lineupCount} sestav · {d.statsCount} stat · {d.resultsCount} vyhodn.
              </span>
            </button>
          ))}
        </div>

        {selectedDayMeta && (
          <p className="mb-4 text-xs text-slate-500">
            {selectedDayMeta.title} · uzávěrka{" "}
            {new Date(selectedDayMeta.lockAt).toLocaleString("cs-CZ", {
              timeZone: "Europe/Prague",
              dateStyle: "medium",
              timeStyle: "short",
            })}
            {day ? ` · ${day.lineupCount} odevzdaných sestav · ${draft.length} unikátních hráčů ve výběrech` : null}
          </p>
        )}

        <div className="mb-4 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={saving || loading || draft.length === 0}
            onClick={() => void saveStats()}
            className="inline-flex items-center gap-2 rounded-xl bg-[#003087] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-40"
          >
            <Save className="h-4 w-4" aria-hidden />
            {saving ? "Ukládám…" : "Uložit statistiky"}
          </button>
          <button
            type="button"
            disabled={evaluating || loading || !day?.lineupCount}
            onClick={() => void runEvaluate()}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-40"
          >
            <Calculator className="h-4 w-4" aria-hidden />
            {evaluating ? "Počítám…" : "Vyhodnotit tento den"}
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-slate-500">Načítám hráče…</p>
        ) : draft.length === 0 ? (
          <p className="rounded-xl border border-white/10 bg-white/[0.03] p-6 text-sm text-slate-400">
            Pro tento den zatím nikdo neodevzdal fantasy sestavu — není co vyhodnotit.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.04] text-[10px] uppercase tracking-wider text-slate-500">
                  <th className="px-3 py-2">Hráč</th>
                  <th className="px-2 py-2">Tým</th>
                  <th className="px-2 py-2">Poz</th>
                  <th className="px-2 py-2 text-center">Sestav</th>
                  <th className="px-2 py-2">Statistiky</th>
                  <th className="px-3 py-2 text-right">Body</th>
                </tr>
              </thead>
              <tbody>
                {draft.map((p) => (
                  <tr key={p.rosterPlayerId} className="border-b border-white/[0.06] hover:bg-white/[0.02]">
                    <td className="px-3 py-2 font-medium text-white">
                      {p.name}
                      <span className="ml-1 text-[10px] text-slate-600">{p.code}</span>
                    </td>
                    <td className="px-2 py-2 text-slate-400">{p.team}</td>
                    <td className="px-2 py-2 text-slate-400">{p.position}</td>
                    <td className="px-2 py-2 text-center tabular-nums text-slate-300">{p.pickCount}</td>
                    <td className="px-2 py-2">
                      {p.position === "G" ? (
                        <div className="flex flex-wrap gap-2">
                          <StatInput label="V" value={p.wins} onChange={(n) => updatePlayer(p.rosterPlayerId, { wins: n })} max={3} />
                          <StatInput
                            label="GA"
                            value={p.goalsAgainst}
                            onChange={(n) => updatePlayer(p.rosterPlayerId, { goalsAgainst: n })}
                          />
                          <StatInput
                            label="SO"
                            value={p.shutouts}
                            onChange={(n) => updatePlayer(p.rosterPlayerId, { shutouts: n })}
                            max={3}
                          />
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          <StatInput label="G" value={p.goals} onChange={(n) => updatePlayer(p.rosterPlayerId, { goals: n })} />
                          <StatInput label="A" value={p.assists} onChange={(n) => updatePlayer(p.rosterPlayerId, { assists: n })} />
                          <StatInput
                            label="±"
                            value={p.plusMinus}
                            onChange={(n) => updatePlayer(p.rosterPlayerId, { plusMinus: n })}
                            min={-20}
                            max={20}
                          />
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right font-display text-lg font-bold tabular-nums text-cyan-200">
                      {p.fantasyPoints}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </main>
    </div>
  );
}
