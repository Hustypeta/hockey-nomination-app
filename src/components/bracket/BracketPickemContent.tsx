"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { toast } from "sonner";
import { Link2, Trash2, Trophy } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { DndContext, DragOverlay, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  MS2026_BRACKET_TEAMS,
  MS2026_GROUP_A_TEAMS,
  MS2026_GROUP_A_VENUE,
  MS2026_GROUP_B_TEAMS,
  MS2026_GROUP_B_VENUE,
  MS2026_QF_LABELS,
  type BracketTeam,
} from "@/data/ms2026BracketTeams";
import { SitePageHero } from "@/components/site/SitePageHero";
import { encodeBracketPayload, decodeBracketPayload } from "@/lib/bracketPayload";
import type { BracketMatchPick, BracketPickemPayload } from "@/types/bracketPickem";
import { EMPTY_BRACKET_PICKEM } from "@/types/bracketPickem";
import type { Player, Position } from "@/types";
import { PlayerAvatar } from "@/components/sestava/PlayerAvatar";

/** v3: drag&drop pořadí skupin + bracket (MS 2026). */
const STORAGE_KEY = "ms2026-bracket-pickem-v4";

const selectCls =
  "mt-1 w-full rounded-lg border border-white/14 bg-white/[0.07] px-3 py-2.5 text-sm text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] focus:border-[#f1c40f]/45 focus:outline-none focus:ring-1 focus:ring-[#f1c40f]/22";

const inputCls =
  "mt-1 w-full rounded-lg border border-white/14 bg-white/[0.07] px-3 py-2.5 text-sm text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] placeholder:text-white/40 focus:border-[#f1c40f]/45 focus:outline-none focus:ring-1 focus:ring-[#f1c40f]/22";

/** Přibližný start MS 2026 (uprav dle oficiálního termínu). */
const MS_2026_KICKOFF = new Date("2026-05-15T16:20:00+02:00");

function useIsMobile(breakpointPx = 720) {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width:${breakpointPx}px)`);
    const apply = () => setMobile(mq.matches);
    apply();
    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, [breakpointPx]);
  return mobile;
}

function useCountdown(target: Date) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  return useMemo(() => {
    if (now === null) return null;
    const diff = Math.max(0, target.getTime() - now);
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return { d, h, m, s, ended: diff <= 0 };
  }, [now, target]);
}

function formatCsDate(d: Date) {
  return d.toLocaleString("cs-CZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function clonePicks(p: BracketPickemPayload): BracketPickemPayload {
  return JSON.parse(JSON.stringify(p)) as BracketPickemPayload;
}

function flagEmoji(teamId: string): string {
  const map: Record<string, string> = {
    USA: "🇺🇸",
    SUI: "🇨🇭",
    FIN: "🇫🇮",
    GER: "🇩🇪",
    LAT: "🇱🇻",
    AUT: "🇦🇹",
    HUN: "🇭🇺",
    GBR: "🇬🇧",
    CAN: "🇨🇦",
    SWE: "🇸🇪",
    CZE: "🇨🇿",
    DEN: "🇩🇰",
    SVK: "🇸🇰",
    NOR: "🇳🇴",
    SLO: "🇸🇮",
    ITA: "🇮🇹",
  };
  return map[teamId] ?? "🏒";
}

function twemojiFlagUrl(teamId: string): string | null {
  const map: Record<string, string> = {
    USA: "1f1fa-1f1f8",
    SUI: "1f1e8-1f1ed",
    FIN: "1f1eb-1f1ee",
    GER: "1f1e9-1f1ea",
    LAT: "1f1f1-1f1fb",
    AUT: "1f1e6-1f1f9",
    HUN: "1f1ed-1f1fa",
    GBR: "1f1ec-1f1e7",
    CAN: "1f1e8-1f1e6",
    SWE: "1f1f8-1f1ea",
    CZE: "1f1e8-1f1ff",
    DEN: "1f1e9-1f1f0",
    SVK: "1f1f8-1f1f0",
    NOR: "1f1f3-1f1f4",
    SLO: "1f1f8-1f1ee",
    ITA: "1f1ee-1f1f9",
  };
  const code = map[teamId];
  if (!code) return null;
  return `https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/${code}.svg`;
}

function FlagIcon({ id, className }: { id: string; className?: string }) {
  const src = twemojiFlagUrl(id);
  if (!src) return <span className={className}>{flagEmoji(id)}</span>;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={id}
      className={className}
      width={20}
      height={20}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
    />
  );
}

function normalizeWinner(m: BracketMatchPick): BracketMatchPick {
  const { teamLeft, teamRight, winner } = m;
  if (winner && winner !== teamLeft && winner !== teamRight) {
    return { ...m, winner: null };
  }
  return m;
}

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="pickem-panel rounded-2xl p-5 shadow-[0_20px_56px_rgba(0,0,0,0.30)] sm:p-6">
      <h2 className="font-display text-lg font-bold tracking-wide text-white sm:text-xl">{title}</h2>
      {hint ? <p className="mt-2 text-xs leading-relaxed text-white/55 sm:text-sm">{hint}</p> : null}
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}

function SortableTeamRow({
  id,
  rank,
  name,
  isOverlay,
}: {
  id: string;
  rank: number;
  name: string;
  isOverlay?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const rankCls =
    rank === 1
      ? "bg-gradient-to-r from-amber-400/22 to-[#FF1E2E]/16 text-amber-200 ring-1 ring-amber-300/22"
      : rank === 2
        ? "bg-[#00E5FF]/12 text-[#67E8F9] ring-1 ring-[#00E5FF]/22"
        : rank === 3
          ? "bg-orange-400/14 text-orange-200 ring-1 ring-orange-300/18"
          : "bg-white/[0.06] text-white/70 ring-1 ring-white/10";
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition ${
        isOverlay
          ? "border-[#00E5FF]/30 bg-[#0A0E17]/75 shadow-[0_18px_56px_rgba(0,0,0,0.55),0_0_0_1px_rgba(0,229,255,0.10),0_0_36px_rgba(0,229,255,0.14),0_0_34px_rgba(255,30,46,0.10)]"
          : "border-white/12 bg-white/[0.06] hover:border-white/18"
      } ${isDragging ? "opacity-75 ring-2 ring-[#00E5FF]/30" : ""}`}
      {...(isOverlay ? {} : attributes)}
      {...(isOverlay ? {} : listeners)}
    >
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-display text-sm font-black ${rankCls}`}
      >
        {rank}
      </span>
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.06] ring-1 ring-white/10">
        <FlagIcon id={id} className="h-[20px] w-[20px]" />
      </span>
      <span className="min-w-0 flex-1 truncate font-display text-sm font-bold text-white">{name}</span>
      <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">{id}</span>
    </div>
  );
}

function GroupOrderDnd({
  title,
  venue,
  order,
  teamById,
  onChange,
}: {
  title: string;
  venue: string;
  order: string[];
  teamById: Map<string, BracketTeam>;
  onChange: (next: string[]) => void;
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeIndex = activeId ? order.indexOf(activeId) : -1;
  const activeTeam = activeId ? teamById.get(activeId) : null;
  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/55">{title}</p>
          <p className="mt-1 text-xs text-white/65">{venue}</p>
        </div>
        <div
          className="mt-0.5 h-2 w-16 rounded-full opacity-80"
          style={{
            background:
              title === "Skupina A"
                ? "linear-gradient(90deg, rgba(0,48,135,0.0), rgba(0,48,135,0.65), rgba(200,16,46,0.0))"
                : "linear-gradient(90deg, rgba(200,16,46,0.0), rgba(200,16,46,0.65), rgba(0,48,135,0.0))",
          }}
          aria-hidden
        />
      </div>
      <div className="mt-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={(e) => setActiveId(String(e.active.id))}
          onDragEnd={(e) => {
            const { active, over } = e;
            setActiveId(null);
            if (!over || active.id === over.id) return;
            const oldIndex = order.indexOf(String(active.id));
            const newIndex = order.indexOf(String(over.id));
            if (oldIndex < 0 || newIndex < 0) return;
            onChange(arrayMove(order, oldIndex, newIndex));
          }}
          onDragCancel={() => setActiveId(null)}
        >
          <SortableContext items={order} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {order.map((id, idx) => {
                const t = teamById.get(id);
                return (
                  <SortableTeamRow key={id} id={id} rank={idx + 1} name={t?.name ?? id} />
                );
              })}
            </div>
          </SortableContext>
          <DragOverlay>
            {activeId ? (
              <SortableTeamRow
                id={activeId}
                rank={(activeIndex >= 0 ? activeIndex : 0) + 1}
                name={activeTeam?.name ?? activeId}
                isOverlay
              />
            ) : (
              <div />
            )}
          </DragOverlay>
        </DndContext>
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-white/45">
        Přetáhni týmy a nastav pořadí 1–8. (Neřešíme skóre; je to čistě tip pořadí.)
      </p>
    </div>
  );
}

function GroupOrderTap({
  title,
  venue,
  order,
  teamById,
  onChange,
}: {
  title: string;
  venue: string;
  order: string[];
  teamById: Map<string, BracketTeam>;
  onChange: (next: string[]) => void;
}) {
  const move = (from: number, dir: -1 | 1) => {
    const to = from + dir;
    if (to < 0 || to >= order.length) return;
    const next = [...order];
    const tmp = next[from];
    next[from] = next[to];
    next[to] = tmp;
    onChange(next);
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/55">{title}</p>
          <p className="mt-1 text-xs text-white/65">{venue}</p>
        </div>
        <div
          className="mt-0.5 h-2 w-16 rounded-full opacity-80"
          style={{
            background:
              title === "Skupina A"
                ? "linear-gradient(90deg, rgba(0,48,135,0.0), rgba(0,48,135,0.65), rgba(200,16,46,0.0))"
                : "linear-gradient(90deg, rgba(200,16,46,0.0), rgba(200,16,46,0.65), rgba(0,48,135,0.0))",
          }}
          aria-hidden
        />
      </div>

      <div className="mt-4 space-y-2">
        {order.map((id, idx) => {
          const t = teamById.get(id);
          return (
            <div
              key={id}
              className="flex items-center gap-2 rounded-xl border border-white/12 bg-white/[0.06] px-2.5 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
            >
              <span className="w-6 shrink-0 text-center font-display text-sm font-black text-white/65">{idx + 1}</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.06] ring-1 ring-white/10">
                <FlagIcon id={id} className="h-[18px] w-[18px]" />
              </span>
              <span className="min-w-0 flex-1 truncate font-display text-sm font-bold text-white">
                {t?.name ?? id}
              </span>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => move(idx, -1)}
                  disabled={idx === 0}
                  className="rounded-lg border border-white/12 bg-white/[0.04] px-2 py-1 text-xs font-black text-white/70 disabled:opacity-40"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(idx, 1)}
                  disabled={idx === order.length - 1}
                  className="rounded-lg border border-white/12 bg-white/[0.04] px-2 py-1 text-xs font-black text-white/70 disabled:opacity-40"
                >
                  ↓
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-white/45">
        Klepáním na ↑↓ nastav pořadí 1–8. (Na mobilu je to spolehlivější než přetahování.)
      </p>
    </div>
  );
}

function teamLabel(teamById: Map<string, BracketTeam>, id: string | null) {
  if (!id) return "Čeká se na tým";
  return teamById.get(id)?.name ?? id;
}

function BracketNode({
  id,
  name,
  selected,
  dimmed,
  onPick,
  disabled,
}: {
  id: string | null;
  name: string;
  selected: boolean;
  dimmed?: boolean;
  onPick: () => void;
  disabled?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.button
      type="button"
      onClick={onPick}
      disabled={disabled || !id}
      whileHover={reduceMotion ? undefined : { scale: 1.01 }}
      whileTap={reduceMotion ? undefined : { scale: 0.995 }}
      className={`group relative flex h-12 w-full items-center justify-between gap-3 overflow-hidden rounded-xl border px-3 text-left transition ${
        selected
          ? "border-[#FF1E2E]/55 bg-[#FF1E2E]/[0.10] text-white shadow-[0_0_0_1px_rgba(255,30,46,0.18),0_0_34px_rgba(255,30,46,0.16)]"
          : "border-white/12 bg-white/[0.06] text-white/85 hover:border-white/22"
      } ${dimmed ? "opacity-55" : ""} ${disabled ? "opacity-65" : ""}`}
    >
      {selected ? (
        <span
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(ellipse 80% 140% at 15% 50%, rgba(255,30,46,0.20), rgba(0,0,0,0) 60%)",
          }}
          aria-hidden
        />
      ) : null}
      <span className="relative z-10 flex min-w-0 items-center gap-2.5">
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-full ring-1 ${
            selected ? "bg-[#FF1E2E]/10 ring-[#FF1E2E]/35" : "bg-white/[0.06] ring-white/10"
          }`}
        >
          {id ? <FlagIcon id={id} className="h-[20px] w-[20px]" /> : <span className="text-sm">🏒</span>}
        </span>
        <span className="min-w-0 truncate font-display text-sm font-black tracking-wide">{name}</span>
      </span>
      <span className="relative z-10 shrink-0 text-[10px] font-black uppercase tracking-[0.22em] text-white/35 group-hover:text-white/45">
        {id ?? ""}
      </span>
    </motion.button>
  );
}

