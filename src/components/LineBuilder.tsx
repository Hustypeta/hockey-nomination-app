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
          group relative cursor-pointer rounded-xl p-1 transition-all duration-200
          ${player ? "pb-5" : "pb-1"}
          ${selected ? "bg-amber-500/15 ring-2 ring-amber-400 ring-offset-1 ring-offset-[#0c0e12]" : "bg-transparent hover:bg-white/[0.03]"}
        `}
      >
        {player && onClear && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            className="absolute -right-0.5 -top-0.5 z-30 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[11px] font-bold text-white opacity-0 shadow-md transition-opacity hover:bg-red-500 group-hover:opacity-100"
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
                absolute -bottom-0.5 left-1/2 z-20 -translate-x-1/2 rounded-full px-1.5 py-px font-display text-[9px] font-bold tracking-wide shadow-md transition-colors
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
        className="flex min-w-0 flex-col gap-1 rounded-lg border border-white/5 bg-white/[0.02] px-1 py-1.5"
      >
        <span className="text-center font-display text-[10px] leading-none text-white/55">
          {i + 1}. lajna
        </span>
        {/* Útok: LW vlevo, C uprostřed, RW vpravo */}
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
        {/* Obránci: LB vlevo, RB vpravo */}
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
          <div className="flex min-h-[2.5rem] items-end justify-center pb-4 text-xs text-white/25">
            {pair.lb && pair.rb ? "–" : ""}
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
    );
  };

  return (
    <div className="nomination-rink rounded-2xl p-3 sm:p-4">
      <div className="pointer-events-none mb-2 flex justify-center gap-2 opacity-40">
        <div className="h-0.5 w-full max-w-[35%] rounded-full bg-[#003f87]/70" />
        <div className="h-0.5 w-full max-w-[35%] rounded-full bg-[#003f87]/70" />
      </div>

      {/* Brankáři + ČR v jednom řádku na širších obrazovkách */}
      <section className="mb-3">
        <h3 className="mb-1.5 flex items-center gap-2 font-display text-sm tracking-wide text-[#c41e3a]">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#003f87]" />
          Brankáři
        </h3>
        <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-between sm:gap-4">
          <div className="flex justify-center gap-2">
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
          <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-[#003f87]/45 bg-[#003f87]/10 sm:flex">
            <span className="font-display text-[10px] tracking-widest text-[#003f87]/85">ČR</span>
          </div>
        </div>
      </section>

      <section>
        <h3 className="mb-1.5 flex items-center gap-2 font-display text-sm tracking-wide text-[#c41e3a]">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#003f87]" />
          Lajny
        </h3>

        {/* Do xl: mřížka 2×2; od xl: čtyři lajny v řadě + náhradníci */}
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-2 xl:grid-cols-5 xl:gap-2">
          {[0, 1, 2, 3].map((i) => lineBlock(i))}
          <div className="col-span-2 flex flex-col items-center justify-center gap-1 rounded-lg border border-white/5 bg-white/[0.02] px-2 py-2 xl:col-span-1">
            <span className="font-display text-[10px] tracking-wide text-[#c41e3a]">Náhradníci</span>
            <div className="flex justify-center gap-1">
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

      <p className="mt-3 text-center text-[10px] text-white/40">
        Klik = slot · C? = kapitán · × = odebrat
      </p>
    </div>
  );
}
