"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { SITE_BRAND, SITE_INSTAGRAM_PAGE_URL } from "@/lib/siteBranding";

function InstagramMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={className}
    >
      <path
        d="M7.6 2h8.8A5.6 5.6 0 0 1 22 7.6v8.8A5.6 5.6 0 0 1 16.4 22H7.6A5.6 5.6 0 0 1 2 16.4V7.6A5.6 5.6 0 0 1 7.6 2Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M12 16.3A4.3 4.3 0 1 0 12 7.7a4.3 4.3 0 0 0 0 8.6Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M17.5 6.7h.01"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

const DEFAULT_INTRO =
  "Staň se na chvíli trenérem národního týmu České hokejové reprezentace. Sestav si svojí vlastní nominaci a soutěž o zajímavé ceny.";

type AppLoadingScreenProps = {
  /** Stav načítání pod úvodním textem (např. „Načítám hráče…“). */
  message?: string;
  /**
   * Úvodní text místo výchozího. `null` = nezobrazovat (např. stránka sdíleného odkazu).
   */
  intro?: string | null;
  /** Nepřihlášení — výrazné Přihlásit + blok výhod (editor sestavy). */
  showSignInCta?: boolean;
};

/**
 * Jednotná celostránková obrazovka při načítání dat — sladěná s hlavičkou editoru sestavy.
 */
export function AppLoadingScreen({
  message = "Načítám…",
  intro,
  showSignInCta = false,
}: AppLoadingScreenProps) {
  const introText = intro === undefined ? DEFAULT_INTRO : intro;

  const handleSignIn = () => {
    const cb =
      typeof window !== "undefined" ? `${window.location.pathname}${window.location.search}` : "/sestava";
    signIn(undefined, { callbackUrl: cb || "/sestava" });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0c0e12]">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 50% at 50% -20%, #003f87 0%, transparent 55%)",
        }}
      />
      <div className="relative flex min-h-screen flex-col items-center justify-center px-6 py-10">
        <div className="flex w-full max-w-4xl flex-col items-center rounded-2xl border border-[#2a3142] bg-[#151922]/90 px-6 py-10 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-sm sm:px-8 sm:py-12">
          <div
            className="relative mb-10 flex aspect-square w-[min(40.5rem,calc(100vw-2.5rem))] items-center justify-center rounded-full border-[10px] border-[#003f87]/45 bg-[#003f87]/[0.08] shadow-[inset_0_0_48px_rgba(0,63,135,0.15)] sm:mb-12"
            aria-hidden
          >
            <div className="absolute inset-0 rounded-full border-[10px] border-transparent border-t-[#c41e3a]/90 border-r-[#003f87]/50 animate-spin [animation-duration:1.15s]" />
            <span className="relative z-10 font-display text-6xl tracking-[0.18em] text-[#003f87]/90 sm:text-7xl md:text-8xl">
              ČR
            </span>
          </div>
          <h1 className="font-display text-3xl tracking-[0.14em] text-white md:text-4xl">{SITE_BRAND}</h1>
          <p className="mt-1 font-display text-sm tracking-[0.18em] text-[#c41e3a]/90">MS 2026 · nominace</p>
          {introText ? (
            <p className="mt-6 text-center text-sm leading-relaxed text-white/80 sm:text-[15px]">
              {introText}
            </p>
          ) : null}
          <div className="mt-8 flex items-center gap-3 text-white/55">
            <span
              className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[#003f87] animate-pulse"
              aria-hidden
            />
            <span className="text-sm tracking-wide">{message}</span>
          </div>

          <div className="mt-8 w-full rounded-2xl border border-white/[0.1] bg-black/20 p-4 sm:p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/55">Články</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Link
                href="/clanky/rady-k-nominaci"
                className="group rounded-xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-[#00B4FF]/30 hover:bg-white/[0.05]"
              >
                <p className="font-display text-base font-black text-white">Rady k nominaci</p>
                <p className="mt-1 text-xs leading-snug text-white/60">
                  Tipy pro sestavení nominace (brankáři, posily, AHL…)
                </p>
                <p className="mt-3 text-xs font-semibold text-sky-300/95 group-hover:underline underline-offset-4">
                  Otevřít článek
                </p>
              </Link>
              <Link
                href="/clanky/kurzy-a-analyza-ms-2026"
                className="group rounded-xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-[#f1c40f]/30 hover:bg-white/[0.05]"
              >
                <p className="font-display text-base font-black text-white">
                  Kurzy a analýza: Kdo ovládne MS v hokeji 2026?
                </p>
                <p className="mt-1 text-xs leading-snug text-white/60">
                  Přehled kurzů + rychlá analýza favoritů.
                </p>
                <p className="mt-3 text-xs font-semibold text-amber-200/95 group-hover:underline underline-offset-4">
                  Otevřít článek
                </p>
              </Link>
            </div>
          </div>

          {showSignInCta ? (
            <div className="mt-8 w-full border-t border-white/[0.08] pt-8">
              <button
                type="button"
                onClick={handleSignIn}
                className="w-full rounded-xl bg-gradient-to-r from-[#003087] to-[#002056] px-5 py-3.5 text-center font-display text-base font-bold uppercase tracking-[0.12em] text-white shadow-[0_8px_28px_rgba(0,48,135,0.45)] transition hover:brightness-110 active:scale-[0.99]"
              >
                Přihlásit se
              </button>

              <div className="mt-5 rounded-xl border border-sky-500/25 bg-[#0f172a]/85 px-4 py-4 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                <p className="font-display text-xs font-bold uppercase tracking-[0.18em] text-sky-200/95">
                  Proč se přihlásit?
                </p>
                <ul className="mt-3 space-y-2.5 text-[13px] leading-snug text-white/82">
                  <li className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#c41e3a]" aria-hidden />
                    <span>Ukládat nominaci k účtu a vrátit se k ní později.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#003f87]" aria-hidden />
                    <span>Kratší odkaz po uložení místo dlouhého sdíleného řetězce v URL.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-white/35" aria-hidden />
                    <span>Odeslat nominaci do soutěže (když je otevřená) a zapojit se do vyhodnocení.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-white/35" aria-hidden />
                    <span>Přehled nominací v sekci účet.</span>
                  </li>
                </ul>
              </div>
            </div>
          ) : null}

          {SITE_INSTAGRAM_PAGE_URL ? (
            <div className={`text-center ${showSignInCta ? "mt-7" : "mt-8"}`}>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/55">
                Více novinek ze světa hokeje na
              </p>
              <a
                href={SITE_INSTAGRAM_PAGE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/[0.04] px-4 py-2.5 text-sm font-bold text-sky-200/95 transition hover:border-[#00B4FF]/35 hover:bg-[#00B4FF]/10 hover:text-white"
              >
                <InstagramMark className="h-4 w-4" />
                Instagram
              </a>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
