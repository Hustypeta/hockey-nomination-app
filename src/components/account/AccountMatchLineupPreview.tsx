"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LineBuilder } from "@/components/LineBuilder";
import { FIFA_RINK_TEMPLATE_HEIGHT, FIFA_RINK_TEMPLATE_WIDTH } from "@/lib/fifa/fifaRinkTemplate";
import { normalizeLineupStructure } from "@/lib/lineupUtils";
import { computeForumPosterContainScale } from "@/lib/sharePosterLayout";
import type { LineupStructure, Player } from "@/types";

export function AccountMatchLineupPreview({
  lineup,
  players,
  defenseCount,
  allowExtraForward,
}: {
  lineup: LineupStructure;
  players: Player[];
  defenseCount: 6 | 7 | 8;
  allowExtraForward: boolean;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.2);

  const syncScale = useCallback(() => {
    const node = wrapRef.current;
    if (!node) return;
    const width = node.clientWidth;
    const height = node.clientHeight;
    if (width <= 0 || height <= 0) return;
    setScale(
      computeForumPosterContainScale(width, height, FIFA_RINK_TEMPLATE_WIDTH, FIFA_RINK_TEMPLATE_HEIGHT),
    );
  }, []);

  useEffect(() => {
    const node = wrapRef.current;
    if (!node) return;
    syncScale();
    const observer = new ResizeObserver(syncScale);
    observer.observe(node);
    return () => observer.disconnect();
  }, [syncScale, lineup, players]);

  const ls = normalizeLineupStructure(lineup, { mode: "match" });

  return (
    <div ref={wrapRef} className="fifa-account-lineup-preview fifa-account-lineup-preview--rink">
      <div
        className="fifa-account-lineup-preview__stage pointer-events-none absolute left-1/2 top-1/2 origin-center"
        style={{
          width: FIFA_RINK_TEMPLATE_WIDTH,
          height: FIFA_RINK_TEMPLATE_HEIGHT,
          transform: `translate(-50%, -50%) scale(${scale})`,
        }}
      >
        <LineBuilder
          lineup={ls}
          players={players}
          captainId={null}
          onLineupChange={() => {}}
          onCaptainChange={() => {}}
          selectedSlot={null}
          onSelectSlot={() => {}}
          enableDnd={false}
          readOnly
          mode="match"
          uiVariant="fifa"
          matchDefenseCount={defenseCount}
          matchAllowExtraForward={allowExtraForward}
          matchRinkPreview
        />
      </div>
    </div>
  );
}
