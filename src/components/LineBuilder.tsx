"use client";

import type { ReactNode } from "react";
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

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-3 flex items-center gap-2.5 font-display text-[13px] uppercase tracking-[0.2em] text-white/45">
      <span className="h-px w-6 bg-gradient-to-r from-[#c41e3a] to-transparent" aria-hidden />
      {children}
      <span className="h-px flex-1 max-w-[4rem] bg-gradient-to-l from-[#003f87]/60 to-transparent" aria-hidden />
    </h3>
  );
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

  const slotJerseyShape = (t: string) => (t === "goalie" ? "goalie" : "skater");

  const Slot = ({
    playerId,
    label,
    type,
    lineIndex,
    role,
    onClear,
    jerseySize = "sm",
  }: {
    playerId: string | null;
    label: string;
    type: string;
    lineIndex?: number;
    role?: string;
    onClear?: () => void;
    jerseySize?: "sm" | "md";
  }) => {
    const player = getPlayer(playerId);
    const selected = isSlotSelected(type, lineIndex, role);

    return (
      <div
        onClick={() => onSelectSlot(selected ? null : { type, lineIndex, role })}
        className={`
          group relative cursor-pointer rounded-2xl p-1.5 transition-all duration-300 ease-out
          ${player ? "pb-6" : "pb-2"}
          ${
            selected
              ? "bg-sky-500/10 ring-2 ring-sky-400/90 shadow-[0_0_32px_rgba(56,189,248,0.2)] ring-offset-2 ring-offset-[#0c1018]"
              : "ring-1 ring-transparent hover:bg-white/[0.04] hover:ring-white/[0.08]"
          }
        `}
      >
        {player && onClear && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            className="absolute -right-0.5 -top-0.5 z-30 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-700 text-sm font-bold text-white opacity-0 shadow-lg transition-all hover:scale-105 hover:from-red-400 hover:to-red-600 group-hover:opacity-100"
            aria-label="Odebrat hráče"
          >
            ×
          </button>
        )}
        {player ? (
          <>
            <NationalJersey
              player={player}
              size={jerseySize}
              jerseyShape={slotJerseyShape(type)}
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
                absolute bottom-0 left-1/2 z-20 -translate-x-1/2 rounded-full border px-2 py-0.5 font-display text-[9px] font-semibold uppercase tracking-wider shadow-md transition-all
                ${
                  captainId === player.id
                    ? "border-sky-300/40 bg-gradient-to-b from-[#003f87] to-[#002a5c] text-white"
                    : "border-white/15 bg-[#0f141c]/95 text-white/65 hover:border-white/25 hover:text-white/90"
                }
              `}
            >
              {captainId === player.id ? "Kapitán" : "C?"}
            </button>
          </>
        ) : (
          <NationalJersey
            size={jerseySize}
            placeholderLabel={label}
            jerseyShape={slotJerseyShape(type)}
            isSelected={selected}
          />
        )}
      </div>
    );
  };

  const lineBlock = (i: number) => {
    const line = lineup.forwardLines[i];
    const pair = lineup.defensePairs[i];
    return (
      <div
        key={i}
        className="flex min-w-0 flex-col gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-sm sm:p-3"
      >
        <div className="flex items-center justify-between gap-2 border-b border-white/[0.05] pb-2">
          <span className="font-display text-sm tracking-[0.12em] text-white/90">{i + 1}. lajna</span>
          <span className="rounded-full bg-[#003f87]/20 px-2 py-0.5 font-display text-[9px] uppercase tracking-wider text-sky-200/80">
            Line {i + 1}
          </span>
        </div>

        <div>
          <p className="mb-1.5 flex justify-between px-0.5 font-display text-[9px] uppercase tracking-[0.18em] text-white/30">
            <span>LW</span>
            <span>Center</span>
            <span>RW</span>
          </p>
          <div className="grid w-full min-w-0 grid-cols-3 items-end gap-0">
            <div className="flex min-w-0 justify-start">
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
            </div>
            <div className="flex min-w-0 justify-center">
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
            </div>
            <div className="flex min-w-0 justify-end">
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
          </div>
        </div>

        <div>
          <p className="mb-1.5 flex justify-between px-0.5 font-display text-[9px] uppercase tracking-[0.18em] text-white/30">
            <span>LB</span>
            <span className="text-white/15">·</span>
            <span>RB</span>
          </p>
          <div className="grid w-full min-w-0 grid-cols-3 items-end gap-0">
            <div className="flex min-w-0 justify-start">
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
            </div>
            <div className="flex min-h-[2.75rem] items-end justify-center pb-5 text-[11px] font-light text-white/20">
              {pair.lb && pair.rb ? "—" : ""}
            </div>
            <div className="flex min-w-0 justify-end">
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
        </div>
      </div>
    );
  };

  return (
    <div className="lineup-board relative overflow-hidden rounded-3xl p-4 sm:p-6">
      <div className="lineup-board-accent mx-auto mb-5 w-[min(100%,20rem)]" />

      <section className="mb-8">
        <SectionTitle>Brankáři</SectionTitle>
        <div className="flex flex-wrap items-center justify-center gap-6 sm:justify-between sm:gap-8">
          <div className="flex justify-center gap-4">
            {lineup.goalies.map((gid, i) => (
              <div key={i} className="relative">
                <Slot
                  playerId={gid}
                  label={`G${i + 1}`}
                  type="goalie"
                  lineIndex={i}
                  jerseySize="sm"
                  onClear={
                    gid
                      ? () => {
                          setGoalie(i, null);
                          onSelectSlot(null);
                        }
                      : undefined
                  }
                />
              </div>
            ))}
          </div>
          <div
            className="hidden h-14 w-14 shrink-0 flex-col items-center justify-center rounded-full border border-[#003f87]/35 bg-gradient-to-b from-[#003f87]/25 to-[#001a35]/60 shadow-[0_0_24px_rgba(0,63,135,0.25)] sm:flex"
            aria-hidden
          >
            <span className="font-display text-[9px] tracking-[0.25em] text-sky-100/90">ČR</span>
          </div>
        </div>
      </section>

      <section>
        <SectionTitle>Lajny</SectionTitle>
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-5">
          {[0, 1, 2, 3].map((i) => lineBlock(i))}
          <div className="flex min-h-[8rem] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/[0.1] bg-white/[0.02] px-3 py-4 sm:col-span-2 sm:min-h-0 xl:col-span-1">
            <span className="font-display text-xs uppercase tracking-[0.2em] text-[#c41e3a]/90">Náhradníci</span>
            <p className="text-center text-[10px] leading-snug text-white/35">Dva útočníci mimo základní sestavu</p>
            <div className="flex justify-center gap-2">
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
      </section>

      <p className="mt-6 text-center text-[11px] leading-relaxed text-white/35">
        Klikni na slot · vyber hráče vpravo · <span className="text-white/50">C?</span> označí kapitána · najetím na kartu
        uvidíš <span className="text-white/50">×</span>
      </p>
    </div>
  );
}
