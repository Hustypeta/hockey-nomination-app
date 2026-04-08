"use client";

import Link from "next/link";
import { signIn, useSession } from "next-auth/react";

export function LandingContent() {
  const { data: session, status } = useSession();

  return (
    <div className="min-h-screen bg-[#0c0e12] text-white">
      <header className="border-b border-[#2a3142] bg-[#151922]/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-5">
          <div className="font-display text-xl tracking-wider text-white">
            MS <span className="text-[#c41e3a]">2026</span>
          </div>
          <nav className="flex flex-wrap items-center gap-3">
            {status === "authenticated" ? (
              <>
                <span className="hidden text-sm text-white/60 sm:inline truncate max-w-[180px]">
                  {session?.user?.email}
                </span>
                <Link
                  href="/sestava"
                  className="rounded-lg bg-[#c41e3a] px-4 py-2 font-display text-sm text-white transition-colors hover:bg-[#a01830]"
                >
                  Do sestavovače
                </Link>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => signIn("google", { callbackUrl: "/sestava" })}
                  className="rounded-lg border border-[#2a3142] px-4 py-2 text-sm text-white/90 transition-colors hover:border-[#003f87]"
                >
                  Přihlásit přes Google
                </button>
                <Link
                  href="/sestava"
                  className="rounded-lg bg-[#c41e3a] px-4 py-2 font-display text-sm text-white transition-colors hover:bg-[#a01830]"
                >
                  Začít bez účtu
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-[#2a3142]">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{
              background:
                "linear-gradient(135deg, #fff 0%, #c41e3a 40%, #003f87 100%)",
            }}
          />
          <div className="relative mx-auto max-w-5xl px-4 py-16 sm:py-24">
            <p className="font-display text-sm tracking-[0.25em] text-[#c41e3a]">
              ČESKÁ REPREZENTACE
            </p>
            <h1 className="mt-4 font-display text-4xl leading-tight tracking-wide text-white sm:text-5xl md:text-6xl">
              Sestav si svoji nominaci na MS v hokeji
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-white/75 sm:text-xl">
              Z 80 kandidátů poskládej vlastních 25 hráčů – lajny, kapitán, plakát ke sdílení. Ulož si
              verzi v účtu, nebo pošli jen odkaz. Brzy soutěž o ceny.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link
                href="/sestava"
                className="inline-flex items-center justify-center rounded-xl bg-[#c41e3a] px-8 py-4 font-display text-lg text-white shadow-lg shadow-[#c41e3a]/20 transition-transform hover:scale-[1.02] hover:bg-[#a01830]"
              >
                Otevřít sestavovač
              </Link>
              <p className="text-sm text-white/50">
                Bez přihlášení jen sdílení odkazem · s Google účtem uložení a stažení plakátu
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-14 sm:py-16">
          <h2 className="text-center font-display text-2xl text-white sm:text-3xl">
            Proč to zkusit
          </h2>
          <ul className="mt-10 grid gap-6 sm:grid-cols-3">
            <li className="rounded-2xl border border-[#2a3142] bg-[#151922]/80 p-6">
              <p className="font-display text-lg text-[#c41e3a]">Reálná soupiska</p>
              <p className="mt-2 text-sm text-white/65">
                Stejná pravidla jako nominace: 3 brankáři, 8 obránců, 14 útočníků + náhradníci v
                lajnách.
              </p>
            </li>
            <li className="rounded-2xl border border-[#2a3142] bg-[#151922]/80 p-6">
              <p className="font-display text-lg text-[#003f87]">Sdílení</p>
              <p className="mt-2 text-sm text-white/65">
                Plakát nebo odkaz na Facebook, WhatsApp i Instagram. Po přihlášení hezký náhled u
                odkazu.
              </p>
            </li>
            <li className="rounded-2xl border border-[#2a3142] bg-[#151922]/80 p-6">
              <p className="font-display text-lg text-[#c41e3a]">Soutěž (brzy)</p>
              <p className="mt-2 text-sm text-white/65">
                Chystáme vstup do soutěže o ceny a transparentní vyhodnocení – sleduj web.
              </p>
            </li>
          </ul>
        </section>

        <section className="border-t border-[#2a3142] bg-[#151922]/50 py-12">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <p className="font-display text-xl text-white">Připravený vybrat svých 25?</p>
            <Link
              href="/sestava"
              className="mt-6 inline-flex rounded-xl border-2 border-[#c41e3a] px-8 py-3 font-display text-lg text-[#c41e3a] transition-colors hover:bg-[#c41e3a] hover:text-white"
            >
              Jít sestavit nominaci
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#2a3142] py-8 text-center text-xs text-white/40">
        MS 2026 · Neoficiální fanouškovský nástroj · hockey-nomination.cz
      </footer>
    </div>
  );
}
