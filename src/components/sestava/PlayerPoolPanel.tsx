"use client";

import { useMemo, useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Info, GripVertical } from "lucide-react";
import type { Player, Position } from "@/types";
import { POSITION_LABELS, POSITION_LIMITS, ROLE_LABELS } from "@/types";
import { PlayerAvatar } from "./PlayerAvatar";

type Tab = "all" | "G" | "D" | "F";

function PoolAbbrevLegend() {
  return (
    <div
      className="rounded-2xl border border-white/[0.1] bg-gradient-to-br from-[#0a1428]/90 via-[#0f172a]/85 to-[#05080f]/95 px-4 py-3 text-[11px] leading-snug text-slate-200/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_24px_rgba(0,48,135,0.12)] sm:text-xs sm:leading-relaxed"
      aria-label="Vysvětlivky zkratek pozic"
    >
      <p className="mb-2 font-bold uppercase tracking-[0.12em] text-[#f1c40f]/90">Zkratky pozic</p>
      <ul className="grid gap-x-3 gap-y-1 sm:grid-cols-2">
        <li>
          <span className="font-mono font-semibold text-sky-200">G</span> — {ROLE_LABELS.G}
        </li>
        <li>
          <span className="font-mono font-semibold text-blue-200">D</span> — obránce (obecně)
        </li>
        <li>
          <span className="font-mono font-semibold text-blue-200">LB</span> — {ROLE_LABELS.LB}
        </li>
        <li>
          <span className="font-mono font-semibold text-blue-200">RB</span> — {ROLE_LABELS.RB}
        </li>
        <li>
          <span className="font-mono font-semibold text-red-200">F</span> — {POSITION_LABELS.F} (obecně)
        </li>
        <li>
          <span className="font-mono font-semibold text-red-200">LW</span> — {ROLE_LABELS.LW}
        </li>
        <li>
          <span className="font-mono font-semibold text-red-200">C</span> — {ROLE_LABELS.C}
        </li>
        <li>
          <span className="font-mono font-semibold text-red-200">RW</span> — {ROLE_LABELS.RW}
        </li>
      </ul>
      <p className="mt-3 border-t border-white/[0.1] pt-2.5 text-[10px] text-slate-400 sm:text-[11px]">
        U hráče s více útočnými rolemi v datech se v čtverci může objevit např.{" "}
        <span className="font-mono text-white/70">LW/RW</span>. Kombinace{" "}
        <span className="font-mono text-white/70">LW+C+RW</span> se zobrazí jako{" "}
        <span className="font-mono text-white/70">F</span>.
      </p>
    </div>
  );
}

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
  const roleU = player.role?.trim().toUpperCase() ?? "";
  const posLetter =
    player.position === "G"
      ? "G"
      : player.position === "D"
        ? "D"
        : roleU && roleU.length <= 4 && !roleU.includes(" ")
          ? roleU
          : "F";

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: inRoster ? 0.38 : 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 420, damping: 28 }}
      className={`
        group/pool relative flex flex-col gap-3 rounded-2xl border p-4 transition-[box-shadow,border-color,transform,opacity] duration-300 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)]
        before:pointer-events-none before:absolute before:inset-y-3 before:left-0 before:w-[3px] before:rounded-full before:bg-[#c8102e] before:opacity-90 before:shadow-[0_0_12px_rgba(200,16,46,0.5)]
        ${
          inRoster
            ? "border-white/[0.07] bg-[#05080f]/50 opacity-[0.72]"
            : disabled
              ? "border-white/[0.05] bg-[#080d14]/80 opacity-50"
              : `border-white/[0.12] bg-gradient-to-br from-[#0a1428]/95 via-[#121c34]/92 to-[#0a0f1a]/95
                 shadow-[0_8px_32px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.07),0_0_0_1px_rgba(0,48,135,0.15)]
                 hover:-translate-y-0.5 hover:border-[#f1c40f]/35 hover:shadow-[0_12px_40px_rgba(200,16,46,0.2),0_0_40px_rgba(241,196,15,0.08),inset_0_1px_0_rgba(255,255,255,0.1)]`
        }
        ${isDragging ? "z-50 scale-[1.03] opacity-[0.98] shadow-2xl ring-2 ring-[#c8102e]/55" : ""}
      `}
    >
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#003087]/20 blur-2xl"
        aria-hidden
      />
      <div className="relative flex items-start gap-2">
        <button
          type="button"
          className="mt-1 touch-none text-slate-500 transition-colors hover:text-[#f1c40f]"
          aria-label="Přetáhni"
          {...listeners}
          {...attributes}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => !disabled && !inRoster && onAdd()} className="min-w-0 flex-1 text-left">
          <div className="flex items-start gap-3">
            <div className="relative shrink-0">
              <span className="absolute -left-1 -top-1 z-10 flex h-7 min-w-[1.75rem] items-center justify-center rounded-md bg-[#c8102e] px-1 font-sans text-[10px] font-bold text-white shadow-md ring-1 ring-white/20">
                {posLetter}
              </span>
              <PlayerAvatar
                name={player.name}
                position={player.position}
                role={player.role}
                imageUrl={player.imageUrl}
                size="lg"
              />
            </div>
            <div className="min-w-0 flex-1 pt-1">
              <p className="break-words text-pretty text-base font-bold leading-snug text-white sm:text-[17px]">
                {player.name}
              </p>
              <p className="mt-1.5 line-clamp-2 text-sm leading-snug text-slate-300/95">
                <span className="text-slate-100">{player.club}</span>
                {player.league ? <span className="text-slate-500"> · {player.league}</span> : null}
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
          className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-white/10 hover:text-[#f1c40f]"
          aria-label="Detail"
        >
          <Info className="h-4 w-4" />
        </button>
      </div>
      <div className="relative flex flex-wrap items-center gap-2 pl-8">
        <span className="rounded-lg border border-[#003087]/40 bg-[#003087]/20 px-2.5 py-1 font-mono text-xs font-semibold tabular-nums text-sky-100/95 sm:text-[13px]">
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
  /** Při vybraném slotu ve sestavě zrcadlíme pozici bez synchronizace přes effect. */
  const activeTab: Tab = (forcedPosition ?? tab) as Tab;
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
    <div className="flex flex-col gap-5">
      {forcedPosition && (
        <p className="rounded-2xl border border-[#f1c40f]/35 bg-[#f1c40f]/10 px-4 py-3 text-center text-sm text-[#f1e6a8] shadow-[0_0_24px_rgba(241,196,15,0.12)]">
          Vybraný slot ve sestavě — zobrazují se jen{" "}
          <span className="font-bold text-white">{POSITION_LABELS[forcedPosition]}</span>.
        </p>
      )}
      <div className="flex flex-wrap gap-2 rounded-2xl border border-white/[0.1] bg-[#0a1428]/60 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_32px_rgba(0,48,135,0.15)] backdrop-blur-md">
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
              flex-1 min-w-[4.5rem] rounded-xl px-3 py-3 font-display text-sm font-bold tracking-wide transition-all
              disabled:cursor-not-allowed disabled:opacity-40
              ${
                activeTab === key
                  ? "bg-gradient-to-b from-[#c8102e] via-[#9e0c24] to-[#003087] text-white shadow-[0_8px_32px_rgba(200,16,46,0.4),0_0_0_1px_rgba(241,196,15,0.35)] ring-1 ring-white/25"
                  : "text-slate-400 hover:bg-white/[0.06] hover:text-white"
              }
            `}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#f1c40f]/50" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Hledat jméno, klub, ligu…"
          className="w-full rounded-2xl border border-white/[0.12] bg-[#0a1428]/80 py-4 pl-11 pr-4 text-sm text-white shadow-[inset_0_2px_8px_rgba(0,0,0,0.25)] placeholder:text-slate-500 focus:border-[#f1c40f]/45 focus:outline-none focus:ring-2 focus:ring-[#c8102e]/25"
        />
      </div>

      <PoolAbbrevLegend />

      <div className="flex flex-wrap items-center gap-2">
        <Filter className="h-4 w-4 text-[#c8102e]/70" />
        <select
          value={league}
          onChange={(e) => setLeague(e.target.value)}
          className="rounded-xl border border-white/[0.12] bg-[#0a1428]/80 px-3 py-3 text-sm text-white focus:border-[#f1c40f]/40 focus:outline-none focus:ring-1 focus:ring-[#f1c40f]/20"
        >
          <option value="">Všechny ligy</option>
          {leagues.map((lg) => (
            <option key={lg} value={lg}>
              {lg}
            </option>
          ))}
        </select>
      </div>

      <p className="text-sm leading-relaxed text-slate-400">
        Klikni na kartu pro rychlé přidání do prvního volného místa, nebo přetáhni na konkrétní dres vpravo.
      </p>

      <motion.div layout className="grid gap-3 sm:grid-cols-2 sm:gap-4">
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
