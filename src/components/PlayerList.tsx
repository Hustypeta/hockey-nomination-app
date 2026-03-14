"use client";

import type { Player } from "@/types";
import { POSITION_LABELS, POSITION_LIMITS } from "@/types";

interface PlayerListProps {
  players: Player[];
  usedIds: Set<string>;
  counts: { G: number; D: number; F: number };
  selectedSlot: { type: string; lineIndex?: number; role?: string } | null;
  onSelectPlayer: (player: Player) => void;
  canAssignPlayer: (player: Player) => boolean;
}

export function PlayerList({
  players,
  usedIds,
  counts,
  selectedSlot,
  onSelectPlayer,
  canAssignPlayer,
}: PlayerListProps) {
  const canAdd = (player: Player) => {
    const limit = POSITION_LIMITS[player.position];
    const current = counts[player.position];
    return !usedIds.has(player.id) && current < limit;
  };
  const canAssign = (player: Player) => canAssignPlayer(player);
  const disabled = (player: Player) => !canAssign(player) && (usedIds.has(player.id) || !canAdd(player));
  const selected = (player: Player) => usedIds.has(player.id);
  const highlight = (player: Player) => selectedSlot && canAssign(player);

  const grouped = {
    G: players.filter((p) => p.position === "G"),
    D: players.filter((p) => p.position === "D"),
    F: players.filter((p) => p.position === "F"),
  };

  // Při výběru slotu zobraz jen relevantní skupinu (brankáře jen do branky, útočníky jen do útoku, atd.)
  const relevantPos = selectedSlot
    ? selectedSlot.type === "goalie"
      ? "G"
      : selectedSlot.type === "forward" || selectedSlot.type === "extraForward"
      ? "F"
      : selectedSlot.type === "defense"
      ? "D"
      : null
    : null;

  return (
    <div className="space-y-6">
      {selectedSlot && relevantPos && (
        <p className="text-amber-400/90 text-sm">
          {relevantPos === "G" && "Vyber brankáře"}
          {relevantPos === "F" && "Vyber útočníka – centrum může na křídlo a naopak"}
          {relevantPos === "D" && "Vyber obránce – LB/RB jsou jen doporučení"}
        </p>
      )}
      {(["G", "D", "F"] as const).map((pos) => {
        // Když je vybraný slot, zobraz jen odpovídající skupinu
        if (relevantPos && pos !== relevantPos) return null;
        return (
        <div key={pos}>
          <h3 className="font-display text-lg text-[#c41e3a] mb-2 flex items-center gap-2">
            {POSITION_LABELS[pos]}
            <span className="text-sm font-normal text-white/70">
              ({counts[pos]}/{POSITION_LIMITS[pos]})
            </span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {grouped[pos].map((player) => {
              const isDisabled = disabled(player);
              const isSelected = selected(player);
              const isHighlight = highlight(player);
              return (
                <button
                  key={player.id}
                  onClick={() => !isDisabled && onSelectPlayer(player)}
                  disabled={isDisabled}
                  className={`
                    px-4 py-2 rounded-lg border-2 transition-all duration-200
                    text-left min-w-[140px]
                    ${isSelected
                      ? "bg-[#003f87]/30 border-[#003f87] text-white cursor-default"
                      : isHighlight
                      ? "bg-amber-500/20 border-amber-400 text-white hover:bg-amber-500/30"
                      : isDisabled
                      ? "bg-white/5 border-white/10 text-white/40 cursor-not-allowed"
                      : "bg-[#151922] border-[#2a3142] text-white hover:border-[#c41e3a] hover:bg-[#1e2430] card-glow"
                    }
                  `}
                >
                  <div className="font-medium truncate">{player.name}</div>
                  <div className="text-xs text-white/60 truncate">
                    {player.role ? (
                      <span className="text-[#c41e3a] font-medium">{player.role}</span>
                    ) : null}
                    {player.role && " · "}
                    {player.club}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        );
      })}
    </div>
  );
}
