"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FifaAppPage } from "@/components/fifa/FifaAppPage";
import { ContestLeaderboardView } from "@/components/contest/ContestLeaderboardView";
import { FantasyLeaderboardView } from "@/components/fantasy/FantasyLeaderboardView";
import { LeaderboardColumn, type LeaderboardPaneId } from "@/components/zebricek/LeaderboardColumn";
import { Sparkles, Trophy } from "lucide-react";

function paneFromParam(raw: string | null): LeaderboardPaneId {
  if (raw === "fantasy" || raw === "f") return "fantasy";
  return "nominace";
}

export function ZebricekHubContent() {
  const searchParams = useSearchParams();
  const [mobilePane, setMobilePane] = useState<LeaderboardPaneId>(() => paneFromParam(searchParams.get("soutez")));

  useEffect(() => {
    setMobilePane(paneFromParam(searchParams.get("soutez")));
  }, [searchParams]);

  const selectPane = useCallback((next: LeaderboardPaneId) => {
    setMobilePane(next);
    const url = new URL(window.location.href);
    if (next === "fantasy") url.searchParams.set("soutez", "fantasy");
    else url.searchParams.delete("soutez");
    window.history.replaceState(null, "", `${url.pathname}${url.search}`);
  }, []);

  return (
    <FifaAppPage className="!py-2 lg:!py-2.5" fillMobile>
      <div className="fifa-viewport-page fifa-zebricek-page w-full max-w-none flex-1" data-mobile-pane={mobilePane}>
        <div className="fifa-zebricek-mobile-chrome">
          <div className="fifa-zebricek-mobile-switcher" role="tablist" aria-label="Žebříček soutěží">
            <button
              type="button"
              role="tab"
              aria-selected={mobilePane === "nominace"}
              className={`fifa-zebricek-mobile-switcher__tab${
                mobilePane === "nominace" ? " fifa-zebricek-mobile-switcher__tab--active" : ""
              }`}
              onClick={() => selectPane("nominace")}
            >
              <Trophy className="fifa-zebricek-mobile-switcher__icon" aria-hidden />
              Tipovačka
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mobilePane === "fantasy"}
              className={`fifa-zebricek-mobile-switcher__tab${
                mobilePane === "fantasy" ? " fifa-zebricek-mobile-switcher__tab--active" : ""
              }`}
              onClick={() => selectPane("fantasy")}
            >
              <Sparkles className="fifa-zebricek-mobile-switcher__icon" aria-hidden />
              Daily Fantasy
            </button>
          </div>
        </div>

        <div className="fifa-viewport-page-body">
          <div className="fifa-zebricek-grid min-h-0 flex-1">
            <LeaderboardColumn
              pane="nominace"
              title="Tipovačka nominace MS 2026"
              icon={Trophy}
              status="Vyhodnoceno"
              statusVariant="evaluated"
            >
              <ContestLeaderboardView variant="panel" />
            </LeaderboardColumn>

            <LeaderboardColumn
              pane="fantasy"
              title="Daily Fantasy MS 2026"
              icon={Sparkles}
              status="Vyhodnoceno"
              statusVariant="evaluated"
            >
              <FantasyLeaderboardView variant="panel" />
            </LeaderboardColumn>
          </div>
        </div>
      </div>
    </FifaAppPage>
  );
}
