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
import { SHARE_POSTER_3X4_H, SHARE_POSTER_3X4_W } from "@/lib/sharePosterLayout";

const LINE_JERSEY_SLOT_MAX_W = 220;

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

    const posterJerseyScale = jerseyRatingExport ? 1.26 : 1.38;
    const ratingExtraShellPx = jerseyRatingExport ? 14 : 0;
    const jerseyFrame = matchPosterJerseyFrameStyles(posterJerseyScale, ratingExtraShellPx);

    const cardShell: CSSProperties = {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "flex-start",
      gap: jerseyRatingExport ? 4 : 10,
      padding: jerseyRatingExport ? "0 0 4px" : "2px 0 8px",
      width: "100%",
      maxWidth: LINE_JERSEY_SLOT_MAX_W,
      marginLeft: "auto",
      marginRight: "auto",
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
                fontSize: jerseyRatingExport ? 22 : 34,
                fontWeight: 900,
                color: "white",
                lineHeight: jerseyRatingExport ? 1.12 : 1.08,
                letterSpacing: "-0.01em",
                ...(jerseyRatingExport
                  ? {
                      overflow: "hidden",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical" as const,
                      wordBreak: "break-word" as const,
                    }
                  : {}),
              }}
            >
              {player ? player.name : "—"}
            </div>
            {jerseyRatingExport && mode ? (
              <div
                style={{
                  marginTop: 4,
                  display: "flex",
                  flexDirection: "row",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  rowGap: 2,
                }}
              >
                <div
                  style={{
                    display: "inline-flex",
                    flexDirection: "row",
                    alignItems: "baseline",
                    gap: 5,
                    padding: "5px 12px 4px",
                    borderRadius: 12,
                    background: hue.bg,
                    boxShadow: `0 6px 16px ${hue.ring}, 0 0 0 2px rgba(255,255,255,0.9) inset`,
                    border: "2px solid rgba(255,255,255,0.9)",
                    color: hue.text,
                  }}
                >
                  <span
                    style={{
                      fontSize: 28,
                      fontWeight: 900,
                      lineHeight: 1,
                      letterSpacing: "-0.04em",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {fmtMatchRating(display)}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      opacity: 0.88,
                    }}
                  >
                    /10
                  </span>
                </div>
                {mode === "community" && aggregate && aggregate.count > 0 ? (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: "rgba(255,255,255,0.48)",
                      letterSpacing: "0.03em",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {aggregate.count} {aggregate.count === 1 ? "hlas" : aggregate.count < 5 ? "hlasy" : "hlasů"}
                  </span>
                ) : null}
                {mode === "personal" && typeof jerseyRatingExport.myRatings[pid] === "number" ? (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      color: "rgba(52, 211, 153, 0.88)",
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Tvoje
                  </span>
                ) : mode === "personal" && typeof jerseyRatingExport.myRatings[pid] !== "number" ? (
                  <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)", whiteSpace: "nowrap" }}>
                    Neuloženo
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      );
    };

    const pad = jerseyRatingExport ? 28 : 32;
    const rootStyle: CSSProperties = {
      width: SHARE_POSTER_3X4_W,
      height: SHARE_POSTER_3X4_H,
      minHeight: SHARE_POSTER_3X4_H,
      maxHeight: SHARE_POSTER_3X4_H,
      padding: pad,
      fontFamily: "'Barlow Condensed', 'Inter', system-ui, sans-serif",
      background: "linear-gradient(135deg, #050a18 0%, #0a1428 32%, #121c34 65%, #050a18 100%)",
      color: "white",
      boxSizing: "border-box",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
    };

    return (
      <div ref={ref} data-export-slot={group} className="match-lineup-jersey-export-poster" style={rootStyle}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
            paddingBottom: jerseyRatingExport ? 10 : 22,
            borderBottom: "3px solid rgba(241, 196, 15, 0.6)",
            flexShrink: 0,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: jerseyRatingExport ? 13 : 16,
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
                marginTop: jerseyRatingExport ? 3 : 8,
                fontSize: jerseyRatingExport ? 30 : 42,
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
                  marginTop: 4,
                  fontSize: 11,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.55)",
                  letterSpacing: "0.03em",
                  lineHeight: 1.25,
                }}
              >
                {jerseyRatingExport.snapshotMode === "personal"
                  ? "Moje známky (1,0–10,0)"
                  : "Průměr komunity v době exportu"}
              </div>
            ) : null}
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div
              style={{
                fontSize: jerseyRatingExport ? 12 : 14,
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
              marginTop: jerseyRatingExport ? 6 : 12,
              display: "flex",
              flexDirection: "column",
              gap: jerseyRatingExport ? 10 : 18,
              flex: 1,
              minHeight: 0,
              justifyContent: "space-evenly",
            }}
          >
            {lineChunks.forwards.filter(Boolean).length > 0 ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                  gap: jerseyRatingExport ? 10 : 16,
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
                  gap: jerseyRatingExport ? 10 : 16,
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
                  <div style={{ width: "100%", maxWidth: LINE_JERSEY_SLOT_MAX_W }}>
                    {renderPlayerCard(lineChunks.bottom.filter(Boolean)[0]!)}
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                    gap: jerseyRatingExport ? 10 : 16,
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
              gap: jerseyRatingExport ? 12 : 18,
              marginTop: 12,
              flex: 1,
              minHeight: 0,
              alignContent: "space-evenly",
            }}
          >
            {ids.map((pid) => renderPlayerCard(pid))}
          </div>
        )}

        <div
          style={{
            marginTop: "auto",
            paddingTop: 8,
            flexShrink: 0,
            textAlign: "center",
            fontSize: jerseyRatingExport ? 22 : 24,
            color: "rgba(126,200,255,0.95)",
            letterSpacing: "0.12em",
            textTransform: "none",
            fontWeight: 900,
            fontFamily: "var(--font-display, 'Barlow Condensed', system-ui)",
          }}
        >
          hokejlineup.cz
        </div>
      </div>
    );
  }
);
