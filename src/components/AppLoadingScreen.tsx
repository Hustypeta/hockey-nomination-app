"use client";

import { signIn } from "next-auth/react";
import { SITE_BRAND } from "@/lib/siteBranding";

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
        <div className="flex w-full max-w-lg flex-col items-center rounded-2xl border border-[#2a3142] bg-[#151922]/90 px-6 py-10 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-sm sm:px-8 sm:py-12">
          <div
            className="relative mb-6 flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full border-2 border-[#003f87]/45 bg-[#003f87]/[0.08] shadow-[inset_0_0_24px_rgba(0,63,135,0.15)] sm:mb-8"
            aria-hidden
          >
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#c41e3a]/90 border-r-[#003f87]/50 animate-spin [animation-duration:1.15s]" />
            <span className="relative z-10 font-display text-[10px] tracking-[0.2em] text-[#003f87]/90">
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
        </div>
      </div>
    </div>
  );
}
