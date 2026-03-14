"use client";

import type { Player } from "@/types";
import type { LineupStructure } from "@/types";

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
  selectedSlot,
  onSelectSlot,
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

  const addExtraForward = (playerId: string) => {
    if (lineup.extraForwards.length >= 2) return;
    onLineupChange({
      ...lineup,
      extraForwards: [...lineup.extraForwards, playerId],
    });
  };

  const removeExtraForward = (playerId: string) => {
    onLineupChange({
      ...lineup,
      extraForwards: lineup.extraForwards.filter((id) => id !== playerId),
    });
  };

  const removeExtraForwardByIndex = (index: number) => {
    const id = lineup.extraForwards[index];
    if (id) removeExtraForward(id);
  };

  const usedIds = new Set<string>();
  lineup.forwardLines.forEach((l) => {
    if (l.lw) usedIds.add(l.lw);
    if (l.c) usedIds.add(l.c);
    if (l.rw) usedIds.add(l.rw);
  });
  lineup.defensePairs.forEach((p) => {
    if (p.lb) usedIds.add(p.lb);
    if (p.rb) usedIds.add(p.rb);
  });
  lineup.goalies.forEach((g) => g && usedIds.add(g));
  lineup.extraForwards.forEach((id) => usedIds.add(id));
  lineup.extraDefensemen.forEach((id) => usedIds.add(id));

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
          relative min-w-[100px] px-3 py-2 rounded-lg border-2 text-center cursor-pointer transition-all group
          ${selected ? "border-amber-400 bg-amber-500/20" : "border-[#2a3142] bg-[#151922] hover:border-[#c41e3a]/50"}
          ${player ? "text-white" : "text-white/40"}
        `}
      >
        {player && onClear && (
          <button
            onClick={(e) => { e.stopPropagation(); onClear(); }}
            className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white rounded-full text-[10px] opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
          >
            ×
          </button>
        )}
        {player ? (
          <div
            onClick={(e) => {
              e.stopPropagation();
              if (e.target instanceof HTMLElement && e.target.closest("button")) return;
              onCaptainChange(captainId === player.id ? null : player.id);
            }}
            className="cursor-pointer"
          >
            <div className="font-medium text-sm truncate">{player.name.split(" ").pop()}</div>
            {player.role && player.position !== "G" && (
              <div className="text-[10px] text-[#c41e3a]">{player.role}</div>
            )}
            {captainId === player.id && (
              <span className="text-[10px] text-amber-400 font-bold">C</span>
            )}
          </div>
        ) : (
          <span className="text-xs">{label}</span>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Brankáři */}
      <div>
        <h3 className="font-display text-lg text-[#c41e3a] mb-2">Brankáři</h3>
        <div className="flex gap-2 flex-wrap">
          {lineup.goalies.map((gid, i) => (
            <Slot
              key={i}
              playerId={gid}
              label={`G ${i + 1}`}
              type="goalie"
              lineIndex={i}
              role={undefined}
              onClear={gid ? () => { setGoalie(i, null); onSelectSlot(null); } : undefined}
            />
          ))}
        </div>
      </div>

      {/* Útočníci – lajny */}
      <div>
        <h3 className="font-display text-lg text-[#c41e3a] mb-2">Útočníci</h3>
        <div className="space-y-3">
          {lineup.forwardLines.map((line, i) => (
            <div key={i} className="flex items-center gap-2 flex-wrap">
              <span className="text-white/60 text-sm w-16">{i + 1}. lajna</span>
              <div className="flex gap-2">
                <Slot
                  playerId={line.lw}
                  label="LW"
                  type="forward"
                  lineIndex={i}
                  role="lw"
                  onClear={line.lw ? () => { setForwardLine(i, "lw", null); onSelectSlot(null); } : undefined}
                />
                <Slot
                  playerId={line.c}
                  label="C"
                  type="forward"
                  lineIndex={i}
                  role="c"
                  onClear={line.c ? () => { setForwardLine(i, "c", null); onSelectSlot(null); } : undefined}
                />
                <Slot
                  playerId={line.rw}
                  label="RW"
                  type="forward"
                  lineIndex={i}
                  role="rw"
                  onClear={line.rw ? () => { setForwardLine(i, "rw", null); onSelectSlot(null); } : undefined}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3">
          <span className="text-white/60 text-sm">Náhradníci: </span>
          <div className="flex gap-2 mt-1 flex-wrap">
            {[0, 1].map((i) => {
              const pid = lineup.extraForwards[i] ?? null;
              return (
                <Slot
                  key={i}
                  playerId={pid}
                  label={`Náhradník ${i + 1}`}
                  type="extraForward"
                  lineIndex={i}
                  role={undefined}
                  onClear={pid ? () => { removeExtraForwardByIndex(i); onSelectSlot(null); } : undefined}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Obránci – páry */}
      <div>
        <h3 className="font-display text-lg text-[#c41e3a] mb-2">Obránci</h3>
        <div className="space-y-3">
          {lineup.defensePairs.map((pair, i) => (
            <div key={i} className="flex items-center gap-2 flex-wrap">
              <span className="text-white/60 text-sm w-16">{i + 1}. pár</span>
              <div className="flex gap-2">
                <Slot
                  playerId={pair.lb}
                  label="LB"
                  type="defense"
                  lineIndex={i}
                  role="lb"
                  onClear={pair.lb ? () => { setDefensePair(i, "lb", null); onSelectSlot(null); } : undefined}
                />
                <Slot
                  playerId={pair.rb}
                  label="RB"
                  type="defense"
                  lineIndex={i}
                  role="rb"
                  onClear={pair.rb ? () => { setDefensePair(i, "rb", null); onSelectSlot(null); } : undefined}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
