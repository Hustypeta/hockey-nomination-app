"use client";

import { forwardRef, type ReactNode } from "react";
import type { Player } from "@/types";
import type { LineupStructure } from "@/types";
import { NationalJersey } from "@/components/NationalJersey";

interface NominationPosterProps {
  players: Player[];
  captainId: string | null;
  lineup?: LineupStructure | null;
}

export const NominationPoster = forwardRef<HTMLDivElement, NominationPosterProps>(
  function NominationPoster({ players, captainId, lineup }, ref) {
    const getPlayer = (id: string) => players.find((p) => p.id === id);

    return (
      <div
        ref={ref}
        className="nomination-poster-box relative w-[430px] max-w-[100vw] overflow-hidden rounded-[1.75rem] border-[5px] border-[#c41e3a] bg-[#07090d] shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
      >
        {/* Jemný praporový akcent */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            background:
              "linear-gradient(90deg, #fff 0%, #fff 33%, #c41e3a 33%, #c41e3a 66%, #003f87 66%, #003f87 100%)",
          }}
        />

        <div className="relative px-4 pb-6 pt-6 sm:px-5">
          <header className="mb-4 text-center">
            <p className="font-display text-[10px] tracking-[0.28em] text-[#c41e3a]">
              ČESKÁ HOCKEYOVÁ REPREZENTACE
            </p>
            <h1 className="mt-1 font-display text-4xl tracking-[0.1em] text-white">
              MS 2026
            </h1>
            <p className="mt-1 font-display text-2xl text-[#c41e3a]">MÁ NOMINACE</p>
            <div className="mx-auto mt-2 h-1 w-20 rounded-full bg-[#003f87]" />
          </header>

          <div className="nomination-rink rounded-xl p-3 sm:p-4">
            {lineup ? (
              <div className="space-y-4">
                <PosterSection title="Brankáři">
                  <div className="flex flex-wrap justify-center gap-2">
                    {lineup.goalies.map((gid, i) => {
                      const p = gid ? getPlayer(gid) : null;
                      if (!p) return null;
                      return (
                        <NationalJersey
                          key={p.id}
                          player={p}
                          variant={i % 2 === 0 ? "white" : "red"}
                          size="sm"
                          isCaptain={captainId === p.id}
                        />
                      );
                    })}
                  </div>
                </PosterSection>

                <PosterSection title="Obránci">
                  <div className="space-y-2">
                    {lineup.defensePairs.map((pair, i) => {
                      const lb = pair.lb ? getPlayer(pair.lb) : null;
                      const rb = pair.rb ? getPlayer(pair.rb) : null;
                      if (!lb && !rb) return null;
                      return (
                        <div
                          key={i}
                          className="flex flex-wrap items-center justify-center gap-3 md:gap-5"
                        >
                          <span className="w-6 text-right font-display text-sm text-[#003f87]/80">
                            {i + 1}.
                          </span>
                          {lb && (
                            <NationalJersey
                              player={lb}
                              variant="white"
                              size="sm"
                              isCaptain={captainId === lb.id}
                            />
                          )}
                          <span className="font-display text-sm text-[#003f87]/50">–</span>
                          {rb && (
                            <NationalJersey
                              player={rb}
                              variant="red"
                              size="sm"
                              isCaptain={captainId === rb.id}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </PosterSection>

                <div className="flex justify-center py-1">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#003f87]/60 bg-[#003f87]/15 font-display text-xs tracking-widest text-[#003f87]">
                    ČR
                  </div>
                </div>

                <PosterSection title="Útočníci">
                  <div className="space-y-2">
                    {lineup.forwardLines.map((line, i) => {
                      const lw = line.lw ? getPlayer(line.lw) : null;
                      const c = line.c ? getPlayer(line.c) : null;
                      const rw = line.rw ? getPlayer(line.rw) : null;
                      if (!lw && !c && !rw) return null;
                      return (
                        <div
                          key={i}
                          className="flex flex-wrap items-end justify-center gap-3 md:gap-5"
                        >
                          <span className="mb-2 w-5 text-right font-display text-xs text-white/50">
                            {i + 1}.
                          </span>
                          {lw && (
                            <NationalJersey
                              player={lw}
                              variant="white"
                              size="sm"
                              isCaptain={captainId === lw.id}
                            />
                          )}
                          {c && (
                            <NationalJersey
                              player={c}
                              variant="red"
                              size="sm"
                              isCaptain={captainId === c.id}
                            />
                          )}
                          {rw && (
                            <NationalJersey
                              player={rw}
                              variant="white"
                              size="sm"
                              isCaptain={captainId === rw.id}
                            />
                          )}
                        </div>
                      );
                    })}
                    {lineup.extraForwards.length > 0 && (
                      <div className="border-t border-[#003f87]/25 pt-2">
                        <p className="mb-2 text-center font-display text-xs tracking-wide text-[#003f87]/80">
                          Náhradní útočníci
                        </p>
                        <div className="flex flex-wrap justify-center gap-2">
                          {lineup.extraForwards.map((id, j) => {
                            const p = getPlayer(id);
                            return p ? (
                              <NationalJersey
                                key={p.id}
                                player={p}
                                variant={j % 2 === 0 ? "red" : "white"}
                                size="sm"
                                isCaptain={captainId === p.id}
                              />
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </PosterSection>
              </div>
            ) : (
              <div className="flex flex-wrap justify-center gap-2">
                {players
                  .filter((p) => p.position === "G")
                  .map((p, i) => (
                    <NationalJersey
                      key={p.id}
                      player={p}
                      variant={i % 2 === 0 ? "white" : "red"}
                      size="sm"
                      isCaptain={captainId === p.id}
                    />
                  ))}
                {players
                  .filter((p) => p.position === "D")
                  .map((p, i) => (
                    <NationalJersey
                      key={p.id}
                      player={p}
                      variant={i % 2 === 0 ? "white" : "red"}
                      size="sm"
                      isCaptain={captainId === p.id}
                    />
                  ))}
                {players
                  .filter((p) => p.position === "F")
                  .map((p, i) => (
                    <NationalJersey
                      key={p.id}
                      player={p}
                      variant={i % 2 === 0 ? "white" : "red"}
                      size="sm"
                      isCaptain={captainId === p.id}
                    />
                  ))}
              </div>
            )}
          </div>

          <footer className="mt-4 text-center">
            <p className="text-xs text-white/55 sm:text-sm">
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
      <h2 className="mb-2 text-center font-display text-sm tracking-[0.15em] text-[#c41e3a]">
        {title}
      </h2>
      {children}
    </section>
  );
}
