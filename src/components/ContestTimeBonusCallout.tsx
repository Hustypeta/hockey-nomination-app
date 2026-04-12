"use client";

import { Zap } from "lucide-react";
import {
  CONTEST_DEADLINE_CS,
  formatContestBonusLabel,
  type ContestTimeBonusPercent,
} from "@/lib/contestTimeBonus";

export function ContestTimeBonusCallout({
  variant,
  bonusPercent,
  submissionOpen,
}: {
  variant: "landing" | "builder";
  bonusPercent: ContestTimeBonusPercent;
  submissionOpen: boolean;
}) {
  const isLanding = variant === "landing";

  return (
    <div
      className={
        isLanding
          ? "mx-auto mt-6 max-w-lg rounded-2xl border border-amber-500/25 bg-gradient-to-br from-amber-500/[0.12] via-[#0c1424]/80 to-[#080d16]/90 p-4 shadow-[0_0_36px_rgba(245,158,11,0.12)] sm:mt-8 sm:p-5"
          : "rounded-xl border border-amber-500/20 bg-amber-500/[0.08] px-4 py-3 shadow-[0_0_24px_rgba(245,158,11,0.1)]"
      }
    >
      <div className="flex items-start gap-3">
        <div
          className={
            isLanding
              ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-200 ring-1 ring-amber-400/30"
              : "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-200 ring-1 ring-amber-400/25"
          }
        >
          <Zap className={isLanding ? "h-5 w-5" : "h-4 w-4"} aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p
            className={
              isLanding
                ? "text-[10px] font-bold uppercase tracking-[0.22em] text-amber-200/90"
                : "text-[9px] font-bold uppercase tracking-[0.2em] text-amber-200/85"
            }
          >
            Časový bonus soutěže
          </p>
          <p
            className={`mt-1 font-display font-bold tracking-tight text-white ${isLanding ? "text-xl sm:text-2xl" : "text-lg"}`}
          >
            {bonusPercent > 0 ? (
              <>
                <span className="text-amber-200">+{bonusPercent} %</span>
                <span className="font-semibold text-white/85"> k bodům</span>
              </>
            ) : (
              <span className="text-white/90">Právě bez časového bonusu</span>
            )}
          </p>
          <p className={`mt-1.5 text-white/55 ${isLanding ? "text-xs leading-relaxed sm:text-sm" : "text-[11px] leading-snug sm:text-xs"}`}>
            Platí pro nominaci uloženou k účtu. {formatContestBonusLabel(bonusPercent)} — podle data uložení (čas ČR).
          </p>
          <p className={`mt-2 border-t border-white/10 pt-2 text-white/45 ${isLanding ? "text-[11px] sm:text-xs" : "text-[10px] sm:text-[11px]"}`}>
            Uzávěrka odeslání: <strong className="text-white/70">{CONTEST_DEADLINE_CS}</strong>
            {!submissionOpen ? (
              <span className="mt-1 block font-semibold text-rose-300/95">
                Soutěž už nepřijímá nové nominace k vyhodnocení.
              </span>
            ) : null}
          </p>
        </div>
      </div>
    </div>
  );
}
