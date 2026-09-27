"use client";

import { FifaHistoricalLineupCardArt } from "@/components/fifa/FifaHistoricalLineupCardArt";
import { FifaHubMenuCard } from "@/components/fifa/FifaHubMenuCard";
import {
  HISTORICAL_LINEUP_HEADLINE,
  HISTORICAL_LINEUP_SUBTITLE,
} from "@/lib/fifa/historicalLineup";

export function FifaHistoricalLineupHubCard() {
  return (
    <div
      className="block w-full min-h-[13rem] lg-device:h-full lg-device:min-h-0"
      aria-disabled="true"
    >
      <FifaHubMenuCard
        title={HISTORICAL_LINEUP_HEADLINE}
        subtitle={HISTORICAL_LINEUP_SUBTITLE}
        art={<FifaHistoricalLineupCardArt />}
        preparing
        preparingOnly
        centerTitle
      />
    </div>
  );
}
