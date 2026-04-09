"use client";

import { useMemo, useState, useEffect } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Info, GripVertical } from "lucide-react";
import type { Player, Position } from "@/types";
import { POSITION_LABELS, POSITION_LIMITS } from "@/types";
import { PlayerAvatar } from "./PlayerAvatar";

type Tab = "all" | "G" | "D" | "F";

function DraggableCard({
  player,
  disabled,
  inRoster,
  onAdd,
  onInfo,
  counts,
}: {
  player: Player;
  disabled: boolean;
  inRoster: boolean;
  onAdd: () => void;
  onInfo: () => void;
  counts: { G: number; D: number; F: number };
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `drag-player-${player.id}`,
    disabled: disabled || inRoster,
    data: { player },
  });
  const style = transform ? { transform: CSS.Translate.toString(transform) } : undefined;
  const lim = POSITION_LIMITS[player.position];
  const cur = counts[player.position];

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: inRoster ? 0.35 : 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 420, damping: 28 }}
      className={`
        group relative flex flex-col gap-2 rounded-2xl border p-3 transition-shadow
        ${
          inRoster
            ? "border-white/[0.06] bg-white/[0.02]"
            : disabled
              ? "border-white/[0.04] bg-white/[0.02] opacity-45"
              : "border-white/[0.08] bg-gradient-to-b from-white/[0.06] to-white/[0.02] hover:border-[#c8102e]/35 hover:shadow-[0_12px_40px_rgba(200,16,46,0.12)]"
        }
        ${isDragging ? "z-50 opacity-90 shadow-2xl ring-2 ring-[#d4af37]/50" : ""}
      `}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          className="mt-1 touch-none text-white/25 hover:text-white/50"
          aria-label="Přetáhni"
          {...listeners}
          {...attributes}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => !disabled && !inRoster && onAdd()} className="min-w-0 flex-1 text-left">
          <div className="flex items-center gap-3">
            <PlayerAvatar name={player.name} position={player.position} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-white">{player.name}</p>
              <p className="truncate text-xs text-white/45">
                {player.club}
                {player.league ? <span className="text-white/30"> · {player.league}</span> : null}
              </p>
            </div>
          </div>
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onInfo();
          }}
          className="rounded-lg p-1.5 text-white/35 transition-colors hover:bg-white/10 hover:text-white/80"
          aria-label="Detail"
        >
          <Info className="h-4 w-4" />
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-2 pl-7">
        <span
          className={`
            rounded-md px-2 py-0.5 font-display text-[10px] font-semibold uppercase tracking-wider
            ${player.position === "G" ? "bg-sky-500/20 text-sky-200" : ""}
            ${player.position === "D" ? "bg-[#003087]/35 text-blue-100" : ""}
            ${player.position === "F" ? "bg-[#c8102e]/25 text-red-100" : ""}
          `}
        >
          {player.position}
          {player.role ? ` · ${player.role}` : ""}
        </span>
        <span className="text-[10px] text-white/35">
          {cur}/{lim} v nominaci
        </span>
      </div>
    </motion.div>
  );
}

interface PlayerPoolPanelProps {
  players: Player[];
  usedIds: Set<string>;
  counts: { G: number; D: number; F: number };
  onAddPlayer: (player: Player) => void;
  onPreview: (player: Player) => void;
  /** Když je ve sestavě vybraný slot — zúží výběr na danou pozici. */
  forcedPosition?: Position | null;
}

