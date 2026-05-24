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
}: {
  title: string;
  children: ReactNode;
  status: ReactNode;
}) {
  return (
    <div className="flex gap-3 rounded-xl border border-white/10 bg-black/25 px-3.5 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] sm:gap-4 sm:px-4 sm:py-4">
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
    <span className="inline-flex items-center gap-1 rounded-lg border border-rose-400/30 bg-rose-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-rose-200/95">
      <Lock className="h-3 w-3 shrink-0" aria-hidden />
      Uzavřeno
    </span>
  );
}

function OpenBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-lg border border-emerald-400/35 bg-emerald-500/12 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-100">
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
          <ContestRow title="Nominační soutěž" status={<ClosedBadge />}>
            {NOMINATION_CLOSED_TEXT}
          </ContestRow>

          <ContestRow title="Pick'em" status={pickemSubmissionOpen ? <OpenBadge /> : <ClosedBadge />}>
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

          <ContestRow title="Fantasy" status={<OpenBadge />}>
            <span className="inline-flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-200">
                <Check className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden />
                Fantasy otevřeno
              </span>
              <span className="text-white/70">—</span>
              <Link
                href="/fantasy"
                className="font-semibold text-sky-300 underline-offset-2 hover:text-sky-200 hover:underline"
              >
                Hrát fantasy
              </Link>
            </span>
          </ContestRow>
        </div>
      </div>
    </section>
  );
}
