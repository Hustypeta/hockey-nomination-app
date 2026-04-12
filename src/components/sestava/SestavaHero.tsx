"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { TOTAL_PLAYERS } from "@/types";
import { ContestTimeBonusCallout } from "@/components/ContestTimeBonusCallout";
import type { ContestTimeBonusPercent } from "@/lib/contestTimeBonus";

export function SestavaHero({
  filled,
  subtitleCounts,
  contestTimeBonusPercent,
  contestSubmissionOpen,
}: {
  filled: number;
  subtitleCounts: string;
  contestTimeBonusPercent: ContestTimeBonusPercent;
  contestSubmissionOpen: boolean;
}) {
  const { data: session, status } = useSession();

  const pct = Math.min(100, Math.round((filled / TOTAL_PLAYERS) * 100));

  return (
    <div className="border-b border-white/[0.08] bg-[#05080f]/90 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex max-w-[90rem] flex-col gap-6 px-4 py-6 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
        <div className="flex items-center gap-4">
          <div className="flex h-[3.75rem] w-[3.75rem] shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#c8102e] via-[#a30d26] to-[#003087] text-lg font-bold text-white shadow-[0_0_40px_rgba(200,16,46,0.4),0_0_0_1px_rgba(255,255,255,0.12)_inset] ring-2 ring-white/20">
            <span className="font-display tracking-tight">ČR</span>
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-white md:text-4xl">MS 2026</h1>
            <p className="text-sm font-medium text-sky-200/90">Česká reprezentace</p>
          </div>
        </div>

        <div className="flex flex-1 flex-col items-center gap-4 text-center lg:max-w-2xl">
          <h2 className="text-balance text-xl font-semibold tracking-tight text-white sm:text-2xl md:text-[1.75rem]">
            Sestav svou nominaci
          </h2>
          <p className="max-w-xl text-xs leading-relaxed text-white/50 sm:text-sm">{subtitleCounts}</p>
          <div className="w-full max-w-lg space-y-3">
            <div className="flex items-end justify-center gap-4 sm:justify-between sm:gap-6">
              <div className="text-left">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/38">Obsazeno</p>
                <p className="font-display text-4xl font-bold tabular-nums leading-none text-white sm:text-5xl">
                  {filled}
                  <span className="text-2xl font-semibold text-white/30 sm:text-3xl">/{TOTAL_PLAYERS}</span>
                </p>
              </div>
              <span className="mb-1 rounded-full border border-[#003087]/45 bg-gradient-to-r from-[#003087]/25 to-[#003087]/10 px-4 py-1.5 text-sm font-bold tabular-nums text-sky-100 shadow-[0_0_24px_rgba(0,48,135,0.25)]">
                {pct}%
              </span>
            </div>
            <div
              className="h-3 w-full overflow-hidden rounded-full bg-[#0a0e17] ring-1 ring-white/[0.1] shadow-inner"
              role="progressbar"
              aria-valuenow={filled}
              aria-valuemin={0}
              aria-valuemax={TOTAL_PLAYERS}
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#c8102e] via-[#ff3355] to-[#003087] shadow-[0_0_24px_rgba(200,16,46,0.5)] transition-[width] duration-500 ease-out"
                style={{ width: `${pct}%` }}
              />
            </div>
            <ContestTimeBonusCallout
              variant="builder"
              bonusPercent={contestTimeBonusPercent}
              submissionOpen={contestSubmissionOpen}
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 sm:justify-end">
          <div className="flex flex-col items-end gap-2">
            {status === "loading" ? (
              <span className="text-white/40">…</span>
            ) : session ? (
              <>
                <span
                  className="hidden max-w-[200px] truncate text-xs text-white/50 sm:block"
                  title={session.user?.email ?? ""}
                >
                  {session.user?.email}
                </span>
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="rounded-xl border border-white/12 px-3 py-2 text-xs font-medium text-white/85 transition-colors hover:border-[#c8102e]/45 hover:text-white"
                >
                  Odhlásit
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => signIn("google", { callbackUrl: "/sestava" })}
                className="rounded-xl bg-[#003087] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_24px_rgba(0,48,135,0.35)] transition-colors hover:bg-[#0040a8]"
              >
                Přihlásit Google
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
