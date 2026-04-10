"use client";

import type { ReactNode } from "react";
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
  enableDnd?: boolean;
}

function PanelSection({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section className="min-w-0 w-full">
      <div className="mb-2.5 flex items-end justify-between gap-2 border-b border-cyan-400/15 pb-2">
        <h3 className="font-display text-[15px] font-bold uppercase tracking-[0.12em] text-white sm:text-base">
          {title}
        </h3>
        {subtitle ? (
          <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-cyan-300/55">{subtitle}</span>
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

  /**
   * NHL-style slot: label v toku dokumentu, dres v buňce s min-w-0, žádné absolute C/A
   * (absolute rozbíjelo výšku řádků a způsobovalo překrývání).
   */
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
          flex w-full min-w-0 flex-col items-center gap-1.5 rounded-xl px-0.5 py-2 transition-all duration-200
          ${
            selected
              ? "bg-cyan-500/10 shadow-[0_0_0_2px_rgba(34,211,238,0.45),0_8px_28px_rgba(0,180,255,0.12)]"
              : "bg-transparent hover:bg-white/[0.04] hover:shadow-[0_0_20px_rgba(34,211,238,0.08)]"
          }
        `}
      >
        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-200/75">{label}</span>

        <div className="relative flex w-full min-w-0 justify-center">
          {player && onClear && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              className="absolute -right-0.5 -top-1 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-red-600 to-red-900 text-sm font-bold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 hover:opacity-100"
              aria-label="Odebrat hráče"
            >
              ×
            </button>
          )}
          <div
            className={`
              w-full max-w-[min(100%,6.75rem)] transition-transform duration-200 ease-out
              hover:scale-[1.04] hover:drop-shadow-[0_0_14px_rgba(34,211,238,0.35)]
              sm:max-w-[min(100%,7.75rem)] lg:max-w-[min(100%,8.25rem)]
            `}
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
          </div>
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
                      ? "border-cyan-500/45 bg-gradient-to-b from-[#003087]/95 to-[#001a52] text-white"
                      : "border-white/15 bg-[#0a1018]/95 text-white/60 hover:border-cyan-400/35 hover:text-white"
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

    const wrapped = enableDnd && dndId ? (
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
    return (
      <article
        key={i}
        className="min-w-0 w-full space-y-3 rounded-xl border border-white/[0.08] bg-gradient-to-b from-[#121a28]/90 to-[#0a0e14]/95 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:p-4"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="font-display text-lg font-bold tracking-wide text-white sm:text-xl">{i + 1}. lajna</span>
          <span className="rounded border border-cyan-400/25 bg-cyan-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-cyan-200/90">
            Line {i + 1}
          </span>
        </div>

        {/* LW – C – RW: pevná 3× mřížka, minmax(0,1fr) */}
        <div
          className="grid w-full gap-x-2 gap-y-1 sm:gap-x-3"
          style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}
        >
          <Slot
            playerId={line.lw}
            label="LW"
            type="forward"
            lineIndex={i}
            role="lw"
            dndId={`slot-fwd-${i}-lw`}
            jerseySize="md"
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
            jerseySize="md"
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
            jerseySize="md"
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

        <div className="border-t border-white/[0.06] pt-3">
          <p className="mb-2 text-center text-[9px] font-semibold uppercase tracking-[0.22em] text-white/35">
            Obranný pár
          </p>
          <div
            className="grid w-full gap-x-3 sm:gap-x-6"
            style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)" }}
          >
            <Slot
              playerId={pair.lb}
              label="LB"
              type="defense"
              lineIndex={i}
              role="lb"
              dndId={`slot-def-${i}-lb`}
              jerseySize="md"
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
              label="RB"
              type="defense"
              lineIndex={i}
              role="rb"
              dndId={`slot-def-${i}-rb`}
              jerseySize="md"
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
    <div
      className={`
        min-w-0 w-full space-y-6 rounded-xl border border-cyan-500/10 bg-[#0a0e14]/95 p-3
        shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_16px_48px_rgba(0,0,0,0.4)] sm:space-y-7 sm:p-4
      `}
    >
      <div
        className="mx-auto h-0.5 w-[min(100%,14rem)] rounded-full bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent opacity-90"
        aria-hidden
      />

      <PanelSection title="Brankáři" subtitle="3 × G">
        <div
          className="grid w-full gap-2 sm:gap-3"
          style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}
        >
          {lineup.goalies.map((gid, i) => (
            <Slot
              key={i}
              playerId={gid}
              label={`G${i + 1}`}
              type="goalie"
              lineIndex={i}
              jerseySize="md"
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
      </PanelSection>

      <PanelSection title="Lajny" subtitle="4 × (LW · C · RW) + pár">
        <div className="flex min-w-0 w-full flex-col gap-4 sm:gap-5">
          {[0, 1, 2, 3].map((i) => lineBlock(i))}
        </div>
      </PanelSection>

      <PanelSection title="Náhradníci" subtitle="Extra F">
        <p className="mb-3 text-center text-[11px] leading-snug text-white/40">
          Dva útočníci mimo základní sestavu
        </p>
        <div
          className="mx-auto grid w-full max-w-md gap-3 sm:gap-4"
          style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}
        >
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
                jerseySize="md"
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
      </PanelSection>

      <p className="border-t border-white/[0.06] pt-4 text-center text-[10px] leading-relaxed text-white/35">
        Klikni na slot · přidej zleva nebo přetáhni · <span className="text-cyan-300/80">C?</span> kapitán ·{" "}
        <span className="text-cyan-400/70">A?</span> asistent
      </p>
    </div>
  );
}
