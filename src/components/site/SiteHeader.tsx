"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { SITE_BRAND, SITE_LOGO_URL } from "@/lib/siteBranding";

const NAV = [
  { href: "/", label: "Úvod" },
  { href: "/ucet", label: "Můj účet" },
  { href: "/sestava", label: "Editor sestavy" },
  { href: "/forum", label: "Fórum" },
  { href: "/zebricek", label: "Žebříček" },
  { href: "/bracket", label: "Pick’em" },
  { href: "/kdo-jsem", label: "Kdo jsem" },
  { href: "/pravidla-souteze", label: "Pravidla" },
] as const;

const ICE = "#00B4FF";
const ICE_DIM = "#0090cc";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
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
          site-header-reveal sticky top-0 z-[80] border-b border-white/[0.08]
          bg-[#03050a]/75 shadow-[0_4px_24px_rgba(0,0,0,0.35),inset_0_-1px_0_rgba(255,255,255,0.04)]
          backdrop-blur-2xl backdrop-saturate-150
        `}
      >
        {/* Ledový wash + jemná červená/modrá linka (repre nádech) */}
        <div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,180,255,0.06)_0%,transparent_42%,rgba(0,48,135,0.08)_100%)]"
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

        <div className="relative mx-auto flex max-w-7xl items-center gap-3 px-4 py-4 sm:gap-4 sm:px-6 sm:py-5 lg:py-6">
          {/* Brand */}
          <Link
            href="/"
            className="group/brand flex min-w-0 flex-1 items-center gap-2 sm:gap-3 lg:flex-none lg:gap-4"
            aria-label={`${SITE_BRAND} · MS 2026`}
          >
            <div className="relative shrink-0">
              <div
                className="absolute -inset-2 rounded-2xl bg-gradient-to-br from-[#00B4FF]/25 via-transparent to-[#c8102e]/15 opacity-0 blur-xl transition-opacity duration-300 group-hover/brand:opacity-100"
                aria-hidden
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={SITE_LOGO_URL}
                alt=""
                width={560}
                height={168}
                decoding="async"
                fetchPriority="high"
                className="relative h-[5rem] w-auto max-h-[min(46vh,15rem)] object-contain object-left transition duration-300 group-hover/brand:scale-[1.04] sm:h-[6.5rem] md:h-[7.75rem] lg:h-[8.75rem] xl:h-[10rem]"
              />
            </div>
            <span className="shrink-0 font-display text-sm font-bold uppercase tracking-[0.14em] text-white/80 sm:text-base lg:text-lg">
              MS 2026
            </span>
          </Link>

          {/* Desktop nav */}
          <nav
            className="ml-auto hidden min-w-0 items-center gap-0.5 lg:flex"
            aria-label="Hlavní navigace"
          >
            {NAV.map(({ href, label }) => {
              const active = isActive(pathname, href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`
                    group/nav relative whitespace-nowrap rounded-xl px-3 py-2 text-[0.8125rem] font-semibold tracking-wide
                    transition-all duration-200 ease-out will-change-transform
                    hover:scale-[1.05] hover:text-white
                    focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00B4FF]/70
                    ${active ? "text-white" : "text-slate-400"}
                  `}
                >
                  <span className="relative z-10">{label}</span>
                  {active ? (
                    <span
                      className="absolute inset-x-2 bottom-1 h-0.5 rounded-full bg-gradient-to-r from-[#00B4FF] via-cyan-300 to-[#00B4FF] shadow-[0_0_12px_rgba(0,180,255,0.65)]"
                      aria-hidden
                    />
                  ) : (
                    <span
                      className="absolute inset-x-3 bottom-1 h-0.5 scale-x-0 rounded-full bg-gradient-to-r from-[#00B4FF] to-cyan-200 opacity-0 transition-all duration-200 group-hover/nav:scale-x-100 group-hover/nav:opacity-100"
                      aria-hidden
                    />
                  )}
                  {!active ? (
                    <span
                      className="absolute inset-0 -z-0 rounded-xl bg-white/[0.04] opacity-0 transition-opacity duration-200 group-hover/nav:opacity-100"
                      aria-hidden
                    />
                  ) : null}
                </Link>
              );
            })}
          </nav>

          {/* Desktop actions */}
          <div className="hidden shrink-0 items-center gap-3 pl-2 lg:flex">
            <div className="h-6 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" aria-hidden />

            {status === "authenticated" && user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/ucet"
                  className="group/avatar flex items-center gap-2.5 rounded-full py-1 pl-1 pr-2 transition-all duration-200 hover:bg-white/[0.06]"
                  title={user.email ?? ""}
                >
                  {user.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.image}
                      alt=""
                      width={36}
                      height={36}
                      className="h-9 w-9 rounded-full object-cover ring-2 ring-[#00B4FF]/35 transition duration-200 group-hover/avatar:ring-[#00B4FF]/70"
                    />
                  ) : (
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-slate-600 to-slate-900 text-xs font-bold text-white ring-2 ring-[#00B4FF]/40">
                      {userInitials(user)}
                    </span>
                  )}
                  <span className="hidden max-w-[10rem] truncate text-xs font-medium text-slate-400 transition group-hover/avatar:text-slate-200 xl:inline">
                    {user.email}
                  </span>
                </Link>
                <Link
                  href="/sestava"
                  style={{ "--ice": ICE, "--ice-dim": ICE_DIM } as CSSProperties}
                  className={`
                    inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[var(--ice-dim)] to-[var(--ice)]
                    px-4 py-2.5 font-display text-sm font-bold uppercase tracking-[0.12em] text-[#03050a]
                    shadow-[0_0_28px_rgba(0,180,255,0.45),0_6px_20px_rgba(0,0,0,0.35)]
                    ring-1 ring-white/20 transition duration-200
                    hover:scale-[1.05] hover:brightness-110 hover:shadow-[0_0_36px_rgba(0,180,255,0.55)]
                    active:scale-[0.98]
                  `}
                >
                  Do editoru sestavy
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => signIn("google", { callbackUrl: "/sestava" })}
                  className={`
                    rounded-xl border border-white/[0.14] bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-slate-200
                    transition duration-200 hover:scale-[1.03] hover:border-[#00B4FF]/45 hover:bg-[#00B4FF]/10 hover:text-white
                    focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00B4FF]/60
                  `}
                >
                  Přihlásit
                </button>
                <Link
                  href="/sestava"
                  style={{ "--ice": ICE, "--ice-dim": ICE_DIM } as CSSProperties}
                  className={`
                    inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[var(--ice-dim)] to-[var(--ice)]
                    px-4 py-2.5 font-display text-sm font-bold uppercase tracking-[0.12em] text-[#03050a]
                    shadow-[0_0_28px_rgba(0,180,255,0.45),0_6px_20px_rgba(0,0,0,0.35)]
                    ring-1 ring-white/20 transition duration-200
                    hover:scale-[1.05] hover:brightness-110 hover:shadow-[0_0_36px_rgba(0,180,255,0.55)]
                    active:scale-[0.98]
                  `}
                >
                  Začít
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            type="button"
            className={`
              ml-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.12] bg-white/[0.05] text-white
              transition duration-200 hover:scale-105 hover:border-[#00B4FF]/40 hover:bg-[#00B4FF]/10 lg:ml-0 lg:hidden
              ${mobileNavOpen ? "border-[#00B4FF]/50 bg-[#00B4FF]/15 text-[#00B4FF]" : ""}
            `}
            aria-expanded={mobileNavOpen}
            aria-controls="site-header-mobile-nav"
            onClick={() => setMobileNavOpen((o) => !o)}
          >
            <span className="relative block h-5 w-5">
              <Menu
                className={`absolute inset-0 h-5 w-5 transition-all duration-300 ${mobileNavOpen ? "scale-50 rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100"}`}
                aria-hidden
              />
              <X
                className={`absolute inset-0 h-5 w-5 transition-all duration-300 ${mobileNavOpen ? "scale-100 rotate-0 opacity-100" : "scale-50 -rotate-90 opacity-0"}`}
                aria-hidden
              />
            </span>
            <span className="sr-only">{mobileNavOpen ? "Zavřít menu" : "Otevřít menu"}</span>
          </button>
        </div>
      </header>

      {/* Mobile overlay + panel */}
      <div
        className={`
          fixed inset-0 z-[100] lg:hidden
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
            site-nav-mobile-panel absolute left-2 right-2 top-[calc(0.5rem+env(safe-area-inset-top))] z-[101] max-h-[min(88dvh,640px)]
            flex flex-col overflow-hidden rounded-2xl border border-white/[0.12]
            bg-gradient-to-b from-[#0b1220]/98 to-[#03050a]/98 shadow-[0_24px_80px_rgba(0,0,0,0.65),0_0_0_1px_rgba(0,180,255,0.12)]
            backdrop-blur-2xl
            ${mobileNavOpen ? "" : "pointer-events-none"}
          `}
        >
          <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3">
            <span className="font-site-wordmark text-sm font-bold tracking-tight text-white">Menu</span>
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
                const active = isActive(pathname, href);
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
