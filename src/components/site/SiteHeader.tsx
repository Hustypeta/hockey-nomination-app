"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { SITE_BRAND, SITE_LOGO_URL, SITE_TAGLINE } from "@/lib/siteBranding";

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

function navLinkClass(active: boolean) {
  return [
    "rounded-lg px-2.5 py-1.5 text-xs font-medium transition sm:px-3 sm:text-sm",
    active
      ? "bg-white/[0.12] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]"
      : "text-white/65 hover:bg-white/[0.06] hover:text-white",
  ].join(" ");
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

  return (
    <header className="relative z-20 border-b border-white/[0.12] bg-gradient-to-r from-[#060a14]/96 via-[#0c1428]/94 to-[#060a14]/96 shadow-[0_8px_40px_rgba(0,0,0,0.4)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6 sm:py-4 lg:flex-wrap lg:gap-x-4 lg:gap-y-3">
        <Link
          href="/"
          className="group/logo flex min-w-0 flex-1 items-center gap-2 sm:max-w-md sm:gap-2.5 lg:flex-none lg:max-w-[min(100%,18rem)]"
          aria-label={`${SITE_BRAND} — ${SITE_TAGLINE}`}
        >
          {/* Lokální PNG z `public/` — klasický <img> kvůli stabilnímu servování (Next image optimizer na některých hostinzích vrací null). */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={SITE_LOGO_URL}
            alt=""
            width={160}
            height={48}
            decoding="async"
            fetchPriority="high"
            className="h-8 w-auto max-h-9 shrink-0 object-contain object-left sm:h-10 sm:max-h-10"
          />
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="block truncate font-display text-base leading-none tracking-[0.06em] text-white sm:text-lg lg:text-xl">
              {SITE_BRAND}
            </span>
            <span className="mt-0.5 line-clamp-1 text-[10px] font-medium leading-snug text-white/55 sm:text-[11px] lg:line-clamp-2">
              {SITE_TAGLINE}
            </span>
          </div>
        </Link>

        <button
          type="button"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/[0.06] text-white transition hover:bg-white/[0.1] lg:hidden"
          aria-expanded={mobileNavOpen}
          aria-controls="site-header-mobile-nav"
          onClick={() => setMobileNavOpen((o) => !o)}
        >
          {mobileNavOpen ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
          <span className="sr-only">{mobileNavOpen ? "Zavřít menu" : "Otevřít menu"}</span>
        </button>

        <div className="hidden min-w-0 flex-1 flex-wrap items-center justify-end gap-x-2 gap-y-2 lg:flex">
          <nav
            className="flex max-w-full flex-wrap items-center justify-end gap-1.5"
            aria-label="Hlavní navigace"
          >
            {NAV.map(({ href, label }) => {
              const active =
                href === "/"
                  ? pathname === "/"
                  : pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link key={href} href={href} className={navLinkClass(active)}>
                  {label}
                </Link>
              );
            })}
          </nav>
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-l border-white/10 pl-3 md:pl-4">
            {status === "authenticated" ? (
              <>
                <span className="hidden max-w-[200px] truncate text-xs text-white/50 xl:inline">
                  {session?.user?.email}
                </span>
                <Link
                  href="/sestava"
                  className="rounded-xl bg-gradient-to-r from-[#c8102e] to-[#9e0c24] px-4 py-2.5 font-display text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-[#c8102e]/30 transition hover:brightness-110"
                >
                  Do editoru sestavy
                </Link>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => signIn("google", { callbackUrl: "/sestava" })}
                  className="rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/90 transition hover:border-[#003087]/50 hover:bg-white/[0.07]"
                >
                  Přihlásit
                </button>
                <Link
                  href="/sestava"
                  className="rounded-xl bg-gradient-to-r from-[#c8102e] to-[#9e0c24] px-4 py-2.5 font-display text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-[#c8102e]/30 transition hover:brightness-110"
                >
                  Začít
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {mobileNavOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/55 backdrop-blur-sm lg:hidden"
            aria-label="Zavřít menu"
            onClick={() => setMobileNavOpen(false)}
          />
          <div
            id="site-header-mobile-nav"
            className="fixed inset-x-0 bottom-0 z-50 flex max-h-[min(85dvh,560px)] flex-col rounded-t-2xl border border-b-0 border-white/10 bg-[#0a0f18] shadow-[0_-12px_48px_rgba(0,0,0,0.5)] lg:hidden"
            style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
          >
            <nav className="min-h-0 flex-1 overflow-y-auto px-4 py-4" aria-label="Hlavní navigace">
              <ul className="flex flex-col gap-1">
                {NAV.map(({ href, label }) => {
                  const active =
                    href === "/"
                      ? pathname === "/"
                      : pathname === href || pathname.startsWith(`${href}/`);
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        className={`block rounded-xl px-4 py-3.5 text-base font-medium ${active ? "bg-white/[0.14] text-white" : "text-white/75 hover:bg-white/[0.06] hover:text-white"}`}
                        onClick={() => setMobileNavOpen(false)}
                      >
                        {label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
            <div className="shrink-0 border-t border-white/10 px-4 py-4">
              {status === "authenticated" ? (
                <div className="flex flex-col gap-3">
                  {session?.user?.email ? (
                    <p className="truncate text-center text-xs text-white/45">{session.user.email}</p>
                  ) : null}
                  <Link
                    href="/sestava"
                    className="block rounded-xl bg-gradient-to-r from-[#c8102e] to-[#9e0c24] py-3.5 text-center font-display text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-[#c8102e]/30"
                    onClick={() => setMobileNavOpen(false)}
                  >
                    Do editoru sestavy
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileNavOpen(false);
                      void signIn("google", { callbackUrl: "/sestava" });
                    }}
                    className="rounded-xl border border-white/15 bg-white/[0.04] py-3 text-sm font-medium text-white/90"
                  >
                    Přihlásit
                  </button>
                  <Link
                    href="/sestava"
                    className="rounded-xl bg-gradient-to-r from-[#c8102e] to-[#9e0c24] py-3 text-center font-display text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-[#c8102e]/30"
                    onClick={() => setMobileNavOpen(false)}
                  >
                    Začít
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>
      ) : null}
    </header>
  );
}
