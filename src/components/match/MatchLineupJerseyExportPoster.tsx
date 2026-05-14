"use client";

import { forwardRef, useMemo, type CSSProperties } from "react";
import type { LineupStructure, Player } from "@/types";
import { getAmbiguousLastNameKeys } from "@/lib/jerseyDisplayName";
import { PremiumJerseySlotCard } from "@/components/sestava/PremiumJerseySlotCard";
import {
  MATCH_LINEUP_POSTER_GROUP_TITLE,
  pickMatchLineupSegmentPlayerIds,
  splitMatchLineupLinePosterChunks,
  type MatchLineupPosterGroup,
} from "@/lib/matchLineupPosterSegments";

function roleForPlayerId(lineup: LineupStructure, playerId: string): { kind: "goalie" | "skater"; label: "G" | "D" | "F" } {
  if (lineup.goalies[0] === playerId || lineup.goalies[1] === playerId) {
    return { kind: "goalie", label: "G" };
  }
  for (const p of lineup.defensePairs) {
    if (p.lb === playerId || p.rb === playerId) return { kind: "skater", label: "D" };
  }
  return { kind: "skater", label: "F" };
}

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
    const ambiguousJerseyLastKeys = useMemo(() => getAmbiguousLastNameKeys(players), [players]);
    const ids = useMemo(
      () => pickMatchLineupSegmentPlayerIds(lineup, group, defenseCount, allowExtraForward),
      [lineup, group, defenseCount, allowExtraForward]
    );
    const lineChunks = splitMatchLineupLinePosterChunks(ids, group);
    const cols = 2;

    const cardShell: CSSProperties = {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 14,
      padding: "20px 14px 22px",
      borderRadius: 22,
      background: "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08), 0 4px 20px rgba(0,0,0,0.3)",
      border: "1px solid rgba(255,255,255,0.1)",
      minHeight: 200,
    };

    const renderPlayerCard = (pid: string) => {
      const player = byId.get(pid) ?? null;
      const role = roleForPlayerId(lineup, pid);
      return (
        <div key={pid} style={cardShell}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              transform: "scale(1.14)",
              transformOrigin: "50% 0%",
            }}
          >
            <PremiumJerseySlotCard
              player={player}
              positionLabel={role.label}
              kind={role.kind}
              size="skater"
              disableMotion
              lightRinkSurface={false}
              ambiguousJerseyLastKeys={ambiguousJerseyLastKeys}
            />
          </div>

          <div style={{ width: "100%", textAlign: "center", paddingLeft: 4, paddingRight: 4 }}>
            <div
              style={{
                fontSize: 30,
                fontWeight: 900,
                color: "white",
                lineHeight: 1.08,
                letterSpacing: "-0.01em",
              }}
            >
              {player ? player.name : "—"}
            </div>
          </div>
        </div>
      );
    };

    return (
      <div
        ref={ref}
        data-export-slot={group}
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

        {lineChunks ? (
          <div
            style={{
              marginTop: 28,
              display: "flex",
              flexDirection: "column",
              gap: 26,
            }}
          >
            {lineChunks.forwards.filter(Boolean).length > 0 ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                  gap: 22,
                  alignItems: "stretch",
                }}
              >
                {lineChunks.forwards.filter(Boolean).map((pid) => (
                  <div key={pid}>{renderPlayerCard(pid)}</div>
                ))}
              </div>
            ) : null}

            {lineChunks.defense.filter(Boolean).length > 0 ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: 22,
                  alignItems: "stretch",
                }}
              >
                {lineChunks.defense.filter(Boolean).map((pid) => (
                  <div key={pid}>{renderPlayerCard(pid)}</div>
                ))}
              </div>
            ) : null}

            {lineChunks.bottom.filter(Boolean).length > 0 ? (
              lineChunks.bottom.filter(Boolean).length === 1 ? (
                <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
                  <div style={{ width: "100%", maxWidth: 520 }}>
                    {renderPlayerCard(lineChunks.bottom.filter(Boolean)[0]!)}
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                    gap: 22,
                    alignItems: "stretch",
                  }}
                >
                  {lineChunks.bottom.filter(Boolean).map((pid) => (
                    <div key={pid}>{renderPlayerCard(pid)}</div>
                  ))}
                </div>
              )
            ) : null}
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${cols}, 1fr)`,
              gap: 26,
              marginTop: 28,
            }}
          >
            {ids.map((pid) => renderPlayerCard(pid))}
          </div>
        )}

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
