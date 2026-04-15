"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { SITE_BRAND, SITE_TAGLINE } from "@/lib/siteBranding";

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
  return (
    <header className="relative z-20 border-b border-white/[0.12] bg-gradient-to-r from-[#060a14]/96 via-[#0c1428]/94 to-[#060a14]/96 shadow-[0_8px_40px_rgba(0,0,0,0.4)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4 sm:px-6 sm:py-4">
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-3 sm:justify-start">
          <Link
            href="/"
            className="group/logo flex min-w-0 max-w-[min(100%,20rem)] shrink-0 items-center gap-2.5 sm:max-w-md sm:gap-3"
            aria-label={`${SITE_BRAND} — ${SITE_TAGLINE}`}
          >
            <Image
              src="/logo.png"
              alt=""
              width={160}
              height={48}
              className="h-9 w-auto max-h-10 object-contain object-left sm:h-10"
              priority
            />
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="font-display text-lg leading-none tracking-[0.06em] text-white sm:text-xl">
                {SITE_BRAND}
              </span>
              <span className="line-clamp-2 text-[10px] font-medium leading-snug text-white/55 sm:text-[11px] sm:leading-tight">
                {SITE_TAGLINE}
              </span>
            </div>
          </Link>
          <nav
            className="flex max-w-full flex-1 flex-wrap items-center justify-end gap-1 sm:ml-4 sm:justify-start sm:gap-1.5"
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
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
          {status === "authenticated" ? (
            <>
              <span className="hidden max-w-[200px] truncate text-xs text-white/50 md:inline">
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
    </header>
  );
}
