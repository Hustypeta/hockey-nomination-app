"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Calculator, ChevronLeft, Save, Trash2, Trophy } from "lucide-react";
import { toast } from "sonner";
import { AdminPasswordLoginForm } from "@/components/admin/AdminPasswordLoginForm";
import { AppLoadingScreen } from "@/components/AppLoadingScreen";
import { BracketPickemContent } from "@/components/bracket/BracketPickemContent";
import { SiteHeader } from "@/components/site/SiteHeader";
import { isBracketPickemComplete } from "@/lib/bracketPayload";
import type { PickemLeaderboardRow } from "@/lib/pickemLeaderboard";
import type { BracketPickemPayload } from "@/types/bracketPickem";
import { EMPTY_BRACKET_PICKEM } from "@/types/bracketPickem";

function readError(data: unknown): string | undefined {
  if (typeof data !== "object" || data === null) return undefined;
  const e = (data as { error?: unknown }).error;
  return typeof e === "string" ? e : undefined;
}

export function PickemAdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [draft, setDraft] = useState<BracketPickemPayload>(EMPTY_BRACKET_PICKEM);
  const [initialForEditor, setInitialForEditor] = useState<BracketPickemPayload | undefined>();
  const [officialUpdatedAt, setOfficialUpdatedAt] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<PickemLeaderboardRow[]>([]);
  const [entriesTotal, setEntriesTotal] = useState(0);
  const [editorKey, setEditorKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  const loadOfficial = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/pickem/official-results", { credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(readError(data) ?? "Nepodařilo se načíst oficiální výsledky.");
        return;
      }
      const payload = (data as { payload?: BracketPickemPayload | null }).payload;
      const updatedAt = (data as { updatedAt?: string | null }).updatedAt ?? null;
      setOfficialUpdatedAt(updatedAt);
      if (payload) {
        setDraft(payload);
        setInitialForEditor(payload);
        setEditorKey((k) => k + 1);
      } else {
        setInitialForEditor(undefined);
        setDraft(EMPTY_BRACKET_PICKEM);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const loadEvaluate = useCallback(async () => {
    const res = await fetch("/api/admin/pickem/evaluate", { credentials: "include" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      if ((data as { error?: string }).error?.includes("Chybí oficiální")) {
        setLeaderboard([]);
        setEntriesTotal(0);
        return;
      }
      toast.error(readError(data) ?? "Vyhodnocení selhalo.");
      return;
    }
    setLeaderboard((data as { leaderboard?: PickemLeaderboardRow[] }).leaderboard ?? []);
    setEntriesTotal((data as { entriesTotal?: number }).entriesTotal ?? 0);
  }, []);

  const checkAuth = useCallback(async () => {
    const res = await fetch("/api/admin/pickem/official-results", { credentials: "include" });
    setAuthed(res.ok);
    if (res.ok) {
      await loadOfficial();
      await loadEvaluate();
    }
  }, [loadOfficial, loadEvaluate]);

  useEffect(() => {
    void checkAuth();
  }, [checkAuth]);

  const saveOfficial = async () => {
    if (!isBracketPickemComplete(draft)) {
      toast.error("Vyplň celý formulář — skupiny, play-off i bonusové tipy.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/pickem/official-results", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload: draft }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(readError(data) ?? "Uložení se nepovedlo.");
        return;
      }
      toast.success("Oficiální výsledky Pick'em uloženy.");
      await loadOfficial();
      await loadEvaluate();
    } finally {
      setSaving(false);
    }
  };

  const runEvaluate = async () => {
    setEvaluating(true);
    try {
      const res = await fetch("/api/admin/pickem/evaluate", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(readError(data) ?? "Vyhodnocení selhalo.");
        return;
      }
      setLeaderboard((data as { leaderboard?: PickemLeaderboardRow[] }).leaderboard ?? []);
      setEntriesTotal((data as { entriesTotal?: number }).entriesTotal ?? 0);
      toast.success(
        `Vyhodnoceno ${(data as { entriesEvaluated?: number }).entriesEvaluated ?? 0} účastníků.`,
      );
    } finally {
      setEvaluating(false);
    }
  };

  const deleteOfficial = async () => {
    if (!window.confirm("Opravdu smazat oficiální výsledky? Žebříček přestane být veřejný.")) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/admin/pickem/official-results", {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(readError(data) ?? "Smazání se nepovedlo.");
        return;
      }
      setOfficialUpdatedAt(null);
      setLeaderboard([]);
      setEntriesTotal(0);
      toast.success("Oficiální výsledky odstraněny.");
    } finally {
      setDeleting(false);
    }
  };

  if (authed === null) return <AppLoadingScreen tagline="Admin · Pick'em" message="Ověřuji přístup…" intro={null} />;

  if (!authed) {
    return (
      <AdminPasswordLoginForm
        title="Admin — Pick'em vyhodnocení"
        description="Přihlášení stejným heslem jako u ostatních admin stránek (cookie contest_admin)."
        onLoggedIn={checkAuth}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#05060a] text-white">
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-wide text-white sm:text-3xl">
              Admin — Pick&apos;em vyhodnocení
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-400">
              Naklikej oficiální výsledky MS 2026, ulož je a spusť vyhodnocení. Žebříček se pak zobrazí na{" "}
              <Link href="/zebricek?soutez=pickem" className="text-cyan-400/90 hover:underline">
                /zebricek
              </Link>
              .
            </p>
            {officialUpdatedAt ? (
              <p className="mt-2 text-xs text-emerald-300/80">
                Oficiální výsledky uloženy · {new Date(officialUpdatedAt).toLocaleString("cs-CZ")}
              </p>
            ) : (
              <p className="mt-2 text-xs text-amber-300/80">Oficiální výsledky zatím nejsou uložené.</p>
            )}
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-sky-300"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
            Úvod
          </Link>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={saving || loading}
            onClick={() => void saveOfficial()}
            className="inline-flex items-center gap-2 rounded-xl bg-[#003087] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-40"
          >
            <Save className="h-4 w-4" aria-hidden />
            {saving ? "Ukládám…" : "Uložit oficiální výsledky"}
          </button>
          <button
            type="button"
            disabled={evaluating || !officialUpdatedAt}
            onClick={() => void runEvaluate()}
            className="inline-flex items-center gap-2 rounded-xl bg-[#f1c40f] px-4 py-2.5 text-sm font-bold text-[#05060f] disabled:opacity-40"
          >
            <Calculator className="h-4 w-4" aria-hidden />
            {evaluating ? "Vyhodnocuji…" : "Vyhodnotit soutěžní tipy"}
          </button>
          <button
            type="button"
            disabled={deleting || !officialUpdatedAt}
            onClick={() => void deleteOfficial()}
            className="inline-flex items-center gap-2 rounded-xl border border-rose-400/35 px-4 py-2.5 text-sm font-semibold text-rose-200 disabled:opacity-40"
          >
            <Trash2 className="h-4 w-4" aria-hidden />
            {deleting ? "Mažu…" : "Smazat oficiální výsledky"}
          </button>
        </div>

        <section className="mb-8 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
          {loading ? (
            <p className="text-sm text-slate-500">Načítám editor…</p>
          ) : (
            <BracketPickemContent
              key={editorKey}
              adminMode
              initialPayload={initialForEditor}
              onPicksChange={setDraft}
            />
          )}
        </section>

        <section className="rounded-2xl border border-[#f1c40f]/25 bg-[#f1c40f]/[0.04] p-4 sm:p-5">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 font-display text-lg font-bold text-white">
                <Trophy className="h-5 w-5 text-[#f1c40f]" aria-hidden />
                Žebříček Pick&apos;em
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                {entriesTotal} soutěžních tipů v databázi · max. 86 bodů na účastníka
              </p>
            </div>
            <button
              type="button"
              disabled={evaluating || !officialUpdatedAt}
              onClick={() => void runEvaluate()}
              className="rounded-xl border border-white/15 px-3 py-2 text-xs font-semibold text-slate-300 hover:border-white/30 disabled:opacity-40"
            >
              Obnovit
            </button>
          </div>

          {leaderboard.length === 0 ? (
            <p className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-slate-400">
              {officialUpdatedAt
                ? "Žádné soutěžní tipy k vyhodnocení, nebo ještě nebylo spuštěno vyhodnocení."
                : "Nejdřív ulož oficiální výsledky výše."}
            </p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-white/10">
              <table className="w-full min-w-[520px] text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.04] text-[10px] uppercase tracking-wider text-slate-500">
                    <th className="px-3 py-2 text-left">#</th>
                    <th className="px-3 py-2 text-left">Hráč</th>
                    <th className="px-3 py-2 text-right">Body</th>
                    <th className="px-3 py-2 text-left">Rozpis</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((row) => {
                    const expanded = expandedUserId === row.userId;
                    const b = row.breakdown;
                    return (
                      <tr key={row.userId} className="border-b border-white/[0.06] align-top">
                        <td className="px-3 py-2.5 text-slate-500">{row.rank}</td>
                        <td className="px-3 py-2.5 font-medium text-white">{row.displayName}</td>
                        <td className="px-3 py-2.5 text-right font-display text-lg font-bold tabular-nums text-[#f1c40f]">
                          {row.points}
                        </td>
                        <td className="px-3 py-2.5">
                          <button
                            type="button"
                            onClick={() => setExpandedUserId(expanded ? null : row.userId)}
                            className="text-xs font-semibold text-cyan-400/90 hover:text-cyan-300"
                          >
                            {expanded ? "Skrýt" : "Zobrazit"}
                          </button>
                          {expanded ? (
                            <ul className="mt-2 space-y-0.5 text-xs text-slate-400">
                              <li>
                                Skupina A: {b.groupA.points}/{b.groupA.max} b ({b.groupA.correctPositions} přesných)
                              </li>
                              <li>
                                Skupina B: {b.groupB.points}/{b.groupB.max} b ({b.groupB.correctPositions} přesných)
                              </li>
                              <li>
                                Čtvrtfinále: {b.quarterfinals.reduce((s, m) => s + m.points, 0)}/
                                {b.quarterfinals.length * 3} b
                              </li>
                              <li>
                                Semifinále: {b.semifinals.reduce((s, m) => s + m.points, 0)}/
                                {b.semifinals.length * 4} b
                              </li>
                              <li>
                                Finále: {b.final.points}/6 b · Bronz: {b.bronze.points}/3 b
                              </li>
                              <li>
                                Bonusy: {b.bonus.points}/{b.bonus.max} b
                              </li>
                            </ul>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
