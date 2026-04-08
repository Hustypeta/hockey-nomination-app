"use client";

import type { Player } from "@/types";
import type { LineupStructure } from "@/types";
import { NationalJersey } from "@/components/NationalJersey";

interface LineBuilderProps {
  lineup: LineupStructure;
  players: Player[];
  captainId: string | null;
  onLineupChange: (lineup: LineupStructure) => void;
  onCaptainChange: (playerId: string | null) => void;
  selectedSlot: { type: string; lineIndex?: number; role?: string } | null;
  onSelectSlot: (slot: { type: string; lineIndex?: number; role?: string } | null) => void;
}

export function LineBuilder({
  lineup,
  players,
  captainId,
  onLineupChange,
  onCaptainChange,
  onSelectSlot,
  selectedSlot,
}: LineBuilderProps) {
  const getPlayer = (id: string | null) =>
    id ? players.find((p) => p.id === id) : null;

  const setForwardLine = (lineIndex: number, role: "lw" | "c" | "rw", playerId: string | null) => {
    const next = { ...lineup };
    const line = { ...next.forwardLines[lineIndex], [role]: playerId };
    next.forwardLines = [...next.forwardLines] as LineupStructure["forwardLines"];
    next.forwardLines[lineIndex] = line;
    onLineupChange(next);
  };

  const setDefensePair = (pairIndex: number, role: "lb" | "rb", playerId: string | null) => {
    const next = { ...lineup };
    const pair = { ...next.defensePairs[pairIndex], [role]: playerId };
    next.defensePairs = [...next.defensePairs] as LineupStructure["defensePairs"];
    next.defensePairs[pairIndex] = pair;
    onLineupChange(next);
  };

  const setGoalie = (index: number, playerId: string | null) => {
    const next = { ...lineup };
    next.goalies = [...next.goalies];
    next.goalies[index] = playerId;
    onLineupChange(next);
  };

  const removeExtraForwardByIndex = (index: number) => {
    const id = lineup.extraForwards[index];
    if (!id) return;
    onLineupChange({
      ...lineup,
      extraForwards: lineup.extraForwards.filter((_, i) => i !== index),
    });
  };

  const isSlotSelected = (type: string, lineIndex?: number, role?: string) =>
    selectedSlot?.type === type &&
    selectedSlot?.lineIndex === lineIndex &&
    selectedSlot?.role === role;

  const Slot = ({
    playerId,
    label,
    type,
    lineIndex,
    role,
    onClear,
  }: {
    playerId: string | null;
    label: string;
    type: string;
    lineIndex?: number;
    role?: string;
    onClear?: () => void;
  }) => {
    const player = getPlayer(playerId);
    const selected = isSlotSelected(type, lineIndex, role);

    return (
      <div
        onClick={() => onSelectSlot(selected ? null : { type, lineIndex, role })}
        className={`
          group relative cursor-pointer rounded-2xl p-2 transition-all duration-200
          ${player ? "pb-6" : "pb-2"}
          ${selected ? "bg-amber-500/15 ring-2 ring-amber-400 ring-offset-2 ring-offset-[#0c0e12]" : "bg-transparent hover:bg-white/[0.03]"}
        `}
      >
        {player && onClear && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            className="absolute -right-0.5 -top-0.5 z-30 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white opacity-0 shadow-md transition-opacity hover:bg-red-500 group-hover:opacity-100"
            aria-label="Odebrat hráče"
          >
            ×
          </button>
        )}
        {player ? (
          <>
            <NationalJersey
              player={player}
              size="md"
              isCaptain={captainId === player.id}
              isSelected={selected}
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onCaptainChange(captainId === player.id ? null : player.id);
              }}
              className={`
                absolute -bottom-1 left-1/2 z-20 -translate-x-1/2 rounded-full px-2 py-0.5 font-display text-[10px] font-bold tracking-wide shadow-md transition-colors
                ${
                  captainId === player.id
                    ? "bg-[#003f87] text-white"
                    : "bg-[#151922] text-white/70 ring-1 ring-white/25 hover:bg-[#1e2430]"
                }
              `}
            >
              {captainId === player.id ? "Kapitán" : "C?"}
            </button>
          </>
        ) : (
          <NationalJersey
            size="md"
            placeholderLabel={label}
            isSelected={selected}
          />
        )}
      </div>
    );
  };

  return (
    <div className="nomination-rink rounded-3xl p-4 sm:p-6 md:p-8">
      {/* Úvodní modré čáry */}
      <div className="pointer-events-none mb-4 flex justify-center gap-2 opacity-50">
        <div className="h-1 w-full max-w-[40%] rounded-full bg-[#003f87]/70" />
        <div className="h-1 w-full max-w-[40%] rounded-full bg-[#003f87]/70" />
      </div>

      {/* Brankáři */}
      <section className="mb-8">
        <h3 className="mb-3 flex items-center gap-2 font-display text-lg tracking-wide text-[#c41e3a]">
          <span className="inline-block h-2 w-2 rounded-full bg-[#003f87]" />
          Brankáři
        </h3>
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
          {lineup.goalies.map((gid, i) => (
            <div key={i} className="relative">
              <Slot
                playerId={gid}
                label={`G${i + 1}`}
                type="goalie"
                lineIndex={i}
                onClear={gid ? () => { setGoalie(i, null); onSelectSlot(null); } : undefined}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Střed hřiště */}
      <div className="mb-6 flex justify-center">
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#003f87]/50 bg-[#003f87]/10 shadow-[inset_0_0_20px_rgba(0,63,135,0.2)]">
          <span className="font-display text-xs tracking-widest text-[#003f87]/80">
            ČR
          </span>
        </div>
      </div>

      {/* Lajny = útok + příslušný bekovský pár; 1.|2. vedle sebe, dole 3.+4. vlevo, náhradníci vpravo */}
      <section>
        <h3 className="mb-3 flex items-center gap-2 font-display text-lg tracking-wide text-[#c41e3a]">
          <span className="inline-block h-2 w-2 rounded-full bg-[#003f87]" />
          Lajny
        </h3>

        <div className="mx-auto max-w-5xl space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[0, 1].map((i) => {
              const line = lineup.forwardLines[i];
              const pair = lineup.defensePairs[i];
              return (
                <div
                  key={i}
                  className="flex min-w-0 flex-col items-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] px-2 py-3"
                >
                  <span className="font-display text-xs text-white/55">{i + 1}. lajna</span>
                  <span className="text-[10px] uppercase tracking-wider text-[#003f87]/80">
                    Útok
                  </span>
                  <div className="flex flex-wrap items-end justify-center gap-1.5 sm:gap-2">
                    <Slot
                      playerId={line.lw}
                      label="LW"
                      type="forward"
                      lineIndex={i}
                      role="lw"
                      onClear={
                        line.lw
                          ? () => {
                              setForwardLine(i, "lw", null);
                              onSelectSlot(null);
                            }
                          : undefined
                      }
                    />
                    <Slot
                      playerId={line.c}
                      label="C"
                      type="forward"
                      lineIndex={i}
                      role="c"
                      onClear={
                        line.c
                          ? () => {
                              setForwardLine(i, "c", null);
                              onSelectSlot(null);
                            }
                          : undefined
                      }
                    />
                    <Slot
                      playerId={line.rw}
                      label="RW"
                      type="forward"
                      lineIndex={i}
                      role="rw"
                      onClear={
                        line.rw
                          ? () => {
                              setForwardLine(i, "rw", null);
                              onSelectSlot(null);
                            }
                          : undefined
                      }
                    />
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-[#003f87]/80">
                    Obránci
                  </span>
                  <div className="flex flex-wrap items-end justify-center gap-1.5 sm:gap-2">
                    <Slot
                      playerId={pair.lb}
                      label="LB"
                      type="defense"
                      lineIndex={i}
                      role="lb"
                      onClear={
                        pair.lb
                          ? () => {
                              setDefensePair(i, "lb", null);
                              onSelectSlot(null);
                            }
                          : undefined
                      }
                    />
                    {pair.lb && pair.rb && (
                      <span className="mb-8 text-sm text-white/25">–</span>
                    )}
                    <Slot
                      playerId={pair.rb}
                      label="RB"
                      type="defense"
                      lineIndex={i}
                      role="rb"
                      onClear={
                        pair.rb
                          ? () => {
                              setDefensePair(i, "rb", null);
                              onSelectSlot(null);
                            }
                          : undefined
                      }
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 gap-4 border-t border-white/10 pt-4 sm:grid-cols-2">
            <div className="flex min-w-0 flex-col items-stretch gap-4">
              {[2, 3].map((i) => {
                const line = lineup.forwardLines[i];
                const pair = lineup.defensePairs[i];
                return (
                  <div
                    key={i}
                    className="flex w-full flex-col items-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] px-2 py-3"
                  >
                    <span className="font-display text-xs text-white/55">{i + 1}. lajna</span>
                    <span className="text-[10px] uppercase tracking-wider text-[#003f87]/80">
                      Útok
                    </span>
                    <div className="flex flex-wrap items-end justify-center gap-1.5 sm:gap-2">
                      <Slot
                        playerId={line.lw}
                        label="LW"
                        type="forward"
                        lineIndex={i}
                        role="lw"
                        onClear={
                          line.lw
                            ? () => {
                                setForwardLine(i, "lw", null);
                                onSelectSlot(null);
                              }
                            : undefined
                        }
                      />
                      <Slot
                        playerId={line.c}
                        label="C"
                        type="forward"
                        lineIndex={i}
                        role="c"
                        onClear={
                          line.c
                            ? () => {
                                setForwardLine(i, "c", null);
                                onSelectSlot(null);
                              }
                            : undefined
                        }
                      />
                      <Slot
                        playerId={line.rw}
                        label="RW"
                        type="forward"
                        lineIndex={i}
                        role="rw"
                        onClear={
                          line.rw
                            ? () => {
                                setForwardLine(i, "rw", null);
                                onSelectSlot(null);
                              }
                            : undefined
                        }
                      />
                    </div>
                    <span className="text-[10px] uppercase tracking-wider text-[#003f87]/80">
                      Obránci
                    </span>
                    <div className="flex flex-wrap items-end justify-center gap-1.5 sm:gap-2">
                      <Slot
                        playerId={pair.lb}
                        label="LB"
                        type="defense"
                        lineIndex={i}
                        role="lb"
                        onClear={
                          pair.lb
                            ? () => {
                                setDefensePair(i, "lb", null);
                                onSelectSlot(null);
                              }
                            : undefined
                        }
                      />
                      {pair.lb && pair.rb && (
                        <span className="mb-8 text-sm text-white/25">–</span>
                      )}
                      <Slot
                        playerId={pair.rb}
                        label="RB"
                        type="defense"
                        lineIndex={i}
                        role="rb"
                        onClear={
                          pair.rb
                            ? () => {
                                setDefensePair(i, "rb", null);
                                onSelectSlot(null);
                              }
                            : undefined
                        }
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex min-w-0 flex-col items-center gap-2 border-t border-white/10 pt-4 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
              <span className="font-display text-xs tracking-wide text-[#c41e3a]">Náhradníci</span>
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                {[0, 1].map((i) => {
                  const pid = lineup.extraForwards[i] ?? null;
                  return (
                    <Slot
                      key={i}
                      playerId={pid}
                      label={`N${i + 1}`}
                      type="extraForward"
                      lineIndex={i}
                      onClear={
                        pid
                          ? () => {
                              removeExtraForwardByIndex(i);
                              onSelectSlot(null);
                            }
                          : undefined
                      }
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <p className="mt-6 text-center text-xs text-white/40">
        Klik na kartu = výběr slotu · C? / Kapitán · × = odebrat
      </p>
    </div>
  );
}
