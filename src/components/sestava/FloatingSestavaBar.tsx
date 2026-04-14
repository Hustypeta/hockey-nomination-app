"use client";

import { Share2, Shuffle, RotateCcw, Trophy } from "lucide-react";

export function FloatingSestavaBar({
  onShare,
  onRandom,
  onReset,
  shareDisabled,
  shareLabel,
  onContestSubmit,
  contestSubmitDisabled,
  showContestSubmit,
}: {
  onShare: () => void;
  onRandom: () => void;
  onReset: () => void;
  shareDisabled: boolean;
  shareLabel: string;
  /** Odeslání do soutěže (jednou na účet). */
  onContestSubmit?: () => void;
  contestSubmitDisabled?: boolean;
  showContestSubmit?: boolean;
}) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center border-t border-white/[0.1] bg-gradient-to-t from-[#05080f] via-[#080d16]/98 to-transparent px-3 pt-6 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-4 lg:pt-5">
      <div className="pointer-events-auto flex w-full max-w-3xl flex-col gap-2.5 rounded-2xl border border-white/[0.12] bg-gradient-to-br from-[#0f172a]/95 via-[#0a1428]/96 to-[#05080f]/95 p-3 shadow-[0_-24px_72px_rgba(0,0,0,0.65),0_0_0_1px_rgba(241,196,15,0.12),0_0_48px_rgba(200,16,46,0.12),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl backdrop-saturate-150 sm:flex-row sm:items-stretch sm:justify-center sm:gap-3 sm:p-4">
        <div className="flex w-full flex-col gap-2 sm:flex-1 sm:flex-row sm:gap-2">
          <button
            type="button"
            onClick={onShare}
            disabled={shareDisabled}
            className={`
            flex flex-1 items-center justify-center gap-2.5 rounded-xl px-4 py-3.5 text-base font-bold tracking-tight transition-all
            ${
              shareDisabled
                ? "cursor-not-allowed bg-white/[0.04] text-white/28 ring-1 ring-white/[0.06]"
                : "bg-gradient-to-r from-[#c8102e] via-[#a30d26] to-[#003087] text-white shadow-[0_8px_36px_rgba(200,16,46,0.4),0_0_0_1px_rgba(241,196,15,0.3)] ring-1 ring-white/20 hover:brightness-110 active:scale-[0.98]"
            }
          `}
          >
            <Share2 className="h-5 w-5 shrink-0 opacity-95" />
            {shareLabel}
          </button>
          {showContestSubmit && onContestSubmit ? (
            <button
              type="button"
              onClick={onContestSubmit}
              disabled={contestSubmitDisabled}
              className={`
                flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-[#f1c40f]/45 bg-[#f1c40f]/[0.09] px-3 py-3.5 text-sm font-bold tracking-tight text-[#f1e6a8] shadow-[0_0_24px_rgba(241,196,15,0.12)] transition-all hover:bg-[#f1c40f]/15 active:scale-[0.98] disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.03] disabled:text-white/25
              `}
            >
              <Trophy className="h-5 w-5 shrink-0 opacity-95" aria-hidden />
              Odeslat do soutěže
            </button>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onRandom}
          className="flex items-center justify-center gap-2 rounded-xl border border-[#003087]/50 bg-[#003087]/14 px-4 py-3 text-sm font-semibold text-sky-100 transition-all hover:border-[#003087]/70 hover:bg-[#003087]/24 hover:shadow-[0_0_24px_rgba(0,48,135,0.2)] active:scale-[0.98]"
        >
          <Shuffle className="h-4 w-4 shrink-0 opacity-90" />
          Náhodná nominace
        </button>
        <button
          type="button"
          onClick={onReset}
          className="flex items-center justify-center gap-2 rounded-xl border border-white/14 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-white/80 transition-all hover:border-[#c8102e]/40 hover:bg-[#c8102e]/10 hover:text-white active:scale-[0.98]"
        >
          <RotateCcw className="h-4 w-4 shrink-0 opacity-90" />
          Reset
        </button>
      </div>
    </div>
  );
}
