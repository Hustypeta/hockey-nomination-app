"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import type { Player, LineupStructure } from "@/types";
import { NationalJersey } from "@/components/NationalJersey";
import { DroppableSlotWrap } from "@/components/sestava/DroppableSlotWrap";

interface LineBuilderProps {
  lineup: LineupStructure;
  players: Player[];
  captainId: string | null;
  onLineupChange: (lineup: LineupStructure) => void;
  onCaptainChange: (playerId: string | null) => void;
  selectedSlot: { type: string; lineIndex?: number; role?: string } | null;
  onSelectSlot: (slot: { type: string; lineIndex?: number; role?: string } | null) => void;
  /** Zóny pro přetahování hráčů z poolu (@dnd-kit). */
  enableDnd?: boolean;
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="mb-5 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/45">
      <span
        className="h-px w-12 shrink-0 bg-gradient-to-r from-[#c8102e] via-white/35 to-transparent"
        aria-hidden
      />
      <span className="shrink-0 text-white/70">{children}</span>
      <span
        className="h-px min-w-[2rem] flex-1 bg-gradient-to-l from-[#003087]/90 via-white/18 to-transparent"
        aria-hidden
      />
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
  enableDnd = true,
}: LineBuilderProps) {
  const assistantIds = lineup.assistantIds ?? [];
  const getPlayer = (id: string | null) => (id ? players.find((p) => p.id === id) : null);

  const setForwardLine = (lineIndex: number, role: "lw" | "c" | "rw", playerId: string | null) => {
    const prev = lineup.forwardLines[lineIndex][role];
    const next = { ...lineup };
    const line = { ...next.forwardLines[lineIndex], [role]: playerId };
    next.forwardLines = [...next.forwardLines] as LineupStructure["forwardLines"];
    next.forwardLines[lineIndex] = line;
    if (playerId === null && prev) {
      next.assistantIds = (next.assistantIds ?? []).filter((id) => id !== prev);
      if (captainId === prev) onCaptainChange(null);
    }
    onLineupChange(next);
  };

  const setDefensePair = (pairIndex: number, role: "lb" | "rb", playerId: string | null) => {
    const prev = lineup.defensePairs[pairIndex][role];
    const next = { ...lineup };
    const pair = { ...next.defensePairs[pairIndex], [role]: playerId };
    next.defensePairs = [...next.defensePairs] as LineupStructure["defensePairs"];
    next.defensePairs[pairIndex] = pair;
    if (playerId === null && prev) {
      next.assistantIds = (next.assistantIds ?? []).filter((id) => id !== prev);
      if (captainId === prev) onCaptainChange(null);
    }
    onLineupChange(next);
  };

  const setGoalie = (index: number, playerId: string | null) => {
    const prev = lineup.goalies[index];
    const next = { ...lineup };
    next.goalies = [...next.goalies];
    next.goalies[index] = playerId;
    if (playerId === null && prev) {
      next.assistantIds = (next.assistantIds ?? []).filter((id) => id !== prev);
      if (captainId === prev) onCaptainChange(null);
    }
    onLineupChange(next);
  };

  const removeExtraForwardByIndex = (index: number) => {
    const id = lineup.extraForwards[index];
    if (!id) return;
    const next = {
      ...lineup,
      extraForwards: lineup.extraForwards.filter((_, i) => i !== index),
      assistantIds: (lineup.assistantIds ?? []).filter((a) => a !== id),
    };
    if (captainId === id) onCaptainChange(null);
    onLineupChange(next);
  };

  const isSlotSelected = (type: string, lineIndex?: number, role?: string) =>
    selectedSlot?.type === type &&
    selectedSlot?.lineIndex === lineIndex &&
    selectedSlot?.role === role;

  const slotJerseyShape = (t: string) => (t === "goalie" ? "goalie" : "skater");

  const toggleAssistant = (playerId: string) => {
    if (captainId === playerId) return;
    const aids = lineup.assistantIds ?? [];
    if (aids.includes(playerId)) {
      onLineupChange({ ...lineup, assistantIds: aids.filter((id) => id !== playerId) });
      return;
    }
    if (aids.length >= 2) {
      toast.error("Jsou už dva asistenti kapitána.");
      return;
    }
    onLineupChange({ ...lineup, assistantIds: [...aids, playerId] });
  };

  const Slot = ({
    playerId,
    label,
    type,
    lineIndex,
    role,
    onClear,
    jerseySize = "md",
    dndId,
  }: {
    playerId: string | null;
    label: string;
    type: string;
    lineIndex?: number;
    role?: string;
    onClear?: () => void;
    jerseySize?: "sm" | "md" | "lg" | "xl";
    dndId?: string;
  }) => {
    const player = getPlayer(playerId);
    const selected = isSlotSelected(type, lineIndex, role);
    const isAsst = player ? assistantIds.includes(player.id) : false;

    const inner = (
      <div
        onClick={() => onSelectSlot(selected ? null : { type, lineIndex, role })}
        className={`
          group relative cursor-pointer rounded-2xl p-2 transition-all duration-300 ease-out
          ${player ? (jerseySize === "xl" ? "pb-16" : "pb-14") : "pb-2"}
          ${
            selected
              ? "bg-[#003087]/15 ring-2 ring-[#003087]/70 shadow-[0_0_40px_rgba(0,48,135,0.25)] ring-offset-2 ring-offset-[#080c14]"
              : "ring-1 ring-transparent hover:bg-white/[0.03] hover:ring-white/[0.1]"
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
            className="absolute -right-1 -top-1 z-30 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#c8102e] to-[#7a0819] text-base font-bold text-white opacity-0 shadow-lg transition-all hover:scale-105 group-hover:opacity-100"
            aria-label="Odebrat hráče"
          >
            ×
          </button>
        )}
        <motion.div
          key={playerId ?? `empty-${type}-${lineIndex ?? 0}-${role ?? ""}`}
          initial={playerId ? { scale: 0.88, opacity: 0.65 } : false}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 420, damping: 26 }}
          className="flex origin-bottom justify-center scale-100 sm:scale-[1.04] xl:scale-[1.06]"
        >
          {player ? (
            <NationalJersey
              player={player}
              size={jerseySize}
              jerseyShape={slotJerseyShape(type)}
              isCaptain={captainId === player.id}
              isAssistant={isAsst}
              isSelected={selected}
            />
          ) : (
            <NationalJersey
              size={jerseySize}
              placeholderLabel={label}
              jerseyShape={slotJerseyShape(type)}
              isSelected={selected}
            />
          )}
        </motion.div>
        {player && (
          <div className="absolute bottom-1 left-1/2 z-20 flex -translate-x-1/2 gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (captainId === player.id) {
                  onCaptainChange(null);
                } else {
                  onCaptainChange(player.id);
                  const aids = lineup.assistantIds ?? [];
                  if (aids.includes(player.id)) {
                    onLineupChange({ ...lineup, assistantIds: aids.filter((id) => id !== player.id) });
                  }
                }
              }}
              className={`
                rounded-lg border font-semibold uppercase tracking-wider shadow-md transition-all
                ${jerseySize === "xl" ? "px-2.5 py-1 text-[11px]" : "px-2 py-0.5 text-[10px]"}
                ${
                  captainId === player.id
                    ? "border-[#c8102e]/50 bg-gradient-to-b from-[#c8102e]/90 to-[#8a0b22] text-white"
                    : "border-white/15 bg-[#0a0e17]/95 text-white/65 hover:border-white/30 hover:text-white"
                }
              `}
            >
              {captainId === player.id ? "C" : "C?"}
            </button>
            <button
              type="button"
              disabled={captainId === player.id}
              onClick={(e) => {
                e.stopPropagation();
                toggleAssistant(player.id);
              }}
              className={`
                rounded-lg border font-semibold uppercase tracking-wider shadow-md transition-all
                ${jerseySize === "xl" ? "px-2.5 py-1 text-[11px]" : "px-2 py-0.5 text-[10px]"}
                ${
                  captainId === player.id
                    ? "cursor-not-allowed border-white/5 text-white/25 opacity-40"
                    : isAsst
                      ? "border-[#003087]/50 bg-gradient-to-b from-[#003087]/90 to-[#001a52] text-white"
                      : "border-white/15 bg-[#0a0e17]/95 text-white/65 hover:border-[#003087]/40 hover:text-white"
                }
              `}
            >
              {isAsst ? "A" : "A?"}
            </button>
          </div>
        )}
      </div>
    );

    if (enableDnd && dndId) {
      return <DroppableSlotWrap id={dndId}>{inner}</DroppableSlotWrap>;
    }
    return inner;
  };

  const lineBlock = (i: number) => {
    const line = lineup.forwardLines[i];
    const pair = lineup.defensePairs[i];
    return (
      <div
        key={i}
        className="flex min-w-0 max-w-full flex-col gap-5 rounded-2xl border border-white/[0.1] bg-gradient-to-b from-white/[0.07] to-[#0a0e17]/40 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_12px_40px_rgba(0,0,0,0.25)] backdrop-blur-md"
      >
        <div className="flex items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
          <span className="text-sm font-semibold tracking-tight text-white">{i + 1}. lajna</span>
          <span className="rounded-full border border-[#003087]/35 bg-[#003087]/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-sky-200/90">
            Line {i + 1}
          </span>
        </div>

        <div>
          <p className="mb-2 flex justify-between px-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
            <span>LW</span>
            <span>Center</span>
            <span>RW</span>
          </p>
          <div className="grid w-full min-w-0 grid-cols-3 items-end gap-1">
            <div className="flex min-w-0 justify-start">
              <Slot
                playerId={line.lw}
                label="LW"
                type="forward"
                lineIndex={i}
                role="lw"
                dndId={`slot-fwd-${i}-lw`}
                jerseySize="xl"
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
                dndId={`slot-fwd-${i}-c`}
                jerseySize="xl"
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
                dndId={`slot-fwd-${i}-rw`}
                jerseySize="xl"
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
          <p className="mb-2 flex justify-between px-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
            <span>LB</span>
            <span className="text-white/15">·</span>
            <span>RB</span>
          </p>
          <div className="grid w-full min-w-0 grid-cols-3 items-end gap-1">
            <div className="flex min-w-0 justify-start">
              <Slot
                playerId={pair.lb}
                label="LB"
                type="defense"
                lineIndex={i}
                role="lb"
                dndId={`slot-def-${i}-lb`}
                jerseySize="xl"
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
            <div className="flex min-h-[3rem] items-end justify-center pb-6 text-xs font-light text-white/20">
              {pair.lb && pair.rb ? "—" : ""}
            </div>
            <div className="flex min-w-0 justify-end">
              <Slot
                playerId={pair.rb}
                label="RB"
                type="defense"
                lineIndex={i}
                role="rb"
                dndId={`slot-def-${i}-rb`}
                jerseySize="xl"
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
    <div className="lineup-board relative overflow-x-hidden rounded-2xl p-5 sm:p-8">
      <div className="lineup-board-accent mx-auto mb-6 w-[min(100%,24rem)]" />

      <section className="mb-10">
        <SectionTitle>Brankáři</SectionTitle>
        <div className="flex flex-wrap items-center justify-center gap-8 sm:justify-between sm:gap-10">
          <div className="flex justify-center gap-6 sm:gap-8">
            {lineup.goalies.map((gid, i) => (
              <div key={i} className="relative">
                <Slot
                  playerId={gid}
                  label={`G${i + 1}`}
                  type="goalie"
                  lineIndex={i}
                  jerseySize="lg"
                  dndId={`slot-goalie-${i}`}
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
            className="hidden h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl border border-[#003087]/40 bg-gradient-to-br from-[#003087]/30 to-[#05080f] shadow-[0_0_28px_rgba(0,48,135,0.35)] sm:flex"
            aria-hidden
          >
            <span className="font-display text-[10px] tracking-[0.28em] text-sky-100/95">ČR</span>
          </div>
        </div>
      </section>

      <section>
        <SectionTitle>Lajny</SectionTitle>
        <div className="mx-auto grid min-w-0 max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 2xl:grid-cols-5">
          {[0, 1, 2, 3].map((i) => lineBlock(i))}
          <div className="flex min-h-[10rem] flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-[#c8102e]/25 bg-gradient-to-b from-[#c8102e]/[0.06] to-transparent px-4 py-6 sm:col-span-2 sm:min-h-0 2xl:col-span-1">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#c8102e]/95">Náhradníci</span>
            <p className="text-center text-[11px] leading-relaxed text-white/40">Dva útočníci mimo základní sestavu</p>
            <div className="flex justify-center gap-3">
              {[0, 1].map((i) => {
                const pid = lineup.extraForwards[i] ?? null;
                return (
                  <Slot
                    key={i}
                    playerId={pid}
                    label={`N${i + 1}`}
                    type="extraForward"
                    lineIndex={i}
                    dndId={`slot-xf-${i as 0 | 1}`}
                    jerseySize="lg"
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

      <p className="mt-8 text-center text-[11px] leading-relaxed text-white/38">
        Klikni na slot · přidej zleva nebo přetáhni ·{" "}
        <span className="text-[#c8102e]/90">C?</span> kapitán · <span className="text-[#003087]/90">A?</span> asistent
      </p>
    </div>
  );
}
