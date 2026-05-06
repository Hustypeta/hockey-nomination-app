"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { LineupStructure, Player } from "@/types";
import { collectMatchLineupIds } from "@/lib/matchLineupValidation";

type RatingMap = Record<string, { avg: number; count: number }>;

function clampInt(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, Math.round(n)));
}

export function MatchRatingClient({
  slug,
  players,
  lineup,
  defenseCount,
  allowExtraForward,
  initialRatings,
}: {
  slug: string;
  players: Player[];
  lineup: LineupStructure;
  defenseCount: 6 | 7 | 8;
  allowExtraForward: boolean;
  initialRatings: RatingMap;
}) {
  const [ratings, setRatings] = useState<RatingMap>(initialRatings);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => setRatings(initialRatings), [initialRatings]);

  const byId = useMemo(() => new Map(players.map((p) => [p.id, p])), [players]);
  const ids = useMemo(
    () => collectMatchLineupIds(lineup, { defenseCount, allowExtraForward }),
    [lineup, defenseCount, allowExtraForward]
  );

  const submit = async (playerId: string, value: number) => {
    const rating = clampInt(value, 1, 10);
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
        toast.error(typeof err === "string" ? err : "Hodnocení se nepovedlo.");
        return;
      }
      toast.success("Uloženo.");

      // Refresh aggregates (lightweight)
      const rr = await fetch(`/api/matches/${encodeURIComponent(slug)}`, { cache: "no-store" });
      const dd: unknown = await rr.json().catch(() => null);
      const nextRatings = (dd as { ratings?: unknown } | null)?.ratings;
      if (rr.ok && nextRatings && typeof nextRatings === "object") setRatings(nextRatings as RatingMap);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-3">
      {ids.map((pid) => {
        const p = byId.get(pid);
        if (!p) return null;
        const r = ratings[pid] ?? { avg: 0, count: 0 };
        return (
          <div key={pid} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate font-bold text-white">{p.name}</div>
                <div className="mt-1 text-xs text-white/60">
                  {p.club} · {p.league}
                </div>
              </div>
              <div className="shrink-0 text-right text-xs text-white/60">
                <div>
                  <span className="font-bold text-white">{r.avg.toFixed(2)}</span> / 10
                </div>
                <div>{r.count} hlasů</div>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((v) => (
                <button
                  key={v}
                  type="button"
                  disabled={busyId === pid}
                  onClick={() => void submit(pid, v)}
                  className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-xs font-bold text-white/90 hover:bg-white/[0.06] disabled:opacity-50"
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

