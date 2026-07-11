"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { Nhl25SharePoster } from "@/components/Nhl25SharePoster";
import { isLineupComplete, normalizeLineupStructure } from "@/lib/lineupUtils";
import { NOMINATION_WEB_POSTER_H, NOMINATION_WEB_POSTER_W } from "@/lib/sharePosterLayout";
import type { LineupStructure, Player } from "@/types";

export function CommunityPosterThumb({
  players,
  lineup,
  captainId,
  createdAtIso,
  title,
  scale = 0.195,
  onNaturalSize,
}: {
  players: Player[];
  lineup: LineupStructure;
  captainId: string | null;
  createdAtIso?: string;
  title?: string | null;
  scale?: number;
  onNaturalSize?: (size: { width: number; height: number }) => void;
}) {
  const ls = normalizeLineupStructure(lineup);
  const posterRef = useRef<HTMLDivElement>(null);
  const [naturalSize, setNaturalSize] = useState({
    width: NOMINATION_WEB_POSTER_W,
    height: NOMINATION_WEB_POSTER_H,
  });

  useLayoutEffect(() => {
    const node = posterRef.current;
    if (!node) return;

    const sync = () => {
      const width = node.offsetWidth;
      const height = node.offsetHeight;
      if (width <= 0 || height <= 0) return;
      setNaturalSize((prev) =>
        prev.width === width && prev.height === height ? prev : { width, height }
      );
      onNaturalSize?.({ width, height });
    };

    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(node);
    return () => observer.disconnect();
  }, [onNaturalSize, players, lineup, title, captainId, createdAtIso]);

  if (!isLineupComplete(ls)) {
    return (
      <div className="flex h-[100px] w-[180px] shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[#0f172a]/90 text-xs text-slate-500">
        Náhled nedostupný
      </div>
    );
  }
  const height = Math.round(naturalSize.height * scale);
  const width = Math.round(naturalSize.width * scale);
  return (
    <div
      className="relative shrink-0 overflow-visible rounded-xl border border-white/10 bg-[#e8ecf2] shadow-inner"
      style={{ height, width }}
    >
      <div
        ref={posterRef}
        className="pointer-events-none absolute left-0 top-0 origin-top-left"
        style={{
          width: NOMINATION_WEB_POSTER_W,
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
