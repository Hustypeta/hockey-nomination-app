"use client";

import Link from "next/link";
import { Zap } from "lucide-react";
import type { ContestTimeBonusPercent } from "@/lib/contestTimeBonus";

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
        className="flex max-w-[16rem] items-center gap-1.5 rounded-lg border border-sky-400/35 bg-gradient-to-r from-sky-400/[0.12] to-transparent px-2 py-1 shadow-sm"
        aria-label={`Aktuální časový bonus ${bonusPercent} procent k bodům`}
      >
        <Zap className="h-3.5 w-3.5 shrink-0 text-sky-300" aria-hidden />
        <span className="text-[10px] font-bold tabular-nums text-sky-200 sm:text-[11px]">
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
          ? "group relative mx-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-sky-400/20 bg-gradient-to-br from-[#0c182e]/95 via-[#0c1018]/98 to-[#03050a] shadow-[0_0_0_1px_rgba(56,189,248,0.08),0_24px_52px_-14px_rgba(0,48,135,0.38),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl transition duration-300 hover:border-sky-400/32 hover:shadow-[0_0_0_1px_rgba(56,189,248,0.14),0_28px_60px_-12px_rgba(0,100,180,0.3),inset_0_1px_0_rgba(255,255,255,0.08)]"
          : "w-full max-w-lg self-start text-left rounded-2xl border border-sky-400/35 bg-gradient-to-br from-sky-400/[0.14] via-sky-400/[0.06] to-transparent px-4 py-3.5 shadow-[0_0_28px_rgba(56,189,248,0.15)]"
      }
      {...(!isLanding
        ? {
            "aria-label": `Aktuální časový bonus ${bonusPercent} procent k bodům`,
          }
        : {})}
    >
      {isLanding ? (
        <>
          <div
            className="pointer-events-none absolute -right-1/4 -top-1/4 h-[85%] w-[55%] bg-[radial-gradient(ellipse_at_70%_0%,rgba(56,189,248,0.22),transparent_55%)]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sky-400/28 to-transparent"
            aria-hidden
          />
        </>
      ) : null}
      <div
        className={`${!isLanding ? "flex items-start gap-3 text-left" : ""} ${isLanding ? "relative z-10 flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start sm:gap-4 sm:px-5 sm:py-4" : ""}`}
      >
        <div
          className={
            isLanding
              ? "mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-300/35 via-sky-500/15 to-[#003087]/40 text-sky-50 shadow-[0_0_0_1px_rgba(125,211,252,0.35),0_8px_28px_rgba(56,189,248,0.28),inset_0_1px_0_rgba(255,255,255,0.2)] ring-1 ring-sky-300/28 sm:mx-0 sm:h-14 sm:w-14"
              : "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-400/20 text-sky-200 ring-1 ring-sky-400/35"
          }
        >
          <Zap className={isLanding ? "h-6 w-6 drop-shadow-[0_0_10px_rgba(56,189,248,0.55)] sm:h-7 sm:w-7" : "h-4 w-4"} aria-hidden />
        </div>
        <div className={`min-w-0 flex-1 ${!isLanding ? "text-left" : "text-center sm:text-left"}`}>
          <p
            className={
              isLanding
                ? "font-display text-[11px] font-bold uppercase tracking-[0.22em] text-sky-200/90 sm:text-xs sm:tracking-[0.2em]"
                : "text-xs font-semibold tracking-wide text-sky-300/95"
            }
          >
            {isLanding ? "Nominační soutěž" : "Aktuální časový bonus"}
          </p>
          {isLanding ? (
            <>
              <p className="mt-2 text-pretty text-sm leading-relaxed text-white/88 sm:text-[15px]">
                Nominační soutěž ukončena. Aktuálně se čeká na oficiální soupisku k prvnímu zápasu.
              </p>
            </>
          ) : (
            <>
              <p className="mt-1 font-display text-lg font-bold tracking-tight text-white">
                {bonusPercent > 0 ? (
                  <>
                    <span className="text-sky-300">+{bonusPercent} %</span>
                    <span className="text-sm font-semibold text-white/85"> k bodům</span>
                  </>
                ) : (
                  <span className="text-sm font-semibold text-white/85">0 % — bez časového bonusu</span>
                )}
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
