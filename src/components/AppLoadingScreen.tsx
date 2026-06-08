"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { SITE_BRAND } from "@/lib/siteBranding";
import { LoadingScreenUsefulLinks } from "@/components/LoadingScreenUsefulLinks";
import { TipsportPartnerBanner } from "@/components/marketing/TipsportPartnerBanner";
import { ContestsStatusBanner } from "@/components/ContestsStatusBanner";
import { UserStandingsInMenu } from "@/components/contest/UserStandingsInMenu";
import { useContestStats } from "@/hooks/useContestStats";
import { useSession } from "next-auth/react";

const DEFAULT_INTRO =
  "Zahraj si Fantasy na MS 2026. Každý den si naklikej svůj tým a soutěž s ostatními a hraj o atraktivní hokejové ceny.";

type AppLoadingScreenProps = {
  /** Řádek pod logem (např. kontext stránky). */
  tagline?: string;
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
 * Jednotná celostránková obrazovka při načítání dat — odkazy nahoře, aby byly vidět bez rolování.
 */
export function AppLoadingScreen({
  tagline = "MS 2026 · Fantasy",
  message = "Načítám…",
  intro,
  showSignInCta = false,
}: AppLoadingScreenProps) {
  const introText = intro === undefined ? DEFAULT_INTRO : intro;
  const contestStats = useContestStats();
  const { status } = useSession();

  const handleSignIn = () => {
    const cb =
      typeof window !== "undefined" ? `${window.location.pathname}${window.location.search}` : "/fantasy";
    signIn(undefined, { callbackUrl: cb || "/fantasy" });
  };

  return (
    <div className="relative min-h-screen overflow-y-auto bg-transparent">
      <div className="relative flex min-h-screen flex-col items-center justify-start px-4 py-6 sm:justify-center sm:px-6 sm:py-10">
        <div className="flex w-full max-w-4xl flex-col items-center rounded-2xl border border-[#2a3142] bg-[#151922]/92 px-4 py-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-sm sm:px-8 sm:py-10">
          <h1 className="font-display text-2xl tracking-[0.14em] text-white sm:text-3xl md:text-4xl">
            {SITE_BRAND}
          </h1>
          <p className="mt-1 font-display text-sm tracking-[0.18em] text-[#c41e3a]/90">{tagline}</p>

          {status === "authenticated" ? (
            <div className="mt-4 flex justify-center">
              <UserStandingsInMenu multiline className="text-center" />
            </div>
          ) : null}

          <p className="mt-4 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 font-display text-sm font-bold uppercase tracking-[0.14em] text-[#00B4FF] underline decoration-[#00B4FF]/50 underline-offset-4 transition hover:text-cyan-200 hover:decoration-cyan-200"
            >
              ← Úvod
            </Link>
          </p>

          <div className="mt-6 w-full sm:mt-8">
            <TipsportPartnerBanner compact />
            <div className="mt-4 flex justify-center">
              <LoadingScreenUsefulLinks />
            </div>
          </div>

          <ContestsStatusBanner
            className="mt-5 w-full sm:mt-6"
            pickemSubmissionOpen={contestStats.pickemSubmissionOpen}
          />

          {introText ? (
            <p className="mt-6 text-center text-sm leading-relaxed text-white/82 sm:text-[15px] sm:mt-8">
              {introText}
            </p>
          ) : null}

          <div className="mt-6 flex items-center gap-3 text-white/70">
            <span
              className="inline-block h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-[#003f87]"
              aria-hidden
            />
            <span className="text-sm font-medium tracking-wide">{message}</span>
          </div>

          <div
            className="relative mt-5 flex aspect-square w-[min(18rem,calc(100vw-2rem))] shrink-0 items-center justify-center rounded-full border-[8px] border-[#003f87]/55 bg-[#003f87]/[0.09] shadow-[inset_0_0_48px_rgba(0,63,135,0.18)] sm:mt-6 sm:w-[min(22rem,calc(100vw-2.5rem))] sm:border-[10px]"
            aria-hidden
          >
            <div className="absolute inset-0 rounded-full border-[8px] border-transparent border-t-[#c41e3a]/90 border-r-[#003f87]/50 animate-spin [animation-duration:1.15s] sm:border-[10px]" />
            <span className="relative z-10 font-display text-5xl tracking-[0.18em] text-[#003f87]/90 sm:text-6xl md:text-7xl">
              ČR
            </span>
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
                    <span>Ukládat fantasy sestavy a nominace k účtu a vracet se k nim později.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#003f87]" aria-hidden />
                    <span>Pick&apos;em na MS 2026 a přehled v účtu.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-white/35" aria-hidden />
                    <span>Zapojit se do soutěží, když jsou otevřené (pravidla vždy u dané aktivity).</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-white/35" aria-hidden />
                    <span>Přehled aktivit v sekci účet.</span>
                  </li>
                </ul>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
