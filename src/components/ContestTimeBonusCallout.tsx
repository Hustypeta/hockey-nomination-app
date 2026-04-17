"use client";

import Link from "next/link";
import { CalendarClock, Zap } from "lucide-react";
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
          ? "group relative flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden rounded-3xl border border-sky-400/20 bg-gradient-to-br from-[#0c182e]/95 via-[#0c1018]/98 to-[#03050a] shadow-[0_0_0_1px_rgba(56,189,248,0.08),0_24px_52px_-14px_rgba(0,48,135,0.38),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl transition duration-300 hover:border-sky-400/32 hover:shadow-[0_0_0_1px_rgba(56,189,248,0.14),0_28px_60px_-12px_rgba(0,100,180,0.3),inset_0_1px_0_rgba(255,255,255,0.08)]"
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
      <div className={`flex items-start gap-3 ${!isLanding ? "text-left" : ""} ${isLanding ? "relative z-10 p-5 sm:p-6" : ""}`}>
        <div
          className={
            isLanding
              ? "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-300/35 via-sky-500/15 to-[#003087]/40 text-sky-50 shadow-[0_0_0_1px_rgba(125,211,252,0.35),0_10px_36px_rgba(56,189,248,0.32),inset_0_1px_0_rgba(255,255,255,0.2)] ring-1 ring-sky-300/28 sm:h-14 sm:w-14"
              : "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-400/20 text-sky-200 ring-1 ring-sky-400/35"
          }
        >
          <Zap className={isLanding ? "h-6 w-6 drop-shadow-[0_0_10px_rgba(56,189,248,0.55)] sm:h-7 sm:w-7" : "h-4 w-4"} aria-hidden />
        </div>
        <div className={`min-w-0 flex-1 ${!isLanding ? "text-left" : ""}`}>
          <p
            className={
              isLanding
                ? "font-display text-[10px] font-bold uppercase tracking-[0.26em] text-sky-200/85"
                : "text-xs font-semibold tracking-wide text-sky-300/95"
            }
          >
            Aktuální časový bonus
          </p>
          {isLanding ? (
            <>
              <p className="mt-2 font-display text-[clamp(1.75rem,5vw,2.35rem)] font-bold leading-[1.05] tracking-tight">
                {bonusPercent > 0 ? (
                  <>
                    <span className="bg-gradient-to-br from-sky-50 via-sky-200 to-sky-400/95 bg-clip-text text-transparent drop-shadow-[0_2px_20px_rgba(56,189,248,0.35)]">
                      +{bonusPercent} %
                    </span>
                    <span className="text-[0.62em] font-semibold uppercase tracking-[0.12em] text-white/75"> k bodům</span>
                  </>
                ) : (
                  <span className="text-white/90">Právě bez časového bonusu</span>
                )}
              </p>
              <p className="mt-3 text-sm">
                <Link
                  href="/pravidla-souteze"
                  className="inline-flex items-center gap-1 font-medium text-sky-300/95 underline decoration-sky-400/35 underline-offset-[5px] transition hover:text-sky-200 hover:decoration-sky-300/60"
                >
                  více v pravidlech soutěže
                </Link>
              </p>
              <div className="mt-4 rounded-2xl border border-white/[0.07] bg-black/25 px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:px-4">
                <div className="flex gap-2.5">
                  <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-sky-200/55" aria-hidden />
                  <p className="text-[11px] leading-relaxed text-white/50 sm:text-xs">
                    <span className="block font-medium text-white/65">Uzávěrka odeslání</span>
                    <span className="mt-0.5 block text-white/80">{CONTEST_DEADLINE_CS}</span>
                    {!submissionOpen ? (
                      <span className="mt-2 block font-semibold text-rose-300/95">
                        Soutěž už nepřijímá nové nominace k vyhodnocení.
                      </span>
                    ) : null}
                  </p>
                </div>
              </div>
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
