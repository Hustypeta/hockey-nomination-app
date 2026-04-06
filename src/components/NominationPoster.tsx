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
        className="nomination-poster-box relative w-[min(92vw,920px)] overflow-hidden rounded-2xl border-[6px] border-[#c41e3a] bg-[#07090d] shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
      >
        {/* Jemný praporový akcent */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            background:
              "linear-gradient(90deg, #fff 0%, #fff 33%, #c41e3a 33%, #c41e3a 66%, #003f87 66%, #003f87 100%)",
          }}
        />

        <div className="relative px-8 pb-10 pt-10 md:px-12 md:pb-12 md:pt-12">
          <header className="mb-8 text-center">
            <p className="font-display text-sm tracking-[0.35em] text-[#c41e3a] md:text-base">
              ČESKÁ HOCKEYOVÁ REPREZENTACE
            </p>
            <h1 className="mt-2 font-display text-5xl tracking-[0.12em] text-white md:text-6xl">
              MS 2026
            </h1>
            <p className="mt-2 font-display text-3xl text-[#c41e3a] md:text-4xl">MÁ NOMINACE</p>
            <div className="mx-auto mt-4 h-1.5 w-28 rounded-full bg-[#003f87]" />
          </header>

          <div className="nomination-rink rounded-2xl p-6 md:p-8">
            {lineup ? (
              <div className="space-y-8">
                <PosterSection title="Brankáři">
                  <div className="flex flex-wrap justify-center gap-4 md:gap-5">
                    {lineup.goalies.map((gid, i) => {
                      const p = gid ? getPlayer(gid) : null;
                      if (!p) return null;
                      return (
                        <NationalJersey
                          key={p.id}
                          player={p}
                          variant={i % 2 === 0 ? "white" : "red"}
                          size="lg"
                          isCaptain={captainId === p.id}
                        />
                      );
                    })}
                  </div>
                </PosterSection>

                <PosterSection title="Obránci">
                  <div className="space-y-3">
                    {lineup.defensePairs.map((pair, i) => {
                      const lb = pair.lb ? getPlayer(pair.lb) : null;
                      const rb = pair.rb ? getPlayer(pair.rb) : null;
                      if (!lb && !rb) return null;
                      return (
                        <div
                          key={i}
                          className="flex flex-wrap items-center justify-center gap-3 md:gap-5"
                        >
                          <span className="w-10 text-right font-display text-lg text-[#003f87]/80">
                            {i + 1}.
                          </span>
                          {lb && (
                            <NationalJersey
                              player={lb}
                              variant="white"
                              size="lg"
                              isCaptain={captainId === lb.id}
                            />
                          )}
                          <span className="font-display text-xl text-[#003f87]/50">–</span>
                          {rb && (
                            <NationalJersey
                              player={rb}
                              variant="red"
                              size="lg"
                              isCaptain={captainId === rb.id}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </PosterSection>

                <div className="flex justify-center py-2">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#003f87]/60 bg-[#003f87]/15 font-display text-sm tracking-widest text-[#003f87]">
                    ČR
                  </div>
                </div>

                <PosterSection title="Útočníci">
                  <div className="space-y-4">
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
                          <span className="mb-3 w-8 text-right font-display text-lg text-white/50">
                            {i + 1}.
                          </span>
                          {lw && (
                            <NationalJersey
                              player={lw}
                              variant="white"
                              size="lg"
                              isCaptain={captainId === lw.id}
                            />
                          )}
                          {c && (
                            <NationalJersey
                              player={c}
                              variant="red"
                              size="lg"
                              isCaptain={captainId === c.id}
                            />
                          )}
                          {rw && (
                            <NationalJersey
                              player={rw}
                              variant="white"
                              size="lg"
                              isCaptain={captainId === rw.id}
                            />
                          )}
                        </div>
                      );
                    })}
                    {lineup.extraForwards.length > 0 && (
                      <div className="border-t border-[#003f87]/25 pt-4">
                        <p className="mb-3 text-center font-display text-sm tracking-wide text-[#003f87]/80">
                          Náhradní útočníci
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                          {lineup.extraForwards.map((id, j) => {
                            const p = getPlayer(id);
                            return p ? (
                              <NationalJersey
                                key={p.id}
                                player={p}
                                variant={j % 2 === 0 ? "red" : "white"}
                                size="lg"
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
              <div className="flex flex-wrap justify-center gap-3">
                {players
                  .filter((p) => p.position === "G")
                  .map((p, i) => (
                    <NationalJersey
                      key={p.id}
                      player={p}
                      variant={i % 2 === 0 ? "white" : "red"}
                      size="lg"
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
                      size="lg"
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
                      size="lg"
                      isCaptain={captainId === p.id}
                    />
                  ))}
              </div>
            )}
          </div>

          <footer className="mt-10 text-center">
            <p className="text-base text-white/55 md:text-lg">
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
      <h2 className="mb-4 text-center font-display text-xl tracking-[0.2em] text-[#c41e3a] md:text-2xl">
        {title}
      </h2>
      {children}
    </section>
  );
}
