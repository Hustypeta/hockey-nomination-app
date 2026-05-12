"use client";

import { Share2 } from "lucide-react";

export function FloatingPrimaryBar({
  label,
  disabled,
  onClick,
  className = "",
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <div
      className={`pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center border-t border-white/[0.1] bg-gradient-to-t from-[#05080f] via-[#080d16]/98 to-transparent px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-4 sm:pt-6 lg:pt-5 ${className}`}
    >
      <div className="pointer-events-auto w-full max-w-3xl rounded-2xl border border-white/[0.12] bg-gradient-to-br from-[#0f172a]/95 via-[#0a1428]/96 to-[#05080f]/95 p-2.5 shadow-[0_-24px_72px_rgba(0,0,0,0.65),0_0_0_1px_rgba(241,196,15,0.12),0_0_48px_rgba(200,16,46,0.12),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl backdrop-saturate-150 sm:p-4">
        <button
          type="button"
          onClick={onClick}
          disabled={!!disabled}
          className={`
            flex min-h-[2.75rem] w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-display text-sm font-black uppercase tracking-wide transition-all
            ${
              disabled
                ? "cursor-not-allowed bg-white/[0.04] text-white/28 ring-1 ring-white/[0.06]"
                : "bg-gradient-to-r from-[#c8102e] via-[#a30d26] to-[#003087] text-white shadow-[0_8px_36px_rgba(200,16,46,0.4),0_0_0_1px_rgba(241,196,15,0.3)] ring-1 ring-white/20 hover:brightness-110 active:scale-[0.98]"
            }
          `}
        >
          <Share2 className="h-4 w-4 shrink-0 opacity-95 sm:h-5 sm:w-5" aria-hidden />
          <span className="text-center">{label}</span>
        </button>
      </div>
    </div>
  );
}

