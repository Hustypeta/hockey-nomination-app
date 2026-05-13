"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Plus } from "lucide-react";
import { FlagMark } from "@/components/flags/FlagMark";
import { msFantasyLineupCardLastName } from "@/lib/msFantasyDisplayName";
import type { MsFantasyRosterPlayer } from "./MsFantasyDayEditor";
import { MsFantasyPlayerAvatar } from "./MsFantasyPlayerAvatar";

const SLOT_G = 0;
const SLOTS_D = [1, 2] as const;
const SLOTS_F = [3, 4, 5] as const;

/** Nádech repre na kartě (IOC / běžné kódy fantasy poolu). */
const TEAM_ACCENT: Record<string, { from: string; to: string; ring: string }> = {
  AUT: { from: "#ef4444", to: "#7f1d1d", ring: "rgba(239,68,68,0.45)" },
  CZE: { from: "#2563eb", to: "#1e3a8a", ring: "rgba(37,99,235,0.45)" },
  SUI: { from: "#dc2626", to: "#7f1d1d", ring: "rgba(220,38,38,0.4)" },
  CAN: { from: "#b91c1c", to: "#450a0a", ring: "rgba(185,28,28,0.45)" },
  USA: { from: "#1d4ed8", to: "#172554", ring: "rgba(29,78,216,0.45)" },
  SWE: { from: "#0ea5e9", to: "#0c4a6e", ring: "rgba(14,165,233,0.4)" },
  FIN: { from: "#0284c7", to: "#0c4a6e", ring: "rgba(2,132,199,0.4)" },
  GER: { from: "#eab308", to: "#713f12", ring: "rgba(234,179,8,0.45)" },
  SVK: { from: "#0369a1", to: "#0c4a6e", ring: "rgba(3,105,161,0.4)" },
  LAT: { from: "#7c3aed", to: "#312e81", ring: "rgba(124,58,237,0.35)" },
  DEN: { from: "#b91c1c", to: "#7f1d1d", ring: "rgba(185,28,28,0.35)" },
  ITA: { from: "#059669", to: "#064e3b", ring: "rgba(5,150,105,0.35)" },
  NOR: { from: "#dc2626", to: "#1e3a8a", ring: "rgba(220,38,38,0.35)" },
  SLO: { from: "#2563eb", to: "#172554", ring: "rgba(37,99,235,0.35)" },
  GBR: { from: "#64748b", to: "#0f172a", ring: "rgba(100,116,139,0.35)" },
};

function teamAccent(team: string) {
  const t = TEAM_ACCENT[team];
  if (t) return t;
  let h = 0;
  for (let i = 0; i < team.length; i++) h = (h * 31 + team.charCodeAt(i)) >>> 0;
  const hue = h % 320;
  return {
    from: `hsl(${hue} 72% 48%)`,
    to: `hsl(${(hue + 40) % 360} 65% 22%)`,
    ring: `hsla(${hue}, 70%, 50%, 0.35)`,
  };
}

type MsFantasyIceRinkProps = {
  slots: Array<MsFantasyRosterPlayer | null>;
  activeIx: number;
  isLocked: boolean;
  onSelectSlot: (index: number) => void;
  onClearSlot: (index: number) => void;
  /** Stejné hodnoty jako v hlavičce editoru — žádný rozpor „0 / 165“ vs. skutečný stav. */
  salaryUsed: number;
  salaryCap: number;
  salaryOverCap: boolean;
};

function IceNoiseOverlay({ filterId }: { filterId: string }) {
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.055]" aria-hidden>
      <defs>
        <filter id={filterId} x="0%" y="0%" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" result="n" />
          <feColorMatrix in="n" type="saturate" values="0" result="g" />
          <feComponentTransfer in="g" result="a">
            <feFuncA type="linear" slope="0.35" />
          </feComponentTransfer>
        </filter>
      </defs>
      <rect width="100%" height="100%" filter={`url(#${filterId})`} />
    </svg>
  );
}

