import Link from "next/link";
import { SITE_INSTAGRAM_PAGE_URL } from "@/lib/siteBranding";

const LOADING_INSTAGRAM_FALLBACK = "https://www.instagram.com/svet_hokeje/";

function InstagramMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
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
      <path d="M17.5 6.7h.01" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

export type LoadingScreenUsefulLinksProps = {
  className?: string;
  eyebrow?: string;
  subtitle?: string;
  /** Bez horních řádků eyebrow/subtitle (vlastní text nad komponentou, např. homepage). */
  hideIntro?: boolean;
};

/**
 * Viditelné odkazy na stejné články jako v editoru nominace / Pick’emu + IG Svět_hokeje.
 * Použití při čekání (Suspense fallback, vlastní „loading“ stavy).
 */
export function LoadingScreenUsefulLinks({
  className = "",
  eyebrow = "Čeká se na načtení — mezitím",
  subtitle = "Články na webu",
  hideIntro = false,
}: LoadingScreenUsefulLinksProps) {
  const instagramHref = SITE_INSTAGRAM_PAGE_URL?.trim() || LOADING_INSTAGRAM_FALLBACK;
  const instagramLabel =
    instagramHref === LOADING_INSTAGRAM_FALLBACK ? "Instagram Svět_hokeje" : "Instagram";

  return (
    <div
      className={`w-full rounded-2xl border-2 border-[#f1c40f]/40 bg-gradient-to-br from-[#003087]/35 via-black/55 to-[#c8102e]/25 p-4 shadow-[0_12px_48px_rgba(0,0,0,0.55)] ring-2 ring-white/[0.08] sm:p-6 ${className}`}
    >
      {!hideIntro ? (
        <>
          <p className="text-center text-[11px] font-black uppercase tracking-[0.24em] text-[#f1c40f]">
            {eyebrow}
          </p>
          <p className="mt-2 text-center text-[10px] font-black uppercase tracking-[0.22em] text-white/80">
            {subtitle}
          </p>
        </>
      ) : null}

      <div className={`grid gap-3 sm:grid-cols-2 ${hideIntro ? "" : "mt-4"}`}>
        <Link
          href="/clanky/rady-k-nominaci"
          className="group block rounded-xl border-2 border-white/20 bg-black/55 p-4 shadow-lg transition hover:border-[#00B4FF]/60 hover:bg-[#082040]/95"
        >
          <p className="font-display text-base font-black text-white sm:text-lg">Rady k nominaci</p>
          <p className="mt-2 text-xs leading-snug text-white/75">
            Tipy pro sestavení nominace (brankáři, posily, AHL…)
          </p>
          <p className="mt-4 text-sm font-black text-cyan-200 underline underline-offset-4 decoration-2 group-hover:text-white">
            Otevřít článek →
          </p>
        </Link>

        <Link
          href="/clanky/kurzy-a-analyza-ms-2026"
          className="group block rounded-xl border-2 border-white/20 bg-black/55 p-4 shadow-lg transition hover:border-[#f1c40f]/55 hover:bg-[#1a1408]/95"
        >
          <p className="font-display text-base font-black text-white sm:text-lg leading-snug">
            Kurzy a analýza: Kdo ovládne MS v hokeji 2026?
          </p>
          <p className="mt-2 text-xs leading-snug text-white/75">Přehled kurzů + rychlá analýza favoritů.</p>
          <p className="mt-4 text-sm font-black text-amber-200 underline underline-offset-4 decoration-2 group-hover:text-white">
            Otevřít článek →
          </p>
        </Link>
      </div>

      <div className="mt-6 border-t-2 border-white/15 pt-5 text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/85">
          Více ze světa hokeje
        </p>
        <a
          href={instagramHref}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex w-full max-w-sm items-center justify-center gap-2.5 rounded-xl border-2 border-[#f1c40f]/50 bg-gradient-to-r from-[#833ab4]/30 via-[#fd1d1d]/20 to-[#fcb045]/25 px-5 py-3.5 text-[15px] font-black text-white shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition hover:border-[#f1c40f] hover:brightness-110 sm:w-auto"
        >
          <InstagramMark className="h-5 w-5 shrink-0 text-white" />
          {instagramLabel}
        </a>
      </div>
    </div>
  );
}
