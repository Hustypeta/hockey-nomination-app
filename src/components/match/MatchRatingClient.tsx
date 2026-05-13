"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { signIn } from "next-auth/react";
import type { LineupStructure, Player } from "@/types";
import { collectMatchLineupIds } from "@/lib/matchLineupValidation";
import { getAmbiguousLastNameKeys, jerseyNameOnJersey } from "@/lib/jerseyDisplayName";

type RatingMap = Record<string, { avg: number; count: number }>;

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

/** Zaokrouhlíme na desetinu (1.0 – 10.0). */
function roundDeci(n: number): number {
  return Math.round(clamp(n, 1, 10) * 10) / 10;
}

function formatRating(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "–";
  return n.toFixed(1).replace(".", ",");
}

export function MatchRatingClient({
  slug,
  players,
  lineup,
  defenseCount,
  allowExtraForward,
  initialRatings,
  initialMyRatings = {},
  canRate = true,
  lockedReason,
  onRatingsChange,
  onMyRatingsChange,
  sheetCommittedPlayerId,
  onConsumeSheetCommitted,
}: {
  slug: string;
  players: Player[];
  lineup: LineupStructure;
  defenseCount: 6 | 7 | 8;
  allowExtraForward: boolean;
  initialRatings: RatingMap;
  initialMyRatings?: Record<string, number>;
  canRate?: boolean;
  lockedReason?: string;
  onRatingsChange?: (ratings: RatingMap) => void;
  onMyRatingsChange?: (mine: Record<string, number>) => void;
  /** Po uložení v mobilním sheetu – zruší „čekající změnu“ u daného hráče. */
  sheetCommittedPlayerId?: string | null;
  onConsumeSheetCommitted?: () => void;
}) {
  const [ratings, setRatings] = useState<RatingMap>(initialRatings);
  const [busyPid, setBusyPid] = useState<string | null>(null);
  const [busyBatch, setBusyBatch] = useState(false);
  const [draftById, setDraftById] = useState<Record<string, number>>({});
  const [myRatings, setMyRatings] = useState<Record<string, number>>(initialMyRatings);
  const [touched, setTouched] = useState<Set<string>>(() => new Set());

  useEffect(() => setRatings(initialRatings), [initialRatings]);
  useEffect(() => setMyRatings(initialMyRatings), [initialMyRatings]);

  useEffect(() => {
    setTouched(new Set());
  }, [slug]);

  useEffect(() => {
    if (!sheetCommittedPlayerId) return;
    setTouched((prev) => {
      const n = new Set(prev);
      n.delete(sheetCommittedPlayerId);
      return n;
    });
    onConsumeSheetCommitted?.();
  }, [sheetCommittedPlayerId, onConsumeSheetCommitted]);

  const ambiguousJerseyLastKeys = useMemo(() => getAmbiguousLastNameKeys(players), [players]);
  const byId = useMemo(() => new Map(players.map((p) => [p.id, p])), [players]);
  const ids = useMemo(
    () => collectMatchLineupIds(lineup, { defenseCount, allowExtraForward }),
    [lineup, defenseCount, allowExtraForward]
  );

  /** Po načtení / změně sestavy sjednotí drafty bez přepsání „dotčených“ sliderů uživatelem. */
  useEffect(() => {
    setDraftById((prev) => {
      const next: Record<string, number> = { ...prev };
      for (const pid of ids) {
        if (!(pid in prev)) {
          const m = initialMyRatings[pid];
          const r = initialRatings[pid] ?? { avg: 0, count: 0 };
          const fan =
            r.count > 0 && Number.isFinite(r.avg) && r.avg > 0 && r.avg <= 10 ? roundDeci(r.avg) : 7;
          next[pid] = typeof m === "number" ? roundDeci(m) : fan;
        }
      }
      for (const k of Object.keys(next)) {
        if (!ids.includes(k)) delete next[k];
      }
      return next;
    });
  }, [slug, ids, initialMyRatings, initialRatings]);

  const saveBatchPending = async () => {
    if (!canRate) {
      toast.error(lockedReason || "Hodnocení zatím není otevřené.");
      return;
    }
    const todo = [...touched];
    if (todo.length === 0) {
      toast.message("Žádné změny k uložení — nejdřív pohni slidery.", { duration: 2400 });
      return;
    }
    setBusyBatch(true);
    let okCnt = 0;
    const mergedMine: Record<string, number> = { ...myRatings };
    try {
      for (const pid of todo) {
        const vRaw = draftById[pid];
        if (typeof vRaw !== "number" || Number.isNaN(vRaw)) continue;
        const rating = roundDeci(vRaw);
        setBusyPid(pid);
        try {
          const r = await fetch(`/api/matches/${encodeURIComponent(slug)}/rate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ playerId: pid, rating }),
          });
          const data: unknown = await r.json().catch(() => ({}));
          const err = (data as { error?: unknown } | null)?.error;
          if (!r.ok) {
            if (r.status === 401) {
              toast.error("Pro hodnocení se musíte přihlásit.");
              void signIn("google", { callbackUrl: `/zapasy/${encodeURIComponent(slug)}` });
              return;
            }
            toast.error(typeof err === "string" ? err : "Hodnocení se nepovedlo.");
            continue;
          }
          mergedMine[pid] = rating;
          okCnt++;
        } finally {
          setBusyPid(null);
        }
      }

      if (okCnt === todo.length) {
        setMyRatings(mergedMine);
        onMyRatingsChange?.(mergedMine);

        const rr = await fetch(`/api/matches/${encodeURIComponent(slug)}`, { cache: "no-store" });
        const dd: unknown = await rr.json().catch(() => null);
        const nextRatings = (dd as { ratings?: unknown } | null)?.ratings;
        if (rr.ok && nextRatings && typeof nextRatings === "object") {
          const map = nextRatings as RatingMap;
          setRatings(map);
          onRatingsChange?.(map);
        }

        toast.success(`Uloženo tvoje hodnocení (${okCnt} hráčů).`);
        setTouched((prev) => {
          const n = new Set(prev);
          for (const p of todo) n.delete(p);
          return n;
        });
      } else if (okCnt > 0) {
        toast.error("Část se nepovedla — uložené úseky zkontroluj a zkus znovu.");
        setMyRatings(mergedMine);
        onMyRatingsChange?.(mergedMine);
      }
    } finally {
      setBusyBatch(false);
    }
  };

  return (
    <div className="space-y-3">
      {!canRate ? (
        <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/70">
          {lockedReason || "Hodnocení se otevře po skončení zápasu."}
        </div>
      ) : null}

      {ids.map((pid) => {
        const p = byId.get(pid);
        if (!p) return null;
        const r = ratings[pid] ?? { avg: 0, count: 0 };
        const mine = myRatings[pid];
        const defaultFromFans =
          r.count > 0 && Number.isFinite(r.avg) && r.avg > 0 && r.avg <= 10 ? roundDeci(r.avg) : 7;
        const draft = draftById[pid] ?? (typeof mine === "number" ? roundDeci(mine) : defaultFromFans);
        const displayName = jerseyNameOnJersey(p.name, ambiguousJerseyLastKeys);
        const fullName = p.name === displayName ? p.name : `${p.name} (${displayName})`;
        const dirty = touched.has(pid);
        return (
          <div key={pid} className={`rounded-2xl border bg-white/[0.03] p-4 ${dirty ? "border-sky-400/35 ring-1 ring-sky-400/14" : "border-white/10"}`}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <div className="truncate font-bold text-white">{fullName}</div>
                <div className="mt-1 text-xs text-white/60">
                  {p.club} · {p.league}
                </div>
                {dirty ? (
                  <div className="mt-2 inline-flex rounded-full bg-sky-400/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-sky-200">
                    Změněno — odešli tlačítkem níže
                  </div>
                ) : typeof mine === "number" ? (
                  <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-400/15 px-2 py-0.5 text-[11px] font-bold text-emerald-300">
                    Uložené u tebe: {formatRating(mine)}
                  </div>
                ) : null}
              </div>
              <div className="shrink-0 rounded-xl border border-amber-400/30 bg-amber-400/[0.08] px-3 py-2 text-right sm:text-right">
                <div className="text-[10px] font-semibold uppercase tracking-wide text-amber-200/90">
                  Průměr · {r.count} hlasů
                </div>
                <div className="font-display text-xl font-black tabular-nums text-amber-200">
                  {formatRating(r.avg)} / 10
                </div>
              </div>
            </div>

            <div className="mt-4 min-w-0">
              <div className="flex items-center justify-between text-xs text-white/60">
                <span>1,0</span>
                <span className="font-bold text-white">
                  Návrh: <span className="tabular-nums">{formatRating(draft)}</span>
                </span>
                <span>10,0</span>
              </div>
              <input
                aria-label={`Hodnocení ${p.name}`}
                type="range"
                min={1}
                max={10}
                step={0.1}
                value={draft}
                disabled={!canRate || busyPid !== null || busyBatch}
                onChange={(e) => {
                  const v = roundDeci(Number(e.target.value));
                  setDraftById((m) => ({ ...m, [pid]: v }));
                  setTouched((prev) => new Set(prev).add(pid));
                }}
                className="mt-2 w-full accent-[#00B4FF] disabled:opacity-50"
              />
            </div>
          </div>
        );
      })}

      {canRate && ids.length > 0 ? (
        <div className="sticky bottom-4 z-[1] rounded-2xl border border-emerald-400/35 bg-gradient-to-br from-black/92 to-[#081420]/95 px-4 py-3 shadow-[0_12px_40px_rgba(0,0,0,0.55)] backdrop-blur-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs leading-snug text-white/72">
              <span className="font-bold text-emerald-200">Uložit svoje hodnocení:</span> pošle všechny posunuté
              slidery k tvému účtu. Na dresích zůstanou průměry všech uživatelů.
            </div>
            <button
              type="button"
              disabled={busyBatch || touched.size === 0 || Boolean(busyPid)}
              onClick={() => void saveBatchPending()}
              className="shrink-0 rounded-xl border border-emerald-400/55 bg-gradient-to-b from-emerald-400 to-emerald-600 px-5 py-2.5 font-display text-sm font-black uppercase tracking-wide text-white shadow-[0_8px_24px_rgba(0,0,0,0.45)] disabled:opacity-50"
            >
              {busyBatch ? "Ukládám…" : touched.size === 0 ? "Není co uložit" : `Uložit (${touched.size})`}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
