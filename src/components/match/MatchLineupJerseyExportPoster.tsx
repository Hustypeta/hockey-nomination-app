"use client";

import { forwardRef, useMemo } from "react";
import type { LineupStructure, Player } from "@/types";
import { jerseyNameOnJersey } from "@/lib/jerseyDisplayName";
import { PremiumJerseySlotCard } from "@/components/sestava/PremiumJerseySlotCard";
import {
  MATCH_LINEUP_POSTER_GROUP_TITLE,
  pickMatchLineupSegmentPlayerIds,
  type MatchLineupPosterGroup,
} from "@/lib/matchLineupPosterSegments";

interface MatchLineupJerseyExportPosterProps {
  lineupTitle: string;
  group: MatchLineupPosterGroup;
  players: Player[];
  lineup: LineupStructure;
  defenseCount: 6 | 7 | 8;
  allowExtraForward: boolean;
}

/**
 * Jedna část exportu zápasové sestavy — dresy + jména, bez hodnocení (html-to-image).
 */
export const MatchLineupJerseyExportPoster = forwardRef<HTMLDivElement, MatchLineupJerseyExportPosterProps>(
  function MatchLineupJerseyExportPoster(
    { lineupTitle, group, players, lineup, defenseCount, allowExtraForward },
    ref
  ) {
    const byId = useMemo(() => new Map(players.map((p) => [p.id, p])), [players]);
    const ids = useMemo(
      () => pickMatchLineupSegmentPlayerIds(lineup, group, defenseCount, allowExtraForward),
      [lineup, group, defenseCount, allowExtraForward]
    );
    const cols = 2;

    return (
      <div
        ref={ref}
        className="match-lineup-jersey-export-poster"
        style={{
          width: 1080,
          padding: 56,
          fontFamily: "'Barlow Condensed', 'Inter', system-ui, sans-serif",
          background:
            "linear-gradient(135deg, #050a18 0%, #0a1428 32%, #121c34 65%, #050a18 100%)",
          color: "white",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 16,
            paddingBottom: 22,
            borderBottom: "3px solid rgba(241, 196, 15, 0.6)",
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 16,
                fontWeight: 800,
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: "#f1c40f",
              }}
            >
              Sestava na zápas
            </div>
            <div
              style={{
                marginTop: 8,
                fontSize: 42,
                fontWeight: 900,
                lineHeight: 1.05,
                color: "white",
              }}
            >
              {lineupTitle.trim() || "Moje sestava"}
            </div>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 800,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.55)",
              }}
            >
              {MATCH_LINEUP_POSTER_GROUP_TITLE[group]}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gap: 22,
            marginTop: 28,
          }}
        >
          {ids.map((pid) => {
            const player = byId.get(pid) ?? null;
            const displayName = player ? jerseyNameOnJersey(player.name) : "";
            return (
              <div
                key={pid}
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 18,
                  padding: 18,
                  borderRadius: 22,
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.08), 0 4px 20px rgba(0,0,0,0.3)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  minHeight: 160,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                    flexShrink: 0,
                  }}
                >
                  <PremiumJerseySlotCard
                    player={player}
                    positionLabel={group === "goalies" ? "G" : group === "defense" ? "D" : "F"}
                    kind={group === "goalies" ? "goalie" : "skater"}
                    size="skater"
                    disableMotion
                    lightRinkSurface={false}
                  />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 26,
                      fontWeight: 900,
                      color: "white",
                      lineHeight: 1.05,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {player ? player.name : "—"}
                  </div>
                  {player ? (
                    <div
                      style={{
                        marginTop: 6,
                        fontSize: 14,
                        color: "rgba(255,255,255,0.7)",
                        lineHeight: 1.25,
                      }}
                    >
                      <span style={{ color: "white", fontWeight: 600 }}>{player.club}</span>
                      {player.league ? (
                        <span style={{ color: "rgba(255,255,255,0.5)" }}> · {player.league}</span>
                      ) : null}
                    </div>
                  ) : null}
                  {player && player.name !== displayName ? (
                    <div
                      style={{
                        marginTop: 4,
                        fontSize: 11,
                        color: "rgba(255,255,255,0.4)",
                        letterSpacing: "0.04em",
                      }}
                    >
                      Na dresu:{" "}
                      <span style={{ color: "rgba(255,255,255,0.7)" }}>{displayName}</span>
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        <div
          style={{
            marginTop: 36,
            textAlign: "center",
            fontSize: 12,
            color: "rgba(255,255,255,0.45)",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            fontWeight: 700,
          }}
        >
          hokejlineup.cz
        </div>
      </div>
    );
  }
);
