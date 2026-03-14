"use client";

import { forwardRef } from "react";
import type { Player } from "@/types";
import type { LineupStructure } from "@/types";

interface RosterSheetProps {
  players: Player[];
  captainId: string | null;
  lineup?: LineupStructure | null;
}

export const RosterSheet = forwardRef<HTMLDivElement, RosterSheetProps>(
  function RosterSheet({ players, captainId, lineup }, ref) {
  const getPlayer = (id: string) => players.find((p) => p.id === id);

  return (
    <div
      ref={ref}
      className="bg-white text-[#0c0e12] p-8 rounded-xl w-[600px]"
    >
      <h1 className="text-2xl font-bold text-center mb-2">MS 2026 – Soupiska</h1>
      <p className="text-center text-sm text-gray-600 mb-6">Má nominace</p>

      {lineup ? (
        <div className="space-y-4 text-sm">
          <div>
            <h2 className="font-bold text-[#c41e3a] mb-2">Brankáři</h2>
            <table className="w-full">
              <tbody>
                {lineup.goalies.map((gid, i) => {
                  const p = gid ? getPlayer(gid) : null;
                  return p ? (
                    <tr key={p.id} className="border-b border-gray-200">
                      <td className="py-1">{i + 1}.</td>
                      <td className="py-1 font-medium">{p.name}</td>
                      <td className="py-1 text-gray-600">{p.club}</td>
                      {captainId === p.id && <td className="py-1 text-amber-600 font-bold">C</td>}
                    </tr>
                  ) : null;
                })}
              </tbody>
            </table>
          </div>

          <div>
            <h2 className="font-bold text-[#c41e3a] mb-2">Útočníci</h2>
            <table className="w-full">
              <tbody>
                {lineup.forwardLines.flatMap((line, li) => {
                  const row: { p: Player; l: number; pos: string }[] = [];
                  if (line.lw) {
                    const p = getPlayer(line.lw);
                    if (p) row.push({ p, l: li + 1, pos: "LW" });
                  }
                  if (line.c) {
                    const p = getPlayer(line.c);
                    if (p) row.push({ p, l: li + 1, pos: "C" });
                  }
                  if (line.rw) {
                    const p = getPlayer(line.rw);
                    if (p) row.push({ p, l: li + 1, pos: "RW" });
                  }
                  return row;
                }).map(({ p, l, pos }) => (
                  <tr key={p.id} className="border-b border-gray-200">
                    <td className="py-1">{l}. lajna</td>
                    <td className="py-1">{pos}</td>
                    <td className="py-1 font-medium">{p.name}</td>
                    <td className="py-1 text-gray-600">{p.club}</td>
                    {captainId === p.id && <td className="py-1 text-amber-600 font-bold">C</td>}
                  </tr>
                ))}
                {lineup.extraForwards.map((id) => {
                  const p = getPlayer(id);
                  return p ? (
                    <tr key={p.id} className="border-b border-gray-200">
                      <td className="py-1">Náhradník</td>
                      <td className="py-1">–</td>
                      <td className="py-1 font-medium">{p.name}</td>
                      <td className="py-1 text-gray-600">{p.club}</td>
                      {captainId === p.id && <td className="py-1 text-amber-600 font-bold">C</td>}
                    </tr>
                  ) : null;
                })}
              </tbody>
            </table>
          </div>

          <div>
            <h2 className="font-bold text-[#c41e3a] mb-2">Obránci</h2>
            <table className="w-full">
              <tbody>
                {lineup.defensePairs.flatMap((pair, pi) => {
                  const row: { p: Player; l: number; pos: string }[] = [];
                  if (pair.lb) {
                    const p = getPlayer(pair.lb);
                    if (p) row.push({ p, l: pi + 1, pos: "LB" });
                  }
                  if (pair.rb) {
                    const p = getPlayer(pair.rb);
                    if (p) row.push({ p, l: pi + 1, pos: "RB" });
                  }
                  return row;
                }).map(({ p, l, pos }) => (
                  <tr key={p.id} className="border-b border-gray-200">
                    <td className="py-1">{l}. pár</td>
                    <td className="py-1">{pos}</td>
                    <td className="py-1 font-medium">{p.name}</td>
                    <td className="py-1 text-gray-600">{p.club}</td>
                    {captainId === p.id && <td className="py-1 text-amber-600 font-bold">C</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {players.map((p, i) => (
            <div key={p.id} className="flex justify-between gap-4 py-1 border-b border-gray-200">
              <span>{i + 1}. {p.name}</span>
              <span className="text-gray-600">{p.club}</span>
              {captainId === p.id && <span className="text-amber-600 font-bold">C</span>}
            </div>
          ))}
        </div>
      )}

      <p className="text-center text-xs text-gray-500 mt-6">
        hockey-nomination.cz
      </p>
    </div>
  );
});
