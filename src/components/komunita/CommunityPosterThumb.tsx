"use client";

import { Nhl25SharePoster } from "@/components/Nhl25SharePoster";
import { isLineupComplete, normalizeLineupStructure } from "@/lib/lineupUtils";
import { SHARE_POSTER_WIDTH_PX } from "@/lib/sharePosterLayout";
import type { LineupStructure, Player } from "@/types";

export function CommunityPosterThumb({
  players,
  lineup,
  captainId,
  createdAtIso,
  title,
  scale = 0.195,
}: {
  players: Player[];
  lineup: LineupStructure;
  captainId: string | null;
  createdAtIso?: string;
  title?: string | null;
  scale?: number;
}) {
  const ls = normalizeLineupStructure(lineup);
  if (!isLineupComplete(ls)) {
    return (
      <div className="flex h-[100px] w-[180px] shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[#0f172a]/90 text-xs text-slate-500">
        Náhled nedostupný
      </div>
    );
  }
  const height = Math.round(920 * scale);
  const width = Math.round(SHARE_POSTER_WIDTH_PX * scale);
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-xl border border-white/10 bg-[#e8ecf2] shadow-inner"
      style={{ height, width }}
    >
      <div
        className="pointer-events-none absolute left-0 top-0 origin-top-left"
        style={{
          width: SHARE_POSTER_WIDTH_PX,
          transform: `scale(${scale})`,
        }}
      >
        <Nhl25SharePoster
          players={players}
          lineup={ls}
          captainId={captainId}
          assistantIds={ls.assistantIds ?? []}
          nominationTitle={title ?? undefined}
          siteUrl=""
          footerInstantIso={createdAtIso}
        />
      </div>
    </div>
  );
}
