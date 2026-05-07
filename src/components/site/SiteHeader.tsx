"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { SITE_BRAND, SITE_LOGO_URL } from "@/lib/siteBranding";

type NavItem = { href: string; label: string; shortLabel?: string };

/** shortLabel = kratší text na úzkém desktopu (pod 2xl), aby se vešly všechny položky bez skrytého scrollu */
const NAV: NavItem[] = [
  { href: "/", label: "Úvod" },
  { href: "/ucet", label: "Můj účet", shortLabel: "Účet" },
  { href: "/sestava", label: "Editor sestavy", shortLabel: "Editor" },
  { href: "/zapasy/sestava", label: "Tvorba sestavy na zápas", shortLabel: "Sestava zápas" },
  { href: "/zapasy", label: "Zápasy", shortLabel: "Zápasy" },
  { href: "/bracket", label: "Pick’em" },
  { href: "/forum", label: "Fórum" },
  { href: "/zebricek", label: "Žebříček" },
  { href: "/pravidla-souteze", label: "Pravidla" },
];

const ICE = "#00B4FF";
const ICE_DIM = "#0090cc";

function isHrefMatch(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

function activeHrefForPath(pathname: string): string {
  // Ensure only one nav item is marked active (pick the most specific / longest match).
  // Example: "/zapasy/sestava" should activate "/zapasy/sestava" (not also "/zapasy").
  const matches = NAV.filter((i) => isHrefMatch(pathname, i.href)).sort((a, b) => b.href.length - a.href.length);
  return matches[0]?.href ?? "/";
}

function userInitials(user: { name?: string | null; email?: string | null }) {
  const n = user.name?.trim();
  if (n) {
    const parts = n.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      const a = parts[0]?.[0] ?? "";
      const b = parts[parts.length - 1]?.[0] ?? "";
      return `${a}${b}`.toUpperCase() || "?";
    }
    return (parts[0]?.slice(0, 2) ?? "?").toUpperCase();
  }
  const e = user.email?.trim();
  return (e?.slice(0, 2) ?? "?").toUpperCase();
}

