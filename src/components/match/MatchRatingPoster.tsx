"use client";

import { forwardRef, useMemo } from "react";
import type { LineupStructure, Player } from "@/types";
import { jerseyNameOnJersey } from "@/lib/jerseyDisplayName";
import { PremiumJerseySlotCard } from "@/components/sestava/PremiumJerseySlotCard";

export type MatchRatingPosterGroup = "goalies" | "defense" | "forwards-12" | "forwards-34";

const GROUP_TITLE: Record<MatchRatingPosterGroup, string> = {
  goalies: "Brankáři",
  defense: "Obrana",
  "forwards-12": "Útok – 1. a 2. lajna",
  "forwards-34": "Útok – 3. a 4. lajna",
};

type RatingMap = Record<string, { avg: number; count: number } | undefined>;
type MyMap = Record<string, number | undefined>;

function fmtRating(n: number | undefined): string {
  if (typeof n !== "number" || !Number.isFinite(n) || n <= 0) return "–";
  return n.toFixed(1).replace(".", ",");
}

function pickIds(
  lineup: LineupStructure,
  group: MatchRatingPosterGroup,
  defenseCount: 6 | 7 | 8,
  allowExtraForward: boolean
): string[] {
  if (group === "goalies") {
    return [lineup.goalies[0], lineup.goalies[1]].filter(Boolean) as string[];
  }
  if (group === "defense") {
    const ids: string[] = [];
    for (let i = 0; i < 3; i++) {
      const p = lineup.defensePairs[i];
      if (p.lb) ids.push(p.lb);
      if (p.rb) ids.push(p.rb);
    }
    if (defenseCount === 8) {
      const p = lineup.defensePairs[3];
      if (p.lb) ids.push(p.lb);
      if (p.rb) ids.push(p.rb);
    } else if (defenseCount === 7) {
      const p = lineup.defensePairs[3];
      if (p.lb) ids.push(p.lb);
    }
    return ids;
  }
  const lineRange = group === "forwards-12" ? [0, 1] : [2, 3];
  const ids: string[] = [];
  for (const li of lineRange) {
    const l = lineup.forwardLines[li];
    if (l.lw) ids.push(l.lw);
    if (l.c) ids.push(l.c);
    if (l.rw) ids.push(l.rw);
  }
  if (group === "forwards-34" && allowExtraForward && lineup.extraForwards[0]) {
    ids.push(lineup.extraForwards[0]);
  }
  return ids;
}

interface MatchRatingPosterProps {
  matchTitle: string;
  startsAtLabel?: string;
  group: MatchRatingPosterGroup;
  players: Player[];
  lineup: LineupStructure;
  defenseCount: 6 | 7 | 8;
  allowExtraForward: boolean;
  ratings: RatingMap;
  myRatings: MyMap;
  /** Pokud `true`, ukáže místo agregátu jen moje hodnocení (osobní share). */
  preferMine?: boolean;
}

/**
 * Off-screen plakát pro export hodnocení do PNG. Layout je 3 sloupce na desktopu / 2 na mobilu.
 */
