"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { Loader2, Pencil, X } from "lucide-react";
import { Nhl25SharePoster } from "@/components/Nhl25SharePoster";
import type { Player } from "@/types";
import type { LineupStructure } from "@/types";
import { isLineupComplete, normalizeLineupStructure } from "@/lib/lineupUtils";
import type { NominationListItem } from "@/components/account/UserAccountHub";

type NominationRow = NominationListItem & {
  lineupStructure: unknown;
};

function formatNominationWhen(iso: string) {
  return new Date(iso).toLocaleString("cs-CZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function PosterThumb({
  players,
  lineup,
  captainId,
  createdAtIso,
  nominationTitle,
  watermarkUserLabel,
}: {
  players: Player[];
  lineup: LineupStructure;
  captainId: string | null;
  createdAtIso: string;
  nominationTitle?: string | null;
  watermarkUserLabel?: string | null;
}) {
  const ls = normalizeLineupStructure(lineup);
  if (!isLineupComplete(ls)) {
    return (
      <div className="flex h-[100px] w-[180px] shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[#0f172a]/90 text-xs text-slate-500">
        Náhled nedostupný
      </div>
    );
  }
  return (
    <div className="relative h-[100px] w-[180px] shrink-0 overflow-hidden rounded-xl border border-white/10 bg-[#e8ecf2] shadow-inner">
      <div
        className="pointer-events-none absolute left-0 top-0 origin-top-left"
        style={{ transform: "scale(0.195)", width: 920 }}
      >
        <Nhl25SharePoster
          players={players}
          lineup={ls}
          captainId={captainId}
          assistantIds={ls.assistantIds ?? []}
          nominationTitle={nominationTitle ?? undefined}
          siteUrl=""
          footerInstantIso={createdAtIso}
          watermarkUserLabel={watermarkUserLabel ?? undefined}
        />
      </div>
    </div>
  );
}

