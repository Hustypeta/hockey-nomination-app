"use client";

import { useCallback, useEffect, useState } from "react";

export type ContestStats = {
  nominationCount: number | null;
  communityUsersCount: number | null;
  pickemCount: number | null;
  contestTimeBonusPercent: number;
  contestSubmissionOpen: boolean;
};

const DEFAULT_STATS: ContestStats = {
  nominationCount: null,
  communityUsersCount: null,
  pickemCount: null,
  contestTimeBonusPercent: 0,
  contestSubmissionOpen: true,
};

/**
 * Načte /api/stats — počet účtů s odeslanou nominací do soutěže, časový bonus, uzávěrka odeslání.
 */
export function useContestStats() {
  const [stats, setStats] = useState<ContestStats>(DEFAULT_STATS);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;

    const load = () => {
      fetch("/api/stats")
        .then((r) => r.json())
        .then(
          (d: {
            nominationCount?: number | null;
            communityUsersCount?: number | null;
            pickemCount?: number | null;
            contestTimeBonusPercent?: number;
            contestSubmissionOpen?: boolean;
          }) => {
            if (cancelled) return;
            setStats({
              nominationCount: typeof d.nominationCount === "number" ? d.nominationCount : null,
              communityUsersCount:
                typeof d.communityUsersCount === "number" ? d.communityUsersCount : null,
              pickemCount: typeof d.pickemCount === "number" ? d.pickemCount : null,
              contestTimeBonusPercent:
                typeof d.contestTimeBonusPercent === "number" ? d.contestTimeBonusPercent : 0,
              contestSubmissionOpen: d.contestSubmissionOpen !== false,
            });
          }
        )
        .catch(() => {
          if (!cancelled) setStats(DEFAULT_STATS);
        });
    };

    load();
    const id = setInterval(load, 60_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [tick]);

  return { ...stats, refresh };
}
