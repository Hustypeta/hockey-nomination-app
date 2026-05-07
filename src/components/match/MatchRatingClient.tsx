"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { signIn } from "next-auth/react";
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
  canRate = true,
  lockedReason,
}: {
  slug: string;
  players: Player[];
  lineup: LineupStructure;
  defenseCount: 6 | 7 | 8;
  allowExtraForward: boolean;
  initialRatings: RatingMap;
  canRate?: boolean;
  lockedReason?: string;
}) {
  const [ratings, setRatings] = useState<RatingMap>(initialRatings);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [draftById, setDraftById] = useState<Record<string, number>>({});

  useEffect(() => setRatings(initialRatings), [initialRatings]);

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
        if (r.status === 401) {
          toast.error("Pro hodnocení se musíte přihlásit.");
          void signIn("google", { callbackUrl: `/zapasy/${encodeURIComponent(slug)}` });
          return;
        }
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
      {!canRate ? (
        <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/70">
          {lockedReason || "Hodnocení se otevře po skončení zápasu."}
        </div>
      ) : null}
      {ids.map((pid) => {
        const p = byId.get(pid);
        if (!p) return null;
        const r = ratings[pid] ?? { avg: 0, count: 0 };
        const draft = draftById[pid] ?? 7;
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

            <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
              <div className="min-w-0">
                <div className="flex items-center justify-between text-xs text-white/60">
                  <span>1</span>
                  <span className="font-bold text-white">
                    Vybráno: <span className="tabular-nums">{draft}</span>
                  </span>
                  <span>10</span>
                </div>
                <input
                  aria-label={`Hodnocení ${p.name}`}
                  type="range"
                  min={1}
                  max={10}
                  step={1}
                  value={draft}
                  disabled={!canRate || busyId === pid}
                  onChange={(e) => {
                    const v = clampInt(Number(e.target.value), 1, 10);
                    setDraftById((m) => ({ ...m, [pid]: v }));
                  }}
                  onMouseUp={() => void submit(pid, draft)}
                  onTouchEnd={() => void submit(pid, draft)}
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

