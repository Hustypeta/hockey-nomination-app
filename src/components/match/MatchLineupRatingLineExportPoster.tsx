"use client";

import { forwardRef, useMemo, type CSSProperties } from "react";
import type { LineupStructure, Player } from "@/types";
import {
  MATCH_LINEUP_POSTER_GROUP_TITLE,
  pickMatchLineupSegmentPlayerIds,
  splitMatchLineupLinePosterChunks,
  type MatchLineupPosterGroup,
} from "@/lib/matchLineupPosterSegments";
import { rosterLastDisplay } from "@/lib/namesOnlyRoster";
import {
  fmtMatchRating,
  matchRatingHue,
  resolveMatchRatingDisplay,
  type MatchRatingAggregateMap,
  type MatchRatingMyMap,
} from "@/lib/matchRatingExportDisplay";
import { SHARE_POSTER_3X4_H, SHARE_POSTER_3X4_W } from "@/lib/sharePosterLayout";

const LINE_NAME_SLOT_MAX_W = 220;

function MatchLineupPosterDecorativeBg() {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-[42%] bg-gradient-to-br from-[#c8102e] via-[#8f0b22] to-[#003087]"
        style={{
          borderTopLeftRadius: "110px",
          borderBottomLeftRadius: "110px",
          transform: "translateX(12%)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-8 right-[36%] w-px bg-gradient-to-b from-transparent via-white/25 to-transparent opacity-70"
        aria-hidden
      />
    </>
  );
}

function voteLineCs(n: number): string {
  if (n === 1) return "1 hlas";
  if (n >= 2 && n <= 4) return `${n} hlasy`;
  return `${n} hlasů`;
}

interface MatchLineupRatingLineExportPosterProps {
  lineupTitle: string;
  group: MatchLineupPosterGroup;
  players: Player[];
  lineup: LineupStructure;
  defenseCount: 6 | 7 | 8;
  allowExtraForward: boolean;
  ratings: MatchRatingAggregateMap;
  myRatings: MatchRatingMyMap;
  snapshotMode: "personal" | "community";
}

/**
 * Řez jedné lajny pro export hodnocení — fixní 3:4, jen jména + známka (bez dresů a bez ledového kluziště).
 */
export const MatchLineupRatingLineExportPoster = forwardRef<HTMLDivElement, MatchLineupRatingLineExportPosterProps>(
  function MatchLineupRatingLineExportPoster(
    { lineupTitle, group, players, lineup, defenseCount, allowExtraForward, ratings, myRatings, snapshotMode },
    ref
  ) {
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
      gap: 6,
      padding: "10px 8px 12px",
      width: "100%",
      maxWidth: LINE_NAME_SLOT_MAX_W,
      marginLeft: "auto",
      marginRight: "auto",
    };

    const renderNameRatingCard = (pid: string) => {
      const nameLine = rosterLastDisplay(players, pid);
      const display = resolveMatchRatingDisplay(pid, ratings, myRatings, snapshotMode);
      const aggregate = ratings[pid];
      const hue = matchRatingHue(display);
      const votes = typeof aggregate?.count === "number" && Number.isFinite(aggregate.count) ? aggregate.count : 0;

      return (
        <div key={pid} style={cardShell}>
          <div
            style={{
              width: "100%",
              textAlign: "center",
              borderRadius: 14,
              background: "rgba(255,255,255,0.96)",
              boxShadow: "0 1px 0 rgba(255,255,255,0.9), inset 0 -1px 0 rgba(0,24,52,0.06), 0 10px 24px rgba(0,0,0,0.18)",
              padding: "12px 10px 10px",
            }}
          >
            <div
              style={{
                fontSize: 28,
                fontWeight: 900,
                color: "#0a1628",
                lineHeight: 1.08,
                letterSpacing: "-0.01em",
                wordBreak: "break-word",
              }}
            >
              {nameLine}
            </div>
            <div
              style={{
                marginTop: 8,
                display: "inline-flex",
                flexDirection: "row",
                alignItems: "baseline",
                gap: 5,
                padding: "5px 14px 4px",
                borderRadius: 12,
                background: hue.bg,
                boxShadow: `0 6px 16px ${hue.ring}, 0 0 0 2px rgba(255,255,255,0.9) inset`,
                border: "2px solid rgba(255,255,255,0.9)",
                color: hue.text,
              }}
            >
              <span
                style={{
                  fontSize: 30,
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
            {snapshotMode === "community" && votes > 0 ? (
              <p style={{ marginTop: 6, fontSize: 11, fontWeight: 700, color: "rgba(10,22,40,0.5)" }}>{voteLineCs(votes)}</p>
            ) : null}
            {snapshotMode === "personal" && typeof myRatings[pid] === "number" ? (
              <p style={{ marginTop: 6, fontSize: 10, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: "#047857" }}>
                Tvoje
              </p>
            ) : snapshotMode === "personal" ? (
              <p style={{ marginTop: 6, fontSize: 10, fontWeight: 700, color: "rgba(10,22,40,0.4)" }}>Neuloženo</p>
            ) : null}
          </div>
        </div>
      );
    };

    const pad = 32;
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
      position: "relative",
    };

    const lineFormation = lineChunks ? (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
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
              gap: 12,
              alignItems: "start",
            }}
          >
            {lineChunks.forwards.filter(Boolean).map((pid) => renderNameRatingCard(pid))}
          </div>
        ) : null}

        {lineChunks.defense.filter(Boolean).length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 12,
              alignItems: "start",
            }}
          >
            {lineChunks.defense.filter(Boolean).map((pid) => renderNameRatingCard(pid))}
          </div>
        ) : null}

        {lineChunks.bottom.filter(Boolean).length > 0 ? (
          lineChunks.bottom.filter(Boolean).length === 1 ? (
            <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
              <div style={{ width: "100%", maxWidth: LINE_NAME_SLOT_MAX_W }}>{renderNameRatingCard(lineChunks.bottom[0]!)}</div>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: 12,
                alignItems: "start",
              }}
            >
              {lineChunks.bottom.filter(Boolean).map((pid) => renderNameRatingCard(pid))}
            </div>
          )
        ) : null}
      </div>
    ) : (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: 14,
          flex: 1,
          minHeight: 0,
          alignContent: "space-evenly",
        }}
      >
        {ids.map((pid) => renderNameRatingCard(pid))}
      </div>
    );

    return (
      <div ref={ref} data-export-slot={group} className="match-lineup-rating-line-export-poster" style={rootStyle}>
        <MatchLineupPosterDecorativeBg />
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
            paddingBottom: 18,
            borderBottom: "3px solid rgba(241, 196, 15, 0.6)",
            flexShrink: 0,
            position: "relative",
            zIndex: 1,
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
              Hodnocení hráčů
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
            <div
              style={{
                marginTop: 4,
                fontSize: 11,
                fontWeight: 700,
                color: "rgba(255,255,255,0.55)",
                letterSpacing: "0.03em",
              }}
            >
              {snapshotMode === "personal" ? "Moje známky (1,0–10,0)" : "Průměr komunity v době exportu"}
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

        <div style={{ flex: 1, minHeight: 0, marginTop: 10, position: "relative", zIndex: 1 }}>{lineFormation}</div>

        <div
          style={{
            marginTop: "auto",
            paddingTop: 8,
            flexShrink: 0,
            textAlign: "center",
            position: "relative",
            zIndex: 1,
            fontSize: 24,
            color: "rgba(126,200,255,0.95)",
            letterSpacing: "0.12em",
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
