"use client";

import { forwardRef } from "react";
import type { Player } from "@/types";
import type { LineupStructure } from "@/types";

interface NominationPosterProps {
  players: Player[];
  captainId: string | null;
  lineup?: LineupStructure | null;
}

export const NominationPoster = forwardRef<HTMLDivElement, NominationPosterProps>(
  function NominationPoster({ players, captainId, lineup }, ref) {
  const getPlayer = (id: string) => players.find((p) => p.id === id);

  return (
    <div
      ref={ref}
      className="bg-[#0c0e12] p-8 rounded-2xl border-4 border-[#c41e3a] w-[600px]"
      style={{ aspectRatio: "3/4" }}
    >
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="font-display text-4xl text-white tracking-wider">
          MS 2026
        </h1>
        <p className="text-[#c41e3a] font-display text-2xl mt-1">
          MÁ NOMINACE
        </p>
        <div className="h-1 w-24 bg-[#003f87] mx-auto mt-2" />
      </div>

      {/* Lineup section */}
      <div className="rink-ice rounded-xl p-4 mb-6 space-y-4">
        {lineup ? (
          <>
            {/* Brankáři */}
            <div>
              <div className="text-[#c41e3a] text-xs font-display mb-1">Brankáři</div>
              <div className="flex gap-2 flex-wrap">
                {lineup.goalies.map((gid, i) => {
                  const p = gid ? getPlayer(gid) : null;
                  return p ? <Jersey key={p.id} player={p} isCaptain={captainId === p.id} /> : null;
                })}
              </div>
            </div>
            {/* Útočníci – lajny */}
            <div>
              <div className="text-[#c41e3a] text-xs font-display mb-1">Útočníci</div>
              {lineup.forwardLines.map((line, i) => {
                const lw = line.lw ? getPlayer(line.lw) : null;
                const c = line.c ? getPlayer(line.c) : null;
                const rw = line.rw ? getPlayer(line.rw) : null;
                if (!lw && !c && !rw) return null;
                return (
                  <div key={i} className="flex gap-2 mb-1 text-sm">
                    <span className="text-white/50 w-6">{i + 1}.</span>
                    {lw && <Jersey player={lw} isCaptain={captainId === lw.id} />}
                    {c && <Jersey player={c} isCaptain={captainId === c.id} />}
                    {rw && <Jersey player={rw} isCaptain={captainId === rw.id} />}
                  </div>
                );
              })}
              {lineup.extraForwards.length > 0 && (
                <div className="flex gap-2 mt-1 text-sm">
                  <span className="text-white/50">N:</span>
                  {lineup.extraForwards.map((id) => {
                    const p = getPlayer(id);
                    return p ? <Jersey key={p.id} player={p} isCaptain={captainId === p.id} /> : null;
                  })}
                </div>
              )}
            </div>
            {/* Obránci */}
            <div>
              <div className="text-[#c41e3a] text-xs font-display mb-1">Obránci</div>
              {lineup.defensePairs.map((pair, i) => {
                const lb = pair.lb ? getPlayer(pair.lb) : null;
                const rb = pair.rb ? getPlayer(pair.rb) : null;
                if (!lb && !rb) return null;
                return (
                  <div key={i} className="flex gap-2 mb-1 text-sm">
                    <span className="text-white/50 w-6">{i + 1}.</span>
                    {lb && <Jersey player={lb} isCaptain={captainId === lb.id} />}
                    {rb && <Jersey player={rb} isCaptain={captainId === rb.id} />}
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          /* Fallback: flat list */
          <div className="grid gap-2">
            {players.filter((p) => p.position === "G").map((p) => (
              <Jersey key={p.id} player={p} isCaptain={captainId === p.id} />
            ))}
            {players.filter((p) => p.position === "D").map((p) => (
              <Jersey key={p.id} player={p} isCaptain={captainId === p.id} />
            ))}
            {players.filter((p) => p.position === "F").map((p) => (
              <Jersey key={p.id} player={p} isCaptain={captainId === p.id} />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center">
        <p className="text-white/60 text-sm">
          Sestavil jsem na hockey-nomination.cz
        </p>
      </div>
    </div>
  );
});

function Jersey({
  player,
  isCaptain,
}: {
  player: Player;
  isCaptain: boolean;
}) {
  const lastName = player.name.split(" ").pop() || player.name;
  return (
    <div
      className={`
        px-2 py-1 rounded text-xs font-display
        ${isCaptain ? "bg-[#003f87] text-white" : "bg-white text-[#0c0e12]"}
      `}
    >
      {isCaptain && "C "}
      {player.role && player.position !== "G" && `${player.role} `}
      {lastName}
    </div>
  );
}
