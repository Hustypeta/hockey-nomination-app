"use client";

import { forwardRef, type ReactNode } from "react";
import type { Player } from "@/types";
import type { LineupStructure, ForwardLine, DefensePair } from "@/types";
import { CzechHockeyCrest } from "@/components/CzechHockeyCrest";
import { LineupJerseyCard } from "@/components/sestava/LineupJerseyCard";

interface NominationPosterProps {
  players: Player[];
  captainId: string | null;
  lineup?: LineupStructure | null;
  assistantIds?: string[];
}

/** Stejné vizuální karty jako ve sestavovači — na exportu bez siluet (jen gradient). */
function PosterPlayerCard({
  player,
  positionLabel,
  size,
  captainId,
  assistantIds,
}: {
  player: Player;
  positionLabel: string;
  size: "compact" | "skater" | "goalie";
  captainId: string | null;
  assistantIds: string[];
}) {
  return (
    <LineupJerseyCard
      player={player}
      positionLabel={positionLabel}
      size={size}
      isCaptain={captainId === player.id}
      isAssistant={assistantIds.includes(player.id)}
      portraitStyle="gradient"
      disableMotion
    />
  );
}

/** Jedna lajna: útok + příslušný obranný blok (u 4. lajny i sedmý bek). */
function PosterLineBlock({
  label,
  line,
  pair,
  captainId,
  assistantIds,
  getPlayer,
}: {
  label: string;
  line: ForwardLine;
  pair: DefensePair;
  captainId: string | null;
  assistantIds: string[];
  getPlayer: (id: string) => Player | undefined;
}) {
  const lw = line.lw ? getPlayer(line.lw) : null;
  const c = line.c ? getPlayer(line.c) : null;
  const rw = line.rw ? getPlayer(line.rw) : null;
  const xf = line.x ? getPlayer(line.x) : null;
  const lb = pair.lb ? getPlayer(pair.lb) : null;
  const rb = pair.rb ? getPlayer(pair.rb) : null;
  const hasFwd = lw || c || rw || xf;
  const hasDef = lb || rb;
  const hasAny = hasFwd || hasDef;
  if (!hasAny) return null;

  const isFourth = label.startsWith("4.");

  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="font-display text-[8px] uppercase tracking-[0.28em] text-white/45">{label}</span>
      {hasFwd ? (
        <div
          className={`flex flex-wrap items-end justify-center gap-1 ${isFourth ? "max-w-[19.5rem]" : "max-w-[15rem]"}`}
        >
          {lw && (
            <PosterPlayerCard
              player={lw}
              positionLabel="LW"
              size="compact"
              captainId={captainId}
              assistantIds={assistantIds}
            />
          )}
          {c && (
            <PosterPlayerCard
              player={c}
              positionLabel="C"
              size="compact"
              captainId={captainId}
              assistantIds={assistantIds}
            />
          )}
          {rw && (
            <PosterPlayerCard
              player={rw}
              positionLabel="RW"
              size="compact"
              captainId={captainId}
              assistantIds={assistantIds}
            />
          )}
          {xf && (
            <PosterPlayerCard
              player={xf}
              positionLabel="X"
              size="compact"
              captainId={captainId}
              assistantIds={assistantIds}
            />
          )}
        </div>
      ) : null}
      {hasDef ? (
        <>
          <span className="font-display text-[7px] uppercase tracking-[0.22em] text-cyan-200/50">
            {isFourth ? "Sedmý bek" : "Obránci"}
          </span>
          <div className="flex flex-wrap items-end justify-center gap-1">
            {lb && (
              <PosterPlayerCard
                player={lb}
                positionLabel={isFourth ? "7. B" : "LD"}
                size="compact"
                captainId={captainId}
                assistantIds={assistantIds}
              />
            )}
            {!isFourth && lb && rb ? (
              <span className="mb-3 font-display text-[9px] text-white/25" aria-hidden>
                –
              </span>
            ) : null}
            {rb && !isFourth && (
              <PosterPlayerCard
                player={rb}
                positionLabel="RD"
                size="compact"
                captainId={captainId}
                assistantIds={assistantIds}
              />
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}

export const NominationPoster = forwardRef<HTMLDivElement, NominationPosterProps>(
  function NominationPoster({ players, captainId, lineup, assistantIds = [] }, ref) {
    const getPlayer = (id: string) => players.find((p) => p.id === id);
    const aids = assistantIds.length ? assistantIds : (lineup?.assistantIds ?? []);

    return (
      <div
        ref={ref}
        className="nomination-poster-box relative w-[440px] max-w-[100vw] overflow-hidden rounded-2xl border-2 border-[#c8102e] bg-[#05080f] shadow-[0_24px_80px_rgba(0,0,0,0.65)]"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-100"
          style={{
            background: `
              radial-gradient(ellipse 100% 55% at 50% -20%, rgba(0, 48, 135, 0.38), transparent 55%),
              radial-gradient(ellipse 55% 40% at 0% 40%, rgba(200, 16, 46, 0.12), transparent 50%),
              radial-gradient(ellipse 50% 38% at 100% 55%, rgba(0, 48, 135, 0.18), transparent 48%),
              linear-gradient(180deg, #0a0e17 0%, #05080f 42%, #04060c 100%)
            `,
          }}
          aria-hidden
        />

        <div className="lineup-board-accent relative mx-4 mt-3 rounded-full opacity-90" aria-hidden />

        <div className="relative px-3 pb-4 pt-2 sm:px-4">
          <header className="mb-3 flex flex-col items-center text-center">
            <div className="mb-2 flex items-center gap-2.5">
              <CzechHockeyCrest className="h-11 w-11 shrink-0 drop-shadow-[0_0_14px_rgba(200,16,46,0.35)]" />
              <div className="text-left">
                <p className="font-display text-[9px] font-bold uppercase tracking-[0.35em] text-[#c8102e]">
                  Česká reprezentace
                </p>
                <h1 className="font-display text-3xl leading-none tracking-[0.12em] text-white drop-shadow-[0_2px_20px_rgba(0,0,0,0.5)]">
                  MS <span className="text-[#c8102e]">2026</span>
                </h1>
              </div>
            </div>
            <p className="font-display text-lg uppercase tracking-[0.22em] text-cyan-200/90">Lineup</p>
          </header>

          <div className="nomination-poster-panel rounded-xl p-2.5 sm:p-3">
            {lineup ? (
              <div className="space-y-3">
                <PosterSection title="Brankáři">
                  <div className="flex flex-wrap justify-center gap-2">
                    {lineup.goalies.map((gid, i) => {
                      const p = gid ? getPlayer(gid) : null;
                      if (!p) return null;
                      return (
                        <PosterPlayerCard
                          key={p.id}
                          player={p}
                          positionLabel={`G${i + 1}`}
                          size="compact"
                          captainId={captainId}
                          assistantIds={aids}
                        />
                      );
                    })}
                  </div>
                </PosterSection>

                <PosterSection title="Lajny">
                  <div className="grid grid-cols-2 gap-x-2 gap-y-3">
                    <PosterLineBlock
                      label="1. lajna"
                      line={lineup.forwardLines[0]}
                      pair={lineup.defensePairs[0]}
                      captainId={captainId}
                      assistantIds={aids}
                      getPlayer={getPlayer}
                    />
                    <PosterLineBlock
                      label="2. lajna"
                      line={lineup.forwardLines[1]}
                      pair={lineup.defensePairs[1]}
                      captainId={captainId}
                      assistantIds={aids}
                      getPlayer={getPlayer}
                    />
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-x-2 border-t border-white/[0.08] pt-3">
                    <PosterLineBlock
                      label="3. lajna"
                      line={lineup.forwardLines[2]}
                      pair={lineup.defensePairs[2]}
                      captainId={captainId}
                      assistantIds={aids}
                      getPlayer={getPlayer}
                    />
                    <div className="flex flex-col items-center gap-2 border-l border-white/[0.08] pl-2">
                      <PosterLineBlock
                        label="4. lajna"
                        line={lineup.forwardLines[3]}
                        pair={lineup.defensePairs[3]}
                        captainId={captainId}
                        assistantIds={aids}
                        getPlayer={getPlayer}
                      />
                      <div className="w-full border-t border-dashed border-white/[0.1] pt-2">
                        <p className="mb-1.5 text-center font-display text-[8px] uppercase tracking-[0.24em] text-[#c8102e]/90">
                          Náhradníci
                        </p>
                        <div className="flex flex-wrap justify-center gap-1">
                          {lineup.extraForwards.map((id, i) => {
                            if (!id) return null;
                            const p = getPlayer(id);
                            return p ? (
                              <PosterPlayerCard
                                key={`xf-${p.id}`}
                                player={p}
                                positionLabel={`EX${i + 1}`}
                                size="compact"
                                captainId={captainId}
                                assistantIds={aids}
                              />
                            ) : null;
                          })}
                          {lineup.extraDefensemen.map((id) => {
                            const p = getPlayer(id);
                            return p ? (
                              <PosterPlayerCard
                                key={`xd-${p.id}`}
                                player={p}
                                positionLabel="N-D"
                                size="compact"
                                captainId={captainId}
                                assistantIds={aids}
                              />
                            ) : null;
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </PosterSection>
              </div>
            ) : (
              <div className="flex flex-wrap justify-center gap-1.5">
                {players.map((p) => (
                  <PosterPlayerCard
                    key={p.id}
                    player={p}
                    positionLabel={
                      p.position === "G" ? "G" : p.position === "D" ? (p.role ?? "D") : (p.role ?? "F")
                    }
                    size="compact"
                    captainId={captainId}
                    assistantIds={aids}
                  />
                ))}
              </div>
            )}
          </div>

          <footer className="mt-3 border-t border-white/[0.06] pt-3 text-center">
            <p className="text-[10px] text-white/50">
              Sestaveno na{" "}
              <span className="font-display text-[#c8102e] tracking-wide">hockey-nomination.cz</span>
            </p>
          </footer>
        </div>
      </div>
    );
  }
);

function PosterSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-2 border-b border-white/[0.08] pb-1.5 text-center font-display text-[11px] uppercase tracking-[0.22em] text-white/80">
        {title}
      </h2>
      {children}
    </section>
  );
}
