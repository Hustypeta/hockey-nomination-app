"use client";

import { Share2, Shuffle, RotateCcw } from "lucide-react";

export function FloatingSestavaBar({
  onShare,
  onRandom,
  onReset,
  shareDisabled,
  shareLabel,
}: {
  onShare: () => void;
  onRandom: () => void;
  onReset: () => void;
  shareDisabled: boolean;
  shareLabel: string;
}) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center p-4 pb-[max(1rem,env(safe-area-inset-bottom))] lg:pb-6">
      <div className="pointer-events-auto flex w-full max-w-lg flex-col gap-2 rounded-2xl border border-white/10 bg-[#0a0a0a]/95 p-3 shadow-[0_-8px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-center sm:gap-3">
        <button
          type="button"
          onClick={onShare}
          disabled={shareDisabled}
          className={`
            flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3.5 font-display text-base font-bold tracking-wide transition-all
            ${
              shareDisabled
                ? "cursor-not-allowed bg-white/5 text-white/35"
                : "bg-gradient-to-r from-[#c8102e] to-[#9e0c24] text-white shadow-lg shadow-[#c8102e]/25 hover:scale-[1.02] active:scale-[0.98]"
            }
          `}
        >
          <Share2 className="h-5 w-5" />
          {shareLabel}
        </button>
        <button
          type="button"
          onClick={onRandom}
          className="flex items-center justify-center gap-2 rounded-xl border border-[#d4af37]/35 bg-[#d4af37]/10 px-4 py-3 font-display text-sm font-semibold text-[#f0d78c] transition-colors hover:bg-[#d4af37]/20"
        >
          <Shuffle className="h-4 w-4" />
          Náhodná nominace
        </button>
        <button
          type="button"
          onClick={onReset}
          className="flex items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-3 text-sm text-white/70 transition-colors hover:border-red-500/40 hover:text-white"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </button>
      </div>
    </div>
  );
}
