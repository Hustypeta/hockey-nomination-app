"use client";

import type { ReactNode } from "react";
import { toast } from "sonner";
import type { Player, LineupStructure } from "@/types";
import { LineupJerseyCard, type LineupJerseySize } from "@/components/sestava/LineupJerseyCard";
import { DroppableSlotWrap } from "@/components/sestava/DroppableSlotWrap";

interface LineBuilderProps {
  lineup: LineupStructure;
  players: Player[];
  captainId: string | null;
  onLineupChange: (lineup: LineupStructure) => void;
  onCaptainChange: (playerId: string | null) => void;
  selectedSlot: { type: string; lineIndex?: number; role?: string } | null;
  onSelectSlot: (slot: { type: string; lineIndex?: number; role?: string } | null) => void;
  enableDnd?: boolean;
}

/** Jemný akcent u nadpisu lajny – červená (repre), žádná „pruhovaná vlajka“. */
function LineHeaderAccent({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-block h-7 w-1 shrink-0 rounded-full bg-[#c8102e] shadow-[0_0_14px_rgba(200,16,46,0.55)] ${className}`}
      aria-hidden
    />
  );
}

function SectionShell({ title, kicker, children }: { title: string; kicker?: string; children: ReactNode }) {
  return (
    <section className="min-w-0 w-full">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.08] pb-2.5">
        <h3 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-white sm:text-[15px]">{title}</h3>
        {kicker ? (
          <span className="text-[9px] font-semibold uppercase tracking-[0.22em] text-white/40">{kicker}</span>
        ) : null}
      </div>
      {children}
    </section>
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
    selectedSlot?.type === type && selectedSlot?.lineIndex === lineIndex && selectedSlot?.role === role;

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
    jerseySize = "skater" as LineupJerseySize,
    dndId,
  }: {
    playerId: string | null;
    label: string;
    type: string;
    lineIndex?: number;
    role?: string;
    onClear?: () => void;
    jerseySize?: LineupJerseySize;
    dndId?: string;
  }) => {
    const player = getPlayer(playerId);
    const selected = isSlotSelected(type, lineIndex, role);
    const isAsst = player ? assistantIds.includes(player.id) : false;

    const inner = (
      <div
        onClick={() => onSelectSlot(selected ? null : { type, lineIndex, role })}
        className={`
          group/slot flex w-full min-w-0 cursor-pointer flex-col items-center gap-2 rounded-xl px-0.5 py-2 transition-colors duration-200
          ${selected ? "bg-[#c8102e]/[0.1] ring-1 ring-[#c8102e]/25" : "hover:bg-white/[0.03]"}
        `}
      >
        <div className="relative flex w-full min-w-0 justify-center">
          {player && onClear && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              className="absolute -right-0.5 -top-0.5 z-40 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-red-600 to-red-950 text-sm font-bold text-white opacity-0 shadow-lg transition-opacity group-hover/slot:opacity-100 group-focus-within/slot:opacity-100"
              aria-label="Odebrat hráče"
            >
              ×
            </button>
          )}
          <LineupJerseyCard
            key={playerId ?? `empty-${dndId ?? label}`}
            player={player}
            positionLabel={label}
            size={jerseySize}
            isCaptain={player ? captainId === player.id : false}
            isAssistant={isAsst}
            isSelected={selected}
          />
        </div>

        {player ? (
          <div className="flex shrink-0 flex-wrap justify-center gap-1">
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
                rounded-md border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide
                ${
                  captainId === player.id
                    ? "border-red-500/50 bg-gradient-to-b from-red-600/90 to-red-900/90 text-white"
                    : "border-white/15 bg-[#0a1018]/95 text-white/60 hover:border-white/30 hover:text-white"
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
                rounded-md border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide
                ${
                  captainId === player.id
                    ? "cursor-not-allowed border-white/5 text-white/25 opacity-40"
                    : isAsst
                      ? "border-[#003087]/55 bg-gradient-to-b from-[#003087]/95 to-[#001233] text-white"
                      : "border-white/15 bg-[#0a1018]/95 text-white/60 hover:border-[#c8102e]/35 hover:text-white"
                }
              `}
            >
              {isAsst ? "A" : "A?"}
            </button>
          </div>
        ) : (
          <div className="h-[22px] shrink-0" aria-hidden />
        )}
      </div>
    );

    const wrapped =
      enableDnd && dndId ? (
        <DroppableSlotWrap id={dndId} className="min-w-0 w-full">
          {inner}
        </DroppableSlotWrap>
      ) : (
        inner
      );

    return <div className="group min-w-0 w-full">{wrapped}</div>;
  };

  const lineBlock = (i: number) => {
    const line = lineup.forwardLines[i];
    const pair = lineup.defensePairs[i];
    const n = i + 1;
    return (
      <article
        key={i}
        className="min-w-0 w-full space-y-4 rounded-xl border border-white/[0.07] bg-gradient-to-b from-[#0a0f18]/95 to-[#05080d]/98 px-3 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:px-4"
      >
        <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-between">
          <div className="flex items-center gap-2.5">
            <LineHeaderAccent />
            <span className="font-display text-lg font-bold tracking-[0.06em] text-white sm:text-xl">
              {n}. LAJNA
            </span>
          </div>
          <span className="rounded border border-white/10 bg-white/[0.04] px-2 py-0.5 font-display text-[9px] font-bold uppercase tracking-[0.18em] text-white/45">
            Line {n}
          </span>
        </div>

        <div className="mx-auto grid w-full max-w-md grid-cols-1 gap-x-2 gap-y-4 sm:max-w-none sm:grid-cols-3 sm:gap-y-1 sm:gap-x-4">
          <Slot
            playerId={line.lw}
            label="LW"
            type="forward"
            lineIndex={i}
            role="lw"
            dndId={`slot-fwd-${i}-lw`}
            jerseySize="skater"
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
            dndId={`slot-fwd-${i}-c`}
            jerseySize="skater"
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
            dndId={`slot-fwd-${i}-rw`}
            jerseySize="skater"
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

        <div className="border-t border-white/[0.06] pt-4">
          <p className="mb-3 text-center text-[9px] font-semibold uppercase tracking-[0.24em] text-white/40">
            Obranný pár
          </p>
          <div className="mx-auto grid w-full max-w-sm grid-cols-1 gap-x-4 gap-y-4 sm:max-w-md sm:grid-cols-2">
            <Slot
              playerId={pair.lb}
              label="LD"
              type="defense"
              lineIndex={i}
              role="lb"
              dndId={`slot-def-${i}-lb`}
              jerseySize="skater"
              onClear={
                pair.lb
                  ? () => {
                      setDefensePair(i, "lb", null);
                      onSelectSlot(null);
                    }
                  : undefined
              }
            />
            <Slot
              playerId={pair.rb}
              label="RD"
              type="defense"
              lineIndex={i}
              role="rb"
              dndId={`slot-def-${i}-rb`}
              jerseySize="skater"
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
      </article>
    );
  };

  return (
    <div className="min-w-0 w-full space-y-8 sm:space-y-9">
      <SectionShell title="Brankáři" kicker="3 × G">
        <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          {lineup.goalies.map((gid, i) => (
            <Slot
              key={i}
              playerId={gid}
              label={`G${i + 1}`}
              type="goalie"
              lineIndex={i}
              jerseySize="goalie"
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
          ))}
        </div>
      </SectionShell>

      <SectionShell title="Lajny" kicker="4 × (LW · C · RW) + LD · RD">
        <div className="flex min-w-0 w-full flex-col gap-6 sm:gap-7">
          {[0, 1, 2, 3].map((i) => lineBlock(i))}
        </div>
      </SectionShell>

      <SectionShell title="Náhradníci" kicker="Extra">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
          <div className="min-w-0 rounded-lg border border-white/[0.06] bg-black/20 p-3 sm:p-4">
            <p className="mb-3 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">
              Útočníci
            </p>
            <div className="grid w-full grid-cols-2 gap-3">
              {[0, 1].map((i) => {
                const pid = lineup.extraForwards[i] ?? null;
                return (
                  <Slot
                    key={i}
                    playerId={pid}
                    label={`EX${i + 1}`}
                    type="extraForward"
                    lineIndex={i}
                    dndId={`slot-xf-${i as 0 | 1}`}
                    jerseySize="compact"
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
          <div className="min-w-0 rounded-lg border border-white/[0.06] bg-black/20 p-3 sm:p-4">
            <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">
              Obránci
            </p>
            <p className="text-center text-[11px] leading-relaxed text-white/38">
              V nominaci je 8 obránců ve čtyřech párech výše — náhradní „scratch“ sloty platí pro útočníky.
            </p>
          </div>
        </div>
      </SectionShell>

      <p className="border-t border-white/[0.06] pt-4 text-center text-[10px] leading-relaxed text-white/32">
        Klikni na slot · přidej zleva nebo přetáhni · <span className="text-[#c8102e]/85">C?</span> kapitán ·{" "}
        <span className="text-[#003087]/90">A?</span> asistent
      </p>
    </div>
  );
}
