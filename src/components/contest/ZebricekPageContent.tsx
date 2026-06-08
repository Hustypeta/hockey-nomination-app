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
      <div
        className="mb-6 flex rounded-2xl border border-white/12 bg-white/[0.04] p-1"
        role="tablist"
        aria-label="Žebříčky soutěží"
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === "nominace"}
          onClick={() => selectTab("nominace")}
          className={`flex-1 rounded-xl px-3 py-2.5 text-sm font-bold transition ${
            tab === "nominace"
              ? "bg-[#003087]/80 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]"
              : "text-white/55 hover:text-white/85"
          }`}
        >
          Nominace
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "fantasy"}
          onClick={() => selectTab("fantasy")}
          className={`flex-1 rounded-xl px-3 py-2.5 text-sm font-bold transition ${
            tab === "fantasy"
              ? "bg-[#f1c40f]/20 text-[#f1e6a8] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
              : "text-white/55 hover:text-white/85"
          }`}
        >
          Fantasy
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
