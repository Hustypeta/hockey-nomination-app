"use client";

import { Plus } from "lucide-react";
import type { MsFantasyRosterPlayer } from "./MsFantasyDayEditor";

const SLOT_G = 0;
const SLOTS_D = [1, 2] as const;
const SLOTS_F = [3, 4, 5] as const;

type MsFantasyIceRinkProps = {
  slots: Array<MsFantasyRosterPlayer | null>;
  activeIx: number;
  isLocked: boolean;
  onSelectSlot: (index: number) => void;
  onClearSlot: (index: number) => void;
};

/** SVG: střední čára, modré pásy, kruhy, brankoviště — zjednodušená simulace hřiště. */
function RinkMarkings() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full text-[#c8102e]"
      viewBox="0 0 100 130"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <linearGradient id="msFantasyIceShine" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
          <stop offset="40%" stopColor="rgba(255,255,255,0)" />
          <stop offset="100%" stopColor="rgba(0,60,90,0.06)" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="100" height="22" fill="rgba(0,48,135,0.07)" />
      <rect x="0" y="52" width="100" height="26" fill="rgba(0,48,135,0.05)" />
      <line x1="0" y1="65" x2="100" y2="65" stroke="currentColor" strokeWidth="1.1" />
      <circle cx="22" cy="32" r="9" fill="none" stroke="rgba(200,16,46,0.35)" strokeWidth="0.55" />
      <circle cx="78" cy="32" r="9" fill="none" stroke="rgba(200,16,46,0.35)" strokeWidth="0.55" />
      <circle cx="22" cy="98" r="9" fill="none" stroke="rgba(200,16,46,0.35)" strokeWidth="0.55" />
      <circle cx="78" cy="98" r="9" fill="none" stroke="rgba(200,16,46,0.35)" strokeWidth="0.55" />
      <circle cx="50" cy="65" r="5.5" fill="none" stroke="rgba(200,16,46,0.45)" strokeWidth="0.5" />
      <path
        d="M 28 118 A 22 14 0 0 0 72 118"
        fill="rgba(0,48,135,0.06)"
        stroke="rgba(0,48,135,0.2)"
        strokeWidth="0.5"
      />
      <rect x="0" y="0" width="100" height="130" fill="url(#msFantasyIceShine)" />
    </svg>
  );
}

function SlotJersey({
  filled,
  selected,
  disabled,
  positionLabel,
  children,
}: {
  filled: boolean;
  selected: boolean;
  disabled: boolean;
  positionLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className={[
          "relative flex h-[4.5rem] w-[3.35rem] shrink-0 flex-col items-center justify-start rounded-t-[0.65rem] rounded-b-lg pt-1.5 shadow-md transition",
          filled
            ? "bg-gradient-to-b from-slate-600 via-slate-700 to-slate-800 ring-1 ring-white/15"
            : "bg-gradient-to-b from-slate-300 via-slate-400/95 to-slate-500 ring-1 ring-black/10",
          selected ? "ring-2 ring-[#00B4FF] ring-offset-2 ring-offset-[#dbeaf2]/90" : "",
          disabled ? "opacity-55" : "",
        ].join(" ")}
      >
        <div
          className={[
            "pointer-events-none absolute -left-1 top-2 h-5 w-2.5 rounded-sm",
            filled ? "bg-slate-700" : "bg-slate-400",
          ].join(" ")}
        />
        <div
          className={[
            "pointer-events-none absolute -right-1 top-2 h-5 w-2.5 rounded-sm",
            filled ? "bg-slate-700" : "bg-slate-400",
          ].join(" ")}
        />
        <div className="relative z-10 flex min-h-[2.5rem] flex-1 flex-col items-center justify-center px-0.5 pb-1">
          {children}
        </div>
      </div>
      <span className="rounded-md bg-[#0a1628]/92 px-2 py-0.5 font-display text-[0.58rem] font-bold uppercase tracking-[0.14em] text-white shadow-sm">
        {positionLabel}
      </span>
    </div>
  );
}

export function MsFantasyIceRink({ slots, activeIx, isLocked, onSelectSlot, onClearSlot }: MsFantasyIceRinkProps) {
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
          className="group rounded-2xl p-1.5 outline-none transition focus-visible:ring-2 focus-visible:ring-[#00B4FF]/70 disabled:opacity-55"
        >
          <SlotJersey filled={filled} selected={sel} disabled={isLocked} positionLabel={positionLabel}>
            {filled && slot ? (
              <>
                <p className="line-clamp-3 max-w-[3rem] text-center text-[0.58rem] font-bold leading-tight text-white drop-shadow-sm">
                  {slot.name}
                </p>
                <p className="mt-0.5 text-center text-[0.45rem] font-medium leading-tight text-sky-100/90">
                  {slot.team} · {slot.tier} · {slot.salary}
                </p>
              </>
            ) : (
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/95 text-white shadow-[0_2px_10px_rgba(16,185,129,0.45)] ring-2 ring-white/40">
                <Plus className="h-5 w-5 stroke-[2.5]" aria-hidden />
              </span>
            )}
          </SlotJersey>
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
            className="absolute -right-0.5 top-0 z-20 flex h-6 w-6 items-center justify-center rounded-full border border-white/20 bg-[#0a1628]/90 text-xs font-bold text-[#7ee0ff] shadow-md transition hover:bg-[#00B4FF]/25 hover:text-white disabled:pointer-events-none disabled:opacity-40"
          >
            ×
          </button>
        ) : null}
      </div>
    );
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <p className="mb-3 text-center font-display text-[0.65rem] font-bold uppercase tracking-[0.22em] text-slate-500">
        Sestava na ledě
      </p>

      <div
        className="relative overflow-hidden rounded-[1.75rem] border border-sky-300/30 shadow-[0_24px_60px_rgba(0,0,0,0.4),inset_0_0_0_1px_rgba(255,255,255,0.35)]"
        style={{ transform: "perspective(920px) rotateX(7deg)", transformOrigin: "50% 40%" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#f4fbff] via-[#e4f0f8] to-[#c9dce8]" />
        <div className="absolute inset-0 opacity-[0.35] mix-blend-multiply bg-[radial-gradient(ellipse_at_30%_20%,rgba(0,180,255,0.12),transparent_55%),radial-gradient(ellipse_at_70%_80%,rgba(0,48,135,0.08),transparent_50%)]" />
        <RinkMarkings />

        <div className="pointer-events-none absolute inset-0 rounded-[1.75rem] ring-[3px] ring-[#0a1628]/20 ring-inset" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-[#0a1628]/25 to-transparent" />

        <div className="relative z-10 flex flex-col items-stretch px-3 pb-8 pt-7 sm:px-5 sm:pb-9 sm:pt-8">
          <div className="flex justify-center gap-2 sm:gap-4">{SLOTS_F.map((ix) => renderSlot(ix, "Útočník"))}</div>

          <div className="mt-5 flex justify-center gap-6 sm:mt-6 sm:gap-10">{SLOTS_D.map((ix) => renderSlot(ix, "Obránce"))}</div>

          <div className="mt-6 flex justify-center sm:mt-7">{renderSlot(SLOT_G, "Brankář")}</div>
        </div>
      </div>

      <p className="mt-2 text-center text-[0.65rem] leading-relaxed text-slate-500">
        Vyber dres pro aktivní slot, pak hráče v seznamu vpravo. U obsazeného místa odeber přes ×.
      </p>
    </div>
  );
}
