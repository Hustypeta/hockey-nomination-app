"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { SITE_BRAND, SITE_LOGO_URL } from "@/lib/siteBranding";
import { UserContestStandingLine } from "@/components/contest/UserContestStandingLine";

type NavItem = { href: string; label: string; shortLabel?: string };

/** shortLabel = kratší text na desktopu pod 2xl, aby se vešly všechny položky včetně „Žebříček“ */
const LINEUP_EDITOR_HREF = "/zapasy/sestava";

const NAV_HOME: NavItem = { href: "/", label: "Úvod" };

const NAV: NavItem[] = [
  NAV_HOME,
  { href: "/komunita", label: "Komunita", shortLabel: "Komunita" },
  { href: "/fantasy", label: "Fantasy", shortLabel: "Fantasy" },
  { href: LINEUP_EDITOR_HREF, label: "Editor sestavy", shortLabel: "Sestavy" },
  { href: "/bracket", label: "Pick’em", shortLabel: "Pick’em" },
  { href: "/sestava", label: "Editor nominace", shortLabel: "Nominace" },
  { href: "/zebricek", label: "Žebříček", shortLabel: "Žebříček" },
  { href: "/ucet", label: "Můj účet", shortLabel: "Účet" },
];

function isNominationEditorPath(pathname: string) {
  return pathname === "/sestava" || pathname.startsWith("/sestava/");
}

function DesktopNavLabel({ item }: { item: NavItem }) {
  if (!item.shortLabel || item.shortLabel === item.label) return <>{item.label}</>;
  return (
    <>
      <span className="hidden 2xl:inline">{item.label}</span>
      <span className="2xl:hidden">{item.shortLabel}</span>
    </>
  );
}

function desktopNavLinkClass(active: boolean) {
  return `
    group/nav relative shrink-0 whitespace-nowrap rounded-lg px-0.5 py-1.5 text-[0.75rem] font-semibold leading-tight tracking-normal lg:px-1 lg:text-[0.8125rem] xl:px-1.5 xl:text-[0.875rem] 2xl:px-2 2xl:tracking-wide 2xl:text-[0.9375rem]
    transition-colors duration-200 ease-out
    hover:text-white
    focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00B4FF]/70
    ${active ? "text-white" : "text-slate-300"}
  `;
}

function DesktopNavLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link href={item.href} className={desktopNavLinkClass(active)}>
      <span className="relative z-10 inline-flex items-center">
        <DesktopNavLabel item={item} />
      </span>
      {active ? (
        <span
          className="absolute inset-x-2 bottom-0.5 h-0.5 rounded-full bg-gradient-to-r from-[#00B4FF] via-cyan-300 to-[#00B4FF] shadow-[0_0_12px_rgba(0,180,255,0.65)]"
          aria-hidden
        />
      ) : (
        <span
          className="absolute inset-x-2 bottom-0.5 h-0.5 scale-x-0 rounded-full bg-gradient-to-r from-[#00B4FF] to-cyan-200 opacity-0 transition-all duration-200 group-hover/nav:scale-x-100 group-hover/nav:opacity-100"
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
}

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
    queueMicrotask(() => setMobileNavOpen(false));
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
  const onNominationEditor = isNominationEditorPath(pathname);
  const showLineupEditorCta = !onNominationEditor;

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

        <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-3 px-3 py-3 sm:px-5 sm:py-4 md:px-4 md:py-3.5 xl:px-5">
          {/* Mobil / úzké okno: logo + hamburger */}
          <div className="flex w-full min-w-0 items-center justify-between gap-3 md:hidden">
            <Link
              href="/"
              className="group/brand flex min-w-0 flex-1 shrink-0 items-center gap-2 sm:gap-3"
              aria-label={SITE_BRAND}
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
                  className="relative h-[5rem] w-auto max-h-[min(46vh,15rem)] max-w-full object-contain object-left transition duration-300 group-hover/brand:scale-[1.04] sm:h-[6.5rem]"
                />
              </div>
            </Link>

            <button
              type="button"
              className={`
              flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.12] bg-white/[0.05] text-white
              transition duration-200 hover:scale-105 hover:border-[#00B4FF]/40 hover:bg-[#00B4FF]/10
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

          {/* Desktop / tablet: logo vlevo — odděleně od položky „Úvod“ v menu */}
          <div className="hidden w-full min-w-0 items-center gap-2 md:flex lg:gap-3 xl:gap-4 2xl:gap-10">
            <Link
              href="/"
              className="group/brand flex w-[5.5rem] max-w-[5.5rem] shrink-0 items-center overflow-hidden pr-0.5 sm:w-[6.5rem] sm:max-w-[6.5rem] lg:w-[7rem] lg:max-w-[7rem] xl:w-[7.25rem] xl:max-w-[7.25rem] 2xl:w-[8rem] 2xl:max-w-[8rem]"
              aria-label={`${SITE_BRAND} — úvod`}
            >
              <div className="relative shrink-0">
                <div
                  className="absolute -inset-3 rounded-2xl bg-gradient-to-br from-[#00B4FF]/22 via-transparent to-[#c8102e]/12 opacity-0 blur-xl transition-opacity duration-300 group-hover/brand:opacity-100"
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
                  className="relative h-10 w-full max-w-full object-contain object-left transition duration-300 group-hover/brand:scale-[1.03] lg:h-11 xl:h-12 2xl:h-[3.75rem]"
                />
              </div>
            </Link>

            <nav
              className="site-header-desktop-nav isolate flex min-w-0 flex-1 flex-nowrap items-center gap-x-0 overflow-hidden lg:gap-x-0.5"
              aria-label="Hlavní navigace"
            >
              {NAV.filter((item) => item.href !== "/ucet" || status !== "authenticated").map((item) => (
                <DesktopNavLink
                  key={item.href}
                  item={item}
                  active={item.href === activeHrefForPath(pathname)}
                />
              ))}
            </nav>

            <div className="flex w-full shrink-0 flex-none flex-wrap items-center justify-end gap-1.5 border-white/[0.08] md:w-auto md:border-l md:pl-2 lg:gap-2 lg:pl-3 xl:pl-4">
              {status === "authenticated" && user ? (
                <div className="flex min-w-0 shrink-0 items-center gap-1.5 lg:gap-2">
                  <Link
                    href="/ucet"
                    className="group/avatar flex min-w-0 items-center gap-1.5 rounded-xl py-1 pl-1 pr-1.5 transition-all duration-200 hover:bg-white/[0.06] lg:gap-2 lg:pr-2"
                    title={user.email ?? ""}
                  >
                    {user.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={user.image}
                        alt=""
                        width={36}
                        height={36}
                        className="h-9 w-9 shrink-0 rounded-full object-cover ring-2 ring-[#00B4FF]/35 transition duration-200 group-hover/avatar:ring-[#00B4FF]/70"
                      />
                    ) : (
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-600 to-slate-900 text-xs font-bold text-white ring-2 ring-[#00B4FF]/40">
                        {userInitials(user)}
                      </span>
                    )}
                    <UserContestStandingLine className="hidden min-w-0 max-w-[10rem] truncate 2xl:block" />
                  </Link>
                  {showLineupEditorCta ? (
                    <Link
                      href={LINEUP_EDITOR_HREF}
                      style={{ "--ice": ICE, "--ice-dim": ICE_DIM } as CSSProperties}
                      className={`
                    inline-flex shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-[var(--ice-dim)] to-[var(--ice)]
                    px-2 py-1.5 font-display text-[0.625rem] font-bold uppercase tracking-[0.08em] text-[#03050a] lg:px-2.5 lg:py-2 xl:px-3 xl:text-xs xl:tracking-[0.1em]
                    shadow-[0_0_28px_rgba(0,180,255,0.45),0_6px_20px_rgba(0,0,0,0.35)]
                    ring-1 ring-white/20 transition duration-200
                    hover:brightness-110 hover:shadow-[0_0_36px_rgba(0,180,255,0.55)] md:hover:scale-100 hover:scale-[1.03]
                    active:scale-[0.98]
                  `}
                    >
                      <span className="2xl:hidden">Sestavy</span>
                      <span className="hidden 2xl:inline">Do editoru sestavy</span>
                    </Link>
                  ) : null}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      signIn("google", { callbackUrl: onNominationEditor ? "/sestava" : LINEUP_EDITOR_HREF })
                    }
                    className={`
                    rounded-lg border border-white/[0.14] bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-200 md:text-[0.8125rem]
                    transition duration-200 hover:scale-[1.03] hover:border-[#00B4FF]/45 hover:bg-[#00B4FF]/10 hover:text-white
                    focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00B4FF]/60
                  `}
                  >
                    Přihlásit
                  </button>
                  {showLineupEditorCta ? (
                    <Link
                      href={LINEUP_EDITOR_HREF}
                      style={{ "--ice": ICE, "--ice-dim": ICE_DIM } as CSSProperties}
                      className={`
                    inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-[var(--ice-dim)] to-[var(--ice)]
                    px-3 py-2 font-display text-xs font-bold uppercase tracking-[0.1em] text-[#03050a] md:text-[0.8125rem] md:tracking-[0.11em]
                    shadow-[0_0_28px_rgba(0,180,255,0.45),0_6px_20px_rgba(0,0,0,0.35)]
                    ring-1 ring-white/20 transition duration-200
                    hover:brightness-110 hover:shadow-[0_0_36px_rgba(0,180,255,0.55)] md:hover:scale-100 hover:scale-[1.03]
                    active:scale-[0.98]
                  `}
                    >
                      Začít
                    </Link>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile overlay + panel */}
      <div
        className={`
          fixed inset-0 z-[100] md:hidden
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
                const active = href === activeHrefForPath(pathname);
                const isAccount = href === "/ucet";
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={() => setMobileNavOpen(false)}
                      className={`
                        flex items-center justify-between gap-3 rounded-xl px-4 py-3.5 transition duration-200
                        ${active ? "bg-white/[0.1] text-white shadow-[inset_0_0_0_1px_rgba(0,180,255,0.25)]" : "text-slate-300 hover:bg-white/[0.06] hover:text-white"}
                      `}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block text-base font-semibold tracking-wide">{label}</span>
                        {isAccount && status === "authenticated" ? (
                          <span className="mt-1 block">
                            <UserContestStandingLine multiline />
                          </span>
                        ) : null}
                      </span>
                      {active ? (
                        <span className="h-2 w-2 shrink-0 rounded-full bg-[#00B4FF] shadow-[0_0_10px_#00B4FF]" aria-hidden />
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
                <Link
                  href="/ucet"
                  onClick={() => setMobileNavOpen(false)}
                  className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.04] p-3 transition hover:border-[#00B4FF]/35 hover:bg-white/[0.07]"
                >
                  {user.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.image} alt="" width={44} height={44} className="h-11 w-11 rounded-full object-cover ring-2 ring-[#00B4FF]/40" />
                  ) : (
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-800 text-sm font-bold text-white ring-2 ring-[#00B4FF]/40">
                      {userInitials(user)}
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-white">{user.name?.trim() || "Můj účet"}</span>
                    <span className="mt-1 block">
                      <UserContestStandingLine multiline />
                    </span>
                    <span className="mt-1 block truncate text-xs text-slate-400">{user.email}</span>
                  </span>
                </Link>
                {showLineupEditorCta ? (
                  <Link
                    href={LINEUP_EDITOR_HREF}
                    onClick={() => setMobileNavOpen(false)}
                    className="block w-full rounded-xl bg-gradient-to-r from-[#0090cc] to-[#00B4FF] py-3.5 text-center font-display text-sm font-bold uppercase tracking-[0.16em] text-[#03050a] shadow-[0_0_24px_rgba(0,180,255,0.45)] ring-1 ring-white/20 transition active:scale-[0.99]"
                  >
                    Do editoru sestavy
                  </Link>
                ) : null}
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  className="rounded-xl border border-white/15 bg-white/[0.05] py-3.5 text-sm font-semibold text-white transition hover:border-[#00B4FF]/40"
                  onClick={() => {
                    setMobileNavOpen(false);
                    void signIn("google", {
                      callbackUrl: onNominationEditor ? "/sestava" : LINEUP_EDITOR_HREF,
                    });
                  }}
                >
                  Přihlásit
                </button>
                {showLineupEditorCta ? (
                  <Link
                    href={LINEUP_EDITOR_HREF}
                    onClick={() => setMobileNavOpen(false)}
                    className="block rounded-xl bg-gradient-to-r from-[#0090cc] to-[#00B4FF] py-3.5 text-center font-display text-sm font-bold uppercase tracking-[0.16em] text-[#03050a] shadow-[0_0_24px_rgba(0,180,255,0.45)] ring-1 ring-white/20"
                  >
                    Začít
                  </Link>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
