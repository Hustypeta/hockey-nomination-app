"use client";

import type { Player } from "@/types";

interface HockeyRinkProps {
  players: Player[];
  captainId: string | null;
  onCaptainClick: (playerId: string) => void;
  onRemovePlayer: (playerId: string) => void;
}

export function HockeyRink({
  players,
  captainId,
  onCaptainClick,
  onRemovePlayer,
}: HockeyRinkProps) {
  const goalies = players.filter((p) => p.position === "G");
  const defensemen = players.filter((p) => p.position === "D");
  const forwards = players.filter((p) => p.position === "F");

  const Jersey = ({
    player,
    isCaptain,
    variant,
  }: {
    player: Player;
    isCaptain: boolean;
    variant: "white" | "red";
  }) => (
    <div
      className={`
        relative group cursor-pointer transition-all duration-200
        px-3 py-2 rounded-lg border-2 min-w-[70px] text-center
        ${variant === "white" 
          ? "bg-white text-[#0c0e12] border-[#003f87]" 
          : "bg-[#c41e3a] text-white border-white"
        }
        hover:scale-105 hover:shadow-lg
      `}
      onClick={() => onCaptainClick(player.id)}
      title={`${player.name}${player.role ? ` (${player.role})` : ""}${isCaptain ? " – Kapitán" : ""}`}
    >
      {isCaptain && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#003f87] text-white rounded-full text-xs font-bold flex items-center justify-center">
          C
        </span>
      )}
      <div className="jersey-number text-sm font-display truncate">
        {player.name.split(" ").pop()?.slice(0, 8) || player.name}
      </div>
      {player.role && player.position !== "G" && (
        <div className="text-[10px] opacity-80 mt-0.5">{player.role}</div>
      )}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemovePlayer(player.id);
        }}
        className="absolute -top-2 -left-2 w-4 h-4 bg-red-600 text-white rounded-full text-[10px] opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
      >
        ×
      </button>
    </div>
  );

  return (
    <div className="rink-ice rounded-2xl p-4 md:p-6 relative overflow-hidden">
      {/* Center ice circle */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border-2 border-[#003f87] opacity-40" />
      
      {/* Blue lines */}
      <div className="absolute top-1/3 left-0 right-0 h-1 bg-[#003f87] opacity-60" />
      <div className="absolute top-2/3 left-0 right-0 h-1 bg-[#003f87] opacity-60" />

      <div className="relative z-10 grid grid-rows-[auto_1fr_auto_1fr_auto] gap-2 min-h-[280px]">
        {/* Goalies row */}
        <div className="flex justify-center gap-2 flex-wrap">
          {goalies.map((p) => (
            <Jersey
              key={p.id}
              player={p}
              isCaptain={captainId === p.id}
              variant={goalies.indexOf(p) % 2 === 0 ? "white" : "red"}
            />
          ))}
        </div>

        {/* Defensemen row */}
        <div className="flex justify-center items-center gap-2 flex-wrap">
          {defensemen.map((p) => (
            <Jersey
              key={p.id}
              player={p}
              isCaptain={captainId === p.id}
              variant={defensemen.indexOf(p) % 2 === 0 ? "white" : "red"}
            />
          ))}
        </div>

        {/* Center label */}
        <div className="flex justify-center">
          <span className="text-[#003f87] font-display text-sm opacity-70">
            STŘED
          </span>
        </div>

        {/* Forwards row 1 */}
        <div className="flex justify-center items-center gap-2 flex-wrap">
          {forwards.slice(0, 7).map((p) => (
            <Jersey
              key={p.id}
              player={p}
              isCaptain={captainId === p.id}
              variant={forwards.indexOf(p) % 2 === 0 ? "white" : "red"}
            />
          ))}
        </div>

        {/* Forwards row 2 */}
        <div className="flex justify-center gap-2 flex-wrap">
          {forwards.slice(7, 14).map((p) => (
            <Jersey
              key={p.id}
              player={p}
              isCaptain={captainId === p.id}
              variant={forwards.indexOf(p) % 2 === 0 ? "red" : "white"}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
