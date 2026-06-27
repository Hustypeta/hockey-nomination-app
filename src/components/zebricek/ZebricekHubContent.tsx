"use client";

import { FifaAppPage } from "@/components/fifa/FifaAppPage";
import { ContestLeaderboardView } from "@/components/contest/ContestLeaderboardView";
import { FantasyLeaderboardView } from "@/components/fantasy/FantasyLeaderboardView";
import { LeaderboardColumn } from "@/components/zebricek/LeaderboardColumn";
import { Sparkles, Trophy } from "lucide-react";

export function ZebricekHubContent() {
  return (
    <FifaAppPage className="!py-2 lg:!py-2.5">
      <div className="fifa-viewport-page w-full max-w-none flex-1">
        <div className="fifa-viewport-page-body">
          <div className="fifa-zebricek-grid fifa-viewport-page-body--scroll-mobile min-h-0 flex-1">
          <LeaderboardColumn
            title="Tipovačka nominace"
            soutezHref="/sestava"
            icon={Trophy}
            status="Vyhodnoceno"
            statusVariant="evaluated"
          >
            <ContestLeaderboardView variant="panel" />
          </LeaderboardColumn>

          <LeaderboardColumn
            title="Fantasy"
            soutezHref="/fantasy"
            icon={Sparkles}
            status="Ukončeno · čeká na vyhodnocení"
            statusVariant="pending"
          >
            <FantasyLeaderboardView variant="panel" />
          </LeaderboardColumn>
        </div>
        </div>
      </div>
    </FifaAppPage>
  );
}
