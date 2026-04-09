"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { TOTAL_PLAYERS } from "@/types";

export function SestavaHero({
  filled,
  subtitleCounts,
}: {
  filled: number;
  subtitleCounts: string;
}) {
  const { data: session, status } = useSession();

  const pct = Math.min(100, Math.round((filled / TOTAL_PLAYERS) * 100));
  const r = 22;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#0a0a0a]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#c8102e] to-[#8b0b20] font-display text-lg font-bold text-white shadow-lg ring-2 ring-[#d4af37]/30">
            ČR
          </div>
          <div>
            <Link href="/" className="text-xs text-white/40 transition-colors hover:text-[#c8102e]">
              ← Úvod
            </Link>
            <h1 className="font-display text-3xl font-bold tracking-tight text-white md:text-4xl">MS 2026</h1>
            <p className="text-sm font-medium text-[#d4af37]/90">Moje nominace</p>
          </div>
        </div>

        <div className="flex flex-1 flex-col items-center gap-1 text-center lg:max-w-xl">
          <h2 className="text-balance font-display text-xl font-bold tracking-tight text-white sm:text-2xl md:text-3xl">
            Sestav svou nominaci
          </h2>
          <p className="text-xs text-white/45 sm:text-sm">{subtitleCounts}</p>
        </div>

        <div className="flex items-center justify-between gap-4 sm:justify-end">
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center">
            <svg className="-rotate-90" width="56" height="56" viewBox="0 0 56 56" aria-hidden>
              <circle cx="28" cy="28" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
              <circle
                cx="28"
                cy="28"
                r={r}
                fill="none"
                stroke="url(#sestava-prog)"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={`${dash} ${circ}`}
              />
              <defs>
                <linearGradient id="sestava-prog" x1="0" y1="0" x2="1" y2="1">
                  <stop stopColor="#c8102e" />
                  <stop offset="1" stopColor="#003087" />
                </linearGradient>
              </defs>
            </svg>
            <span className="absolute font-display text-xs font-bold text-white">
              {filled}/{TOTAL_PLAYERS}
            </span>
          </div>

          <div className="flex flex-col items-end gap-2">
            {status === "loading" ? (
              <span className="text-white/40">…</span>
            ) : session ? (
              <>
                <span
                  className="hidden max-w-[180px] truncate text-xs text-white/50 sm:block"
                  title={session.user?.email ?? ""}
                >
                  {session.user?.email}
                </span>
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="rounded-xl border border-white/10 px-3 py-1.5 text-xs text-white/80 hover:border-[#c8102e]/50"
                >
                  Odhlásit
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => signIn("google", { callbackUrl: "/sestava" })}
                className="rounded-xl bg-[#003087] px-3 py-2 font-display text-sm text-white hover:bg-[#0040a8]"
              >
                Přihlásit Google
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
