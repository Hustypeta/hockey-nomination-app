"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ContestLeaderboardView } from "@/components/contest/ContestLeaderboardView";
import { FantasyLeaderboardView } from "@/components/fantasy/FantasyLeaderboardView";

type TabId = "nominace" | "fantasy";

function tabFromParam(raw: string | null): TabId {
  if (raw === "fantasy" || raw === "f") return "fantasy";
  return "nominace";
}

export function ZebricekPageContent() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<TabId>(() => tabFromParam(searchParams.get("soutez")));

  useEffect(() => {
    setTab(tabFromParam(searchParams.get("soutez")));
  }, [searchParams]);

  const selectTab = useCallback((next: TabId) => {
    setTab(next);
    const url = new URL(window.location.href);
    if (next === "fantasy") url.searchParams.set("soutez", "fantasy");
    else url.searchParams.delete("soutez");
    window.history.replaceState(null, "", `${url.pathname}${url.search}`);
  }, []);

  return (
    <div>
      <div className="fifa-tabs" role="tablist" aria-label="Žebříček soutěží">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "nominace"}
          onClick={() => selectTab("nominace")}
          className={`fifa-tab ${tab === "nominace" ? "fifa-tab--active" : ""}`}
        >
          Tipovačka nominace MS 2026
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "fantasy"}
          onClick={() => selectTab("fantasy")}
          className={`fifa-tab ${tab === "fantasy" ? "fifa-tab--active" : ""}`}
        >
          Daily Fantasy MS 2026
        </button>
      </div>

      <div role="tabpanel" hidden={tab !== "nominace"} className={tab === "nominace" ? undefined : "hidden"}>
        {tab === "nominace" ? <ContestLeaderboardView /> : null}
      </div>
      <div role="tabpanel" hidden={tab !== "fantasy"} className={tab === "fantasy" ? undefined : "hidden"}>
        {tab === "fantasy" ? <FantasyLeaderboardView /> : null}
      </div>
    </div>
  );
}