export function SiteHeader() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileNavOpen]);

  const user = session?.user;

  return (
    <>
      <header
        className={`
          site-header-reveal sticky top-0 z-[80] border-b border-white/[0.12]
          bg-gradient-to-b from-[#1c2739]/93 via-[#141c2c]/90 to-[#0c111a]/86
          shadow-[0_4px_24px_rgba(0,0,0,0.26),inset_0_-1px_0_rgba(255,255,255,0.06)]
          backdrop-blur-2xl backdrop-saturate-150
        `}
      >
        {/* Světlejší nahoře — černá silueta v logu lépe čte oproti téměř černému baru */}
        <div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.055)_0%,rgba(0,180,255,0.065)_26%,transparent_46%,rgba(0,48,135,0.065)_100%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00B4FF]/50 to-transparent"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-[#c8102e]/20 via-white/10 to-[#003087]/25"
          aria-hidden
        />

        <div className="relative mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-3 py-3 sm:px-5 sm:py-4 lg:px-4 lg:py-4 xl:px-5">
          {/* Brand (always visible, big) */}
          <Link
            href="/"
            className="group/brand flex min-w-0 flex-1 items-center gap-3"
            aria-label={SITE_BRAND}
          >
            <div className="relative min-w-0">
              <div
                className="pointer-events-none absolute -inset-3 rounded-2xl bg-gradient-to-br from-[#00B4FF]/25 via-transparent to-[#c8102e]/15 opacity-0 blur-xl transition-opacity duration-300 group-hover/brand:opacity-100"
                aria-hidden
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={SITE_LOGO_URL}
                alt=""
                width={920}
                height={280}
                decoding="async"
                fetchPriority="high"
                className="relative h-[4.75rem] w-auto max-w-[min(88vw,42rem)] object-contain object-left transition duration-300 group-hover/brand:scale-[1.03] sm:h-[5.75rem] md:h-[6.5rem] lg:h-[6.25rem] xl:h-[6.75rem] 2xl:h-[7.25rem]"
              />
            </div>
          </Link>

          {/* Menu toggle (always visible) */}
          <button
            type="button"
            className={`
              flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/[0.12] bg-white/[0.05] text-white
              transition duration-200 hover:scale-105 hover:border-[#00B4FF]/40 hover:bg-[#00B4FF]/10
              ${mobileNavOpen ? "border-[#00B4FF]/50 bg-[#00B4FF]/15 text-[#00B4FF]" : ""}
            `}
            aria-expanded={mobileNavOpen}
            aria-controls="site-header-mobile-nav"
            onClick={() => setMobileNavOpen((o) => !o)}
          >
            <span className="relative block h-6 w-6">
              <Menu
                className={`absolute inset-0 h-6 w-6 transition-all duration-300 ${mobileNavOpen ? "scale-50 rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100"}`}
                aria-hidden
              />
              <X
                className={`absolute inset-0 h-6 w-6 transition-all duration-300 ${mobileNavOpen ? "scale-100 rotate-0 opacity-100" : "scale-50 -rotate-90 opacity-0"}`}
                aria-hidden
              />
            </span>
            <span className="sr-only">{mobileNavOpen ? "Zavřít menu" : "Otevřít menu"}</span>
          </button>
        </div>
      </header>

      {/* Overlay + panel (same UX on desktop and mobile) */}
      <div
        className={`
          fixed inset-0 z-[100]
          transition-[opacity,visibility] duration-300
          ${mobileNavOpen ? "visible opacity-100" : "invisible opacity-0 pointer-events-none"}
        `}
        aria-hidden={!mobileNavOpen}
      >
        <button
          type="button"
          className="absolute inset-0 bg-[#010208]/80 backdrop-blur-md"
          aria-label="Zavřít menu"
          onClick={() => setMobileNavOpen(false)}
        />
        <div
          id="site-header-mobile-nav"
          className={`
            site-nav-mobile-panel absolute z-[101] flex flex-col overflow-hidden border border-white/[0.12]
            bg-gradient-to-b from-[#0b1220]/98 to-[#03050a]/98 shadow-[0_24px_80px_rgba(0,0,0,0.65),0_0_0_1px_rgba(0,180,255,0.12)]
            backdrop-blur-2xl
            transition-transform duration-300 ease-out
            ${mobileNavOpen ? "translate-x-0" : "translate-x-[105%]"}
            left-2 right-2 top-[calc(0.5rem+env(safe-area-inset-top))] max-h-[min(88dvh,640px)] rounded-2xl
            lg:left-auto lg:right-0 lg:top-0 lg:bottom-0 lg:max-h-none lg:w-[24rem] lg:rounded-none lg:border-y-0 lg:border-r-0
            ${mobileNavOpen ? "" : "pointer-events-none"}
          `}
        >
          <div className="flex items-center justify-between gap-3 border-b border-white/[0.08] px-4 py-3">
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.26em] text-white/50">Menu</p>
              <Link
                href="/"
                onClick={() => setMobileNavOpen(false)}
                className="mt-2 block"
                aria-label={SITE_BRAND}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={SITE_LOGO_URL}
                  alt=""
                  width={560}
                  height={168}
                  decoding="async"
                  className="h-10 w-auto max-w-full object-contain object-left opacity-95"
                />
              </Link>
            </div>
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.06] text-white transition hover:bg-white/10"
              onClick={() => setMobileNavOpen(false)}
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>

          <nav className="min-h-0 flex-1 overflow-y-auto px-2 py-3" aria-label="Hlavní navigace">
            <ul className="flex flex-col gap-1">
              {NAV.map(({ href, label }) => {
                const active = href === activeHrefForPath(pathname);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={() => setMobileNavOpen(false)}
                      className={`
                        flex items-center justify-between rounded-xl px-4 py-3.5 text-base font-semibold tracking-wide transition duration-200
                        ${active ? "bg-white/[0.1] text-white shadow-[inset_0_0_0_1px_rgba(0,180,255,0.25)]" : "text-slate-300 hover:bg-white/[0.06] hover:text-white"}
                      `}
                    >
                      {label}
                      {active ? (
                        <span className="h-2 w-2 rounded-full bg-[#00B4FF] shadow-[0_0_10px_#00B4FF]" aria-hidden />
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="shrink-0 space-y-3 border-t border-white/[0.08] p-4">
            {status === "authenticated" && user ? (
              <>
                <div className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.04] p-3">
                  {user.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.image} alt="" width={44} height={44} className="h-11 w-11 rounded-full object-cover ring-2 ring-[#00B4FF]/40" />
                  ) : (
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-800 text-sm font-bold text-white ring-2 ring-[#00B4FF]/40">
                      {userInitials(user)}
                    </span>
                  )}
                  <p className="min-w-0 flex-1 truncate text-sm text-slate-400">{user.email}</p>
                </div>
                <Link
                  href="/sestava"
                  onClick={() => setMobileNavOpen(false)}
                  className="block w-full rounded-xl bg-gradient-to-r from-[#0090cc] to-[#00B4FF] py-3.5 text-center font-display text-sm font-bold uppercase tracking-[0.16em] text-[#03050a] shadow-[0_0_24px_rgba(0,180,255,0.45)] ring-1 ring-white/20 transition active:scale-[0.99]"
                >
                  Do editoru sestavy
                </Link>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  className="rounded-xl border border-white/15 bg-white/[0.05] py-3.5 text-sm font-semibold text-white transition hover:border-[#00B4FF]/40"
                  onClick={() => {
                    setMobileNavOpen(false);
                    void signIn("google", { callbackUrl: "/sestava" });
                  }}
                >
                  Přihlásit
                </button>
                <Link
                  href="/sestava"
                  onClick={() => setMobileNavOpen(false)}
                  className="block rounded-xl bg-gradient-to-r from-[#0090cc] to-[#00B4FF] py-3.5 text-center font-display text-sm font-bold uppercase tracking-[0.16em] text-[#03050a] shadow-[0_0_24px_rgba(0,180,255,0.45)] ring-1 ring-white/20"
                >
                  Začít
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
