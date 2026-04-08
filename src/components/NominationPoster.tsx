"use client";

import { forwardRef, type ReactNode } from "react";
import type { Player } from "@/types";
import type { LineupStructure, ForwardLine } from "@/types";
import { NationalJersey } from "@/components/NationalJersey";

interface NominationPosterProps {
  players: Player[];
  captainId: string | null;
  lineup?: LineupStructure | null;
}

function PosterForwardRow({
  label,
  line,
  captainId,
  getPlayer,
}: {
  label: string;
  line: ForwardLine;
  captainId: string | null;
  getPlayer: (id: string) => Player | undefined;
}) {
  const lw = line.lw ? getPlayer(line.lw) : null;
  const c = line.c ? getPlayer(line.c) : null;
  const rw = line.rw ? getPlayer(line.rw) : null;
  if (!lw && !c && !rw) return null;
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="font-display text-[9px] tracking-wide text-white/55">{label}</span>
      <div className="flex items-end justify-center gap-0.5">
        {lw && (
          <NationalJersey player={lw} size="xs" isCaptain={captainId === lw.id} />
        )}
        {c && (
          <NationalJersey player={c} size="xs" isCaptain={captainId === c.id} />
        )}
        {rw && (
          <NationalJersey player={rw} size="xs" isCaptain={captainId === rw.id} />
        )}
      </div>
    </div>
  );
}

export const NominationPoster = forwardRef<HTMLDivElement, NominationPosterProps>(
  function NominationPoster({ players, captainId, lineup }, ref) {
    const getPlayer = (id: string) => players.find((p) => p.id === id);

    return (
      <div
        ref={ref}
        className="nomination-poster-box relative w-[430px] max-w-[100vw] overflow-hidden rounded-[1.75rem] border-[5px] border-[#c41e3a] bg-[#07090d] shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            background:
              "linear-gradient(90deg, #fff 0%, #fff 33%, #c41e3a 33%, #c41e3a 66%, #003f87 66%, #003f87 100%)",
          }}
        />

        <div className="relative px-3 pb-5 pt-5 sm:px-4">
          <header className="mb-3 text-center">
            <p className="font-display text-[10px] tracking-[0.28em] text-[#c41e3a]">
              ČESKÁ HOCKEYOVÁ REPREZENTACE
            </p>
            <h1 className="mt-1 font-display text-4xl tracking-[0.1em] text-white">MS 2026</h1>
            <p className="mt-1 font-display text-2xl text-[#c41e3a]">MÁ NOMINACE</p>
            <div className="mx-auto mt-2 h-1 w-20 rounded-full bg-[#003f87]" />
          </header>

          <div className="nomination-rink rounded-xl p-2.5 sm:p-3">
            {lineup ? (
              <div className="space-y-3">
                <PosterSection title="Brankáři">
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {lineup.goalies.map((gid) => {
                      const p = gid ? getPlayer(gid) : null;
                      if (!p) return null;
                      return (
                        <NationalJersey
                          key={p.id}
                          player={p}
                          size="sm"
                          isCaptain={captainId === p.id}
                        />
                      );
                    })}
                  </div>
                </PosterSection>

                <PosterSection title="Obránci">
                  <div className="space-y-1.5">
                    {lineup.defensePairs.map((pair, i) => {
                      const lb = pair.lb ? getPlayer(pair.lb) : null;
                      const rb = pair.rb ? getPlayer(pair.rb) : null;
                      if (!lb && !rb) return null;
                      return (
                        <div
                          key={i}
                          className="flex flex-wrap items-center justify-center gap-2 md:gap-4"
                        >
                          <span className="w-5 text-right font-display text-xs text-[#003f87]/80">
                            {i + 1}.
                          </span>
                          {lb && (
                            <NationalJersey
                              player={lb}
                              size="sm"
                              isCaptain={captainId === lb.id}
                            />
                          )}
                          <span className="font-display text-xs text-[#003f87]/50">–</span>
                          {rb && (
                            <NationalJersey
                              player={rb}
                              size="sm"
                              isCaptain={captainId === rb.id}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </PosterSection>

                <div className="flex justify-center py-0.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#003f87]/60 bg-[#003f87]/15 font-display text-[10px] tracking-widest text-[#003f87]">
                    ČR
                  </div>
                </div>

                <PosterSection title="Útočníci">
                  {/* 1. a 2. lajna vedle sebe */}
                  <div className="grid grid-cols-2 gap-x-1 gap-y-1">
                    <PosterForwardRow
                      label="1. lajna"
                      line={lineup.forwardLines[0]}
                      captainId={captainId}
                      getPlayer={getPlayer}
                    />
                    <PosterForwardRow
                      label="2. lajna"
                      line={lineup.forwardLines[1]}
                      captainId={captainId}
                      getPlayer={getPlayer}
                    />
                  </div>
                  {/* 3. + 4. lajna vlevo, náhradníci vpravo */}
                  <div className="mt-2 grid grid-cols-2 gap-x-1 border-t border-[#003f87]/20 pt-2">
                    <div className="flex flex-col items-center gap-1.5">
                      <PosterForwardRow
                        label="3. lajna"
                        line={lineup.forwardLines[2]}
                        captainId={captainId}
                        getPlayer={getPlayer}
                      />
                      <PosterForwardRow
                        label="4. lajna"
                        line={lineup.forwardLines[3]}
                        captainId={captainId}
                        getPlayer={getPlayer}
                      />
                    </div>
                    <div className="flex flex-col items-center justify-start gap-1 border-l border-[#003f87]/30 pl-1.5">
                      <span className="font-display text-[9px] tracking-wide text-[#c41e3a]">
                        Náhradníci
                      </span>
                      <div className="flex flex-wrap justify-center gap-0.5">
                        {lineup.extraForwards.map((id) => {
                          const p = getPlayer(id);
                          return p ? (
                            <NationalJersey
                              key={p.id}
                              player={p}
                              size="xs"
                              isCaptain={captainId === p.id}
                            />
                          ) : null;
                        })}
                      </div>
                    </div>
                  </div>
                </PosterSection>
              </div>
            ) : (
              <div className="flex flex-wrap justify-center gap-2">
                {players
                  .filter((p) => p.position === "G")
                  .map((p) => (
                    <NationalJersey
                      key={p.id}
                      player={p}
                      size="sm"
                      isCaptain={captainId === p.id}
                    />
                  ))}
                {players
                  .filter((p) => p.position === "D")
                  .map((p) => (
                    <NationalJersey
                      key={p.id}
                      player={p}
                      size="sm"
                      isCaptain={captainId === p.id}
                    />
                  ))}
                {players
                  .filter((p) => p.position === "F")
                  .map((p) => (
                    <NationalJersey
                      key={p.id}
                      player={p}
                      size="sm"
                      isCaptain={captainId === p.id}
                    />
                  ))}
              </div>
            )}
          </div>

          <footer className="mt-3 text-center">
            <p className="text-[11px] text-white/55 sm:text-xs">
              Sestavil jsem na{" "}
              <span className="font-display text-[#c41e3a]">hockey-nomination.cz</span>
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
      <h2 className="mb-1.5 text-center font-display text-xs tracking-[0.15em] text-[#c41e3a]">
        {title}
      </h2>
      {children}
    </section>
  );
}