/** SVG: čáry a kruhy na ledu. */
function RinkMarkings({ patternId }: { patternId: string }) {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full text-[#c8102e]"
      viewBox="0 0 100 130"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <linearGradient id={`${patternId}-shine`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.65)" />
          <stop offset="38%" stopColor="rgba(255,255,255,0)" />
          <stop offset="100%" stopColor="rgba(0,60,90,0.05)" />
        </linearGradient>
        <pattern id={patternId} width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(-18)">
          <path d="M0 6h14" stroke="rgba(255,255,255,0.14)" strokeWidth="0.35" />
          <path d="M4 0v14" stroke="rgba(0,80,120,0.06)" strokeWidth="0.25" />
        </pattern>
      </defs>
      <rect x="0" y="0" width="100" height="130" fill={`url(#${patternId})`} opacity="0.5" />
      <rect x="0" y="0" width="100" height="22" fill="rgba(0,48,135,0.06)" />
      <rect x="0" y="52" width="100" height="26" fill="rgba(0,48,135,0.04)" />
      <line x1="0" y1="65" x2="100" y2="65" stroke="currentColor" strokeWidth="1.15" />
      <line x1="0" y1="38" x2="100" y2="38" stroke="#1d4ed8" strokeWidth="0.85" opacity="0.72" />
      <line x1="0" y1="92" x2="100" y2="92" stroke="#1d4ed8" strokeWidth="0.85" opacity="0.72" />
      <circle cx="22" cy="32" r="9" fill="none" stroke="rgba(200,16,46,0.32)" strokeWidth="0.55" />
      <circle cx="78" cy="32" r="9" fill="none" stroke="rgba(200,16,46,0.32)" strokeWidth="0.55" />
      <circle cx="22" cy="98" r="9" fill="none" stroke="rgba(200,16,46,0.32)" strokeWidth="0.55" />
      <circle cx="78" cy="98" r="9" fill="none" stroke="rgba(200,16,46,0.32)" strokeWidth="0.55" />
      <circle cx="50" cy="65" r="5.5" fill="none" stroke="rgba(200,16,46,0.42)" strokeWidth="0.5" />
      <path
        d="M 28 118 A 22 14 0 0 0 72 118"
        fill="rgba(0,48,135,0.05)"
        stroke="rgba(0,48,135,0.18)"
        strokeWidth="0.5"
      />
      <g opacity="0.35" stroke="rgba(255,255,255,0.35)" strokeWidth="0.22" fill="none" strokeLinecap="round">
        <path d="M12 88 Q 22 82 30 90" />
        <path d="M68 42 Q 78 36 88 44" />
        <path d="M40 24 Q 48 18 58 26" />
        <path d="M18 52 L 26 48" />
        <path d="M74 72 L 82 78" />
      </g>
      <rect x="0" y="0" width="100" height="130" fill={`url(#${patternId}-shine)`} />
    </svg>
  );
}

