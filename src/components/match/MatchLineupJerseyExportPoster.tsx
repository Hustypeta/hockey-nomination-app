"use client";

import { forwardRef, useMemo } from "react";
import type { LineupStructure, Player } from "@/types";
import { LineupJerseyCard } from "@/components/sestava/LineupJerseyCard";
import { FifaRinkChemistryLines } from "@/components/fifa/FifaRinkChemistryLines";
import { FifaRinkShieldFrame } from "@/components/fifa/FifaRinkShieldFrame";
import { getAmbiguousLastNameKeys, jerseyNameOnJersey } from "@/lib/jerseyDisplayName";
import {
  MATCH_LINEUP_POSTER_GROUP_TITLE,
  pickMatchLineupLineExtraSlots,
  pickMatchLineupSegmentPlayerIds,
  splitMatchLineupLinePosterChunks,
  type MatchLineupPosterGroup,
} from "@/lib/matchLineupPosterSegments";
import { fifaRinkChemistryEdges } from "@/lib/fifa/fifaRinkChemistry";
import {
  FIFA_RINK_TEMPLATE_SLOTS_MOBILE,
  type FifaRinkSlotRect,
  type FifaRinkTemplatePos,
} from "@/lib/fifa/fifaRinkTemplate";
import {
  fmtMatchRating,
  matchRatingHue,
  resolveMatchRatingDisplay,
  type MatchRatingAggregateMap,
  type MatchRatingMyMap,
} from "@/lib/matchRatingExportDisplay";
import { SHARE_POSTER_ROSTER_4X5_STYLE } from "@/lib/sharePosterLayout";
import { SITE_CANONICAL_HOST, SITE_LOGO_URL } from "@/lib/siteBranding";
import styles from "./MatchLineupJerseyExportPoster.module.css";

const LINE_POSTER_BACKGROUND_SRC = "/images/poster-lineup-line-rink-bg.png?v=2";

interface MatchLineupJerseyExportPosterProps {
  lineupTitle: string;
  group: MatchLineupPosterGroup;
  players: Player[];
  lineup: LineupStructure;
  defenseCount: 6 | 7 | 8;
  allowExtraForward: boolean;
  siteUrl?: string;
  jerseyRatingExport?: {
    ratings: MatchRatingAggregateMap;
    myRatings: MatchRatingMyMap;
    snapshotMode: "personal" | "community";
  };
}

function roleForPlayerId(
  lineup: LineupStructure,
  playerId: string
): { label: "G" | "D" | "F"; size: "goalie" | "compact" } {
  if (lineup.goalies.includes(playerId)) return { label: "G", size: "goalie" };
  for (const pair of lineup.defensePairs) {
    if (pair.lb === playerId || pair.rb === playerId) return { label: "D", size: "compact" };
  }
  return { label: "F", size: "compact" };
}

export const MatchLineupJerseyExportPoster = forwardRef<
  HTMLDivElement,
  MatchLineupJerseyExportPosterProps
