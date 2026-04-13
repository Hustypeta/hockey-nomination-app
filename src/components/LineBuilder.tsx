"use client";

import type { ReactNode } from "react";
import { toast } from "sonner";
import type { Player, LineupStructure } from "@/types";
import { LineupJerseyCard, type LineupJerseySize } from "@/components/sestava/LineupJerseyCard";
import { PremiumJerseySlotCard, type PremiumJerseySize } from "@/components/sestava/PremiumJerseySlotCard";
import { DroppableSlotWrap } from "@/components/sestava/DroppableSlotWrap";
import { CzechFlagMark } from "@/components/CzechFlagMark";

interface LineBuilderProps {
  lineup: LineupStructure;
  players: Player[];
  captainId: string | null;
  onLineupChange: (lineup: LineupStructure) => void;
  onCaptainChange: (playerId: string | null) => void;
  selectedSlot: { type: string; lineIndex?: number; role?: string } | null;
  onSelectSlot: (slot: { type: string; lineIndex?: number; role?: string } | null) => void;
  enableDnd?: boolean;
  /** NHL 25: světlý panel, G nahoře, 4× LW–C–RW, pak obrana; doplňkové sloty pod tím. */
  layoutVariant?: "classic" | "nhl25";
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

function NhlSectionShell({ title, kicker, children }: { title: string; kicker?: string; children: ReactNode }) {
  return (
    <section className="min-w-0 w-full">
      <div className="mb-1.5 flex flex-wrap items-end justify-between gap-1.5 border-b border-slate-200/90 pb-1.5">
        <h3 className="font-display text-xs font-bold uppercase tracking-[0.18em] text-slate-900 sm:text-[13px]">{title}</h3>
        {kicker ? (
          <span className="max-w-[55%] text-right text-[8px] font-semibold uppercase leading-tight tracking-[0.16em] text-slate-500 sm:max-w-none sm:text-[9px]">
            {kicker}
          </span>
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
  layoutVariant = "classic",
}: LineBuilderProps) {
  const nhl = layoutVariant === "nhl25";
  const assistantIds = lineup.assistantIds ?? [];
  const getPlayer = (id: string | null) => (id ? players.find((p) => p.id === id) : null);

  const setForwardLine = (lineIndex: number, role: "lw" | "c" | "rw" | "x", playerId: string | null) => {
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
    if (pairIndex === 3 && role === "rb") return;
    const prev =
      pairIndex === 3 ? lineup.defensePairs[3].lb : lineup.defensePairs[pairIndex][role];
    const next = { ...lineup };
    next.defensePairs = [...next.defensePairs] as LineupStructure["defensePairs"];
    if (pairIndex === 3) {
      next.defensePairs[3] = { lb: playerId, rb: null };
      if (playerId === null) {
        next.extraDefensemen = [];
      }
    } else {
      next.defensePairs[pairIndex] = { ...next.defensePairs[pairIndex], [role]: playerId };
    }
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

  const removeExtraForward = () => {
    const id = lineup.extraForwards[0];
    if (!id) return;
    const next = {
      ...lineup,
      extraForwards: [null] as LineupStructure["extraForwards"],
      assistantIds: (lineup.assistantIds ?? []).filter((a) => a !== id),
    };
    if (captainId === id) onCaptainChange(null);
    onLineupChange(next);
  };

  const removeExtraDefense = () => {
    const id = lineup.extraDefensemen[0];
    if (!id) return;
    const next = {
      ...lineup,
      extraDefensemen: [],
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
    const premiumKind: "skater" | "goalie" =
      jerseySize === "goalie" || player?.position === "G" ? "goalie" : "skater";
    const premiumSize: PremiumJerseySize =
      jerseySize === "goalie" ? "goalie" : jerseySize === "compact" ? "compact" : "skater";

    const renderSlotBody = (isDragOver: boolean) => (
      <div
        onClick={() => onSelectSlot(selected ? null : { type, lineIndex, role })}
        className={`
          group/slot flex w-full min-w-0 cursor-pointer flex-col items-center gap-2 rounded-xl px-0.5 py-2 transition-colors duration-200
          ${
            nhl
              ? selected
                ? "bg-sky-50/90"
                : "hover:bg-slate-200/60"
              : selected
                ? "bg-[#c8102e]/[0.1] ring-1 ring-[#c8102e]/25"
                : "hover:bg-white/[0.03]"
          }
        `}
      >
        <div className="relative flex w-full min-w-0 justify-center">
          {player && onClear && !nhl && (
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
          {nhl ? (
            <PremiumJerseySlotCard
              key={playerId ?? `empty-${dndId ?? label}`}
              player={player}
              positionLabel={label}
              kind={premiumKind}
              size={premiumSize}
              isCaptain={player ? captainId === player.id : false}
              isAssistant={isAsst}
              isSelected={selected}
              isDragOver={isDragOver}
              onClear={onClear}
            />
          ) : (
            <LineupJerseyCard
              key={playerId ?? `empty-${dndId ?? label}`}
              player={player}
              positionLabel={label}
              size={jerseySize}
              isCaptain={player ? captainId === player.id : false}
              isAssistant={isAsst}
              isSelected={selected}
            />
          )}
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
                    ? nhl
                      ? "border-red-400/60 bg-gradient-to-b from-[#c8102e] to-[#8a0b20] text-white shadow-sm"
                      : "border-red-500/50 bg-gradient-to-b from-red-600/90 to-red-900/90 text-white"
                    : nhl
                      ? "border-slate-300/90 bg-white text-slate-600 hover:border-[#c8102e]/40 hover:text-slate-900"
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
                    ? nhl
                      ? "cursor-not-allowed border-slate-200 text-slate-300 opacity-40"
                      : "cursor-not-allowed border-white/5 text-white/25 opacity-40"
                    : isAsst
                      ? nhl
                        ? "border-[#003087]/50 bg-gradient-to-b from-[#003087] to-[#001a4d] text-white shadow-sm"
                        : "border-[#003087]/55 bg-gradient-to-b from-[#003087]/95 to-[#001233] text-white"
                      : nhl
                        ? "border-slate-300/90 bg-white text-slate-600 hover:border-[#003087]/35 hover:text-slate-900"
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
        <DroppableSlotWrap
          id={dndId}
          className="min-w-0 w-full"
          lightSurface={nhl}
          renderContent={({ isOver }) => renderSlotBody(isOver)}
        />
      ) : (
        renderSlotBody(false)
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

        {i === 3 ? (
          <div className="border-t border-white/[0.06] pt-4">
            <p className="mb-3 text-center text-[9px] font-semibold uppercase tracking-[0.2em] text-white/40">
              13. útočník (X) — součást základních 20 bruslařů
            </p>
            <div className="mx-auto flex max-w-[10rem] justify-center">
              <Slot
                playerId={line.x}
                label="X"
                type="forward"
                lineIndex={3}
                role="x"
                dndId="slot-fwd-3-x"
                jerseySize="skater"
                onClear={
                  line.x
                    ? () => {
                        setForwardLine(3, "x", null);
                        onSelectSlot(null);
                      }
                    : undefined
                }
              />
            </div>
            <p className="mt-2 text-center text-[10px] leading-relaxed text-white/35">
              Čtrnáctý útočník je náhradník v sekci pod základem — tady máš třináctého v základní dvacítce bruslařů.
            </p>
          </div>
        ) : null}

        {i < 3 ? (
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
        ) : (
          <div className="border-t border-white/[0.06] pt-4">
            <p className="mb-3 text-center text-[9px] font-semibold uppercase tracking-[0.24em] text-white/40">
              4. obranný řádek — sedmý bek
            </p>
            <div className="mx-auto flex max-w-[10rem] justify-center">
              <Slot
                playerId={pair.lb}
                label="7. bek"
                type="defense"
                lineIndex={3}
                role="lb"
                dndId="slot-def-3-lb"
                jerseySize="skater"
                onClear={
                  pair.lb
                    ? () => {
                        setDefensePair(3, "lb", null);
                        onSelectSlot(null);
                      }
                    : undefined
                }
              />
            </div>
            <p className="mt-3 text-center text-[10px] leading-relaxed text-white/35">
              Sedmý bek patří do základních 20 bruslařů. Osmého (náhradní na soupisce) doplň v sekci náhradníků níže.
            </p>
          </div>
        )}
      </article>
    );
  };

  if (nhl) {
    return (
      <div className="nhl25-lineup-root min-w-0 w-full space-y-3 sm:space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200/90 bg-gradient-to-r from-white via-slate-50 to-white px-3 py-2 shadow-sm">
          <div className="flex min-w-0 items-center gap-2">
            <CzechFlagMark className="h-8 w-[2.65rem] shrink-0 rounded border border-slate-300/80 shadow-sm sm:h-9 sm:w-[3rem]" />
            <div className="min-w-0">
              <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-slate-500">Česká republika</p>
              <p className="truncate font-display text-lg font-bold tracking-[0.08em] text-slate-900 sm:text-xl">
                Český nároďák
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3 rounded-xl border border-slate-200/80 bg-white/40 p-3 shadow-sm sm:space-y-4 sm:p-4">
          <p className="text-center font-display text-[9px] font-bold uppercase tracking-[0.26em] text-slate-500 sm:text-left">
            Základ (20 + 2)
          </p>

          <NhlSectionShell title="Brankáři — základ" kicker="2 × G">
            <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              {[0, 1].map((i) => {
                const gid = lineup.goalies[i];
                return (
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
                );
              })}
            </div>
          </NhlSectionShell>

          <NhlSectionShell title="Útočné řady" kicker="4 × LW–C–RW + X u 4.">
            <div className="flex min-w-0 flex-col gap-3">
              {[0, 1, 2, 3].map((i) => {
                const line = lineup.forwardLines[i];
                return (
                  <div
                    key={i}
                    className="flex flex-col gap-2 rounded-lg border border-slate-200/70 bg-white/60 px-2.5 py-3 shadow-sm sm:flex-row sm:items-end sm:gap-4 sm:px-3"
                  >
                    <div className="shrink-0 font-display text-base font-bold tracking-wide text-slate-800 sm:w-[5.25rem] sm:pb-1 sm:text-lg">
                      {i + 1}. LAJNA
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                      <div className="grid min-w-0 grid-cols-3 gap-2 sm:gap-3">
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
                      {i === 3 ? (
                        <div className="rounded-md border border-dashed border-slate-300/90 bg-slate-50/90 px-2 py-2">
                          <p className="mb-1.5 text-center font-display text-[8px] font-bold uppercase tracking-[0.18em] text-slate-500">
                            13. útok (X)
                          </p>
                          <div className="mx-auto flex max-w-[7rem] justify-center">
                            <Slot
                              playerId={line.x}
                              label="X"
                              type="forward"
                              lineIndex={3}
                              role="x"
                              dndId="slot-fwd-3-x"
                              jerseySize="compact"
                              onClear={
                                line.x
                                  ? () => {
                                      setForwardLine(3, "x", null);
                                      onSelectSlot(null);
                                    }
                                  : undefined
                              }
                            />
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </NhlSectionShell>

          <NhlSectionShell title="Obranné páry" kicker="3× pár + 7. bek">
          <div className="space-y-3">
            {[0, 1, 2].map((i) => {
              const pair = lineup.defensePairs[i];
              return (
                <div key={i}>
                  <p className="mb-1.5 text-center font-display text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">
                    {i + 1}. pár
                  </p>
                  <div className="mx-auto grid max-w-lg grid-cols-2 gap-2.5 sm:gap-4">
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
              );
            })}
            <div className="rounded-md border border-dashed border-slate-300/90 bg-slate-50/80 px-2 py-3">
              <p className="mb-2 text-center font-display text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">
                7. bek
              </p>
              <div className="mx-auto flex max-w-[12rem] justify-center">
                <Slot
                  playerId={lineup.defensePairs[3].lb}
                  label="D"
                  type="defense"
                  lineIndex={3}
                  role="lb"
                  dndId="slot-def-3-lb"
                  jerseySize="skater"
                  onClear={
                    lineup.defensePairs[3].lb
                      ? () => {
                          setDefensePair(3, "lb", null);
                          onSelectSlot(null);
                        }
                      : undefined
                  }
                />
              </div>
              <p className="mt-2 text-center text-[9px] leading-snug text-slate-500">
                8. bek = náhradníci níže (po 7.).
              </p>
            </div>
          </div>
        </NhlSectionShell>
        </div>

        <div className="space-y-2">
          <p className="text-center font-display text-[9px] font-bold uppercase tracking-[0.26em] text-slate-500 sm:text-left">
            Náhradníci (3)
          </p>
          <NhlSectionShell title="Mimo základ" kicker="G3 · F · D">
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 sm:gap-3">
              <div className="rounded-lg border border-slate-200/80 bg-white/70 p-2 shadow-sm">
                <p className="mb-2 text-center text-[9px] font-semibold uppercase tracking-wider text-slate-500">
                  3. brankář
                </p>
                <Slot
                  playerId={lineup.goalies[2]}
                  label="G3"
                  type="goalie"
                  lineIndex={2}
                  jerseySize="goalie"
                  dndId="slot-goalie-2"
                  onClear={
                    lineup.goalies[2]
                      ? () => {
                          setGoalie(2, null);
                          onSelectSlot(null);
                        }
                      : undefined
                  }
                />
              </div>
              <div className="rounded-lg border border-slate-200/80 bg-white/70 p-2 shadow-sm">
                <p className="mb-2 text-center text-[9px] font-semibold uppercase tracking-wider text-slate-500">
                  Náhr. F
                </p>
                <Slot
                  playerId={lineup.extraForwards[0] ?? null}
                  label="F"
                  type="extraForward"
                  lineIndex={0}
                  dndId="slot-xf-0"
                  jerseySize="compact"
                  onClear={
                    lineup.extraForwards[0]
                      ? () => {
                          removeExtraForward();
                          onSelectSlot(null);
                        }
                      : undefined
                  }
                />
              </div>
              <div className="rounded-lg border border-slate-200/80 bg-white/70 p-2 shadow-sm">
                <p className="mb-2 text-center text-[9px] font-semibold uppercase tracking-wider text-slate-500">
                  Náhr. D
                </p>
                <Slot
                  playerId={lineup.extraDefensemen[0] ?? null}
                  label="D"
                  type="extraDefenseman"
                  lineIndex={0}
                  dndId="slot-xd-0"
                  jerseySize="compact"
                  onClear={
                    lineup.extraDefensemen[0]
                      ? () => {
                          removeExtraDefense();
                          onSelectSlot(null);
                        }
                      : undefined
                  }
                />
              </div>
            </div>
            <p className="mt-2 text-center text-[9px] leading-snug text-slate-500 sm:text-left">
              Náhr. D až po 7. bekovi.
            </p>
          </NhlSectionShell>
        </div>

        <p className="border-t border-slate-200/80 pt-3 text-center text-[9px] leading-snug text-slate-500">
          Klikni na slot · přidej zleva nebo přetáhni · <span className="font-semibold text-[#c8102e]">C?</span> kapitán ·{" "}
          <span className="font-semibold text-[#003087]">A?</span> asistent
        </p>
      </div>
    );
  }

  return (
    <div className="min-w-0 w-full space-y-8 sm:space-y-9">
      <div className="space-y-8 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 sm:space-y-9 sm:p-5">
        <p className="text-center font-display text-[10px] font-bold uppercase tracking-[0.28em] text-white/50 sm:text-left">
          Základ (20 + 2)
        </p>
        <SectionShell title="Brankáři — základ" kicker="2 × G">
          <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            {[0, 1].map((i) => {
              const gid = lineup.goalies[i];
              return (
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
              );
            })}
          </div>
        </SectionShell>

        <SectionShell
          title="Lajny"
          kicker="4× LW–C–RW · 13. útok u 4. lajny · u každé řady obrana — 20 bruslařů celkem"
        >
          <div className="flex min-w-0 w-full flex-col gap-6 sm:gap-7">
            {[0, 1, 2, 3].map((i) => lineBlock(i))}
          </div>
        </SectionShell>
      </div>

      <div className="space-y-4">
        <p className="text-center font-display text-[10px] font-bold uppercase tracking-[0.28em] text-white/50 sm:text-left">
          Náhradníci (3)
        </p>
        <SectionShell title="Mimo základ 20 + 2" kicker="3. G · náhr. F · 8. bek">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-4">
            <div className="min-w-0 rounded-lg border border-white/[0.06] bg-black/20 p-3 sm:p-4">
              <p className="mb-3 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">
                3. brankář
              </p>
              <div className="flex justify-center">
                <Slot
                  playerId={lineup.goalies[2]}
                  label="G3"
                  type="goalie"
                  lineIndex={2}
                  jerseySize="goalie"
                  dndId="slot-goalie-2"
                  onClear={
                    lineup.goalies[2]
                      ? () => {
                          setGoalie(2, null);
                          onSelectSlot(null);
                        }
                      : undefined
                  }
                />
              </div>
            </div>
            <div className="min-w-0 rounded-lg border border-white/[0.06] bg-black/20 p-3 sm:p-4">
              <p className="mb-3 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">
                Náhr. útočník
              </p>
              <div className="flex justify-center">
                <Slot
                  playerId={lineup.extraForwards[0] ?? null}
                  label="EX"
                  type="extraForward"
                  lineIndex={0}
                  dndId="slot-xf-0"
                  jerseySize="compact"
                  onClear={
                    lineup.extraForwards[0]
                      ? () => {
                          removeExtraForward();
                          onSelectSlot(null);
                        }
                      : undefined
                  }
                />
              </div>
            </div>
            <div className="min-w-0 rounded-lg border border-white/[0.06] bg-black/20 p-3 sm:p-4">
              <p className="mb-3 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">
                Náhr. obránce
              </p>
              <div className="flex justify-center">
                <Slot
                  playerId={lineup.extraDefensemen[0] ?? null}
                  label="N-D"
                  type="extraDefenseman"
                  lineIndex={0}
                  dndId="slot-xd-0"
                  jerseySize="compact"
                  onClear={
                    lineup.extraDefensemen[0]
                      ? () => {
                          removeExtraDefense();
                          onSelectSlot(null);
                        }
                      : undefined
                  }
                />
              </div>
              <p className="mt-2 text-center text-[9px] leading-snug text-white/30">
                Vyplň až po sedmém bekovi ve 4. obranném řádku v základu.
              </p>
            </div>
          </div>
        </SectionShell>
      </div>

      <p className="border-t border-white/[0.06] pt-4 text-center text-[10px] leading-relaxed text-white/32">
        Klikni na slot · přidej zleva nebo přetáhni · <span className="text-[#c8102e]/85">C?</span> kapitán ·{" "}
        <span className="text-[#003087]/90">A?</span> asistent
      </p>
    </div>
  );
}