export const MatchRatingPoster = forwardRef<HTMLDivElement, MatchRatingPosterProps>(
  function MatchRatingPoster(
    {
      matchTitle,
      startsAtLabel,
      group,
      players,
      lineup,
      defenseCount,
      allowExtraForward,
      ratings,
      myRatings,
      preferMine = false,
    },
    ref
  ) {
    const byId = useMemo(() => new Map(players.map((p) => [p.id, p])), [players]);
    const ids = useMemo(
      () => pickIds(lineup, group, defenseCount, allowExtraForward),
      [lineup, group, defenseCount, allowExtraForward]
    );
    const cols = ids.length <= 2 ? 2 : 3;

    return (
      <div
        ref={ref}
        className="match-rating-poster"
        style={{
          width: 1080,
          padding: 56,
          fontFamily: "'Barlow Condensed', 'Inter', system-ui, sans-serif",
          background:
            "linear-gradient(135deg, #050a18 0%, #0a1428 32%, #121c34 65%, #050a18 100%)",
          color: "white",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: 16,
            paddingBottom: 18,
            borderBottom: "2px solid rgba(241, 196, 15, 0.55)",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 800,
                letterSpacing: "0.32em",
                textTransform: "uppercase",
                color: "#f1c40f",
              }}
            >
              Hodnocení hráčů
            </div>
            <div
              style={{
                marginTop: 6,
                fontSize: 36,
                fontWeight: 900,
                lineHeight: 1.1,
                color: "white",
              }}
            >
              {matchTitle}
            </div>
            {startsAtLabel ? (
              <div style={{ marginTop: 4, fontSize: 14, color: "rgba(255,255,255,0.55)" }}>
                {startsAtLabel}
              </div>
            ) : null}
          </div>
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.5)",
              }}
            >
              {GROUP_TITLE[group]}
            </div>
            <div style={{ marginTop: 4, fontSize: 18, color: "rgba(255,255,255,0.7)" }}>
              {preferMine ? "Moje známky" : "Průměry komunity"}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gap: 28,
            marginTop: 28,
          }}
        >
          {ids.map((pid) => {
            const player = byId.get(pid) ?? null;
            const aggregate = ratings[pid];
            const mine = myRatings[pid];
            const display = preferMine
              ? typeof mine === "number"
                ? mine
                : null
              : aggregate && Number.isFinite(aggregate.avg) && aggregate.avg > 0
                ? aggregate.avg
                : typeof mine === "number"
                  ? mine
                  : null;
            const displayName = player ? jerseyNameOnJersey(player.name) : "";
            return (
              <div
                key={pid}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 10,
                  padding: 16,
                  borderRadius: 18,
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
                  <PremiumJerseySlotCard
                    player={player}
                    positionLabel={
                      group === "goalies"
                        ? "G"
                        : group === "defense"
                          ? "D"
                          : "F"
                    }
                    kind={group === "goalies" ? "goalie" : "skater"}
                    size="skater"
                    disableMotion
                    lightRinkSurface={false}
                  />
                  {display != null ? (
                    <div
                      style={{
                        position: "absolute",
                        top: -8,
                        left: "50%",
                        transform: "translateX(-50%)",
                        padding: "4px 10px",
                        borderRadius: 999,
                        background:
                          preferMine
                            ? "linear-gradient(180deg, #34d399 0%, #047857 100%)"
                            : "linear-gradient(180deg, #fde68a 0%, #d97706 100%)",
                        color: preferMine ? "white" : "#1a1208",
                        fontWeight: 900,
                        fontSize: 16,
                        letterSpacing: "0.02em",
                        boxShadow: "0 6px 18px rgba(0,0,0,0.45)",
                        border: "2px solid rgba(255,255,255,0.95)",
                      }}
                    >
                      {fmtRating(display)}
                    </div>
                  ) : null}
                </div>
                <div
                  style={{
                    marginTop: 6,
                    fontSize: 18,
                    fontWeight: 800,
                    color: "white",
                    textAlign: "center",
                    lineHeight: 1.1,
                  }}
                >
                  {player ? player.name : "—"}
                </div>
                {player ? (
                  <div
                    style={{
                      fontSize: 11,
                      color: "rgba(255,255,255,0.55)",
                      textAlign: "center",
                      lineHeight: 1.2,
                    }}
                  >
                    {player.club}
                    {player.league ? ` · ${player.league}` : ""}
                  </div>
                ) : null}
                {!preferMine && aggregate ? (
                  <div
                    style={{
                      marginTop: 2,
                      fontSize: 11,
                      color: "rgba(255,255,255,0.45)",
                    }}
                  >
                    {aggregate.count} hlasů
                  </div>
                ) : null}
                {preferMine && typeof mine === "number" ? (
                  <div
                    style={{
                      marginTop: 2,
                      fontSize: 11,
                      color: "rgba(255,255,255,0.45)",
                    }}
                  >
                    Tvoje známka
                  </div>
                ) : null}
                {/* Jméno na dresu (disambiguated) jako reference, jen menší. */}
                {player && player.name !== displayName ? (
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>
                    Na dresu: {displayName}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        <div
          style={{
            marginTop: 36,
            textAlign: "center",
            fontSize: 12,
            color: "rgba(255,255,255,0.4)",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          hokejlineup.cz
        </div>
      </div>
    );
  }
);
