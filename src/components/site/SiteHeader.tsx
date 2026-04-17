"use client";

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

function navLinkClass(active: boolean) {
  return [
    "rounded-xl px-3 py-2 text-sm font-semibold tracking-wide transition duration-200 sm:px-3.5 sm:py-2.5 sm:text-[0.9375rem] lg:text-base",
    active
      ? "bg-gradient-to-b from-white/[0.16] to-white/[0.08] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_0_0_1px_rgba(255,255,255,0.12)]"
      : "text-white/80 hover:bg-white/[0.08] hover:text-white",
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
    <header className="relative z-20 border-b border-white/[0.14] bg-gradient-to-r from-[#050912]/98 via-[#0a1428]/96 to-[#050912]/98 shadow-[0_12px_48px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl backdrop-saturate-150">
      {/* jemný trikolorní akcent nahoře */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-[#c8102e]/0 via-[#c8102e]/70 via-white/50 to-[#003087]/80"
        aria-hidden
      />
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-4 sm:gap-5 sm:px-6 sm:py-5 lg:flex-wrap lg:gap-x-5 lg:gap-y-3">
        <Link
          href="/"
          className="group/logo flex min-w-0 flex-1 items-center gap-3 sm:max-w-md sm:gap-3.5 lg:flex-none lg:max-w-[min(100%,22rem)]"
          aria-label={SITE_BRAND}
        >
          {/* Lokální PNG z `public/` — klasický <img> kvůli stabilnímu servování (Next image optimizer na některých hostinzích vrací null). */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={SITE_LOGO_URL}
            alt=""
            width={280}
            height={84}
            decoding="async"
            fetchPriority="high"
            className="h-11 w-auto shrink-0 object-contain object-left drop-shadow-[0_4px_20px_rgba(200,16,46,0.35)] transition duration-300 group-hover/logo:scale-[1.03] sm:h-[52px] lg:h-14"
          />
          <div className="flex min-w-0 flex-1 flex-col justify-center">
            <span className="block truncate bg-gradient-to-br from-white via-white to-slate-200 bg-clip-text font-display text-xl font-bold leading-none tracking-[0.12em] text-transparent drop-shadow-[0_2px_24px_rgba(255,255,255,0.12)] sm:text-2xl lg:text-3xl">
              {SITE_BRAND}
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

        <div className="hidden min-w-0 flex-1 flex-wrap items-center justify-end gap-x-3 gap-y-2 lg:flex">
          <nav
            className="flex max-w-full flex-wrap items-center justify-end gap-2"
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
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-3 border-l border-white/15 pl-4 md:pl-5">
            {status === "authenticated" ? (
              <>
                <span className="hidden max-w-[220px] truncate text-sm text-white/65 xl:inline">
                  {session?.user?.email}
                </span>
                <Link
                  href="/sestava"
                  className="rounded-xl bg-gradient-to-r from-[#e01432] via-[#c8102e] to-[#8f0b22] px-5 py-3 font-display text-base font-bold uppercase tracking-[0.14em] text-white shadow-[0_0_28px_rgba(200,16,46,0.45),0_8px_24px_rgba(0,0,0,0.35)] ring-1 ring-white/15 transition hover:brightness-110 hover:ring-white/25"
                >
                  Do editoru sestavy
                </Link>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => signIn("google", { callbackUrl: "/sestava" })}
                  className="rounded-xl border border-white/20 bg-white/[0.06] px-4 py-2.5 text-base font-semibold text-white transition hover:border-[#003087]/55 hover:bg-white/[0.1]"
                >
                  Přihlásit
                </button>
                <Link
                  href="/sestava"
                  className="rounded-xl bg-gradient-to-r from-[#e01432] via-[#c8102e] to-[#8f0b22] px-5 py-3 font-display text-base font-bold uppercase tracking-[0.14em] text-white shadow-[0_0_28px_rgba(200,16,46,0.45),0_8px_24px_rgba(0,0,0,0.35)] ring-1 ring-white/15 transition hover:brightness-110 hover:ring-white/25"
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
                        className={`block rounded-xl px-4 py-4 text-lg font-semibold tracking-wide ${active ? "bg-white/[0.16] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]" : "text-white/85 hover:bg-white/[0.08] hover:text-white"}`}
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
                    className="block rounded-xl bg-gradient-to-r from-[#e01432] via-[#c8102e] to-[#8f0b22] py-4 text-center font-display text-base font-bold uppercase tracking-[0.14em] text-white shadow-[0_0_24px_rgba(200,16,46,0.4)] ring-1 ring-white/15"
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
                    className="rounded-xl border border-white/20 bg-white/[0.06] py-3.5 text-base font-semibold text-white"
                  >
                    Přihlásit
                  </button>
                  <Link
                    href="/sestava"
                    className="rounded-xl bg-gradient-to-r from-[#e01432] via-[#c8102e] to-[#8f0b22] py-3.5 text-center font-display text-base font-bold uppercase tracking-[0.14em] text-white shadow-[0_0_24px_rgba(200,16,46,0.4)] ring-1 ring-white/15"
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
