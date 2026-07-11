"use client";

import type { ReactNode } from "react";
import type { MatchLineupLineExtraSlot } from "@/lib/matchLineupPosterSegments";
import { FIFA_RINK_SHIELD_CLIP_CSS } from "@/lib/fifa/fifaRinkShield";
import {
  MATCH_LINEUP_POSTER_RINK_ASPECT,
  MATCH_LINEUP_POSTER_RINK_HEIGHT,
  MATCH_LINEUP_POSTER_RINK_SLOTS,
  MATCH_LINEUP_POSTER_RINK_SRC,
  MATCH_LINEUP_POSTER_RINK_WIDTH,
  matchLineupPosterRinkSlotStyle,
} from "@/lib/matchLineupPosterRinkTemplate";

export type MatchLineupPosterRinkPlayerSlotContent = {
  jersey: ReactNode;
  caption: ReactNode;
};

export type MatchLineupPosterRinkStageProps = {
  forwards: MatchLineupPosterRinkPlayerSlotContent[];
  defense: MatchLineupPosterRinkPlayerSlotContent[];
  goalie: MatchLineupPosterRinkPlayerSlotContent | null;
  extraSlots?: MatchLineupLineExtraSlot[];
  renderExtraJersey?: (slot: MatchLineupLineExtraSlot) => ReactNode;
  compact?: boolean;
};

function PosterRinkCaption({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "100%",
        transform: "translate(-50%, 6px)",
        width: "165%",
        maxWidth: 220,
        pointerEvents: "none",
        textAlign: "center",
        zIndex: 4,
      }}
    >
      {children}
    </div>
  );
}

export function MatchLineupPosterRinkPlayerSlot({
  pos,
  jersey,
  caption,
  compact = false,
}: {
  pos: keyof typeof MATCH_LINEUP_POSTER_RINK_SLOTS;
  jersey: ReactNode;
  caption: ReactNode;
  compact?: boolean;
}) {
  return (
    <div style={{ ...matchLineupPosterRinkSlotStyle(MATCH_LINEUP_POSTER_RINK_SLOTS[pos]), overflow: "visible" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          clipPath: FIFA_RINK_SHIELD_CLIP_CSS,
          WebkitClipPath: FIFA_RINK_SHIELD_CLIP_CSS,
          filter: "drop-shadow(0 4px 12px rgba(0, 0, 0, 0.45))",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: compact ? "scale(0.92)" : "scale(1)",
            transformOrigin: "center center",
          }}
        >
          {jersey}
        </div>
      </div>
      <PosterRinkCaption>{caption}</PosterRinkCaption>
    </div>
  );
}

/** Led ze šablony rink-mobile-lineup.png — dresy ve štítech jako v editoru sestavy. */
export function MatchLineupPosterRinkStage({
  forwards,
  defense,
  goalie,
  extraSlots,
  renderExtraJersey,
  compact = false,
}: MatchLineupPosterRinkStageProps) {
  const defenseSolo = defense.length === 1;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "100%",
        margin: "0 auto",
        aspectRatio: String(MATCH_LINEUP_POSTER_RINK_ASPECT),
        borderRadius: 12,
        overflow: "visible",
        marginBottom: extraSlots?.length ? (compact ? 56 : 64) : 0,
        boxShadow: "0 12px 40px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(0, 212, 255, 0.12)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={MATCH_LINEUP_POSTER_RINK_SRC}
          alt=""
          width={MATCH_LINEUP_POSTER_RINK_WIDTH}
          height={MATCH_LINEUP_POSTER_RINK_HEIGHT}
          draggable={false}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "fill",
            userSelect: "none",
            pointerEvents: "none",
          }}
        />
      </div>

      <div style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {forwards[0] ? <MatchLineupPosterRinkPlayerSlot pos="lw" {...forwards[0]} compact={compact} /> : null}
        {forwards[1] ? <MatchLineupPosterRinkPlayerSlot pos="c" {...forwards[1]} compact={compact} /> : null}
        {forwards[2] ? <MatchLineupPosterRinkPlayerSlot pos="rw" {...forwards[2]} compact={compact} /> : null}

        {defenseSolo && defense[0] ? (
          <MatchLineupPosterRinkPlayerSlot pos="d" {...defense[0]} compact={compact} />
        ) : (
          <>
            {defense[0] ? <MatchLineupPosterRinkPlayerSlot pos="ld" {...defense[0]} compact={compact} /> : null}
            {defense[1] ? <MatchLineupPosterRinkPlayerSlot pos="rd" {...defense[1]} compact={compact} /> : null}
          </>
        )}

        {goalie ? <MatchLineupPosterRinkPlayerSlot pos="g" {...goalie} compact={compact} /> : null}
      </div>

      {extraSlots && extraSlots.length > 0 && renderExtraJersey ? (
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: compact ? -52 : -58,
            transform: "translateX(-50%)",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: compact ? 10 : 14,
            width: "92%",
            zIndex: 5,
          }}
        >
          {extraSlots.map((slot) => (
            <div
              key={`${slot.kind}-${slot.playerId}`}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                minWidth: 0,
                flex: "1 1 120px",
                maxWidth: 200,
              }}
            >
              <span
                style={{
                  fontSize: compact ? 9 : 10,
                  fontWeight: 800,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.55)",
                  textAlign: "center",
                }}
              >
                {slot.label}
              </span>
              {renderExtraJersey(slot)}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
