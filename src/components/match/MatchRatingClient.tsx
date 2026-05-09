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
}: {
  slug: string;
  players: Player[];
  lineup: LineupStructure;
  defenseCount: 6 | 7 | 8;
  allowExtraForward: boolean;
  initialRatings: RatingMap;
  /** Předvyplněné moje hodnocení (z `/api/matches/[slug]/my-ratings`). Zatím volitelné. */
  initialMyRatings?: Record<string, number>;
  canRate?: boolean;
  lockedReason?: string;
  onRatingsChange?: (ratings: RatingMap) => void;
  onMyRatingsChange?: (mine: Record<string, number>) => void;
}) {
  const [ratings, setRatings] = useState<RatingMap>(initialRatings);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [draftById, setDraftById] = useState<Record<string, number>>(initialMyRatings);
  const [myRatings, setMyRatings] = useState<Record<string, number>>(initialMyRatings);

  useEffect(() => setRatings(initialRatings), [initialRatings]);
  useEffect(() => {
    setDraftById(initialMyRatings);
    setMyRatings(initialMyRatings);
  }, [initialMyRatings]);

  const ambiguousJerseyLastKeys = useMemo(() => getAmbiguousLastNameKeys(players), [players]);

  const byId = useMemo(() => new Map(players.map((p) => [p.id, p])), [players]);
  const ids = useMemo(
    () => collectMatchLineupIds(lineup, { defenseCount, allowExtraForward }),
    [lineup, defenseCount, allowExtraForward]
  );

  const submit = async (playerId: string, value: number) => {
    if (!canRate) {
      toast.error(lockedReason || "Hodnocení zatím není otevřené.");
      return;
    }
    const rating = roundDeci(value);
    setBusyId(playerId);
    try {
      const r = await fetch(`/api/matches/${encodeURIComponent(slug)}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, rating }),
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
        return;
      }
      toast.success(`Uloženo ${formatRating(rating)} / 10`);
      const nextMine = { ...myRatings, [playerId]: rating };
      setMyRatings(nextMine);
      onMyRatingsChange?.(nextMine);

      const rr = await fetch(`/api/matches/${encodeURIComponent(slug)}`, { cache: "no-store" });
      const dd: unknown = await rr.json().catch(() => null);
      const nextRatings = (dd as { ratings?: unknown } | null)?.ratings;
      if (rr.ok && nextRatings && typeof nextRatings === "object") {
        const map = nextRatings as RatingMap;
        setRatings(map);
        onRatingsChange?.(map);
      }
    } finally {
      setBusyId(null);
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
        const draft = draftById[pid] ?? mine ?? defaultFromFans;
        const displayName = jerseyNameOnJersey(p.name, ambiguousJerseyLastKeys);
        const fullName = p.name === displayName ? p.name : `${p.name} (${displayName})`;
        return (
          <div key={pid} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <div className="truncate font-bold text-white">{fullName}</div>
                <div className="mt-1 text-xs text-white/60">
                  {p.club} · {p.league}
                </div>
                {typeof mine === "number" ? (
                  <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-400/15 px-2 py-0.5 text-[11px] font-bold text-emerald-300">
                    Tvoje uložené: {formatRating(mine)}
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

            <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
              <div className="min-w-0">
                <div className="flex items-center justify-between text-xs text-white/60">
                  <span>1,0</span>
                  <span className="font-bold text-white">
                    Vybráno: <span className="tabular-nums">{formatRating(draft)}</span>
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
                  disabled={!canRate || busyId === pid}
                  onChange={(e) => {
                    const v = roundDeci(Number(e.target.value));
                    setDraftById((m) => ({ ...m, [pid]: v }));
                  }}
                  className="mt-2 w-full accent-[#00B4FF] disabled:opacity-50"
                />
              </div>
              <button
                type="button"
                disabled={!canRate || busyId === pid}
                onClick={() => void submit(pid, draft)}
                className="rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-sm font-black text-white/90 hover:bg-white/[0.06] disabled:opacity-50"
              >
                {busyId === pid ? "…" : "Uložit"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
