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
  ratingByPlayerId,
  myRatingByPlayerId,
  jerseyBadgesPreferFanAverage = false,
  onPlayerClick,
}: {
  lineup: LineupStructure;
  players: Player[];
  captainId: string | null;
  matchDefenseCount: 6 | 7 | 8;
  matchAllowExtraForward: boolean;
  /** Průměrné hodnocení 1–10 + počet hlasů (z DB). */
  ratingByPlayerId?: Record<string, { avg: number; count: number } | undefined>;
  /** Moje uložené hodnocení (slider v dialogu); na dres jen pokud `jerseyBadgesPreferFanAverage` je false. */
  myRatingByPlayerId?: Record<string, number | undefined>;
  /** Na dresu vždy průměr fanoušků (hodnocení zápasu). */
  jerseyBadgesPreferFanAverage?: boolean;
  /** Mobilní rating sheet — klik na dres otevře formulář s slidrem. */
  onPlayerClick?: (playerId: string) => void;
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
      ratingByPlayerId={ratingByPlayerId}
      myRatingByPlayerId={myRatingByPlayerId}
      jerseyBadgesPreferFanAverage={jerseyBadgesPreferFanAverage}
      onPlayerClick={onPlayerClick}
      matchPublicNamesOnly
    />
  );
}
