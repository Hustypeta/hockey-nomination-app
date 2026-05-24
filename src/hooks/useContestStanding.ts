"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export type ContestStanding = {
  published: boolean;
  participant: boolean;
  rank: number | null;
  points: number | null;
  maxPoints: number | null;
  totalParticipants: number;
  displayName?: string | null;
};

const EMPTY: ContestStanding = {
  published: false,
  participant: false,
  rank: null,
  points: null,
  maxPoints: null,
  totalParticipants: 0,
};

export function useContestStanding() {
  const { status } = useSession();
  const [standing, setStanding] = useState<ContestStanding>(EMPTY);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") {
      setStanding(EMPTY);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    fetch("/api/account/contest-standing", { credentials: "include", cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("load failed"))))
      .then((d: unknown) => {
        if (cancelled) return;
        const o = d as Record<string, unknown>;
        setStanding({
          published: Boolean(o.published),
          participant: Boolean(o.participant),
          rank: typeof o.rank === "number" ? o.rank : null,
          points: typeof o.points === "number" ? o.points : null,
          maxPoints: typeof o.maxPoints === "number" ? o.maxPoints : null,
          totalParticipants: typeof o.totalParticipants === "number" ? o.totalParticipants : 0,
          displayName: typeof o.displayName === "string" ? o.displayName : null,
        });
      })
      .catch(() => {
        if (!cancelled) setStanding(EMPTY);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [status]);

  return { standing, loading, isAuthenticated: status === "authenticated" };
}