function PremiumMatchCard({
  title,
  match,
  teamById,
  onPickWinner,
  className,
}: {
  title: string;
  match: BracketMatchPick;
  teamById: Map<string, BracketTeam>;
  onPickWinner: (id: string | null) => void;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const leftName = teamLabel(teamById, match.teamLeft);
  const rightName = teamLabel(teamById, match.teamRight);
  const leftSelected = Boolean(match.teamLeft && match.winner === match.teamLeft);
  const rightSelected = Boolean(match.teamRight && match.winner === match.teamRight);
  return (
    <motion.div
      layout
      className={`relative rounded-2xl border border-white/[0.12] bg-white/[0.04] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-sm ${
        className ?? ""
      }`}
      whileHover={reduceMotion ? undefined : { y: -1 }}
      transition={{ type: "spring", stiffness: 380, damping: 28 }}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-[0.7]"
        style={{
          background:
            "radial-gradient(ellipse 80% 80% at 20% 0%, rgba(125,211,252,0.16), rgba(0,0,0,0) 62%)",
        }}
        aria-hidden
      />
      <p className="relative z-10 mb-2 text-center font-display text-[11px] font-black uppercase tracking-[0.22em] text-white/55">
        {title}
      </p>
      <div className="relative z-10 space-y-2">
        <BracketNode
          id={match.teamLeft}
          name={leftName}
          selected={leftSelected}
          dimmed={Boolean(match.winner) && !leftSelected}
          onPick={() => onPickWinner(match.teamLeft)}
          disabled={!match.teamLeft}
        />
        <BracketNode
          id={match.teamRight}
          name={rightName}
          selected={rightSelected}
          dimmed={Boolean(match.winner) && !rightSelected}
          onPick={() => onPickWinner(match.teamRight)}
          disabled={!match.teamRight}
        />
      </div>
    </motion.div>
  );
}

function ConnectorSvg({
  quarterfinals,
  semifinals,
  finalMatch,
}: {
  quarterfinals: BracketMatchPick[];
  semifinals: BracketMatchPick[];
  finalMatch: BracketMatchPick;
}) {
  const qfWinnerId = (i: number) => quarterfinals[i]?.winner ?? null;
  const sfTeamId = (i: number, side: "L" | "R") =>
    side === "L" ? semifinals[i]?.teamLeft ?? null : semifinals[i]?.teamRight ?? null;
  const sfWinnerId = (i: number) => semifinals[i]?.winner ?? null;

  // Fixed coordinate system (works because cards have stable spacing in desktop layout)
  const W = 1000;
  const H = 640;
  const xQf = 180;
  const xSf = 500;
  const xFinal = 780;
  const yQf = [120, 250, 390, 520];
  const ySf = [210, 450];
  const yFinal = 330;

  const path = (x1: number, y1: number, x2: number, y2: number) => {
    const mx = (x1 + x2) / 2;
    return `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`;
  };

  const qfToSf = [
    { qf: 0, sf: 0 },
    { qf: 1, sf: 0 },
    { qf: 2, sf: 1 },
    { qf: 3, sf: 1 },
  ];

  const winnerGlow = "#00E5FF";
  const baseStroke = "rgba(203,213,225,0.14)";

  const highlightFor = (qfIdx: number, sfIdx: number) => {
    const w = qfWinnerId(qfIdx);
    if (!w) return false;
    return sfTeamId(sfIdx, "L") === w || sfTeamId(sfIdx, "R") === w;
  };

  const highlightSfToFinal = (sfIdx: number) => {
    const w = sfWinnerId(sfIdx);
    if (!w) return false;
    return finalMatch.teamLeft === w || finalMatch.teamRight === w;
  };

  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <filter id="glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* QF -> SF base */}
      {qfToSf.map((m) => (
        <path
          key={`b-${m.qf}-${m.sf}`}
          d={path(xQf, yQf[m.qf], xSf, ySf[m.sf])}
          stroke={baseStroke}
          strokeWidth="3.5"
          fill="none"
        />
      ))}
      {/* SF -> Final base */}
      {[0, 1].map((sf) => (
        <path
          key={`sf-base-${sf}`}
          d={path(xSf, ySf[sf], xFinal, yFinal)}
          stroke={baseStroke}
          strokeWidth="3.5"
          fill="none"
        />
      ))}

      {/* Highlights */}
      {qfToSf
        .filter((m) => highlightFor(m.qf, m.sf))
        .map((m) => (
          <path
            key={`h-${m.qf}-${m.sf}`}
            d={path(xQf, yQf[m.qf], xSf, ySf[m.sf])}
            stroke={winnerGlow}
            strokeOpacity="0.75"
            strokeWidth="4.5"
            fill="none"
            filter="url(#glow)"
          />
        ))}
      {[0, 1]
        .filter((sf) => highlightSfToFinal(sf))
        .map((sf) => (
          <path
            key={`sf-h-${sf}`}
            d={path(xSf, ySf[sf], xFinal, yFinal)}
            stroke={winnerGlow}
            strokeOpacity="0.75"
            strokeWidth="4.5"
            fill="none"
            filter="url(#glow)"
          />
        ))}

      {/* Junction dots */}
      {ySf.map((y, i) => (
        <circle key={`dot-sf-${i}`} cx={xSf} cy={y} r="5" fill="rgba(0,229,255,0.12)" />
      ))}
      <circle cx={xFinal} cy={yFinal} r="6" fill="rgba(0,229,255,0.12)" />
    </svg>
  );
}

