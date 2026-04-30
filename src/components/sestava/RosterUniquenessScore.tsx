"use client";

import { useMemo } from "react";
import type { Player } from "@/types";
import { TOTAL_PLAYERS } from "@/types";

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

export function RosterUniquenessScore({ selectedPlayers }: { selectedPlayers: Player[] }) {
  const avg = useMemo(() => {
    if (!Array.isArray(selectedPlayers) || selectedPlayers.length === 0) return 0;
    const sum = selectedPlayers.reduce((s, p) => s + (Number.isFinite(p.pick_rate) ? p.pick_rate : 0), 0);
    // Prompt: průměr přes "počet pozic" (stabilní vůči nevyplněné sestavě).
    return sum / TOTAL_PLAYERS;
  }, [selectedPlayers]);

  const score = Math.max(0, Math.min(100, Math.round(avg)));
  const label = score >= 80 ? "Hraješ na jistotu (Mainstream Meta)" : score >= 40 ? "Vyvážená sestava" : "Hokejový hipster (Extrémně unikátní)";

  return (
    <div className="rounded-2xl border border-slate-900/10 bg-white/75 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Unikátnost sestavy</p>
          <p className="mt-1 line-clamp-2 text-sm font-bold text-slate-900">{label}</p>
        </div>
        <div className="shrink-0 rounded-full bg-slate-900/5 px-3 py-1 text-sm font-black tabular-nums text-slate-900">
          {score}%
        </div>
      </div>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-900/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-sky-500 via-emerald-500 to-amber-400"
          style={{ width: `${Math.round(clamp01(score / 100) * 100)}%` }}
          aria-hidden
        />
      </div>
      <p className="mt-2 text-[11px] leading-snug text-slate-600">
        Skóre = průměrný pick rate vybraných hráčů v sestavě.
      </p>
    </div>
  );
}

