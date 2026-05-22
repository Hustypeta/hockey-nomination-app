"use client";

import { forwardRef, useId, useMemo, type CSSProperties } from "react";
import type { LineupStructure, Player, PowerPlayRole } from "@/types";
import { getAmbiguousLastNameKeys } from "@/lib/jerseyDisplayName";
import { PremiumJerseySlotCard } from "@/components/sestava/PremiumJerseySlotCard";
import { IceRinkShell } from "@/components/shared/IceRinkShell";
import { ensurePowerPlayLineup, POWER_PLAY_UNIT_LABELS } from "@/lib/powerPlayLineup";
import { matchPosterJerseyFrameStyles } from "@/lib/matchLineupPosterJerseyFrame";
import { SHARE_POSTER_3X4_H, SHARE_POSTER_3X4_W } from "@/lib/sharePosterLayout";

const PP_SLOT_MAX_W = 148;
const ROLES_TOP_TO_BOTTOM: PowerPlayRole[][] = [
  ["point"],
  ["left", "bumper", "right"],
  ["netFront"],
];

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

interface MatchPowerPlayExportPosterProps {
  lineupTitle: string;
  lineup: LineupStructure;
  players: Player[];
}

export const MatchPowerPlayExportPoster = forwardRef<HTMLDivElement, MatchPowerPlayExportPosterProps>(
  function MatchPowerPlayExportPoster({ lineupTitle, lineup, players }, ref) {
    const byId = useMemo(() => new Map(players.map((p) => [p.id, p])), [players]);
    const ambiguousJerseyLastKeys = useMemo(() => getAmbiguousLastNameKeys(players), [players]);
    const units = ensurePowerPlayLineup(lineup).powerPlay!.units;
    const iceUid = useId().replace(/:/g, "");
    const posterJerseyScale = 0.92;
    const jerseyFrame = matchPosterJerseyFrameStyles(posterJerseyScale, 0);

    const cardShell: CSSProperties = {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "flex-start",
      gap: 6,
      width: "100%",
      maxWidth: PP_SLOT_MAX_W,
      marginLeft: "auto",
      marginRight: "auto",
    };

    const renderPlayer = (playerId: string | null) => {
      const player = playerId ? byId.get(playerId) ?? null : null;
      return (
        <div style={cardShell}>
          <div style={jerseyFrame.shell}>
            <div style={jerseyFrame.scaler}>
              <PremiumJerseySlotCard
                player={player}
                positionLabel="F"
                kind="skater"
                size="skater"
                disableMotion
                posterEmbed
                lightRinkSurface={false}
                ambiguousJerseyLastKeys={ambiguousJerseyLastKeys}
              />
            </div>
          </div>
        </div>
      );
    };

    const renderUnit = (unitIndex: 0 | 1) => {
      const unit = units[unitIndex];
      return (
        <div style={{ flex: "1 1 0", minHeight: 0, display: "flex", flexDirection: "column" }}>
          <p
            style={{
              margin: "0 0 6px",
              textAlign: "center",
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "rgba(241,196,15,0.92)",
            }}
          >
            {POWER_PLAY_UNIT_LABELS[unitIndex]}
          </p>
          <IceRinkShell
            className="mx-auto w-full flex-1 border-cyan-400/30 shadow-[0_0_32px_rgba(0,180,255,0.12)]"
            iceMood="arena"
            noiseFilterId={`${iceUid}-n-${unitIndex}`}
            scratchPatternId={`${iceUid}-i-${unitIndex}`}
            transform="perspective(880px) rotateX(6deg) scale(0.94) translateZ(0)"
            innerClassName="relative z-10 flex flex-col items-center justify-evenly gap-2 px-2 pb-3 pt-5"
          >
            {ROLES_TOP_TO_BOTTOM.map((row, ri) => (
              <div
                key={ri}
                style={{
                  display: "flex",
                  width: "100%",
                  justifyContent: "center",
                  gap: row.length === 3 ? 10 : 0,
                }}
              >
                {row.length === 3 ? (
                  row.map((role) => (
                    <div key={role} style={{ flex: "1 1 0", maxWidth: PP_SLOT_MAX_W }}>
                      {renderPlayer(unit[role])}
                    </div>
                  ))
                ) : (
                  <div style={{ maxWidth: PP_SLOT_MAX_W }}>{renderPlayer(unit[row[0]!])}</div>
                )}
              </div>
            ))}
          </IceRinkShell>
        </div>
      );
    };

    const rootStyle: CSSProperties = {
      width: SHARE_POSTER_3X4_W,
      height: SHARE_POSTER_3X4_H,
      minHeight: SHARE_POSTER_3X4_H,
      maxHeight: SHARE_POSTER_3X4_H,
      padding: 28,
      fontFamily: "'Barlow Condensed', 'Inter', system-ui, sans-serif",
      background: "linear-gradient(135deg, #050a18 0%, #0a1428 32%, #121c34 65%, #050a18 100%)",
      color: "white",
      boxSizing: "border-box",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      position: "relative",
    };

    return (
      <div
        ref={ref}
        data-export-slot="power-play"
        className="match-power-play-export-poster"
        style={rootStyle}
      >
        <MatchLineupPosterDecorativeBg />
        <header
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
            paddingBottom: 14,
            borderBottom: "3px solid rgba(241, 196, 15, 0.6)",
            flexShrink: 0,
            position: "relative",
            zIndex: 2,
          }}
        >
          <div style={{ minWidth: 0, flex: "1 1 auto" }}>
            <p
              style={{
                fontSize: 13,
                fontWeight: 800,
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: "#f1c40f",
                lineHeight: 1.2,
              }}
            >
              Přesilovka
            </p>
            <h1
              style={{
                marginTop: 6,
                fontSize: 36,
                fontWeight: 900,
                lineHeight: 1.08,
                color: "white",
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                wordBreak: "break-word",
              }}
            >
              {lineupTitle.trim() || "Moje sestava"}
            </h1>
          </div>
          <aside style={{ textAlign: "right", flexShrink: 0, maxWidth: "34%" }}>
            <p
              style={{
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.55)",
                lineHeight: 1.25,
              }}
            >
              2×5 · 1:3:1
            </p>
          </aside>
        </header>

        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            gap: 14,
            marginTop: 10,
            position: "relative",
            zIndex: 1,
          }}
        >
          {renderUnit(0)}
          {renderUnit(1)}
        </div>

        <div
          style={{
            marginTop: "auto",
            paddingTop: 8,
            flexShrink: 0,
            textAlign: "center",
            position: "relative",
            zIndex: 1,
            fontSize: 22,
            color: "rgba(126,200,255,0.95)",
            letterSpacing: "0.12em",
            fontWeight: 900,
          }}
        >
          hokejlineup.cz
        </div>
      </div>
    );
  }
);
