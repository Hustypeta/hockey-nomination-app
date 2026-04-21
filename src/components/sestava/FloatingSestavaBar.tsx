"use client";

import { Share2, Shuffle, RotateCcw, Trophy } from "lucide-react";

export function FloatingSestavaBar({
  onShare,
  onRandom,
  onReset,
  shareDisabled,
  shareLabel,
  onContestSubmit,
  contestSubmitBusy,
  contestSubmitInactive,
  showContestSubmit,
  className = "",
}: {
  onShare: () => void;
  onRandom: () => void;
  onReset: () => void;
  shareDisabled: boolean;
  shareLabel: string;
  /** Odeslání do soutěže (jednou na účet). */
  onContestSubmit?: () => void;
  /** true = probíhá POST — tlačítko je skutečně disabled. */
  contestSubmitBusy?: boolean;
  /** true = šedý stav (nepřipravená nominace / uzávěrka); kliknutí stále proběhne (rodič ukáže nápovědu). */
  contestSubmitInactive?: boolean;
  showContestSubmit?: boolean;
  /** Např. skrýt lištu pod mobilním výběrem hráčů (`max-lg:hidden`). */
  className?: string;
}) {
  return (
    <div
      className={`pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center border-t border-white/[0.1] bg-gradient-to-t from-[#05080f] via-[#080d16]/98 to-transparent px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-4 sm:pt-6 lg:pt-5 ${className}`}
    >
      <div className="pointer-events-auto flex w-full max-w-3xl flex-col gap-2 rounded-2xl border border-white/[0.12] bg-gradient-to-br from-[#0f172a]/95 via-[#0a1428]/96 to-[#05080f]/95 p-2.5 shadow-[0_-24px_72px_rgba(0,0,0,0.65),0_0_0_1px_rgba(241,196,15,0.12),0_0_48px_rgba(200,16,46,0.12),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl backdrop-saturate-150 sm:flex-row sm:items-stretch sm:justify-center sm:gap-3 sm:p-4">
        {/* Mobil: primární tlačítka vedle sebe (nebo jedno přes šířku); tablet+: řádek jako dřív */}
        <div
          className={
            showContestSubmit
              ? "grid w-full grid-cols-2 gap-2 sm:flex sm:flex-1 sm:flex-row sm:gap-2"
              : "flex w-full flex-col gap-2 sm:flex-1 sm:flex-row sm:gap-2"
          }
        >
          <button
            type="button"
            onClick={onShare}
            disabled={shareDisabled}
            className={`
            flex min-h-[2.75rem] flex-1 items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 text-xs font-bold leading-tight tracking-tight transition-all sm:min-h-0 sm:gap-2.5 sm:px-4 sm:py-3.5 sm:text-base
            ${
              shareDisabled
                ? "cursor-not-allowed bg-white/[0.04] text-white/28 ring-1 ring-white/[0.06]"
                : "bg-gradient-to-r from-[#c8102e] via-[#a30d26] to-[#003087] text-white shadow-[0_8px_36px_rgba(200,16,46,0.4),0_0_0_1px_rgba(241,196,15,0.3)] ring-1 ring-white/20 hover:brightness-110 active:scale-[0.98]"
            }
          `}
          >
            <Share2 className="h-4 w-4 shrink-0 opacity-95 sm:h-5 sm:w-5" />
            <span className="text-center">{shareLabel}</span>
          </button>
          {showContestSubmit && onContestSubmit ? (
            <button
              type="button"
              onClick={onContestSubmit}
              disabled={!!contestSubmitBusy}
              aria-busy={!!contestSubmitBusy}
              className={`
                flex min-h-[2.75rem] flex-1 items-center justify-center gap-1.5 rounded-xl border-2 px-2 py-2.5 text-[11px] font-bold leading-tight tracking-tight shadow-[0_0_24px_rgba(241,196,15,0.12)] transition-all active:scale-[0.98] sm:min-h-0 sm:gap-2 sm:px-3 sm:py-3.5 sm:text-sm
                ${
                  contestSubmitBusy
                    ? "cursor-not-allowed border-white/10 bg-white/[0.03] text-white/25"
                    : contestSubmitInactive
                      ? "cursor-pointer border-white/15 bg-white/[0.05] text-white/45 hover:bg-white/[0.08] hover:text-white/65"
                      : "border-[#f1c40f]/45 bg-[#f1c40f]/[0.09] text-[#f1e6a8] hover:bg-[#f1c40f]/15"
                }
              `}
            >
              <Trophy className="h-4 w-4 shrink-0 opacity-95 sm:h-5 sm:w-5" aria-hidden />
              <span className="text-center">
                <span className="max-sm:block sm:hidden">Do soutěže</span>
                <span className="max-sm:hidden">Odeslat do soutěže</span>
              </span>
            </button>
          ) : null}
        </div>
        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-none sm:gap-2">
          <button
            type="button"
            onClick={onRandom}
            className="flex min-h-[2.65rem] items-center justify-center gap-1.5 rounded-xl border border-[#003087]/50 bg-[#003087]/14 px-2 py-2 text-[11px] font-semibold leading-tight text-sky-100 transition-all hover:border-[#003087]/70 hover:bg-[#003087]/24 hover:shadow-[0_0_24px_rgba(0,48,135,0.2)] active:scale-[0.98] sm:min-h-0 sm:gap-2 sm:px-4 sm:py-3 sm:text-sm"
          >
            <Shuffle className="h-3.5 w-3.5 shrink-0 opacity-90 sm:h-4 sm:w-4" />
            <span className="text-center">
              <span className="max-sm:block sm:hidden">Náhodně</span>
              <span className="max-sm:hidden">Náhodná nominace</span>
            </span>
          </button>
          <button
            type="button"
            onClick={onReset}
            className="flex min-h-[2.65rem] items-center justify-center gap-1.5 rounded-xl border border-white/14 bg-white/[0.03] px-2 py-2 text-[11px] font-semibold leading-tight text-white/80 transition-all hover:border-[#c8102e]/40 hover:bg-[#c8102e]/10 hover:text-white active:scale-[0.98] sm:min-h-0 sm:gap-2 sm:px-4 sm:py-3 sm:text-sm"
          >
            <RotateCcw className="h-3.5 w-3.5 shrink-0 opacity-90 sm:h-4 sm:w-4" />
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
