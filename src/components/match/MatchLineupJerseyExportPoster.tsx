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
import { matchPosterJerseyFrameStyles } from "@/lib/matchLineupPosterJerseyFrame";
import {
  fmtMatchRating,
  matchRatingHue,
  resolveMatchRatingDisplay,
  type MatchRatingAggregateMap,
  type MatchRatingMyMap,
} from "@/lib/matchRatingExportDisplay";

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
  /** Zobrazení známky pod jménem (export z modalu hodnocení). */
  jerseyRatingExport?: {
    ratings: MatchRatingAggregateMap;
    myRatings: MatchRatingMyMap;
    snapshotMode: "personal" | "community";
  };
}

/**
 * Jedna část exportu zápasové sestavy — dresy + jména; volitelně známka z hodnocení.
 */
export const MatchLineupJerseyExportPoster = forwardRef<HTMLDivElement, MatchLineupJerseyExportPosterProps>(
  function MatchLineupJerseyExportPoster(
    { lineupTitle, group, players, lineup, defenseCount, allowExtraForward, jerseyRatingExport },
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

    const posterJerseyScale = 1.38;
    const ratingExtraShellPx = jerseyRatingExport ? 8 : 0;
    const jerseyFrame = matchPosterJerseyFrameStyles(posterJerseyScale, ratingExtraShellPx);

    const cardShell: CSSProperties = {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "flex-start",
      gap: jerseyRatingExport ? 10 : 14,
      padding: jerseyRatingExport ? "4px 0 20px" : "4px 0 12px",
    };

    const renderPlayerCard = (pid: string) => {
      const player = byId.get(pid) ?? null;
      const role = roleForPlayerId(lineup, pid);
      const mode = jerseyRatingExport?.snapshotMode;
      const display =
        jerseyRatingExport && mode
          ? resolveMatchRatingDisplay(pid, jerseyRatingExport.ratings, jerseyRatingExport.myRatings, mode)
          : null;
      const aggregate = jerseyRatingExport?.ratings[pid];
      const hue = display != null ? matchRatingHue(display) : matchRatingHue(null);
      return (
        <div key={pid} style={cardShell}>
          <div style={jerseyFrame.shell}>
            <div style={jerseyFrame.scaler}>
              <PremiumJerseySlotCard
                player={player}
                positionLabel={role.label}
                kind={role.kind}
                size="skater"
                disableMotion
                posterEmbed
                lightRinkSurface={false}
                ambiguousJerseyLastKeys={ambiguousJerseyLastKeys}
              />
            </div>
          </div>

          <div style={{ width: "100%", textAlign: "center", paddingLeft: 4, paddingRight: 4 }}>
            <div
              style={{
                fontSize: 34,
                fontWeight: 900,
                color: "white",
                lineHeight: 1.08,
                letterSpacing: "-0.01em",
              }}
            >
              {player ? player.name : "—"}
            </div>
            {jerseyRatingExport && mode ? (
              <div style={{ marginTop: 10, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div
                  style={{
                    minWidth: 112,
                    padding: "10px 18px 8px",
                    borderRadius: 18,
                    background: hue.bg,
                    boxShadow: `0 8px 22px ${hue.ring}, 0 0 0 2px rgba(255,255,255,0.92) inset`,
                    border: "2px solid rgba(255,255,255,0.92)",
                    color: hue.text,
                  }}
                >
                  <div
                    style={{
                      fontSize: 44,
                      fontWeight: 900,
                      lineHeight: 1,
                      letterSpacing: "-0.04em",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {fmtMatchRating(display)}
                  </div>
                  <div
                    style={{
                      marginTop: 2,
                      fontSize: 9,
                      fontWeight: 800,
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                      opacity: 0.82,
                    }}
                  >
                    / 10
                  </div>
                </div>
                {mode === "community" && aggregate && aggregate.count > 0 ? (
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "rgba(255,255,255,0.5)",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {aggregate.count} {aggregate.count === 1 ? "hlas" : aggregate.count < 5 ? "hlasy" : "hlasů"}
                  </div>
                ) : null}
                {mode === "personal" && typeof jerseyRatingExport.myRatings[pid] === "number" ? (
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: "rgba(52, 211, 153, 0.85)",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                    }}
                  >
                    Tvoje známka
                  </div>
                ) : mode === "personal" && typeof jerseyRatingExport.myRatings[pid] !== "number" ? (
                  <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.42)" }}>Neuloženo</div>
                ) : null}
              </div>
            ) : null}
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
              {jerseyRatingExport ? "Hodnocení hráčů" : "Sestava na zápas"}
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
            {jerseyRatingExport ? (
              <div
                style={{
                  marginTop: 6,
                  fontSize: 13,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.55)",
                  letterSpacing: "0.04em",
                }}
              >
                {jerseyRatingExport.snapshotMode === "personal"
                  ? "Moje uložené známky (1,0–10,0)"
                  : "Průměr komunity v době exportu"}
              </div>
            ) : null}
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
                  gap: 16,
                  alignItems: "start",
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
                  gap: 16,
                  alignItems: "start",
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
                  <div style={{ width: "100%", maxWidth: 580 }}>
                    {renderPlayerCard(lineChunks.bottom.filter(Boolean)[0]!)}
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                    gap: 16,
                    alignItems: "start",
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
              gap: 20,
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