export function PlayerPoolPanel({
  players,
  usedIds,
  counts,
  onAddPlayer,
  onPreview,
  forcedPosition = null,
}: PlayerPoolPanelProps) {
  const [tab, setTab] = useState<Tab>("all");

  useEffect(() => {
    if (forcedPosition) setTab(forcedPosition);
    else setTab("all");
  }, [forcedPosition]);
  const [q, setQ] = useState("");
  const [league, setLeague] = useState<string>("");

  const leagues = useMemo(() => {
    const s = new Set<string>();
    players.forEach((p) => p.league && s.add(p.league));
    return Array.from(s).sort();
  }, [players]);

  const filtered = useMemo(() => {
    let list = players;
    const posFilter = forcedPosition ?? (tab === "all" ? null : tab);
    if (posFilter) list = list.filter((p) => p.position === posFilter);
    else if (tab !== "all") list = list.filter((p) => p.position === tab);
    if (league) list = list.filter((p) => p.league === league);
    const nq = q.trim().toLowerCase();
    if (nq) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(nq) ||
          p.club.toLowerCase().includes(nq) ||
          (p.league && p.league.toLowerCase().includes(nq))
      );
    }
    return list;
  }, [players, tab, league, q, forcedPosition]);

  const canAdd = (player: Player) => {
    if (usedIds.has(player.id)) return false;
    const lim = POSITION_LIMITS[player.position];
    return counts[player.position] < lim;
  };

  if (players.length === 0) {
    return (
      <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-8 text-center">
        <p className="font-medium text-amber-200">Žádní hráči v databázi</p>
        <p className="mt-2 text-sm text-white/50">
          Na Railway spusť <code className="rounded bg-black/40 px-2 py-0.5 text-amber-200/90">railway run npm run db:seed</code>
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {forcedPosition && (
        <p className="rounded-xl border border-[#d4af37]/30 bg-[#d4af37]/10 px-3 py-2 text-center text-xs text-[#f0d78c]">
          Vybraný slot ve sestavě — zobrazují se jen{" "}
          <span className="font-semibold">{POSITION_LABELS[forcedPosition]}</span>.
        </p>
      )}
      <div className="flex flex-wrap gap-2 rounded-2xl border border-white/[0.06] bg-black/20 p-1.5">
        {(
          [
            ["all", "Všichni"],
            ["G", POSITION_LABELS.G],
            ["D", POSITION_LABELS.D],
            ["F", POSITION_LABELS.F],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            disabled={!!forcedPosition}
            onClick={() => setTab(key)}
            className={`
              flex-1 min-w-[4.5rem] rounded-xl px-3 py-2 font-display text-sm tracking-wide transition-all
              disabled:cursor-not-allowed disabled:opacity-40
              ${
                tab === key
                  ? "bg-gradient-to-b from-[#c8102e] to-[#8b0b20] text-white shadow-lg"
                  : "text-white/55 hover:bg-white/[0.05] hover:text-white"
              }
            `}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Hledat jméno, klub, ligu…"
          className="w-full rounded-2xl border border-white/[0.08] bg-black/30 py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-white/30 focus:border-[#003087]/60 focus:outline-none focus:ring-2 focus:ring-[#003087]/25"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Filter className="h-4 w-4 text-white/35" />
        <select
          value={league}
          onChange={(e) => setLeague(e.target.value)}
          className="rounded-xl border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white focus:border-[#003087]/50 focus:outline-none"
        >
          <option value="">Všechny ligy</option>
          {leagues.map((lg) => (
            <option key={lg} value={lg}>
              {lg}
            </option>
          ))}
        </select>
      </div>

      <p className="text-xs text-white/40">
        Klikni na kartu pro rychlé přidání do prvního volného místa, nebo přetáhni na konkrétní slot v sestavě.
      </p>

      <motion.div layout className="grid gap-3 sm:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {filtered.map((player) => {
            const inRoster = usedIds.has(player.id);
            const disabled = !canAdd(player);
            return (
              <DraggableCard
                key={player.id}
                player={player}
                disabled={disabled}
                inRoster={inRoster}
                counts={counts}
                onAdd={() => onAddPlayer(player)}
                onInfo={() => onPreview(player)}
              />
            );
          })}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && (
        <p className="py-12 text-center text-sm text-white/40">Žádní hráči nevyhovují filtru.</p>
      )}
    </div>
  );
}
