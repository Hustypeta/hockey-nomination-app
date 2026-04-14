"use client";

import Link from "next/link";
import { Zap } from "lucide-react";
import { CONTEST_DEADLINE_CS, type ContestTimeBonusPercent } from "@/lib/contestTimeBonus";

export function ContestTimeBonusCallout({
  variant,
  bonusPercent,
  submissionOpen,
  compact = false,
}: {
  variant: "landing" | "builder";
  bonusPercent: ContestTimeBonusPercent;
  submissionOpen: boolean;
  /** Jen builder: jedna kompaktní řádka (hero editoru). */
  compact?: boolean;
}) {
  const isLanding = variant === "landing";

  if (!isLanding && compact) {
    return (
      <div
        className="flex max-w-[16rem] items-center gap-1.5 rounded-lg border border-[#f1c40f]/35 bg-gradient-to-r from-[#f1c40f]/[0.12] to-transparent px-2 py-1 shadow-sm"
        aria-label={`Aktuální časový bonus ${bonusPercent} procent k bodům`}
      >
        <Zap className="h-3.5 w-3.5 shrink-0 text-[#f1c40f]" aria-hidden />
        <span className="text-[10px] font-bold tabular-nums text-[#f1c40f] sm:text-[11px]">
          {bonusPercent > 0 ? `+${bonusPercent} % bodů` : "0 % bonus"}
        </span>
        <Link
          href="/pravidla-souteze"
          className="ml-0.5 text-[10px] font-medium text-sky-300/90 underline-offset-2 hover:text-sky-200 hover:underline"
        >
          pravidla
        </Link>
        {!submissionOpen ? (
          <span className="text-[9px] font-semibold text-rose-300/90">Uzavřeno</span>
        ) : null}
      </div>
    );
  }

  return (
    <div
      className={
        isLanding
          ? "flex h-full min-h-0 w-full flex-1 flex-col rounded-2xl border border-amber-500/25 bg-gradient-to-br from-amber-500/[0.12] via-[#0c1424]/80 to-[#080d16]/90 p-4 shadow-[0_0_36px_rgba(245,158,11,0.12)] sm:p-5"
          : "w-full max-w-lg self-start text-left rounded-2xl border border-[#f1c40f]/35 bg-gradient-to-br from-[#f1c40f]/[0.14] via-[#f1c40f]/[0.06] to-transparent px-4 py-3.5 shadow-[0_0_28px_rgba(241,196,15,0.15)]"
      }
      {...(!isLanding
        ? {
            "aria-label": `Aktuální časový bonus ${bonusPercent} procent k bodům`,
          }
        : {})}
    >
      <div className={`flex items-start gap-3 ${!isLanding ? "text-left" : ""}`}>
        <div
          className={
            isLanding
              ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-200 ring-1 ring-amber-400/30"
              : "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f1c40f]/20 text-[#f1c40f] ring-1 ring-[#f1c40f]/35"
          }
        >
          <Zap className={isLanding ? "h-5 w-5" : "h-4 w-4"} aria-hidden />
        </div>
        <div className={`min-w-0 flex-1 ${!isLanding ? "text-left" : ""}`}>
          <p
            className={
              isLanding
                ? "text-sm font-semibold tracking-wide text-amber-200/95"
                : "text-xs font-semibold tracking-wide text-[#f1c40f]/95"
            }
          >
            Aktuální časový bonus
          </p>
          {isLanding ? (
            <>
              <p className="mt-1 font-display text-xl font-bold tracking-tight text-white sm:text-2xl">
                {bonusPercent > 0 ? (
                  <>
                    <span className="text-amber-200">+{bonusPercent} %</span>
                    <span className="font-semibold text-white/85"> k bodům</span>
                  </>
                ) : (
                  <span className="text-white/90">Právě bez časového bonusu</span>
                )}
              </p>
              <p className="mt-2 text-sm">
                <Link
                  href="/pravidla-souteze"
                  className="font-medium text-cyan-300/95 underline-offset-2 transition hover:text-cyan-200 hover:underline"
                >
                  více v pravidlech soutěže
                </Link>
              </p>
              <p className="mt-2 border-t border-white/10 pt-2 text-[11px] text-white/45 sm:text-xs">
                Uzávěrka odeslání: <strong className="text-white/70">{CONTEST_DEADLINE_CS}</strong>
                {!submissionOpen ? (
                  <span className="mt-1 block font-semibold text-rose-300/95">
                    Soutěž už nepřijímá nové nominace k vyhodnocení.
                  </span>
                ) : null}
              </p>
            </>
          ) : (
            <>
              <p className="mt-1 font-display text-lg font-bold tracking-tight text-white">
                {bonusPercent > 0 ? (
                  <>
                    <span className="text-[#f1c40f]">+{bonusPercent} %</span>
                    <span className="text-sm font-semibold text-white/85"> k bodům</span>
                  </>
                ) : (
                  <span className="text-sm font-semibold text-white/85">0 % — bez časového bonusu</span>
                )}
              </p>
              <p className="mt-2 text-xs">
                <Link
                  href="/pravidla-souteze"
                  className="font-medium text-cyan-300/95 underline-offset-2 transition hover:text-cyan-200 hover:underline"
                >
                  více v pravidlech soutěže
                </Link>
              </p>
              {!submissionOpen ? (
                <p className="mt-2 text-[10px] font-semibold leading-snug text-rose-300/90">
                  Soutěž už nepřijímá nové nominace k vyhodnocení.
                </p>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
