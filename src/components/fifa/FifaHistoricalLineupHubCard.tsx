"use client";

import Link from "next/link";
import { FifaHistoricalLineupCardArt } from "@/components/fifa/FifaHistoricalLineupCardArt";
import { FifaHubMenuCard } from "@/components/fifa/FifaHubMenuCard";
import {
  HISTORICAL_LINEUP_HEADLINE,
  HISTORICAL_LINEUP_SUBTITLE,
  HISTORICAL_LINEUP_TITLE,
} from "@/lib/fifa/historicalLineup";

export function FifaHistoricalLineupHubCard() {
  return (
    <Link
      href="/souteze/historical-lineup"
      className="block min-h-0 w-full lg:h-full"
      aria-label={`Otevřít: ${HISTORICAL_LINEUP_TITLE}`}
    >
      <FifaHubMenuCard
        title={HISTORICAL_LINEUP_HEADLINE}
        subtitle={HISTORICAL_LINEUP_SUBTITLE}
        art={<FifaHistoricalLineupCardArt />}
        preparing
        preparingOnly
        centerTitle
      />
    </Link>
  );
}