function DesktopBracketLayout({
  quarterfinals,
  semifinals,
  finalMatch,
  bronzeMatch,
  teamById,
  onPickQf,
  onPickSf,
  onPickFinal,
  onPickBronze,
}: {
  quarterfinals: BracketMatchPick[];
  semifinals: BracketMatchPick[];
  finalMatch: BracketMatchPick;
  bronzeMatch: BracketMatchPick;
  teamById: Map<string, BracketTeam>;
  onPickQf: (i: number, winner: string | null) => void;
  onPickSf: (i: number, winner: string | null) => void;
  onPickFinal: (winner: string | null) => void;
  onPickBronze: (winner: string | null) => void;
}) {
  // Desktop: plný pavouk bez scrollu + konektory (SVG)
  return (
    <div className="relative">
      <ConnectorSvg quarterfinals={quarterfinals} semifinals={semifinals} finalMatch={finalMatch} />
      <div className="relative grid grid-cols-4 gap-5">
        {/* Column headers */}
        <div className="text-center text-[11px] font-black uppercase tracking-[0.22em] text-white/45">Čtvrtfinále</div>
        <div className="text-center text-[11px] font-black uppercase tracking-[0.22em] text-white/45">Semifinále</div>
        <div className="text-center text-[11px] font-black uppercase tracking-[0.22em] text-white/45">Finále</div>
        <div className="text-center text-[11px] font-black uppercase tracking-[0.22em] text-white/45">O bronz</div>

        {/* Bracket body */}
        <div className="relative grid grid-rows-[auto_auto_auto_auto] gap-4">
          {quarterfinals.slice(0, 2).map((m, i) => (
            <PremiumMatchCard
              key={`qf-${i}`}
              title={`QF ${i + 1}`}
              match={m}
              teamById={teamById}
              onPickWinner={(id) => onPickQf(i, id)}
            />
          ))}
          {quarterfinals.slice(2, 4).map((m, i) => (
            <PremiumMatchCard
              key={`qf-${i + 2}`}
              title={`QF ${i + 3}`}
              match={m}
              teamById={teamById}
              onPickWinner={(id) => onPickQf(i + 2, id)}
            />
          ))}
        </div>

        <div className="relative grid grid-rows-[1fr_1fr] gap-6 pt-[48px]">
          {semifinals.map((m, i) => (
            <PremiumMatchCard
              key={`sf-${i}`}
              title={`SF ${i + 1}`}
              match={m}
              teamById={teamById}
              onPickWinner={(id) => onPickSf(i, id)}
            />
          ))}
        </div>

        <div className="relative flex flex-col justify-center pt-[48px]">
          <PremiumMatchCard title="FINÁLE" match={finalMatch} teamById={teamById} onPickWinner={onPickFinal} />
        </div>

        <div className="relative flex flex-col justify-center pt-[48px]">
          <PremiumMatchCard title="BRONZ" match={bronzeMatch} teamById={teamById} onPickWinner={onPickBronze} />
        </div>
      </div>
    </div>
  );
}

