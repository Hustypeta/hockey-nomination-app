"use client";

import { LineBuilder } from "@/components/LineBuilder";
import type { LineupStructure, Player } from "@/types";

/**
 * Read-only zobrazení oficiální zápasové sestavy. Je `"use client"`, aby šlo do `LineBuilder`
 * (který je client) předat no-op handlery — server komponenty nesmí předávat funkce do client props.
 */
export function MatchOfficialLineupView({
  lineup,
  players,
  captainId,
  matchDefenseCount,
  matchAllowExtraForward,
}: {
  lineup: LineupStructure;
  players: Player[];
  captainId: string | null;
  matchDefenseCount: 6 | 7 | 8;
  matchAllowExtraForward: boolean;
}) {
  return (
    <LineBuilder
      mode="match"
      layoutVariant="classic"
      lineup={lineup}
      players={players}
      captainId={captainId}
      onLineupChange={() => undefined}
      onCaptainChange={() => undefined}
      selectedSlot={null}
      onSelectSlot={() => undefined}
      enableDnd={false}
      readOnly
      matchDefenseCount={matchDefenseCount}
      matchAllowExtraForward={matchAllowExtraForward}
    />
  );
}
