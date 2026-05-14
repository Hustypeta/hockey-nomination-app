"use client";

import { forwardRef, useMemo, type CSSProperties, type ReactNode } from "react";
import type { LineupStructure, Player } from "@/types";
import { getAmbiguousLastNameKeys } from "@/lib/jerseyDisplayName";
import { PremiumJerseySlotCard } from "@/components/sestava/PremiumJerseySlotCard";

function roleForPlayerId(lineup: LineupStructure, playerId: string): { kind: "goalie" | "skater"; label: "G" | "D" | "F" } {
  if (lineup.goalies[0] === playerId || lineup.goalies[1] === playerId || lineup.goalies[2] === playerId) {
    return { kind: "goalie", label: "G" };
  }
  for (const p of lineup.defensePairs) {
    if (p.lb === playerId || p.rb === playerId) return { kind: "skater", label: "D" };
  }
  return { kind: "skater", label: "F" };
}

interface MatchLineupFullJerseyExportPosterProps {
  lineupTitle: string;
  players: Player[];
  lineup: LineupStructure;
  defenseCount: 6 | 7 | 8;
  allowExtraForward: boolean;
}

/**
 * Celá zápasová soupiska s dresy (PremiumJersey) — jedna vysoká PNG, podobně jako nominace {@link Nhl25SharePoster}.
 * Počty obránců / 13. útočník podle stejných pravidel jako editor zápasové sestavy.
 */
export const MatchLineupFullJerseyExportPoster = forwardRef<HTMLDivElement, MatchLineupFullJerseyExportPosterProps>(
  function MatchLineupFullJerseyExportPoster(
    { lineupTitle, players, lineup, defenseCount, allowExtraForward },
    ref
  ) {
    const byId = useMemo(() => new Map(players.map((p) => [p.id, p])), [players]);
    const ambiguousJerseyLastKeys = useMemo(() => getAmbiguousLastNameKeys(players), [players]);

    const cardShell: CSSProperties = {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      padding: "16px 12px 18px",
      borderRadius: 18,
      background: "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08), 0 4px 20px rgba(0,0,0,0.3)",
      border: "1px solid rgba(255,255,255,0.1)",
      minHeight: 148,
    };

    const renderCard = (pid: string | null, positionLabel: string, reactKey: string) => {
      const player = pid ? (byId.get(pid) ?? null) : null;
      const role = pid ? roleForPlayerId(lineup, pid) : { kind: "skater" as const, label: "F" as const };
      const label = positionLabel || role.label;
      return (
        <div key={reactKey} style={cardShell}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              transform: "scale(1.08)",
              transformOrigin: "50% 0%",
            }}
          >
            <PremiumJerseySlotCard
              player={player}
              positionLabel={label}
              kind={role.kind}
              size="compact"
              disableMotion
              lightRinkSurface={false}
              ambiguousJerseyLastKeys={ambiguousJerseyLastKeys}
            />
          </div>
          <div style={{ width: "100%", textAlign: "center", paddingLeft: 2, paddingRight: 2 }}>
            <div
              style={{
                fontSize: 24,
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

    const g1 = lineup.goalies[0];
    const g2 = lineup.goalies[1];

    const defenseBlocks: Array<{ key: string; nodes: ReactNode }> = [];
    for (let i = 0; i < 3; i++) {
      const p = lineup.defensePairs[i];
      if (!p?.lb && !p?.rb) continue;
      defenseBlocks.push({
        key: `pair-${i}`,
        nodes: (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 18,
              alignItems: "stretch",
            }}
          >
            {renderCard(p.lb, "LD", `pair-${i}-lb`)}
            {renderCard(p.rb, "RD", `pair-${i}-rb`)}
          </div>
        ),
      });
    }
    const p3 = lineup.defensePairs[3];
    if (defenseCount === 8 && (p3?.lb || p3?.rb)) {
      defenseBlocks.push({
        key: "pair-4",
        nodes: (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 18,
              alignItems: "stretch",
            }}
          >
            {renderCard(p3.lb, "LD", "pair-4-lb")}
            {renderCard(p3.rb, "RD", "pair-4-rb")}
          </div>
        ),
      });
    } else if (defenseCount === 7 && p3?.lb) {
      defenseBlocks.push({
        key: "d7",
        nodes: (
          <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
              <div style={{ width: "100%", maxWidth: 480 }}>{renderCard(p3.lb, "D", "d7")}</div>
          </div>
        ),
      });
    }

    const sectionTitle = (t: string) => (
      <div
        style={{
          marginBottom: 12,
          fontSize: 13,
          fontWeight: 800,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.72)",
          borderBottom: "1px solid rgba(255,255,255,0.12)",
          paddingBottom: 8,
        }}
      >
        {t}
      </div>
    );

    const lineLabel = (n: number) => (
      <div style={{ marginBottom: 8, fontSize: 12, fontWeight: 700, color: "rgba(241,196,15,0.95)" }}>{n}. lajna</div>
    );

    return (
      <div
        ref={ref}
        data-export-slot="cele-dresy"
        className="match-lineup-full-jersey-poster"
        style={{
          width: 1080,
          padding: 48,
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
            paddingBottom: 20,
            borderBottom: "3px solid rgba(241, 196, 15, 0.6)",
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 14,
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
                marginTop: 6,
                fontSize: 38,
                fontWeight: 900,
                lineHeight: 1.05,
                color: "white",
              }}
            >
              {lineupTitle.trim() || "Moje sestava"}
            </div>
            <div style={{ marginTop: 6, fontSize: 13, color: "rgba(255,255,255,0.55)", fontWeight: 600 }}>
              Celá soupiska · dresy
            </div>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.55)",
              }}
            >
              {defenseCount} beků
              {allowExtraForward ? " · 13. útočník" : ""}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 28 }}>
          <section>
            {sectionTitle("Brankáři")}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: 18,
                alignItems: "stretch",
              }}
            >
              {renderCard(g1, "G", "g1")}
              {renderCard(g2, "G", "g2")}
            </div>
          </section>

          <section>
            {sectionTitle("Útočné řady")}
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {lineup.forwardLines.map((line, li) => (
                <div key={`fl-${li}`}>
                  {lineLabel(li + 1)}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                      gap: 18,
                      alignItems: "stretch",
                    }}
                  >
                    {renderCard(line.lw, "LW", `ln${li}-lw`)}
                    {renderCard(line.c, "C", `ln${li}-c`)}
                    {renderCard(line.rw, "RW", `ln${li}-rw`)}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            {sectionTitle("Obranné páry")}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {defenseBlocks.map((b) => (
                <div key={b.key}>{b.nodes}</div>
              ))}
            </div>
          </section>

          {allowExtraForward && lineup.extraForwards[0] ? (
            <section>
              {sectionTitle("13. útočník")}
              <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
                <div style={{ width: "100%", maxWidth: 520 }}>
                  {renderCard(lineup.extraForwards[0], "F", "xf")}
                </div>
              </div>
            </section>
          ) : null}
        </div>

        <div
          style={{
            marginTop: 32,
            textAlign: "center",
            fontSize: 11,
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