function MobileRoundSnap({
  quarterfinals,
  semifinals,
  finalMatch,
  bronzeMatch,
  teamById,
  onPickQf,
  onPickSf,
  onPickFinal,
  onPickBronze,
}: {
  quarterfinals: BracketMatchPick[];
  semifinals: BracketMatchPick[];
  finalMatch: BracketMatchPick;
  bronzeMatch: BracketMatchPick;
  teamById: Map<string, BracketTeam>;
  onPickQf: (i: number, winner: string | null) => void;
  onPickSf: (i: number, winner: string | null) => void;
  onPickFinal: (winner: string | null) => void;
  onPickBronze: (winner: string | null) => void;
}) {
  const reduceMotion = useReducedMotion();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [round, setRound] = useState<"qf" | "sf" | "fin" | "bronze">("qf");

  const rounds: Array<{ id: typeof round; label: string }> = [
    { id: "qf", label: "QF" },
    { id: "sf", label: "SF" },
    { id: "fin", label: "FIN" },
    { id: "bronze", label: "BRONZ" },
  ];

  const scrollTo = (id: typeof round) => {
    const el = scrollerRef.current?.querySelector<HTMLElement>(`[data-round="${id}"]`);
    if (!el) return;
    el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", inline: "start", block: "nearest" });
    setRound(id);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-2">
        {rounds.map((r) => {
          const active = r.id === round;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => scrollTo(r.id)}
              className={`rounded-full border px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.22em] transition ${
                active
                  ? "border-sky-300/40 bg-sky-300/[0.10] text-sky-100 shadow-[0_0_18px_rgba(125,211,252,0.16)]"
                  : "border-white/12 bg-white/[0.04] text-white/60 hover:border-white/20 hover:bg-white/[0.06]"
              }`}
            >
              {r.label}
            </button>
          );
        })}
      </div>

      <div
        ref={scrollerRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:thin]"
      >
        <motion.div
          data-round="qf"
          className="w-[92%] shrink-0 snap-start"
          initial={false}
          animate={{ opacity: 1 }}
        >
          <div className="grid gap-4">
            {quarterfinals.map((m, i) => (
              <PremiumMatchCard
                key={`m-qf-${i}`}
                title={`Čtvrtfinále ${i + 1}`}
                match={m}
                teamById={teamById}
                onPickWinner={(id) => onPickQf(i, id)}
              />
            ))}
          </div>
        </motion.div>

        <motion.div data-round="sf" className="w-[92%] shrink-0 snap-start" initial={false} animate={{ opacity: 1 }}>
          <div className="grid gap-4">
            {semifinals.map((m, i) => (
              <PremiumMatchCard
                key={`m-sf-${i}`}
                title={`Semifinále ${i + 1}`}
                match={m}
                teamById={teamById}
                onPickWinner={(id) => onPickSf(i, id)}
              />
            ))}
          </div>
        </motion.div>

        <motion.div data-round="fin" className="w-[92%] shrink-0 snap-start" initial={false} animate={{ opacity: 1 }}>
          <div className="grid gap-4">
            <PremiumMatchCard title="Finále" match={finalMatch} teamById={teamById} onPickWinner={onPickFinal} />
          </div>
        </motion.div>

        <motion.div
          data-round="bronze"
          className="w-[92%] shrink-0 snap-start"
          initial={false}
          animate={{ opacity: 1 }}
        >
          <div className="grid gap-4">
            <PremiumMatchCard title="O bronz" match={bronzeMatch} teamById={teamById} onPickWinner={onPickBronze} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function PickemPlayerPicker({
  open,
  title,
  players,
  value,
  onSelect,
  onClose,
}: {
  open: boolean;
  title: string;
  players: Player[];
  value: string;
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  const [q, setQ] = useState("");
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!open) setQ("");
  }, [open]);

  const filtered = useMemo(() => {
    const nq = q.trim().toLowerCase();
    const base = players;
    if (!nq) return base;
    return base.filter(
      (p) =>
        p.name.toLowerCase().includes(nq) ||
        p.club.toLowerCase().includes(nq) ||
        (p.league && p.league.toLowerCase().includes(nq))
    );
  }, [players, q]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70]">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 10, scale: 0.985 }}
        animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
        exit={reduceMotion ? undefined : { opacity: 0, y: 10, scale: 0.985 }}
        transition={{ type: "spring", stiffness: 380, damping: 30 }}
        className="absolute left-1/2 top-1/2 w-[min(920px,calc(100%-1.5rem))] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl border border-white/12 bg-gradient-to-br from-[#0a1428]/95 via-[#121c34]/92 to-[#05080f]/95 shadow-[0_24px_80px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.06)]"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between gap-3 border-b border-white/10 px-5 py-4 sm:px-7">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-sky-200/70">Výběr hráče</p>
            <h3 className="mt-1 font-display text-base font-black tracking-wide text-white sm:text-lg">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/12 bg-white/[0.06] px-3 py-2 text-sm font-semibold text-white/85 hover:bg-white/[0.1]"
          >
            Zavřít
          </button>
        </div>

        <div className="px-5 pb-5 pt-4 sm:px-7">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Hledat jméno, klub, ligu…"
            className="w-full rounded-2xl border border-white/[0.12] bg-[#0a1428]/70 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-[#f1c40f]/40 focus:outline-none focus:ring-2 focus:ring-[#003087]/25"
          />

          <div className="mt-4 grid max-h-[60vh] gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
            {filtered.map((p) => {
              const selected = value === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    onSelect(p.id);
                    onClose();
                  }}
                  className={`group flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${
                    selected
                      ? "border-sky-300/40 bg-sky-300/[0.10] shadow-[0_0_0_1px_rgba(125,211,252,0.14),0_0_28px_rgba(125,211,252,0.12)]"
                      : "border-white/12 bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.06]"
                  }`}
                >
                  <PlayerAvatar
                    name={p.name}
                    position={p.position}
                    role={p.role}
                    imageUrl={p.imageUrl}
                    size="md"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-sm font-black text-white">{p.name}</p>
                    <p className="mt-1 truncate text-xs text-slate-300/90">
                      <span className="text-slate-100">{p.club}</span>
                      {p.league ? <span className="text-slate-500"> · {p.league}</span> : null}
                    </p>
                  </div>
                  <span className="shrink-0 text-[10px] font-black uppercase tracking-[0.22em] text-white/35">
                    {selected ? "Vybráno" : ""}
                  </span>
                </button>
              );
            })}
            {filtered.length === 0 ? (
              <p className="col-span-full py-8 text-center text-sm text-white/45">Nikdo neodpovídá filtru.</p>
            ) : null}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function BracketPickemContent({ initialPayload }: { initialPayload?: BracketPickemPayload }) {
  const searchParams = useSearchParams();
  const { status: authStatus } = useSession();
  const [picks, setPicks] = useState<BracketPickemPayload>(() => ({ ...EMPTY_BRACKET_PICKEM }));
  const [hydrated, setHydrated] = useState(false);
  const [czPlayers, setCzPlayers] = useState<Player[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [pickemTitle, setPickemTitle] = useState("");
  /** Po jednorázovém „Odeslat do soutěže“ je payload na serveru zamčený. */
  const [contestLocked, setContestLocked] = useState(false);

  const teamById = useMemo(() => new Map(MS2026_BRACKET_TEAMS.map((t) => [t.id, t] as const)), []);
  const isMobile = useIsMobile(900);
  const cd = useCountdown(MS_2026_KICKOFF);
  const [picker, setPicker] = useState<null | { field: "topCzechGoalScorerId" | "topCzechPointsLeaderId" | "mostPenalizedCzechPlayerId"; title: string }>(null);

  const ensureDefaults = useCallback((p: BracketPickemPayload): BracketPickemPayload => {
    const aDefault = MS2026_GROUP_A_TEAMS.map((t) => t.id);
    const bDefault = MS2026_GROUP_B_TEAMS.map((t) => t.id);
    const bonus = (p as BracketPickemPayload).bonus ?? ({} as BracketPickemPayload["bonus"]);
    return {
      ...p,
      groupAOrder: Array.isArray(p.groupAOrder) && p.groupAOrder.length === aDefault.length ? p.groupAOrder : aDefault,
      groupBOrder: Array.isArray(p.groupBOrder) && p.groupBOrder.length === bDefault.length ? p.groupBOrder : bDefault,
      bonus: {
        topCzechGoalScorerId: bonus.topCzechGoalScorerId ?? "",
        topCzechPointsLeaderId: bonus.topCzechPointsLeaderId ?? "",
        mostPenalizedCzechPlayerId: bonus.mostPenalizedCzechPlayerId ?? "",
        czechTeamGoals: bonus.czechTeamGoals ?? "",
        czechTeamPim: bonus.czechTeamPim ?? "",
      },
    };
  }, []);

  useEffect(() => {
    if (authStatus !== "authenticated") {
      setContestLocked(false);
      return;
    }
    let cancelled = false;
    fetch("/api/pickem/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { contestSubmittedAt?: unknown } | null) => {
        if (cancelled || !d) return;
        setContestLocked(typeof d.contestSubmittedAt === "string" && d.contestSubmittedAt.length > 0);
      })
      .catch(() => {
        if (!cancelled) setContestLocked(false);
      });
    return () => {
      cancelled = true;
    };
  }, [authStatus]);

  // CZ hráči pro bonus tipy (výběr z DB kandidátů).
  useEffect(() => {
    fetch("/api/players")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("players fetch failed"))))
      .then((rows) => {
        const isPos = (x: unknown): x is Position => x === "G" || x === "D" || x === "F";
        const parsePlayer = (raw: unknown): Player | null => {
          if (!raw || typeof raw !== "object") return null;
          const r2 = raw as Record<string, unknown>;
          if (typeof r2.id !== "string") return null;
          if (typeof r2.name !== "string") return null;
          if (!isPos(r2.position)) return null;
          if (typeof r2.club !== "string") return null;
          if (typeof r2.league !== "string") return null;

          return {
            id: r2.id,
            name: r2.name,
            position: r2.position,
            role: typeof r2.role === "string" || r2.role === null ? r2.role : undefined,
            club: r2.club,
            league: r2.league,
            jerseyNumber: typeof r2.jerseyNumber === "number" || r2.jerseyNumber === null ? r2.jerseyNumber : undefined,
            imageUrl: typeof r2.imageUrl === "string" || r2.imageUrl === null ? r2.imageUrl : undefined,
            pick_rate: 0,
          };
        };

        const list = Array.isArray(rows)
          ? (rows as unknown[]).flatMap((x) => {
              const p = parsePlayer(x);
              return p ? [p] : [];
            })
          : [];
        setCzPlayers(list);
      })
      .catch(() => {
        // fallback: prázdno (stále lze vyplnit čísla), ale dropdown nebude mít data
        setCzPlayers([]);
      });
  }, []);

  useEffect(() => {
    if (initialPayload) {
      queueMicrotask(() => {
        setPicks(ensureDefaults(initialPayload));
        setHydrated(true);
      });
      return;
    }
    const z = searchParams.get("z");
    if (z) {
      const decoded = decodeBracketPayload(z);
      if (decoded) {
        queueMicrotask(() => {
            setPicks(ensureDefaults(decoded));
          setHydrated(true);
          toast.message("Tipy načteny z odkazu.");
        });
        return;
      }
      toast.error("Odkaz se nepodařilo načíst.");
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
          const parsed = JSON.parse(raw) as BracketPickemPayload;
          if (parsed && typeof parsed === "object") {
            queueMicrotask(() => setPicks(ensureDefaults(parsed)));
          }
      }
    } catch {
      /* ignore */
    }
    queueMicrotask(() => setHydrated(true));
  }, [searchParams, ensureDefaults, initialPayload]);

  // Načíst koncept z účtu (z /ucet/pickem nebo přímý link /bracket?loadAccount=1)
  useEffect(() => {
    const want = searchParams.get("loadAccount") === "1";
    if (!want) return;
    if (authStatus !== "authenticated") return;
    let cancelled = false;
    fetch("/api/pickem/me")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("pickem me fetch failed"))))
      .then((d: { payload?: unknown; contestSubmittedAt?: unknown }) => {
        if (cancelled) return;
        setContestLocked(typeof d.contestSubmittedAt === "string" && d.contestSubmittedAt.length > 0);
        const p = d.payload;
        if (p && typeof p === "object") {
          setPicks(ensureDefaults(p as BracketPickemPayload));
          setHydrated(true);
          toast.success("Pick’em koncept načten z účtu.");
        } else {
          toast.message("V účtu není uložený Pick’em koncept.");
        }
      })
      .catch(() => {
        if (!cancelled) toast.error("Nepodařilo se načíst Pick’em z účtu.");
      });
    return () => {
      cancelled = true;
    };
  }, [searchParams, authStatus, ensureDefaults]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(picks));
    } catch {
      /* ignore */
    }
  }, [picks, hydrated]);

  const setGroupOrder = (which: "A" | "B", next: string[]) => {
    setPicks((p) => (which === "A" ? { ...p, groupAOrder: next } : { ...p, groupBOrder: next }));
  };

  const computedQuarterfinals = useMemo(() => {
    const A = picks.groupAOrder;
    const B = picks.groupBOrder;
    const A1 = A[0] ?? null;
    const A2 = A[1] ?? null;
    const A3 = A[2] ?? null;
    const A4 = A[3] ?? null;
    const B1 = B[0] ?? null;
    const B2 = B[1] ?? null;
    const B3 = B[2] ?? null;
    const B4 = B[3] ?? null;
    // IIHF cross-over: 1A–4B, 2A–3B, 1B–4A, 2B–3A
    return [
      { teamLeft: A1, teamRight: B4 },
      { teamLeft: A2, teamRight: B3 },
      { teamLeft: B1, teamRight: A4 },
      { teamLeft: B2, teamRight: A3 },
    ] as const;
  }, [picks.groupAOrder, picks.groupBOrder]);

  const computedSemifinals = useMemo(() => {
    // IIHF po QF re-seeding: nejlepší semifinalista vs nejhorší (podle pozice ve skupině; v případě shody A před B).
    const A = picks.groupAOrder;
    const B = picks.groupBOrder;
    const pos = (id: string): { group: "A" | "B"; place: number } | null => {
      const ia = A.indexOf(id);
      if (ia >= 0) return { group: "A", place: ia + 1 };
      const ib = B.indexOf(id);
      if (ib >= 0) return { group: "B", place: ib + 1 };
      return null;
    };
    const seedKey = (id: string): [number, number] => {
      const p = pos(id);
      if (!p) return [99, 9];
      // menší = lepší (1..4); při shodě A před B (jen deterministicky)
      return [p.place, p.group === "A" ? 0 : 1];
    };

    const winners = picks.quarterfinals
      .map((m) => m.winner ?? null)
      .filter(Boolean) as string[];

    if (winners.length < 4) {
      return [
        { teamLeft: winners[0] ?? null, teamRight: winners[1] ?? null },
        { teamLeft: winners[2] ?? null, teamRight: winners[3] ?? null },
      ] as const;
    }

    const sorted = [...winners].sort((a, b) => {
      const ka = seedKey(a);
      const kb = seedKey(b);
      return ka[0] - kb[0] || ka[1] - kb[1];
    });
    return [
      { teamLeft: sorted[0] ?? null, teamRight: sorted[3] ?? null },
      { teamLeft: sorted[1] ?? null, teamRight: sorted[2] ?? null },
    ] as const;
  }, [picks.quarterfinals, picks.groupAOrder, picks.groupBOrder]);

  const computedFinal = useMemo(() => {
    const w = picks.semifinals.map((m) => m.winner ?? null);
    return { teamLeft: w[0] ?? null, teamRight: w[1] ?? null };
  }, [picks.semifinals]);

  const computedBronze = useMemo(() => {
    const loser = (m: BracketMatchPick) => {
      if (!m.teamLeft || !m.teamRight || !m.winner) return null;
      return m.winner === m.teamLeft ? m.teamRight : m.teamLeft;
    };
    return { teamLeft: loser(picks.semifinals[0]), teamRight: loser(picks.semifinals[1]) };
  }, [picks.semifinals]);

  // Když se změní pořadí skupin, přepočítej dvojice QF a smaž neplatné vítěze.
  useEffect(() => {
    if (!hydrated) return;
    setPicks((p) => {
      const nextQf = p.quarterfinals.map((m, i) => {
        const base = computedQuarterfinals[i];
        const merged: BracketMatchPick = { ...m, teamLeft: base?.teamLeft ?? null, teamRight: base?.teamRight ?? null };
        return normalizeWinner(merged);
      });
      return { ...p, quarterfinals: nextQf };
    });
  }, [computedQuarterfinals, hydrated]);

  // QF winners → SF teams
  useEffect(() => {
    if (!hydrated) return;
    setPicks((p) => {
      const nextSf = p.semifinals.map((m, i) => {
        const base = computedSemifinals[i];
        const merged: BracketMatchPick = { ...m, teamLeft: base?.teamLeft ?? null, teamRight: base?.teamRight ?? null };
        return normalizeWinner(merged);
      });
      return { ...p, semifinals: nextSf };
    });
  }, [computedSemifinals, hydrated]);

  // SF winners → Final + Bronze teams
  useEffect(() => {
    if (!hydrated) return;
    setPicks((p) => {
      const nextFinal = normalizeWinner({ ...p.final, teamLeft: computedFinal.teamLeft, teamRight: computedFinal.teamRight });
      const nextBronze = normalizeWinner({ ...p.bronze, teamLeft: computedBronze.teamLeft, teamRight: computedBronze.teamRight });
      return { ...p, final: nextFinal, bronze: nextBronze };
    });
  }, [computedFinal, computedBronze, hydrated]);

  const setQuarter = (index: number, m: BracketMatchPick) => {
    setPicks((p) => {
      const quarterfinals = [...p.quarterfinals];
      quarterfinals[index] = m;
      return { ...p, quarterfinals };
    });
  };

  const setSemi = (index: number, m: BracketMatchPick) => {
    setPicks((p) => {
      const semifinals = [...p.semifinals];
      semifinals[index] = m;
      return { ...p, semifinals };
    });
  };

  const setFinal = (m: BracketMatchPick) => setPicks((p) => ({ ...p, final: m }));
  const setBronze = (m: BracketMatchPick) => setPicks((p) => ({ ...p, bronze: m }));

  const setBonus = (key: keyof BracketPickemPayload["bonus"], value: string) => {
    setPicks((p) => ({ ...p, bonus: { ...p.bonus, [key]: value } }));
  };

  const playerNameById = useMemo(() => new Map(czPlayers.map((p) => [p.id, p.name] as const)), [czPlayers]);

  const isPickemComplete = useMemo(() => {
    const groupsOk =
      picks.groupAOrder.length === MS2026_GROUP_A_TEAMS.length &&
      picks.groupBOrder.length === MS2026_GROUP_B_TEAMS.length;
    const qfOk = picks.quarterfinals.every((m) => Boolean(m.winner));
    const sfOk = picks.semifinals.every((m) => Boolean(m.winner));
    const finOk = Boolean(picks.final.winner);
    const bronzOk = Boolean(picks.bronze.winner);
    const b = picks.bonus;
    const bonusOk =
      Boolean(b.topCzechGoalScorerId?.trim()) &&
      Boolean(b.topCzechPointsLeaderId?.trim()) &&
      Boolean(b.mostPenalizedCzechPlayerId?.trim()) &&
      b.czechTeamGoals.trim() !== "" &&
      b.czechTeamPim.trim() !== "";
    return groupsOk && qfOk && sfOk && finOk && bronzOk && bonusOk;
  }, [picks]);

  const ensurePickemTitle = useCallback((): string | null => {
    const t = pickemTitle.trim();
    if (t) return t;
    const ok = window.confirm("Přejete si pokračovat bez vyplnění jména?");
    if (!ok) return null;
    try {
      const key = "lineup:autoTitle:pickem";
      const raw = window.localStorage.getItem(key);
      const n = Math.max(0, Number.parseInt(raw ?? "0", 10) || 0) + 1;
      window.localStorage.setItem(key, String(n));
      const generated = `Pickem ${n}`;
      setPickemTitle(generated);
      return generated;
    } catch {
      const generated = "Pickem";
      setPickemTitle(generated);
      return generated;
    }
  }, [pickemTitle]);

  const confirmIfIncomplete = useCallback(() => {
    if (isPickemComplete) return true;
    return window.confirm(
      "Pick’em nemá vyplněné všechny části (pořadí ve skupinách, vyřazovací pavouk nebo bonusové tipy). Opravdu chcete pokračovat?"
    );
  }, [isPickemComplete]);

  const copyLink = useCallback(() => {
    if (!confirmIfIncomplete()) return;
    const title = ensurePickemTitle();
    if (!title) return;
    fetch("/api/pickem/share-links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, payload: picks }),
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("share failed"))))
      .then((d: { url?: unknown; path?: unknown; code?: unknown }) => {
        const origin = typeof window !== "undefined" ? window.location.origin : "";
        const url =
          typeof d.url === "string"
            ? d.url
            : typeof d.path === "string"
              ? `${origin}${d.path}`
              : typeof d.code === "string"
                ? `${origin}/p/${encodeURIComponent(d.code)}`
                : "";
        if (!url) throw new Error("no url");
        return navigator.clipboard.writeText(url).then(() => url);
      })
      .then(() => toast.success("Krátký odkaz zkopírován — pošli ho sobě nebo kamarádům."))
      .catch(() => {
        // fallback: dlouhý link
        const z = encodeBracketPayload(picks);
        const url = `${typeof window !== "undefined" ? window.location.origin : ""}/bracket?z=${z}`;
        navigator.clipboard.writeText(url).then(
          () => toast.success("Odkaz zkopírován (fallback) — pošli ho sobě nebo kamarádům."),
          () =>
            toast.error("Schránka nedostupná — zkopíruj URL ručně z adresního řádku po kliknutí sem.", {
              duration: 5000,
            })
        );
      });
  }, [picks, confirmIfIncomplete, ensurePickemTitle]);

  const submitPickem = useCallback(async () => {
    if (authStatus !== "authenticated") {
      toast.error("Abyste se mohli odeslat Pickem do soutěže nebo si uložit jeho koncept, musíte se přihlásit.");
      return;
    }
    if (contestLocked) {
      toast.error("Pick’em už máte v soutěži — uložený koncept na serveru už nejde měnit.");
      return;
    }
    if (!confirmIfIncomplete()) return;
    if (submitting) return;
    setSubmitting(true);
    try {
      const r = await fetch("/api/pickem/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(picks),
      });
      const data: unknown = await r.json().catch(() => null);
      const apiError =
        data && typeof data === "object" && "error" in data && typeof (data as { error?: unknown }).error === "string"
          ? (data as { error: string }).error
          : null;
      if (!r.ok) {
        toast.error(apiError ?? "Odeslání se nepovedlo.");
        return;
      }
      toast.success("Pick’em odeslán a uložen k účtu.");
    } catch {
      toast.error("Odeslání se nepovedlo.");
    } finally {
      setSubmitting(false);
    }
  }, [authStatus, picks, submitting, confirmIfIncomplete, contestLocked]);

  const submitPickemToContest = useCallback(async () => {
    if (authStatus !== "authenticated") {
      toast.error("Abyste se mohli odeslat Pickem do soutěže nebo si uložit jeho koncept, musíte se přihlásit.");
      return;
    }
    if (contestLocked) {
      toast.error("Do soutěže už máte Pick’em jednou odeslaný.");
      return;
    }
    if (!confirmIfIncomplete()) return;
    if (submitting) return;
    setSubmitting(true);
    try {
      const r = await fetch("/api/pickem/contest-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(picks),
      });
      const data: unknown = await r.json().catch(() => null);
      const apiError =
        data && typeof data === "object" && "error" in data && typeof (data as { error?: unknown }).error === "string"
          ? (data as { error: string }).error
          : null;
      if (!r.ok) {
        toast.error(apiError ?? "Odeslání do soutěže se nepovedlo.");
        return;
      }
      setContestLocked(true);
      toast.success("Pick’em odeslán do soutěže.");
    } catch {
      toast.error("Odeslání do soutěže se nepovedlo.");
    } finally {
      setSubmitting(false);
    }
  }, [authStatus, picks, submitting, confirmIfIncomplete, contestLocked]);

  const resetAll = () => {
    if (contestLocked) {
      toast.error("Po odeslání do soutěže už tipy z účtu nelze v tomto rozhraní vymazat.");
      return;
    }
    setPicks(clonePicks(EMPTY_BRACKET_PICKEM));
    toast.message("Formulář vyprázdněn.");
  };

  return (
    <main className="relative z-10 mx-auto max-w-6xl px-4 pb-14 pt-2 sm:px-6 sm:pb-20">
      <SitePageHero
        title="Bracket Pick’em"
        subtitle="Vítejte v Pick'emu pro MS v hokeji 2026. Zde si můžete tipnout pořadí skupin, výsledky play off a také vyzkoušet bonusové tipy. Žebříček nejlepších tiperů bude zveřejněn na našem webu."
        align="center"
      />

      <div className="pickem-panel mt-6 overflow-hidden rounded-3xl p-5 ring-1 ring-sky-400/15 shadow-[0_24px_80px_rgba(0,0,0,0.35)] sm:p-6">
        <div
          className="pointer-events-none absolute inset-x-0 -mt-5 h-20 bg-[radial-gradient(ellipse_at_30%_0%,rgba(56,189,248,0.22),transparent_60%)]"
          aria-hidden
        />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400/25 via-sky-500/10 to-[#003087]/40 ring-1 ring-sky-300/20">
              <FlagIcon id="CZE" className="h-7 w-7" />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.26em] text-sky-200/75">MS v hokeji 2026</p>
              <p className="mt-1 text-sm font-semibold text-white/85">
                Start: <span className="font-black text-white">{formatCsDate(MS_2026_KICKOFF)}</span>
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.26em] text-white/50">Odpočet</p>
            {!cd ? (
              <p className="mt-2 text-sm text-white/45">Načítám…</p>
            ) : cd.ended ? (
              <p className="mt-2 font-display text-lg font-black text-white">MS je tady</p>
            ) : (
              <div className="mt-2 grid grid-cols-4 gap-2">
                {[
                  { v: cd.d, l: "dní" },
                  { v: cd.h, l: "hod" },
                  { v: cd.m, l: "min" },
                  { v: cd.s, l: "sek" },
                ].map((x) => (
                  <div key={x.l} className="rounded-xl border border-white/10 bg-black/25 px-2 py-2">
                    <div className="font-display text-lg font-black tabular-nums text-white">{x.v}</div>
                    <div className="text-[9px] font-semibold uppercase tracking-[0.22em] text-sky-200/70">{x.l}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {authStatus !== "authenticated" ? (
        <div className="pickem-panel mt-6 rounded-2xl p-5 text-center ring-1 ring-[#003087]/25">
          <p className="text-sm text-white/75">
            Abyste se mohli odeslat Pickem do soutěže nebo si uložit jeho koncept, musíte se přihlásit.
          </p>
          <button
            type="button"
            onClick={() => signIn(undefined, { callbackUrl: "/bracket" })}
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#003087] via-[#002a5c] to-[#c8102e] px-6 py-3 font-display text-sm font-bold text-white shadow-[0_12px_40px_rgba(0,48,135,0.35),0_0_32px_rgba(200,16,46,0.15)] transition hover:brightness-110"
          >
            Přihlásit se
          </button>
        </div>
      ) : null}

      <div className="space-y-8">
        <Section
          title="Pořadí ve skupinách"
          hint={`Oficiální skupiny IIHF MS 2026. Přetáhni týmy a nastav pořadí ve skupině A (${MS2026_GROUP_A_VENUE}) a skupině B (${MS2026_GROUP_B_VENUE}).`}
        >
          <div className="grid gap-6 sm:grid-cols-2">
            {isMobile ? (
              <GroupOrderTap
                title="Skupina A"
                venue={MS2026_GROUP_A_VENUE}
                order={picks.groupAOrder}
                teamById={teamById}
                onChange={(next) => setGroupOrder("A", next)}
              />
            ) : (
              <GroupOrderDnd
                title="Skupina A"
                venue={MS2026_GROUP_A_VENUE}
                order={picks.groupAOrder}
                teamById={teamById}
                onChange={(next) => setGroupOrder("A", next)}
              />
            )}
            {isMobile ? (
              <GroupOrderTap
                title="Skupina B"
                venue={MS2026_GROUP_B_VENUE}
                order={picks.groupBOrder}
                teamById={teamById}
                onChange={(next) => setGroupOrder("B", next)}
              />
            ) : (
              <GroupOrderDnd
                title="Skupina B"
                venue={MS2026_GROUP_B_VENUE}
                order={picks.groupBOrder}
                teamById={teamById}
                onChange={(next) => setGroupOrder("B", next)}
              />
            )}
          </div>
        </Section>

        <Section
          title="Play‑off pavouk"
          hint="Dle IIHF se čtvrtfinále hraje cross-over (1A–4B, 2A–3B, 1B–4A, 2B–3A) a po čtvrtfinále se semifinalisti re-seedují (nejlepší vs nejhorší). Klikni na tým, který postupuje."
        >
          {isMobile ? (
            <MobileRoundSnap
              quarterfinals={picks.quarterfinals}
              semifinals={picks.semifinals}
              finalMatch={picks.final}
              bronzeMatch={picks.bronze}
              teamById={teamById}
              onPickQf={(i, winner) => setQuarter(i, { ...picks.quarterfinals[i], winner })}
              onPickSf={(i, winner) => setSemi(i, { ...picks.semifinals[i], winner })}
              onPickFinal={(winner) => setFinal({ ...picks.final, winner })}
              onPickBronze={(winner) => setBronze({ ...picks.bronze, winner })}
            />
          ) : (
            <DesktopBracketLayout
              quarterfinals={picks.quarterfinals}
              semifinals={picks.semifinals}
              finalMatch={picks.final}
              bronzeMatch={picks.bronze}
              teamById={teamById}
              onPickQf={(i, winner) => setQuarter(i, { ...picks.quarterfinals[i], winner })}
              onPickSf={(i, winner) => setSemi(i, { ...picks.semifinals[i], winner })}
              onPickFinal={(winner) => setFinal({ ...picks.final, winner })}
              onPickBronze={(winner) => setBronze({ ...picks.bronze, winner })}
            />
          )}
          <p className="text-xs text-white/45">
            {MS2026_QF_LABELS.map((l, i) => (
              <span key={l}>
                <span className="font-semibold text-white/60">QF{i + 1}:</span> {l}
                {i < MS2026_QF_LABELS.length - 1 ? " · " : ""}
              </span>
            ))}
          </p>
        </Section>

        <Section
          title="Bonusové tipy"
          hint="Vyhodnocení jde udělat jen z českých hráčů + týmových součtů (bez databáze všech hráčů světa)."
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <p className="text-xs font-medium text-white/65">Nejlepší český střelec (CZ hráč)</p>
              <button
                type="button"
                onClick={() => setPicker({ field: "topCzechGoalScorerId", title: "Nejlepší český střelec" })}
                className="mt-1 flex w-full items-center justify-between gap-3 rounded-xl border border-white/14 bg-white/[0.07] px-3 py-2.5 text-left text-sm text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:border-white/20"
              >
                <span className="min-w-0 truncate">
                  {picks.bonus.topCzechGoalScorerId
                    ? playerNameById.get(picks.bonus.topCzechGoalScorerId) ?? "Vybraný hráč"
                    : "— vyber hráče —"}
                </span>
                <span className="shrink-0 text-[11px] font-bold uppercase tracking-[0.22em] text-sky-200/75">
                  Vybrat
                </span>
              </button>
            </div>
            <button
              type="button"
              onClick={() => setBonus("topCzechGoalScorerId", "")}
              className="self-end rounded-xl border border-white/14 bg-white/[0.06] px-3 py-2.5 text-sm font-semibold text-white/80 hover:bg-white/[0.1]"
            >
              Vymazat
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <p className="text-xs font-medium text-white/65">Nejlepší český hráč v bodování (CZ hráč)</p>
              <button
                type="button"
                onClick={() => setPicker({ field: "topCzechPointsLeaderId", title: "Nejlepší český hráč v bodování" })}
                className="mt-1 flex w-full items-center justify-between gap-3 rounded-xl border border-white/14 bg-white/[0.07] px-3 py-2.5 text-left text-sm text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:border-white/20"
              >
                <span className="min-w-0 truncate">
                  {picks.bonus.topCzechPointsLeaderId
                    ? playerNameById.get(picks.bonus.topCzechPointsLeaderId) ?? "Vybraný hráč"
                    : "— vyber hráče —"}
                </span>
                <span className="shrink-0 text-[11px] font-bold uppercase tracking-[0.22em] text-sky-200/75">
                  Vybrat
                </span>
              </button>
            </div>
            <button
              type="button"
              onClick={() => setBonus("topCzechPointsLeaderId", "")}
              className="self-end rounded-xl border border-white/14 bg-white/[0.06] px-3 py-2.5 text-sm font-semibold text-white/80 hover:bg-white/[0.1]"
            >
              Vymazat
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <p className="text-xs font-medium text-white/65">Nejtrestanější český hráč (PIM) (CZ hráč)</p>
              <button
                type="button"
                onClick={() => setPicker({ field: "mostPenalizedCzechPlayerId", title: "Nejtrestanější český hráč (PIM)" })}
                className="mt-1 flex w-full items-center justify-between gap-3 rounded-xl border border-white/14 bg-white/[0.07] px-3 py-2.5 text-left text-sm text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:border-white/20"
              >
                <span className="min-w-0 truncate">
                  {picks.bonus.mostPenalizedCzechPlayerId
                    ? playerNameById.get(picks.bonus.mostPenalizedCzechPlayerId) ?? "Vybraný hráč"
                    : "— vyber hráče —"}
                </span>
                <span className="shrink-0 text-[11px] font-bold uppercase tracking-[0.22em] text-sky-200/75">
                  Vybrat
                </span>
              </button>
            </div>
            <button
              type="button"
              onClick={() => setBonus("mostPenalizedCzechPlayerId", "")}
              className="self-end rounded-xl border border-white/14 bg-white/[0.06] px-3 py-2.5 text-sm font-semibold text-white/80 hover:bg-white/[0.1]"
            >
              Vymazat
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-xs font-medium text-white/65">
              Počet gólů českého týmu
              <select
                className={selectCls}
                value={picks.bonus.czechTeamGoals}
                onChange={(e) => setBonus("czechTeamGoals", e.target.value)}
              >
                <option value="">—</option>
                {Array.from({ length: 61 }, (_, i) => String(i)).map((v) => (
                  <option key={`g-${v}`} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-xs font-medium text-white/65">
              Počet trestných minut českého týmu
              <select
                className={selectCls}
                value={picks.bonus.czechTeamPim}
                onChange={(e) => setBonus("czechTeamPim", e.target.value)}
              >
                <option value="">—</option>
                {Array.from({ length: 101 }, (_, i) => String(i * 2)).map((v) => (
                  <option key={`p-${v}`} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </Section>
      </div>

      <PickemPlayerPicker
        open={picker !== null}
        title={picker?.title ?? ""}
        players={czPlayers}
        value={
          picker?.field === "topCzechGoalScorerId"
            ? picks.bonus.topCzechGoalScorerId
            : picker?.field === "topCzechPointsLeaderId"
              ? picks.bonus.topCzechPointsLeaderId
              : picker?.field === "mostPenalizedCzechPlayerId"
                ? picks.bonus.mostPenalizedCzechPlayerId
                : ""
        }
        onSelect={(id) => {
          if (!picker) return;
          setBonus(picker.field, id);
        }}
        onClose={() => setPicker(null)}
      />

      {authStatus === "authenticated" && contestLocked ? (
        <div
          className="pickem-panel mt-10 rounded-2xl border border-emerald-400/25 bg-emerald-500/[0.07] p-5 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:p-6"
          role="status"
        >
          <p className="text-sm font-semibold text-emerald-100">
            Pick’em máte jednou odeslaný do soutěže — uložený tip na serveru je finální a nelze ho měnit ani znovu
            odeslat.
          </p>
          <p className="mt-2 text-xs text-emerald-100/75">
            Stále si můžeš zkopírovat odkaz s aktuálním stavem tipů v prohlížeči (nemění uložený soutěžní tip).
          </p>
        </div>
      ) : null}

      <div className="pickem-panel mt-10 flex flex-col items-center gap-3 rounded-2xl p-6 text-center ring-1 ring-[#00E5FF]/18 shadow-[0_0_48px_rgba(0,229,255,0.06)]">
        <Trophy className="h-8 w-8 text-[#00E5FF]/85" aria-hidden />
        <p className="text-sm text-white/78">
          Hotovo? Ulož si koncept k účtu nebo tipy odešli do soutěže.
        </p>
        <label className="w-full max-w-xl text-left text-xs font-medium text-white/65">
          Název Pick’em <span className="font-normal text-white/35">(volitelné)</span>
          <input
            className={inputCls}
            value={pickemTitle}
            onChange={(e) => setPickemTitle(e.target.value)}
            maxLength={80}
            placeholder="např. Konzervativní varianta"
            autoComplete="off"
          />
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={submitPickem}
            disabled={submitting || contestLocked}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF1E2E] px-6 py-3.5 font-display text-sm font-black uppercase tracking-[0.08em] text-white shadow-[0_14px_44px_rgba(255,30,46,0.26)] transition hover:brightness-110 disabled:opacity-60"
          >
            {submitting ? "Ukládám…" : contestLocked ? "Koncept uzamčen" : "Uložit koncept"}
          </button>
          <button
            type="button"
            onClick={submitPickemToContest}
            disabled={submitting || contestLocked}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#00E5FF]/35 bg-white/[0.04] px-5 py-3.5 text-sm font-semibold text-white/90 shadow-[0_0_0_1px_rgba(0,229,255,0.10)] transition hover:bg-white/[0.07] hover:border-[#00E5FF]/55 disabled:opacity-60"
          >
            {submitting ? "Odesílám…" : contestLocked ? "V soutěži odesláno" : "Odeslat do soutěže"}
          </button>
          <button
            type="button"
            onClick={copyLink}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#00E5FF]/30 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white/90 shadow-[0_0_0_1px_rgba(0,229,255,0.08)] transition hover:bg-white/[0.07] hover:border-[#00E5FF]/50"
          >
            <Link2 className="h-4 w-4" aria-hidden />
            Zkopírovat odkaz s tipy
          </button>
          <button
            type="button"
            onClick={resetAll}
            disabled={contestLocked}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/14 bg-white/[0.06] px-5 py-3 text-sm font-semibold text-white/88 transition hover:border-[#FF1E2E]/40 hover:bg-[#FF1E2E]/[0.07] disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" aria-hidden />
            Vymazat
          </button>
        </div>
        <p className="text-xs text-white/50">
          Chceš nominovat hráče?{" "}
          <Link href="/sestava" className="font-semibold text-cyan-300 underline-offset-2 hover:underline">
            Editor sestavy nominace
          </Link>
        </p>
      </div>
    </main>
  );
}