>(function MatchLineupJerseyExportPoster(
  {
    lineupTitle,
    group,
    players,
    lineup,
    defenseCount,
    allowExtraForward,
    siteUrl = "",
    jerseyRatingExport,
  },
  ref
) {
  const byId = useMemo(() => new Map(players.map((player) => [player.id, player])), [players]);
  const ambiguousJerseyLastKeys = useMemo(() => getAmbiguousLastNameKeys(players), [players]);
  const ids = useMemo(
    () => pickMatchLineupSegmentPlayerIds(lineup, group, defenseCount, allowExtraForward),
    [lineup, group, defenseCount, allowExtraForward]
  );
  const lineChunks = splitMatchLineupLinePosterChunks(ids, group);
  const extraSlots = useMemo(
    () => pickMatchLineupLineExtraSlots(lineup, group, allowExtraForward),
    [lineup, group, allowExtraForward]
  );
  const defenseCountInLine = lineChunks?.defense.length ?? 0;
  const chemistryEdges = fifaRinkChemistryEdges({
    hasDefense: defenseCountInLine > 0,
    defenseSolo: defenseCountInLine === 1,
    showGoalie: true,
  });

  if (!lineChunks) return null;

  const host =
    siteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "").trim() || SITE_CANONICAL_HOST;
  const starterGoalieId = lineup.goalies[0];
  const secondGoalie = extraSlots.find((slot) => slot.kind === "second-goalie");
  const extraForward = extraSlots.find((slot) => slot.kind === "extra-forward");

  const renderRating = (playerId: string) => {
    if (!jerseyRatingExport) return null;
    const mode = jerseyRatingExport.snapshotMode;
    const display = resolveMatchRatingDisplay(
      playerId,
      jerseyRatingExport.ratings,
      jerseyRatingExport.myRatings,
      mode
    );
    const hue = matchRatingHue(display);
    const aggregate = jerseyRatingExport.ratings[playerId];
    const meta =
      mode === "community" && aggregate?.count
        ? `${aggregate.count} ${aggregate.count === 1 ? "hlas" : aggregate.count < 5 ? "hlasy" : "hlasů"}`
        : mode === "personal"
          ? typeof jerseyRatingExport.myRatings[playerId] === "number"
            ? "Tvoje"
            : "Neuloženo"
          : "";

    return (
      <>
        <span
          className={styles.rating}
          style={{ background: hue.bg, color: hue.text, boxShadow: `0 4px 12px ${hue.ring}` }}
        >
          {fmtMatchRating(display)}
          <span className={styles.ratingSuffix}>/10</span>
        </span>
        {meta ? <span className={styles.ratingMeta}>{meta}</span> : null}
      </>
    );
  };

  const renderSlot = (
    playerId: string | null | undefined,
    pos: FifaRinkTemplatePos,
    options?: { benchLabel?: string }
  ) => {
    if (!playerId) return null;
    const player = byId.get(playerId) ?? null;
    const role = roleForPlayerId(lineup, playerId);
    const slot: FifaRinkSlotRect = FIFA_RINK_TEMPLATE_SLOTS_MOBILE[pos];
    const caption = player
      ? jerseyNameOnJersey(player.name, ambiguousJerseyLastKeys)
      : "—";
    const bench = Boolean(options?.benchLabel);

    return (
      <div
        key={`${pos}-${playerId}`}
        className={`${styles.slot} ${bench ? styles.benchSlot : ""} fifa-rink-template__slot`}
        style={{ left: `${slot.left}%`, top: `${slot.top}%` }}
      >
        <div className={styles.shield} aria-hidden>
          <FifaRinkShieldFrame />
        </div>
        <div className={styles.jerseyHost}>
          <div className={`${styles.jerseyClip} fifa-rink-slot__jersey`}>
            <LineupJerseyCard
              player={player}
              positionLabel={role.label}
              size={role.size}
              disableMotion
              overlayMode="rink"
              nameOnJersey={false}
              className="fifa-rink-jersey h-full w-full"
              showPositionBadge={false}
              showRoleBadge={false}
              ambiguousJerseyLastKeys={ambiguousJerseyLastKeys}
            />
          </div>
        </div>
        <div className={styles.caption}>
          {options?.benchLabel ? (
            <span className={styles.benchLabel}>{options.benchLabel}</span>
          ) : null}
          <div className={styles.captionPlate}>{caption}</div>
          {renderRating(playerId)}
        </div>
      </div>
    );
  };

  const defenseSolo = lineChunks.defense.length === 1;

  return (
    <div
      ref={ref}
      data-export-slot={group}
      className={`match-lineup-jersey-export-poster ${styles.poster}`}
      style={SHARE_POSTER_ROSTER_4X5_STYLE}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- uživatelem dodané pozadí exportu lajny */}
      <img src={LINE_POSTER_BACKGROUND_SRC} alt="" className={styles.background} decoding="sync" />
      <div className={styles.shade} aria-hidden />

      <header className={styles.header}>
        <span className={styles.host}>{host}</span>
        <div className={styles.titleBlock}>
          <h1 className={styles.title}>{lineupTitle.trim() || "Moje sestava na zápas"}</h1>
        </div>
        <span className={styles.logoFrame}>
          {/* eslint-disable-next-line @next/next/no-img-element -- statické logo pro export PNG */}
          <img src={SITE_LOGO_URL} alt="Lineup" className={styles.logo} decoding="sync" />
        </span>
      </header>
      <div className={styles.headerRule} aria-hidden />

      <div className={styles.formation}>
        <FifaRinkChemistryLines
          edges={chemistryEdges}
          slotLayout={FIFA_RINK_TEMPLATE_SLOTS_MOBILE}
        />
        <span className={styles.lineLabel}>{MATCH_LINEUP_POSTER_GROUP_TITLE[group]}</span>
        {renderSlot(lineChunks.forwards[0], "lw")}
        {renderSlot(lineChunks.forwards[1], "c")}
        {renderSlot(lineChunks.forwards[2], "rw")}
        {defenseSolo
          ? renderSlot(lineChunks.defense[0], "d")
          : (
              <>
                {renderSlot(lineChunks.defense[0], "ld")}
                {renderSlot(lineChunks.defense[1], "rd")}
              </>
            )}
        {renderSlot(starterGoalieId, "g")}
        {secondGoalie
          ? renderSlot(secondGoalie.playerId, "benchL", { benchLabel: "2. brankář" })
          : null}
        {extraForward
          ? renderSlot(extraForward.playerId, "benchR", { benchLabel: "13. útočník" })
          : null}
      </div>
    </div>
  );
});
