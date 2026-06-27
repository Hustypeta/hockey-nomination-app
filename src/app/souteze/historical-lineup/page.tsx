import type { Metadata } from "next";
import { FifaHistoricalLineupContent } from "@/components/fifa/FifaHistoricalLineupContent";
import { HISTORICAL_LINEUP_TITLE } from "@/lib/fifa/historicalLineup";
import { SiteShell } from "@/components/site/SiteShell";

export const metadata: Metadata = {
  title: HISTORICAL_LINEUP_TITLE,
};

export default function SoutezeHistoricalLineupPage() {
  return (
    <SiteShell>
      <FifaHistoricalLineupContent />
    </SiteShell>
  );
}
