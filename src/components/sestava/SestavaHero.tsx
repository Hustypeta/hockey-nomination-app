"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { TOTAL_PLAYERS } from "@/types";

export function SestavaHero({
  filled,
  subtitleCounts,
  uiVariant = "classic",
}: {
  filled: number;
  subtitleCounts?: string | null;
  uiVariant?: "classic" | "fifa";
}) {
  const { data: session, status } = useSession();
  const fifaUi = uiVariant === "fifa";

  const pct = Math.min(100, Math.round((filled / TOTAL_PLAYERS) * 100));

  return (
    <header
      className={
        fifaUi
          ? "fifa-editor-hero"
          : "relative border-b border-white/[0.1] bg-gradient-to-b from-[#0a1224]/95 via-[#080d18]/92 to-[#060a14]/95 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-xl backdrop-saturate-150"
      }
    >
      {!fifaUi ? (
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.1]"
          style={{
            background:
              "radial-gradient(ellipse 80% 80% at 15% 0%, rgba(200,16,46,0.45), transparent 50%), radial-gradient(ellipse 60% 60% at 90% 0%, rgba(0,48,135,0.4), transparent 50%)",
          }}
          aria-hidden
        />
      ) : null}
      <div className="relative mx-auto max-w-[90rem] px-3 py-1.5 sm:px-4 sm:py-3 lg:px-6">
        {/* Řádek 1: logo, titulek, komunita, bonus, přihlášení */}
        <div className="flex flex-col gap-1.5 sm:gap-2.5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center">
            <div className="min-w-0 flex-1">
              <h1
                className={
                  fifaUi
                    ? "font-display text-lg font-semibold leading-snug text-[var(--fifa-text)] sm:text-xl"
                    : "font-sans text-lg font-bold leading-snug tracking-normal text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.75)] sm:text-2xl lg:text-[1.75rem]"
                }
              >
                Editor nominace
              </h1>
              {subtitleCounts ? (
                <p
                  className="mt-0.5 line-clamp-1 text-[10px] leading-snug text-slate-400 sm:text-[11px]"
                  title={subtitleCounts}
                >
                  {subtitleCounts}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            {status === "loading" ? (
              <span className="text-[10px] text-white/40">…</span>
            ) : session ? (
              <div className="flex items-center gap-1.5">
                <span className="hidden max-w-[140px] truncate text-[10px] text-white/45 xl:inline" title={session.user?.email ?? ""}>
                  {session.user?.email}
                </span>
                <button
                  type="button"
                  onClick={() => signOut()}
                  className={
                    fifaUi
                      ? "rounded-md border border-[var(--fifa-border)] px-2 py-1 text-[10px] font-medium text-[var(--fifa-text-secondary)] transition hover:border-[var(--fifa-border-strong)] hover:bg-[var(--fifa-bg-hover)] sm:px-2.5 sm:text-xs"
                      : "rounded-lg border border-white/12 px-2 py-1 text-[10px] font-medium text-white/85 transition hover:border-[#c8102e]/40 hover:bg-[#c8102e]/10 sm:px-2.5 sm:text-xs"
                  }
                >
                  Odhlásit
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => signIn("google", { callbackUrl: "/sestava" })}
                className={
                  fifaUi
                    ? "fifa-btn-primary px-2.5 py-1 text-[10px] sm:text-xs"
                    : "rounded-lg bg-gradient-to-r from-[#003087] to-[#002060] px-2.5 py-1 text-[10px] font-bold text-white shadow-md ring-1 ring-white/10 sm:text-xs"
                }
              >
                Google
              </button>
            )}
          </div>
        </div>

        {/* Řádek 2: obsazeno + progress */}
        <div className={`mt-1.5 flex flex-wrap items-center gap-2 border-t pt-1.5 sm:mt-2 sm:pt-2 ${fifaUi ? "border-[var(--fifa-border)]" : "border-white/[0.06]"}`}>
          <div className="flex items-center gap-2">
            <span className={`text-[9px] font-bold uppercase tracking-wider ${fifaUi ? "text-[var(--fifa-text-muted)]" : "text-white/40"}`}>
              Sestava
            </span>
            <span className={`font-display text-xl font-bold tabular-nums leading-none sm:text-3xl ${fifaUi ? "text-[var(--fifa-text)]" : "text-white"}`}>
              {filled}
              <span className={`text-lg font-semibold sm:text-xl ${fifaUi ? "text-[var(--fifa-text-muted)]" : "text-white/35"}`}>
                /{TOTAL_PLAYERS}
              </span>
            </span>
            <span
              className={
                fifaUi
                  ? "fifa-badge tabular-nums"
                  : "rounded-full border border-sky-400/35 bg-sky-400/12 px-2 py-0.5 font-display text-xs font-bold tabular-nums text-sky-300"
              }
            >
              {pct}%
            </span>
          </div>
          <div
            className={`h-2 min-w-[8rem] flex-1 overflow-hidden rounded-full ${fifaUi ? "bg-[var(--fifa-bg-base)] ring-1 ring-[var(--fifa-border)]" : "bg-[#0f172a] ring-1 ring-white/[0.08]"}`}
            role="progressbar"
            aria-valuenow={filled}
            aria-valuemin={0}
            aria-valuemax={TOTAL_PLAYERS}
          >
            <div
              className={`h-full rounded-full transition-[width] duration-500 ease-out ${fifaUi ? "bg-[var(--fifa-accent)]" : "bg-gradient-to-r from-[#c8102e] via-[#e12d4a] to-[#003087]"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
