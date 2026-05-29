"use client";

import { forwardRef, useMemo, type CSSProperties } from "react";
import type { LineupStructure, Player } from "@/types";
import { getAmbiguousLastNameKeys } from "@/lib/jerseyDisplayName";
import { PremiumJerseySlotCard } from "@/components/sestava/PremiumJerseySlotCard";

import {
  jerseyPosterExportRowMeta,
  MATCH_LINEUP_POSTER_GROUP_TITLE,
  pickMatchLineupForwards34ExtraSlot,
  pickMatchLineupLineExtraSlots,
  pickMatchLineupSegmentPlayerIds,
  splitMatchLineupLinePosterChunks,
  type MatchLineupLineExtraSlot,
  type MatchLineupPosterGroup,
} from "@/lib/matchLineupPosterSegments";
import {
  ExtraPlayerSlotBand,
  MatchLineupPosterLineLayout,
} from "@/components/match/lineup-poster/MatchLineupPosterLineLayout";
import { fmtMatchRating, matchRatingHue } from "@/lib/matchRatingExportDisplay";

/** @deprecated importuj z @/lib/matchLineupPosterSegments jako MatchLineupPosterGroup */
export type MatchRatingPosterGroup = MatchLineupPosterGroup;

type RatingMap = Record<string, { avg: number; count: number } | undefined>;
type MyMap = Record<string, number | undefined>;

interface MatchRatingPosterProps {
  matchTitle: string;
  startsAtLabel?: string;
  group: MatchLineupPosterGroup;
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
 * Off-screen plakát pro export hodnocení do PNG. U řezů line-1…line-4 je rozložení 3F+2D+1G;
 * 13. útočník a 2. gólman jsou v secondary slotu pod hlavním gridem. Ostatní segmenty: 2 sloupce karet.
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
    const ambiguousJerseyLastKeys = useMemo(() => getAmbiguousLastNameKeys(players), [players]);
    const ids = useMemo(
      () => pickMatchLineupSegmentPlayerIds(lineup, group, defenseCount, allowExtraForward),
      [lineup, group, defenseCount, allowExtraForward]
    );
    const lineChunks = splitMatchLineupLinePosterChunks(ids, group);
    const lineExtraSlots = useMemo(
      () => pickMatchLineupLineExtraSlots(lineup, group, allowExtraForward),
      [lineup, group, allowExtraForward]
    );
    const forwards34Extra = useMemo(
      () => pickMatchLineupForwards34ExtraSlot(lineup, group, allowExtraForward),
      [lineup, group, allowExtraForward]
    );
    const cols = 2;

    const cardShell: CSSProperties = {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      gap: 18,
      padding: 18,
      borderRadius: 22,
      background: "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08), 0 4px 20px rgba(0,0,0,0.3)",
      border: "1px solid rgba(255,255,255,0.1)",
      minHeight: 180,
    };

    const renderRatingCard = (pid: string) => {
      const rowMeta = jerseyPosterExportRowMeta(lineup, group, pid, defenseCount, allowExtraForward);
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
      const hue = matchRatingHue(display);
      return (
        <div style={cardShell}>
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
              positionLabel={rowMeta.positionLabel}
              kind={rowMeta.jerseyKind === "goalie" ? "goalie" : "skater"}
              size="skater"
              disableMotion
              lightRinkSurface={false}
              ambiguousJerseyLastKeys={ambiguousJerseyLastKeys}
            />
          </div>

          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}>
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
            {!preferMine && aggregate && aggregate.count > 0 ? (
              <div
                style={{
                  marginTop: 8,
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "3px 10px",
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.7)",
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              >
                {aggregate.count} {aggregate.count === 1 ? "hlas" : aggregate.count < 5 ? "hlasy" : "hlasů"}
              </div>
            ) : null}
            {preferMine && typeof mine === "number" ? (
              <div
                style={{
                  marginTop: 8,
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "3px 10px",
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#34d399",
                  background: "rgba(52, 211, 153, 0.12)",
                  border: "1px solid rgba(52, 211, 153, 0.35)",
                }}
              >
                Tvoje známka
              </div>
            ) : null}
          </div>

          <div
            style={{
              flexShrink: 0,
              width: 130,
              height: 130,
              borderRadius: 24,
              background: hue.bg,
              boxShadow: `0 12px 32px ${hue.ring}, 0 0 0 3px rgba(255,255,255,0.95) inset`,
              border: `3px solid rgba(255,255,255,0.95)`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: hue.text,
            }}
          >
            <div
              style={{
                fontSize: 64,
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
                marginTop: 4,
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                opacity: 0.8,
              }}
            >
              / 10
            </div>
          </div>
        </div>
      );
    };

    const renderExtraCard = (slot: MatchLineupLineExtraSlot) => renderRatingCard(slot.playerId);

    return (
      <div
        ref={ref}
        data-export-slot={group}
        className="match-rating-poster"
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
                letterSpacing: "0.32em",
                textTransform: "uppercase",
                color: "#f1c40f",
              }}
            >
              Hodnocení hráčů
            </div>
            <div
              style={{
                marginTop: 8,
                fontSize: 44,
                fontWeight: 900,
                lineHeight: 1.05,
                color: "white",
              }}
            >
              {matchTitle}
            </div>
            {startsAtLabel ? (
              <div style={{ marginTop: 6, fontSize: 16, color: "rgba(255,255,255,0.6)" }}>
                {startsAtLabel}
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
            <div
              style={{
                marginTop: 6,
                fontSize: 22,
                fontWeight: 700,
                color: preferMine ? "#34d399" : "#f1c40f",
              }}
            >
              {preferMine ? "Moje známky" : "Průměry komunity"}
            </div>
          </div>
        </div>

        {lineChunks ? (
          <div style={{ marginTop: 28 }}>
            <MatchLineupPosterLineLayout
              forwards={lineChunks.forwards.filter(Boolean).map((pid) => renderRatingCard(pid))}
              defense={lineChunks.defense.filter(Boolean).map((pid) => renderRatingCard(pid))}
              goalie={lineChunks.bottom[0] ? renderRatingCard(lineChunks.bottom[0]) : null}
              extraSlots={lineExtraSlots}
              renderExtraCard={renderExtraCard}
            />
          </div>
        ) : (
          <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 20 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${cols}, 1fr)`,
                gap: 22,
              }}
            >
              {ids.map((pid) => (
                <div key={pid}>{renderRatingCard(pid)}</div>
              ))}
            </div>
            {forwards34Extra ? (
              <ExtraPlayerSlotBand extraSlots={[forwards34Extra]} renderExtraCard={renderExtraCard} />
            ) : null}
          </div>
        )}

        <div
          style={{
            marginTop: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 18,
            borderTop: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.5)",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            hokejlineup.cz
          </div>
          <div
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.4)",
              letterSpacing: "0.04em",
            }}
          >
            Hodnoť svoje hráče po každém zápase
          </div>
        </div>
      </div>
    );
  }
);