export function MyNominationsPage() {
  const { status, data: session } = useSession();
  const accountWatermark =
    session?.user?.name?.trim() || session?.user?.email?.split("@")[0]?.trim() || "";
  const [players, setPlayers] = useState<Player[]>([]);
  const [nominations, setNominations] = useState<NominationRow[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [renameBusy, setRenameBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/players")
      .then((r) => r.json())
      .then((data: Player[]) => {
        if (!cancelled) setPlayers(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setPlayers([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (status !== "authenticated") return;
    let cancelled = false;
    fetch("/api/nominations")
      .then((r) => {
        if (r.status === 401) return { nominations: [] as NominationRow[] };
        if (!r.ok) throw new Error("fetch");
        return r.json();
      })
      .then((d: { nominations?: NominationRow[] }) => {
        if (!cancelled) setNominations(d.nominations ?? []);
      })
      .catch(() => {
        if (!cancelled) setLoadError("Nepodařilo se načíst nominace.");
      });
    return () => {
      cancelled = true;
    };
  }, [status]);

  if (status === "loading") {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#c8102e]" aria-hidden />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="font-sans text-2xl font-bold text-white">Moje nominace</h1>
        <p className="mt-3 text-slate-400">Pro zobrazení uložených nominací se přihlas.</p>
        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl: "/ucet/nominace" })}
          className="mt-8 rounded-xl bg-gradient-to-r from-[#c8102e] to-[#9e0c24] px-8 py-3.5 font-semibold text-white shadow-lg shadow-[#c8102e]/25 transition hover:brightness-110"
        >
          Přihlásit se přes Google
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:py-14">
      <nav className="mb-6 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
        <div>
          <Link href="/ucet" className="text-sky-300/90 hover:underline">
            Můj účet
          </Link>
          <span className="mx-2 text-slate-600">/</span>
          <span className="text-slate-400">Moje nominace</span>
        </div>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="rounded-lg border border-white/12 bg-black/20 px-3 py-1.5 text-xs font-medium text-white/85 transition hover:border-[#c8102e]/40 hover:bg-[#c8102e]/10 sm:text-sm"
        >
          Odhlásit
        </button>
      </nav>

      <h1 className="font-sans text-2xl font-bold text-white sm:text-3xl">Moje nominace</h1>
      <p className="mt-1 text-sm text-slate-500">
        Koncepty můžeš mít u účtu víc — do soutěže se započítá jen ta, kterou jednou odešleš tlačítkem v editoru.
      </p>

      {loadError ? <p className="mt-4 text-sm text-rose-300">{loadError}</p> : null}
      {nominations === null && !loadError ? (
        <p className="mt-10 flex items-center gap-2 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin text-[#c8102e]" aria-hidden />
          Načítám…
        </p>
      ) : null}
      {nominations && nominations.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-white/10 bg-black/25 p-8 text-center text-slate-400">
          Zatím nemáš uložený koncept. Zvol <strong className="text-white">Nová nominace</strong>, poskládej sestavu a v
          editoru ji <strong className="text-white">dokonči</strong> (tlačítko dole).
        </p>
      ) : null}

      {nominations && nominations.length > 0 ? (
        <ul className="mt-8 space-y-4">
          {nominations.map((n) => {
            const lineup =
              n.lineupStructure && typeof n.lineupStructure === "object"
                ? (n.lineupStructure as LineupStructure)
                : null;
            return (
              <li key={n.id} className="overflow-hidden rounded-xl border border-white/10 bg-[#0a1428]/90">
                {editingId === n.id ? (
                  <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
                    <label className="min-w-0 flex-1">
                      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-white/45">
                        Název nominace
                      </span>
                      <input
                        type="text"
                        value={editDraft}
                        onChange={(e) => setEditDraft(e.target.value)}
                        maxLength={80}
                        className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:border-[#c8102e]/45 focus:outline-none focus:ring-1 focus:ring-[#c8102e]/30"
                        placeholder="např. Po čtvrtfinále"
                      />
                    </label>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={renameBusy}
                        onClick={async () => {
                          setRenameBusy(true);
                          try {
                            const res = await fetch(`/api/nominations/${n.id}`, {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ title: editDraft.trim() || null }),
                            });
                            const data = await res.json().catch(() => ({}));
                            if (!res.ok) {
                              setLoadError(
                                typeof data.error === "string" ? data.error : "Uložení názvu se nepovedlo."
                              );
                              return;
                            }
                            setNominations((prev) =>
                              prev
                                ? prev.map((row) =>
                                    row.id === n.id ? { ...row, title: data.title ?? null } : row
                                  )
                                : prev
                            );
                            setEditingId(null);
                          } finally {
                            setRenameBusy(false);
                          }
                        }}
                        className="rounded-lg bg-[#003087] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0040a8] disabled:opacity-50"
                      >
                        {renameBusy ? "…" : "Uložit"}
                      </button>
                      <button
                        type="button"
                        disabled={renameBusy}
                        onClick={() => {
                          setEditingId(null);
                          setEditDraft("");
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-white/15 px-3 py-2 text-sm text-white/80 hover:bg-white/5"
                      >
                        <X className="h-4 w-4" aria-hidden />
                        Zrušit
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-stretch sm:gap-4 sm:p-4">
                    <div className="group flex min-w-0 flex-1 gap-4 rounded-lg">
                      {lineup && players.length > 0 ? (
                        <PosterThumb
                          players={players}
                          lineup={lineup}
                          captainId={n.captainId}
                          createdAtIso={n.createdAt}
                          nominationTitle={n.title}
                          watermarkUserLabel={accountWatermark || null}
                        />
                      ) : (
                        <div className="h-[100px] w-[180px] shrink-0 rounded-xl border border-white/10 bg-[#0f172a]/90" />
                      )}
                      <div className="min-w-0 flex-1 py-0.5">
                        <p className="text-base font-semibold text-white">
                          {n.title?.trim() || "Nominace bez názvu"}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">{formatNominationWhen(n.createdAt)}</p>
                        {n.isContestEntry ? (
                          <p className="mt-2 inline-flex rounded-md border border-[#f1c40f]/35 bg-[#f1c40f]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#f1e6a8]">
                            V soutěži
                          </p>
                        ) : (
                          <p className="mt-2 text-[10px] text-slate-500">Koncept</p>
                        )}
                        {n.isContestEntry && n.timeBonusPercent > 0 ? (
                          <p className="mt-1 text-xs text-amber-200/90">
                            Časový bonus při odeslání +{n.timeBonusPercent} %
                          </p>
                        ) : n.isContestEntry ? (
                          <p className="mt-1 text-xs text-slate-500">Časový bonus při odeslání 0 %</p>
                        ) : null}
                        <p className="mt-2 font-mono text-[10px] text-slate-600">{n.id}</p>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-row flex-wrap items-center justify-end gap-2 sm:flex-col sm:items-end sm:justify-center">
                      <Link
                        href={`/sestava?nominace=${encodeURIComponent(n.id)}`}
                        className="inline-flex items-center justify-center rounded-lg bg-[#003087] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0040a8]"
                      >
                        Upravit v editoru
                      </Link>
                      <Link
                        href={`/nominations/${n.id}`}
                        className="inline-flex items-center justify-center rounded-lg border border-white/15 px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-[#f1c40f]/35 hover:text-white"
                      >
                        Veřejný náhled
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(n.id);
                          setEditDraft(n.title ?? "");
                        }}
                        className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/12 px-3 py-2 text-xs font-semibold text-white/85 transition hover:border-[#f1c40f]/35 hover:bg-white/[0.04]"
                      >
                        <Pencil className="h-3.5 w-3.5" aria-hidden />
                        Přejmenovat
                      </button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
