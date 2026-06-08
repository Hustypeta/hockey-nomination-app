"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Check, Lock, Trophy } from "lucide-react";

const NOMINATION_CLOSED_TEXT = (
  <>
    Nominační soutěž ukončena — výsledky jsou zveřejněné v{" "}
    <Link href="/zebricek" className="font-semibold text-sky-300 underline-offset-2 hover:text-sky-200 hover:underline">
      žebříčku nominace
    </Link>
    .
  </>
);

type ContestsStatusBannerProps = {
  pickemSubmissionOpen: boolean;
  className?: string;
};

function ContestRow({
  title,
  children,
  status,
  accentClassName = "",
}: {
  title: string;
  children: ReactNode;
  status: ReactNode;
  accentClassName?: string;
}) {
  return (
    <div
      className={`group/row relative flex gap-3 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-black/30 px-3.5 py-3.5 shadow-[0_12px_36px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.06)] transition duration-200 hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.07] sm:gap-4 sm:px-4 sm:py-4 ${accentClassName}`}
    >
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-transparent via-white/25 to-transparent opacity-60"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        aria-hidden
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, rgba(255,255,255,0.18) 0px, rgba(255,255,255,0.18) 1px, transparent 1px, transparent 12px)",
        }}
      />
      <div className="min-w-0 flex-1">
        <p className="font-display text-[11px] font-bold uppercase tracking-[0.18em] text-sky-200/90 sm:text-xs">
          {title}
        </p>
        <div className="mt-1.5 text-pretty text-sm leading-relaxed text-white/82 sm:text-[15px]">{children}</div>
      </div>
      <div className="flex shrink-0 flex-col items-end justify-center">{status}</div>
    </div>
  );
}

function ClosedBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-xl border border-rose-400/30 bg-rose-500/10 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-rose-200/95 shadow-[0_0_28px_rgba(255,45,85,0.10)]">
      <Lock className="h-3 w-3 shrink-0" aria-hidden />
      Uzavřeno
    </span>
  );
}

function OpenBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-xl border border-emerald-400/35 bg-emerald-500/12 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-100 shadow-[0_0_28px_rgba(16,185,129,0.10)]">
      <Check className="h-3.5 w-3.5 shrink-0 text-emerald-300" aria-hidden />
      Otevřeno
    </span>
  );
}

export function ContestsStatusBanner({ pickemSubmissionOpen, className = "" }: ContestsStatusBannerProps) {
  return (
    <section
      className={`group relative w-full overflow-hidden rounded-2xl border border-sky-400/20 bg-gradient-to-br from-[#0c182e]/95 via-[#0c1018]/98 to-[#03050a] shadow-[0_0_0_1px_rgba(56,189,248,0.08),0_24px_52px_-14px_rgba(0,48,135,0.38),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl ${className}`}
      aria-labelledby="contests-status-heading"
    >
      <div
        className="pointer-events-none absolute -right-1/4 -top-1/4 h-[85%] w-[55%] bg-[radial-gradient(ellipse_at_70%_0%,rgba(56,189,248,0.22),transparent_55%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sky-400/28 to-transparent"
        aria-hidden
      />

      <div className="relative z-10 px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-300/35 via-sky-500/15 to-[#003087]/40 text-sky-50 shadow-[0_0_0_1px_rgba(125,211,252,0.35),0_8px_28px_rgba(56,189,248,0.28),inset_0_1px_0_rgba(255,255,255,0.2)] ring-1 ring-sky-300/28 sm:h-12 sm:w-12">
            <Trophy className="h-5 w-5 drop-shadow-[0_0_10px_rgba(56,189,248,0.55)] sm:h-6 sm:w-6" aria-hidden />
          </div>
          <h2
            id="contests-status-heading"
            className="font-display text-lg font-black uppercase tracking-[0.14em] text-white sm:text-xl"
          >
            Soutěže
          </h2>
        </div>

        <div className="mt-4 flex flex-col gap-2.5">
          <ContestRow
            title="Nominační soutěž"
            status={<ClosedBadge />}
            accentClassName="border-[#003087]/18 hover:border-[#003087]/28"
          >
            {NOMINATION_CLOSED_TEXT}
          </ContestRow>

          <ContestRow
            title="Pick'em"
            status={pickemSubmissionOpen ? <OpenBadge /> : <ClosedBadge />}
            accentClassName="border-[#00B4FF]/18 hover:border-[#00B4FF]/28"
          >
            {pickemSubmissionOpen ? (
              <>
                Tipni play-off a bonusy v{" "}
                <Link href="/bracket" className="font-semibold text-sky-300 underline-offset-2 hover:text-sky-200 hover:underline">
                  Pick&apos;em na MS 2026
                </Link>
                .
              </>
            ) : (
              "Soutěž Pick'em na MS 2026 uzavřena!"
            )}
          </ContestRow>

          <ContestRow
            title="Fantasy"
            status={<ClosedBadge />}
            accentClassName="border-rose-400/18 hover:border-rose-400/28"
          >
            Soutěž Daily Fantasy na MS 2026 uzavřena — výsledky jsou v{" "}
            <Link
              href="/zebricek?soutez=fantasy"
              className="font-semibold text-sky-300 underline-offset-2 hover:text-sky-200 hover:underline"
            >
              žebříčku Fantasy
            </Link>
            .
          </ContestRow>
        </div>
      </div>
    </section>
  );
}