function ArenaBackdrop() {
  return (
    <>
      <div
        className="ms-fantasy-arena-lights absolute -inset-[18%] opacity-90"
        style={{
          background: `
            radial-gradient(ellipse 55% 45% at 20% 30%, rgba(200, 16, 46, 0.35), transparent 62%),
            radial-gradient(ellipse 50% 40% at 78% 22%, rgba(0, 180, 255, 0.28), transparent 58%),
            radial-gradient(ellipse 70% 55% at 50% 100%, rgba(15, 23, 42, 0.95), transparent 55%),
            radial-gradient(ellipse 80% 60% at 50% 0%, rgba(30, 58, 95, 0.55), transparent 50%),
            linear-gradient(185deg, #0a0f1a 0%, #050810 45%, #020308 100%)
          `,
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.22] mix-blend-screen"
        style={{
          background:
            "repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 6px)",
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_120%,rgba(0,0,0,0.55),transparent_55%)]" />
    </>
  );
}

function RinkSalaryStrip({ used, cap, over }: { used: number; cap: number; over: boolean }) {
  const pct = Math.min(100, Math.round((used / cap) * 1000) / 10);
  const grad = over
    ? "from-red-500 via-red-400 to-rose-600"
    : pct >= 95
      ? "from-amber-400 via-amber-300 to-orange-500"
      : "from-sky-500 via-[#00B4FF] to-cyan-400";

  return (
    <div className="pointer-events-none absolute left-2 right-2 top-2 z-20 flex items-center gap-3 rounded-xl border border-slate-900/45 bg-slate-950/72 px-2.5 py-2 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-md sm:left-4 sm:right-4 sm:top-3 sm:px-3.5">
      <div className="shrink-0">
        <p className="font-display text-[0.5rem] font-bold uppercase tracking-[0.16em] text-slate-400 sm:text-[0.55rem] sm:tracking-[0.18em]">
          Platový strop
        </p>
        <p className="font-mono text-xs font-bold tabular-nums text-white sm:text-sm">
          <span className={over ? "text-red-300" : "text-[#9ae9ff]"}>{used}</span>
          <span className="text-slate-500"> / </span>
          <span className="text-slate-400">{cap}</span>
        </p>
      </div>
      <div className="min-w-0 flex-1 pt-0.5">
        <div className="h-1.5 overflow-hidden rounded-full bg-black/55 ring-1 ring-white/10 sm:h-2">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${grad} shadow-[0_0_12px_rgba(0,212,255,0.25)] transition-[width] duration-500 ease-out`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function PositionBadge({ label, compact = false }: { label: string; compact?: boolean }) {
  return (
    <span
      className={[
        "relative font-display font-bold uppercase tracking-[0.18em] text-white/95 shadow-[0_4px_14px_rgba(0,0,0,0.35)]",
        compact
          ? "px-2 py-0.5 text-[0.48rem] tracking-[0.1em] sm:px-2.5 sm:py-1 sm:text-[0.52rem]"
          : "px-2.5 py-1 text-[0.55rem] tracking-[0.14em] sm:px-3 sm:py-1.5 sm:text-[0.6rem] sm:tracking-[0.16em]",
      ].join(" ")}
      style={{
        clipPath: "polygon(6% 0, 94% 0, 100% 14%, 100% 86%, 94% 100%, 6% 100%, 0 86%, 0 14%)",
        background:
          "linear-gradient(165deg, rgba(15,23,42,0.95) 0%, rgba(30,41,59,0.92) 40%, rgba(15,23,42,0.98) 100%)",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.12), 0 0 0 1px rgba(0,212,255,0.22), 0 0 20px rgba(0,180,255,0.12)",
      }}
    >
      <span className="absolute inset-x-2 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/50 to-transparent" />
      {label}
    </span>
  );
}

function EmptySlotCard({ selected, disabled, reduceMotion }: { selected: boolean; disabled: boolean; reduceMotion: boolean }) {
  return (
    <div
      className={[
        "relative flex min-h-[6.5rem] w-[6.1rem] flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed px-1.5 py-2 shadow-inner backdrop-blur-[3px] transition sm:min-h-[6.85rem] sm:w-[6.55rem]",
        "border-cyan-400/45 bg-gradient-to-b from-white/40 via-cyan-50/25 to-sky-100/20",
        selected ? "border-[#00d4ff] from-cyan-100/55 ring-2 ring-[#00B4FF]/70 ring-offset-[2px] ring-offset-sky-100/90 shadow-[0_0_22px_rgba(0,212,255,0.32)]" : "",
        !reduceMotion ? "ms-fantasy-empty-pulse" : "",
        disabled ? "opacity-55" : "",
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(0,212,255,0.2),transparent_55%)]" />
      <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#00B4FF] to-[#0066a3] text-white shadow-[0_0_20px_rgba(0,180,255,0.5),inset_0_1px_0_rgba(255,255,255,0.35)] ring-2 ring-white/45 sm:h-11 sm:w-11">
        <Plus className="h-5 w-5 stroke-[2.5] sm:h-[1.35rem] sm:w-[1.35rem]" aria-hidden />
      </span>
      <span className="relative mt-1.5 text-center text-[0.62rem] font-bold uppercase tracking-[0.1em] text-slate-700 sm:text-[0.65rem]">
        Přidat
      </span>
    </div>
  );
}

function FilledPlayerCard({
  slot,
  positionLabel,
  selected,
  disabled,
  reduceMotion,
}: {
  slot: MsFantasyRosterPlayer;
  positionLabel: string;
  selected: boolean;
  disabled: boolean;
  reduceMotion: boolean;
}) {
  const ac = teamAccent(slot.team);
  const last = msFantasyLineupCardLastName(slot.name);

  const card = (
    <div
      className={[
        "relative flex min-h-[6.85rem] w-[6.2rem] flex-col rounded-xl border px-1.5 pb-1.5 pt-1.5 shadow-[0_18px_40px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.18)] sm:min-h-[7.35rem] sm:w-[6.65rem] sm:px-2 sm:pb-2 sm:pt-2",
        "border-white/25 bg-gradient-to-b from-slate-800/98 via-slate-900 to-[#030712]",
        selected ? "ring-[2px] ring-[#00e5ff] ring-offset-[2px] ring-offset-sky-100/95" : "ring-1 ring-white/10",
        disabled ? "opacity-55" : "",
      ].join(" ")}
      style={{ boxShadow: selected ? `0 0 28px ${ac.ring}, 0 18px 40px rgba(0,0,0,0.55)` : undefined }}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-xl opacity-95"
        style={{
          background: `radial-gradient(120% 85% at 50% -15%, ${ac.ring}, transparent 52%), radial-gradient(90% 70% at 100% 100%, rgba(0,48,135,0.22), transparent 48%)`,
        }}
      />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col items-center px-0.5 pt-0.5">
        <MsFantasyPlayerAvatar playerId={slot.id} variant="circle" frame="premium" size="2.55rem" />

        <div className="mt-1 flex w-full max-w-[5.75rem] items-center justify-center gap-1 sm:max-w-[6.1rem]">
          <p className="truncate text-center text-[0.7rem] font-bold leading-tight text-white sm:text-[0.76rem]">{last}</p>
          <FlagMark code={slot.team} className="h-2.5 w-3.5 shrink-0 rounded-sm ring-1 ring-white/30 sm:h-3 sm:w-4" />
        </div>

        <div className="mt-auto flex w-full justify-center pt-1">
          <PositionBadge label={positionLabel} compact />
        </div>
      </div>
    </div>
  );

  if (reduceMotion) return card;

  return (
    <motion.div
      key={slot.id}
      initial={{ opacity: 0, y: 18, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 420, damping: 24 }}
      className="drop-shadow-[0_18px_40px_rgba(0,0,0,0.45)]"
    >
      {card}
    </motion.div>
  );
}

export function MsFantasyIceRink({
  slots,
  activeIx,
  isLocked,
  onSelectSlot,
  onClearSlot,
  salaryUsed,
  salaryCap,
  salaryOverCap,
}: MsFantasyIceRinkProps) {
  const rawId = useId().replace(/:/g, "");
  const noiseFilterId = `msFantasyIceNoise-${rawId}`;
  const scratchPatternId = `msFantasyScratches-${rawId}`;
  const reduceMotion = useReducedMotion();

  const renderSlot = (i: number, positionLabel: string) => {
    const slot = slots[i];
    const sel = activeIx === i;
    const filled = Boolean(slot?.id);

    return (
      <div key={`slot-wrap-${i}`} className="relative flex flex-col items-center">
        <button
          type="button"
          disabled={isLocked}
          onClick={() => onSelectSlot(i)}
          className="group rounded-xl p-0.5 outline-none transition focus-visible:ring-2 focus-visible:ring-[#00B4FF]/70 disabled:opacity-55"
        >
          <div className="flex flex-col items-center gap-1 sm:gap-1.5">
            {filled && slot ? (
              <FilledPlayerCard
                slot={slot}
                positionLabel={positionLabel}
                selected={sel}
                disabled={isLocked}
                reduceMotion={!!reduceMotion}
              />
            ) : (
              <>
                <EmptySlotCard selected={sel} disabled={isLocked} reduceMotion={!!reduceMotion} />
                <PositionBadge label={positionLabel} />
              </>
            )}
          </div>
        </button>
        {filled && slot?.id ? (
          <button
            type="button"
            disabled={isLocked}
            title="Odebrat hráče"
            onClick={(e) => {
              e.stopPropagation();
              onClearSlot(i);
            }}
            className="absolute -right-0.5 top-0.5 z-20 flex h-6 w-6 items-center justify-center rounded-full border border-white/15 bg-slate-950/75 text-xs font-medium text-slate-300 shadow-md backdrop-blur-sm transition hover:border-red-400/40 hover:bg-red-950/50 hover:text-white disabled:pointer-events-none disabled:opacity-40 sm:top-0 sm:h-7 sm:w-7"
          >
            ×
          </button>
        ) : null}
      </div>
    );
  };

  return (
    <div className="mx-auto w-full max-w-md sm:max-w-lg">
      <p className="mb-2 text-center font-display text-[0.65rem] font-bold uppercase tracking-[0.18em] text-slate-400 sm:mb-2.5 sm:text-xs sm:tracking-[0.2em]">
        Sestava na ledě
      </p>

      <div
        className="relative overflow-hidden rounded-[1.35rem] border border-cyan-200/25 shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.08)_inset] sm:rounded-[1.5rem]"
        style={{
          transform: "perspective(920px) rotateX(4deg) scale(0.94)",
          transformOrigin: "50% 38%",
        }}
      >
        <ArenaBackdrop />
        <IceNoiseOverlay filterId={noiseFilterId} />

        <div
          className="absolute inset-0 opacity-[0.2] mix-blend-multiply"
          style={{
            background:
              "repeating-linear-gradient(-28deg, transparent, transparent 11px, rgba(0,60,90,0.1) 11px, rgba(0,60,90,0.1) 12px), repeating-linear-gradient(18deg, transparent, transparent 17px, rgba(255,255,255,0.08) 17px, rgba(255,255,255,0.08) 18px)",
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-b from-white/88 via-cyan-50/82 to-sky-100/78" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_55%_at_50%_-5%,rgba(255,255,255,0.75),transparent_52%)]" />
        <div className="absolute inset-0 opacity-50 mix-blend-soft-light bg-[radial-gradient(ellipse_at_80%_20%,rgba(0,180,255,0.12),transparent_45%)]" />

        <RinkMarkings patternId={scratchPatternId} />

        <div className="pointer-events-none absolute inset-0 rounded-[1.35rem] ring-[1px] ring-white/50 ring-inset sm:rounded-[1.5rem]" />
        <div className="pointer-events-none absolute inset-0 rounded-[1.35rem] shadow-[inset_0_0_50px_rgba(0,40,80,0.08)] sm:rounded-[1.5rem]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-slate-900/20 to-transparent sm:h-8" />

        <div className="relative z-10 flex flex-col items-stretch px-1.5 pb-5 pt-[2.65rem] sm:px-4 sm:pb-6 sm:pt-[2.85rem]">
          <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">{SLOTS_F.map((ix) => renderSlot(ix, "Útočník"))}</div>
          <div className="mt-4 flex flex-wrap justify-center gap-3 sm:mt-5 sm:gap-5">{SLOTS_D.map((ix) => renderSlot(ix, "Obránce"))}</div>
          <div className="mt-4 flex justify-center sm:mt-5">{renderSlot(SLOT_G, "Brankář")}</div>
        </div>
      </div>
    </div>
  );
}
