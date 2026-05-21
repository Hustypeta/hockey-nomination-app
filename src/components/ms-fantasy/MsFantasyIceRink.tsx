"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Plus } from "lucide-react";
import { FlagMark } from "@/components/flags/FlagMark";
import {
  msFantasyLineupCardLastName,
  msFantasyLineupCardLastNameStyle,
  msFantasyLineupCardLastNameTextClass,
} from "@/lib/msFantasyDisplayName";
import type { MsFantasyRosterPlayer } from "./MsFantasyDayEditor";
import { MsFantasyPlayerAvatar } from "./MsFantasyPlayerAvatar";
import { IceRinkShell } from "@/components/shared/IceRinkShell";

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

function slotNeonVariant(slotIndex: number): "cyan" | "red" {
  if (slotIndex === SLOT_G) return "red";
  if (slotIndex === SLOTS_D[0]) return "cyan";
  if (slotIndex === SLOTS_D[1]) return "red";
  if (slotIndex === SLOTS_F[0] || slotIndex === SLOTS_F[2]) return "cyan";
  return "red";
}

function PositionBadge({ label, compact = false }: { label: string; compact?: boolean }) {
  return (
    <span
      className={[
        "relative font-display font-bold uppercase tracking-[0.18em] text-white/95 shadow-[0_4px_14px_rgba(0,0,0,0.35)]",
        compact
          ? "px-2 py-0.5 text-[0.52rem] tracking-[0.1em] sm:px-2.5 sm:py-0.5 sm:text-[0.56rem] md:text-[0.58rem] lg:text-[0.62rem]"
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

function EmptySlotCard({
  selected,
  disabled,
  reduceMotion,
  neon,
}: {
  selected: boolean;
  disabled: boolean;
  reduceMotion: boolean;
  neon: "cyan" | "red";
}) {
  const isCyan = neon === "cyan";
  const baseBorder = isCyan
    ? "border-cyan-400/85 border-solid shadow-[0_0_20px_rgba(0,242,255,0.38),inset_0_0_24px_rgba(0,180,255,0.08)]"
    : "border-rose-500/80 border-solid shadow-[0_0_20px_rgba(251,113,133,0.32),inset_0_0_24px_rgba(200,16,46,0.08)]";
  const hoverLift =
    "sm:group-hover:-translate-y-0.5 sm:group-hover:scale-[1.04] motion-reduce:sm:group-hover:translate-y-0 motion-reduce:sm:group-hover:scale-100";
  const glowHover = isCyan
    ? "sm:group-hover:shadow-[0_0_0_1px_rgba(0,245,255,0.55),0_0_40px_rgba(0,220,255,0.55),0_16px_36px_rgba(0,0,0,0.45)]"
    : "sm:group-hover:shadow-[0_0_0_1px_rgba(251,113,133,0.5),0_0_40px_rgba(248,113,113,0.45),0_16px_36px_rgba(0,0,0,0.45)]";

  return (
    <div
      className={[
        "relative flex min-h-[6.25rem] w-[5.35rem] flex-col items-center justify-center rounded-xl border-2 px-1 py-1.5 backdrop-blur-sm transition-[border-color,box-shadow,transform,background-color] duration-300 ease-out sm:min-h-[6.85rem] sm:w-[6.5rem] sm:px-1.5 sm:py-1.5 md:min-h-[7.45rem] md:w-[7.65rem] md:px-2 md:py-2 lg:min-h-[8.1rem] lg:w-[8.2rem] lg:px-2 lg:py-2",
        "bg-gradient-to-b from-slate-950/92 via-slate-950/88 to-black/90",
        baseBorder,
        hoverLift,
        glowHover,
        selected
          ? isCyan
            ? "ring-2 ring-cyan-300/80 ring-offset-2 ring-offset-slate-950 shadow-[0_0_32px_rgba(0,245,255,0.55)]"
            : "ring-2 ring-rose-400/75 ring-offset-2 ring-offset-slate-950 shadow-[0_0_32px_rgba(251,113,133,0.45)]"
          : "",
        disabled ? "opacity-55" : "",
      ].join(" ")}
    >
      <div
        className={[
          "pointer-events-none absolute inset-0 rounded-[10px] opacity-70",
          isCyan
            ? "bg-[radial-gradient(circle_at_50%_0%,rgba(0,245,255,0.22),transparent_58%)]"
            : "bg-[radial-gradient(circle_at_50%_0%,rgba(251,113,133,0.2),transparent_58%)]",
          !reduceMotion ? "ms-fantasy-empty-pulse" : "",
        ].join(" ")}
        aria-hidden
      />
      <span
        className={[
          "relative z-10 flex h-9 w-9 items-center justify-center rounded-full text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] ring-2 ring-white/30 transition-[transform,box-shadow] duration-300 ease-out sm:group-hover:scale-110 motion-reduce:sm:group-hover:scale-100 sm:h-11 sm:w-11 md:h-12 md:w-12 lg:h-[3.15rem] lg:w-[3.15rem]",
          isCyan
            ? "bg-gradient-to-br from-[#00e5ff] to-[#0066a3] shadow-[0_0_22px_rgba(0,230,255,0.55)] sm:group-hover:shadow-[0_0_30px_rgba(0,245,255,0.85)]"
            : "bg-gradient-to-br from-[#fb7185] to-[#9f1239] shadow-[0_0_22px_rgba(251,113,133,0.45)] sm:group-hover:shadow-[0_0_30px_rgba(248,113,113,0.75)]",
        ].join(" ")}
      >
        <Plus className="h-4 w-4 stroke-[2.5] transition-transform duration-300 ease-out sm:group-hover:scale-110 motion-reduce:sm:group-hover:scale-100 sm:h-[1.35rem] sm:w-[1.35rem] md:h-6 md:w-6" aria-hidden />
      </span>
      <span
        className={[
          "relative z-10 mt-1 text-center text-[0.62rem] font-bold uppercase tracking-[0.1em] sm:text-[0.65rem]",
          isCyan ? "text-cyan-100/95" : "text-rose-100/95",
        ].join(" ")}
      >
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
  const lastNameClass = msFantasyLineupCardLastNameTextClass(last);
  const lastNameStyle = msFantasyLineupCardLastNameStyle(last);

  const card = (
    <div
      className={[
        "relative flex min-h-[6.45rem] w-[5.35rem] flex-col rounded-xl border px-1.5 pb-1.5 pt-1 shadow-[0_16px_36px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.18)] sm:min-h-[7.05rem] sm:w-[6.5rem] sm:px-2 sm:pb-1.5 sm:pt-1.5 md:min-h-[7.65rem] md:w-[7.65rem] md:px-2.5 md:pb-2 md:pt-2 lg:min-h-[8.35rem] lg:w-[8.2rem] lg:px-3 lg:pb-2.5 lg:pt-2.5",
        "border-white/25 bg-gradient-to-b from-slate-800/98 via-slate-900 to-[#030712]",
        selected ? "ring-[2px] ring-[#00e5ff] ring-offset-[2px] ring-offset-sky-100/95" : "ring-1 ring-white/10",
        disabled ? "opacity-55" : "",
      ].join(" ")}
      style={{ boxShadow: selected ? `0 0 28px ${ac.ring}, 0 16px 36px rgba(0,0,0,0.55)` : undefined }}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-xl opacity-95"
        style={{
          background: `radial-gradient(120% 85% at 50% -15%, ${ac.ring}, transparent 52%), radial-gradient(90% 70% at 100% 100%, rgba(0,48,135,0.22), transparent 48%)`,
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-0.5 px-0.5 pt-0.5 sm:gap-1">
        <div className="shrink-0 sm:hidden">
          <MsFantasyPlayerAvatar playerId={slot.id} variant="circle" frame="premium" size="2.72rem" />
        </div>
        <div className="hidden shrink-0 sm:block lg:hidden">
          <MsFantasyPlayerAvatar playerId={slot.id} variant="circle" frame="premium" size="3.1rem" />
        </div>
        <div className="hidden shrink-0 lg:block">
          <MsFantasyPlayerAvatar playerId={slot.id} variant="circle" frame="premium" size="3.45rem" />
        </div>

        <div className="flex w-full max-w-[5.05rem] items-center justify-center gap-0.5 sm:max-w-[6.45rem] md:max-w-[7.35rem] lg:max-w-[7.85rem]">
          <p className={lastNameClass} style={lastNameStyle} title={last}>
            {last}
          </p>
          <FlagMark code={slot.team} className="h-3.5 w-[1.05rem] shrink-0 rounded-sm ring-1 ring-white/30 sm:h-4 sm:w-[1.2rem] lg:h-[1.15rem] lg:w-[1.42rem]" />
        </div>

        <div className="flex w-full justify-center pt-0.5">
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
      <div key={`slot-wrap-${i}`} className="relative flex min-w-0 shrink-0 flex-col items-center">
        <button
          type="button"
          disabled={isLocked}
          onClick={() => onSelectSlot(i)}
          className="group relative z-20 min-w-0 touch-manipulation rounded-xl p-0.5 outline-none transition focus-visible:ring-2 focus-visible:ring-[#00B4FF]/70 disabled:opacity-55"
        >
          <div className="flex flex-col items-center gap-0.5 sm:gap-1">
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
                <EmptySlotCard
                  selected={sel}
                  disabled={isLocked}
                  reduceMotion={!!reduceMotion}
                  neon={slotNeonVariant(i)}
                />
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
    <div className="mx-auto w-full max-w-[21rem] sm:max-w-xl lg:max-w-2xl">
      <p className="mb-2 text-center font-display text-[0.68rem] font-bold uppercase tracking-[0.18em] text-slate-500 sm:mb-2.5 sm:text-xs sm:tracking-[0.2em]">
        Sestava na ledě
      </p>

      <IceRinkShell
        className="ms-fantasy-rink-3d border-cyan-400/30 shadow-[0_0_60px_rgba(0,180,255,0.12),0_24px_64px_rgba(0,0,0,0.55)]"
        iceMood="arena"
        noiseFilterId={noiseFilterId}
        scratchPatternId={scratchPatternId}
        transform="perspective(920px) rotateX(4deg) scale(0.97) translateZ(0)"
        innerClassName="relative z-10 flex flex-col items-stretch px-1.5 pb-8 pt-[2.55rem] sm:px-3.5 sm:pb-9 sm:pt-[2.85rem] md:pt-[3rem] lg:px-5 lg:pb-10 lg:pt-[3.15rem]"
      >
        <div className="flex min-w-0 flex-nowrap justify-center gap-1.5 sm:flex-wrap sm:gap-2.5 md:gap-3 lg:gap-3.5">
          {SLOTS_F.map((ix) => renderSlot(ix, "Útočník"))}
        </div>
        <div className="mt-3.5 flex min-w-0 flex-wrap justify-center gap-2 sm:mt-4 sm:gap-5 md:gap-6 lg:gap-7">
          {SLOTS_D.map((ix) => renderSlot(ix, "Obránce"))}
        </div>
        <div className="mt-3.5 flex justify-center sm:mt-4 md:mt-5">{renderSlot(SLOT_G, "Brankář")}</div>

        <div
          className="pointer-events-none absolute bottom-2.5 right-2.5 z-30 flex h-11 w-11 flex-col items-center justify-center rounded-full border-2 border-amber-400/55 bg-gradient-to-br from-amber-600/95 via-amber-800/95 to-amber-950/98 px-1 text-center shadow-[0_0_22px_rgba(251,191,36,0.35)] sm:bottom-3 sm:right-3 sm:h-12 sm:w-12"
          aria-hidden
        >
          <span className="font-display text-[0.38rem] font-black uppercase leading-none tracking-wide text-amber-50/95">
            MS
          </span>
          <span className="mt-px font-display text-[0.38rem] font-black uppercase leading-none tracking-wide text-amber-100/90">
            2026
          </span>
        </div>
      </IceRinkShell>
    </div>
  );
}
