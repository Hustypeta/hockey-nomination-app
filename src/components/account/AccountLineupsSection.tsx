"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { AccountMatchLineupPreview } from "@/components/account/AccountMatchLineupPreview";
import { LineupPoolSwitcher } from "@/components/match/LineupPoolSwitcher";
import { initJerseyNameDisambiguation } from "@/lib/jerseyDisplayName";
import { DEFAULT_LINEUP_POOL } from "@/lib/lineupPools";
import { matchLineupEditorHref, normalizeMatchSharePoolKey } from "@/lib/matchSharePool";
import { normalizeLineupStructure } from "@/lib/lineupUtils";
import { FIFA_BTN_PRIMARY } from "@/lib/fifa/fifaUiClasses";
import type { LineupStructure, Player } from "@/types";

type MatchLineupRow = {
  code: string;
  title: string | null;
  createdAt: string;
  defenseCount: number;
  allowExtraForward: boolean;
  lineupStructure: unknown;
  poolKey?: string | null;
};

function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString("cs-CZ", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });
}

function lineupTitle(row: MatchLineupRow) {
  return row.title?.trim() || "Zápasová sestava";
}

function defenseCountFromRow(row: MatchLineupRow): 6 | 7 | 8 {
  return row.defenseCount === 6 || row.defenseCount === 7 || row.defenseCount === 8 ? row.defenseCount : 7;
}

function lineupFromRow(row: MatchLineupRow): LineupStructure | null {
  if (!row.lineupStructure || typeof row.lineupStructure !== "object") return null;
  try {
    return normalizeLineupStructure(row.lineupStructure as LineupStructure, { mode: "match" });
  } catch {
    return null;
  }
}

export function AccountLineupsSection() {
  const [lineups, setLineups] = useState<MatchLineupRow[] | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [poolKey, setPoolKey] = useState<string>(DEFAULT_LINEUP_POOL);
  const [poolCounts, setPoolCounts] = useState<Record<string, number>>({});
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/players?meta=1")
      .then((r) => r.json())
      .then((data: { pools?: { poolKey: string; count: number }[] }) => {
        if (cancelled || !Array.isArray(data.pools)) return;
        const map: Record<string, number> = {};
        for (const p of data.pools) map[p.poolKey] = p.count;
        setPoolCounts(map);
      })
      .catch(() => {
        /* ignore */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/account/match-share-links", { credentials: "include", cache: "no-store" })
      .then((r) => {
        if (r.status === 401) return { links: [] as MatchLineupRow[] };
        if (!r.ok) throw new Error("fetch");
        return r.json();
      })
      .then((linksData: { links?: MatchLineupRow[] }) => {
        if (cancelled) return;
        setLineups(linksData.links ?? []);
      })
      .catch(() => {
        if (!cancelled) setLoadError("Nepodařilo se načíst uložené sestavy.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/players?pool=${encodeURIComponent(poolKey)}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((playerList: unknown) => {
        if (cancelled) return;
        const pl = Array.isArray(playerList) ? (playerList as Player[]) : [];
        setPlayers(pl);
        initJerseyNameDisambiguation(pl);
      })
      .catch(() => {
        if (!cancelled) setPlayers([]);
      });
    return () => {
      cancelled = true;
    };
  }, [poolKey]);

  const filteredLineups = useMemo(() => {
    if (!lineups) return null;
    return lineups.filter((row) => normalizeMatchSharePoolKey(row.poolKey) === poolKey);
  }, [lineups, poolKey]);

  const newHref = matchLineupEditorHref({ poolKey });

  return (
    <section className="fifa-account-section">
      <div className="fifa-account-section__head">
        <div>
          <h2 className="fifa-account-section__title">Moje sestavy</h2>
          <p className="fifa-account-section__desc">Uložené zápasové sestavy z editoru</p>
        </div>
        <Link href={newHref} className={`${FIFA_BTN_PRIMARY} fifa-account-section__action`}>
          <Plus className="h-3.5 w-3.5" aria-hidden />
          Nová sestava
        </Link>
      </div>

      <div className="mb-4">
        <LineupPoolSwitcher
          value={poolKey}
          onChange={setPoolKey}
          counts={poolCounts}
          size="comfortable"
        />
      </div>

      {loadError ? (
        <p className="fifa-account-section__empty">{loadError}</p>
      ) : filteredLineups === null ? (
        <div className="fifa-account-section__loading">
          <Loader2 className="h-6 w-6 animate-spin text-[var(--fifa-accent-text)]" aria-hidden />
        </div>
      ) : filteredLineups.length === 0 ? (
        <p className="fifa-account-section__empty">
          V tomto poolu zatím nemáš uložené sestavy.{" "}
          <Link href={newHref} className="text-[var(--fifa-accent-text)] hover:underline">
            Vytvoř první zápasovou sestavu
          </Link>
          .
        </p>
      ) : (
        <div className="fifa-account-lineup-tiles">
          {filteredLineups.map((row) => {
            const title = lineupTitle(row);
            const lineup = lineupFromRow(row);
            const rowPool = normalizeMatchSharePoolKey(row.poolKey);
            return (
              <Link
                key={row.code}
                href={matchLineupEditorHref({ code: row.code, poolKey: rowPool })}
                className="fifa-account-lineup-tile fifa-card fifa-card--interactive"
              >
                <div className="fifa-account-lineup-tile__preview">
                  {lineup && players.length > 0 ? (
                    <AccountMatchLineupPreview
                      lineup={lineup}
                      players={players}
                      defenseCount={defenseCountFromRow(row)}
                      allowExtraForward={row.allowExtraForward}
                    />
                  ) : (
                    <div className="fifa-account-lineup-tile__preview-fallback" aria-hidden />
                  )}
                </div>
                <div className="fifa-account-lineup-tile__meta">
                  <div className="fifa-account-lineup-tile__name">{title}</div>
                  <div className="fifa-account-lineup-tile__date">{formatShortDate(row.createdAt)}</div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
