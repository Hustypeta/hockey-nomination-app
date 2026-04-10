"use client";

import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { Users, Clock, ChevronRight, Sparkles, Trophy, BookOpen } from "lucide-react";
import { CzechHockeyCrest } from "@/components/CzechHockeyCrest";

/** Přibližný start MS 2026 (uprav dle oficiálního termínu). */
const MS_2026_KICKOFF = new Date("2026-05-15T18:00:00+02:00");

function useNominationCount() {
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    let cancelled = false;
    fetch("/api/stats")
      .then((r) => r.json())
      .then((d: { nominationCount?: number | null }) => {
        if (!cancelled && typeof d.nominationCount === "number") setCount(d.nominationCount);
      })
      .catch(() => {
        if (!cancelled) setCount(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);
  return count;
}

function useCountdown(target: Date) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  return useMemo(() => {
    const diff = Math.max(0, target.getTime() - now);
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return { d, h, m, s, ended: diff <= 0 };
  }, [now, target]);
}

function formatCs(n: number) {
  return new Intl.NumberFormat("cs-CZ").format(n);
}

export function LandingContent() {
  const { data: session, status } = useSession();
  const nominationCount = useNominationCount();
  const cd = useCountdown(MS_2026_KICKOFF);

  return (
    <div className="min-h-screen bg-[#05080f] text-white">
      {/* Ambient + „led“ – bez obrázků, rychlé */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div
          className="absolute inset-0 opacity-90"
          style={{
            background: `
              radial-gradient(ellipse 100% 60% at 50% -15%, rgba(0, 48, 135, 0.55), transparent 55%),
              radial-gradient(ellipse 70% 50% at 0% 40%, rgba(200, 16, 46, 0.18), transparent 50%),
              radial-gradient(ellipse 60% 45% at 100% 55%, rgba(0, 100, 200, 0.2), transparent 48%),
              linear-gradient(180deg, #0a1018 0%, #05080f 40%, #03050a 100%)
            `,
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px)
            `,
            backgroundSize: "64px 64px",
            maskImage: "linear-gradient(180deg, black 0%, transparent 85%)",
          }}
        />
      </div>

      <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#05080f]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5" aria-label="MS 2026 — úvod">
            <CzechHockeyCrest className="h-9 w-9 shrink-0 drop-shadow-[0_0_12px_rgba(200,16,46,0.35)]" />
            <div className="font-display text-lg tracking-[0.08em] sm:text-xl">
              MS <span className="text-[#c8102e]">2026</span>
            </div>
          </Link>
          <nav className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
            {status === "authenticated" ? (
              <>
                <span className="hidden max-w-[200px] truncate text-xs text-white/50 md:inline">
                  {session?.user?.email}
                </span>
                <Link
                  href="/sestava"
                  className="rounded-xl bg-gradient-to-r from-[#c8102e] to-[#9e0c24] px-4 py-2.5 font-display text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-[#c8102e]/30 transition hover:brightness-110"
                >
                  Do sestavovače
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
          </nav>
        </div>
      </header>

      <main>
        {/* ——— HERO ——— */}
        <section className="relative overflow-hidden border-b border-white/[0.06]">
          <div
            className="pointer-events-none absolute -left-1/4 top-1/2 h-[min(80vw,520px)] w-[min(80vw,520px)] -translate-y-1/2 rounded-full bg-[#c8102e]/20 blur-[100px]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -right-1/4 top-0 h-[min(70vw,440px)] w-[min(70vw,440px)] rounded-full bg-[#003087]/35 blur-[90px]"
            aria-hidden
          />

          <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-12 sm:px-6 sm:pb-20 sm:pt-16 lg:pt-20">
            <p className="text-center font-display text-xs font-bold uppercase tracking-[0.35em] text-[#c8102e] sm:text-sm">
              MS v hokeji 2026
            </p>

            <h1 className="mx-auto mt-5 max-w-5xl text-center font-display text-[clamp(1.85rem,6vw,3.75rem)] font-bold leading-[1.05] tracking-wide text-white drop-shadow-[0_4px_32px_rgba(0,0,0,0.45)]">
              Sestav si svoji nominaci na MS v hokeji 2026
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-center text-base leading-relaxed text-white/75 sm:text-lg">
              Staň se na chvíli trenérem národního týmu: vyber <strong className="text-white">25 hráčů</strong> z
              kandidátů, postav lajny, jmenuj kapitána a ukaž světu svou sestavu. Jedním klikem do hry.
            </p>

            {/* Social proof */}
            <div className="mx-auto mt-8 flex max-w-xl flex-col items-center gap-2 sm:mt-10">
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/80 shadow-[0_0_24px_rgba(0,48,135,0.15)]">
                <Users className="h-4 w-4 shrink-0 text-cyan-300/90" aria-hidden />
                <span>
                  {nominationCount !== null ? (
                    <>
                      Již <strong className="tabular-nums text-white">{formatCs(nominationCount)}</strong>{" "}
                      {nominationCount === 1
                        ? "fanoušek sestavil"
                        : nominationCount < 5
                          ? "fanoušci sestavili"
                          : "fanoušků sestavilo"}{" "}
                      svoji nominaci
                    </>
                  ) : (
                    <>Přidej se k fanouškům a zapiš svou nominaci mezi prvními</>
                  )}
                </span>
              </div>
              <p className="text-center text-[11px] leading-snug text-white/40">
                Fanouškovská hra inspirovaná reálnou nominací — není oficiálním produktem ČSLH.
              </p>
            </div>

            {/* Countdown */}
            <div className="mx-auto mt-8 max-w-lg rounded-2xl border border-cyan-500/20 bg-gradient-to-b from-[#0c1424]/90 to-[#080d16]/90 p-4 shadow-[0_0_40px_rgba(34,211,238,0.08)] sm:mt-10 sm:p-5">
              <div className="flex items-center justify-center gap-2 text-cyan-200/90">
                <Clock className="h-4 w-4" aria-hidden />
                <span className="text-xs font-semibold uppercase tracking-[0.2em]">Odpočet do šampionátu</span>
              </div>
              {cd.ended ? (
                <p className="mt-3 text-center font-display text-xl text-white">MS je tady — sestav sestavu!</p>
              ) : (
                <div className="mt-4 grid grid-cols-4 gap-2 text-center sm:gap-3">
                  {[
                    { v: cd.d, l: "dní" },
                    { v: cd.h, l: "hod" },
                    { v: cd.m, l: "min" },
                    { v: cd.s, l: "sek" },
                  ].map((x) => (
                    <div
                      key={x.l}
                      className="rounded-xl border border-white/10 bg-black/30 py-2.5 sm:py-3"
                    >
                      <div className="font-display text-2xl font-bold tabular-nums text-white sm:text-3xl">
                        {x.v}
                      </div>
                      <div className="text-[10px] uppercase tracking-wider text-white/45">{x.l}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Proč to zkusit — v hero, aby bylo vidět bez skrolování */}
            <div className="mx-auto mt-10 max-w-5xl sm:mt-12">
              <h2 className="text-center font-display text-2xl font-bold uppercase tracking-wide text-white sm:text-3xl">
                Proč to zkusit?
              </h2>
              <p className="mx-auto mt-2 max-w-2xl text-center text-xs text-white/45 sm:text-sm">
                Krátce, o co jde — soutěžní pravidla najdeš níže na stránce.
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 sm:gap-5">
                <div className="rounded-2xl border border-white/[0.08] bg-[#0a0e17]/80 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#003087]/25 text-sky-200 ring-1 ring-[#003087]/35">
                    <Users className="h-5 w-5" aria-hidden />
                  </div>
                  <p className="text-sm leading-relaxed text-white/80">
                    Máš k dispozici <strong className="text-white">až 138 hráčů</strong>, rozhraní je{" "}
                    <strong className="text-white">jednoduché a přehledné</strong>, a svoji nominaci{" "}
                    <strong className="text-white">snadno sdílíš</strong> odkazem nebo plakátem.
                  </p>
                </div>
                <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-b from-amber-500/[0.08] to-[#0a0e14]/90 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-200 ring-1 ring-amber-500/30">
                    <Trophy className="h-5 w-5" aria-hidden />
                  </div>
                  <p className="text-sm leading-relaxed text-white/80">
                    Můžeš <strong className="text-white">hrát o zajímavé ceny</strong> — vstup do soutěže{" "}
                    <strong className="text-white">50&nbsp;Kč</strong>, výsledky se budou porovnávat s{" "}
                    <strong className="text-white">oficiální soupiskou ČR k prvnímu zápasu</strong> na šampionátu.
                  </p>
                  <Link
                    href="#pravidla-souteze"
                    className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl border border-amber-400/35 bg-amber-500/10 px-4 py-2.5 text-sm font-semibold text-amber-100 transition hover:border-amber-300/50 hover:bg-amber-500/15"
                  >
                    <BookOpen className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
                    Pravidla soutěže
                  </Link>
                </div>
              </div>
            </div>

            {/* Primární CTA */}
            <div className="mx-auto mt-10 flex flex-col items-center gap-4 sm:mt-12">
              <Link
                href="/sestava"
                className="landing-cta-pulse relative inline-flex min-h-[3.5rem] w-full max-w-md items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#c8102e] via-[#d41432] to-[#9e0c24] px-8 py-4 text-center font-display text-lg font-bold uppercase tracking-[0.06em] text-white shadow-[0_8px_40px_rgba(200,16,46,0.45),0_0_0_1px_rgba(255,255,255,0.12)_inset] transition hover:scale-[1.02] hover:shadow-[0_12px_48px_rgba(200,16,46,0.55)] sm:text-xl"
              >
                <Sparkles className="h-5 w-5 opacity-90" aria-hidden />
                Otevřít sestavovač
                <ChevronRight className="h-5 w-5 opacity-90" aria-hidden />
              </Link>
              <p className="max-w-md text-center text-sm text-white/50">
                Bez účtu můžeš sestavit a sdílet odkaz. S Google účtem si nominaci uložíš a stáhneš plakát.
              </p>
              <a
                href="#pravidla"
                className="text-sm font-medium text-cyan-300/90 underline-offset-4 transition hover:text-cyan-200 hover:underline"
              >
                Jak to funguje? Podívej se na pravidla
              </a>
            </div>
          </div>
        </section>

        {/* ——— PRAVIDLA SOUTĚŽE ——— */}
        <section
          id="pravidla-souteze"
          className="scroll-mt-24 border-t border-white/[0.06] bg-[#080d16]/60 py-14 sm:py-16"
        >
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <h2 className="text-center font-display text-2xl font-bold uppercase tracking-wide text-white sm:text-3xl">
              Pravidla soutěže
            </h2>
            <p className="mx-auto mt-3 text-center text-sm text-white/50">
              Orientační pravidla — před startem platnosti je upřesníme na stránce a v e-mailu pro účastníky.
            </p>
            <ul className="mt-8 space-y-4 text-sm leading-relaxed text-white/75">
              <li className="flex gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
                <span className="font-bold text-amber-300">•</span>
                <span>
                  <strong className="text-white">Vstupenka do soutěže 50&nbsp;Kč</strong> (zaplacená přes platební
                  bránu). Bez úhrady se nominace do vyhodnocení nezapočítává.
                </span>
              </li>
              <li className="flex gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
                <span className="font-bold text-amber-300">•</span>
                <span>
                  Vyhodnocení jde z <strong className="text-white">oficiálních dokumentů k 1. zápasu ČR</strong> na MS
                  2026: <strong className="text-white">soupiska</strong> (25 hráčů) a{" "}
                  <strong className="text-white">zápis o utkání</strong> (rozestavení — kdo je kde: lajny, páry beků,
                  brankáři včetně náhradníků podle toho, jak to bude v zápise uvedené).
                </span>
              </li>
              <li className="flex gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
                <span className="font-bold text-amber-300">•</span>
                <div>
                  <strong className="text-white">Bodování hráčů (návrh) — dvě úrovně</strong>
                  <ul className="mt-2 list-inside list-disc space-y-2 text-white/70">
                    <li>
                      <strong className="text-white/90">5 bodů — přesná pozice:</strong> hráč je v tvé nominaci na{" "}
                      <strong className="text-white">stejném „místě“ jako v oficiálním zápisu o utkání</strong> (např. totéž
                      křídlo / střed / bek v tom samém páru / stejný slot brankáře či náhradníka, jak to vyjde ze zápisu).
                    </li>
                    <li>
                      <strong className="text-white/90">2 body — jen trefené jméno:</strong> hráč je mezi{" "}
                      <strong className="text-white">25 na soupisce</strong> k tomu zápasu, ale v tvé sestavě ho máš{" "}
                      <strong className="text-white">na jiné pozici</strong> než v oficiálním zápisu (počítá se jen jedna z
                      úrovní — nepřičítají se obě najednou).
                    </li>
                    <li>
                      <strong className="text-white/90">+10 bodů</strong> za správně zvoleného{" "}
                      <strong className="text-white">kapitána</strong> (shoda s „C“ u týmu dle oficiálního zápisu k 1.
                      zápasu).
                    </li>
                    <li>
                      <strong className="text-white/90">+4 body</strong> za každého trefeného{" "}
                      <strong className="text-white">asistenta</strong> (max. 2 ve tvé nominaci; shoda s označením v
                      zápisu).
                    </li>
                  </ul>
                  <p className="mt-2 text-xs text-white/45">
                    Mapování tvých slotů (včetně náhradníků) na řádky v zápisu upřesníme v plných pravidlech, ať je
                    vyhodnocení jednoznačné. Při shodě skóre rozhodne dřívější platná úhrada vstupenky, případně los.
                  </p>
                </div>
              </li>
            </ul>
            <p className="mt-6 text-center text-xs text-white/40">
              Ceny a přesné termíny vyhlásíme před startem soutěže. Sestavovač můžeš používat i bez vstupu do soutěže.
            </p>
          </div>
        </section>

        {/* ——— PRAVIDLA NOMINACE ——— */}
        <section id="pravidla" className="scroll-mt-24 mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
          <h2 className="text-center font-display text-2xl font-bold uppercase tracking-wide text-white sm:text-3xl">
            Pravidla nominace
          </h2>
          <ul className="mt-8 space-y-4 text-sm leading-relaxed text-white/70">
            <li className="flex gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
              <span className="font-bold text-sky-300">•</span>
              Celkem přesně <strong className="text-white">25 hráčů</strong>: 3 brankáři, 7 obránců, 15 útočníků.
            </li>
            <li className="flex gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
              <span className="font-bold text-sky-300">•</span>
              Čtyři útoky a <strong className="text-white">tři obranné páry</strong> (4. lajna už bek nemá); sedmý bek a
              tři útočníci jsou v náhradnících.
            </li>
            <li className="flex gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
              <span className="font-bold text-sky-300">•</span>
              Zvol <strong className="text-white">kapitána</strong> a až dva asistenty přímo u dresů ve sestavě.
            </li>
          </ul>
          <div className="mt-10 text-center">
            <Link
              href="/sestava"
              className="inline-flex min-h-[3rem] items-center justify-center rounded-2xl border-2 border-[#c8102e] bg-transparent px-10 py-3 font-display text-lg font-bold uppercase tracking-wide text-white transition hover:bg-[#c8102e] hover:shadow-[0_8px_32px_rgba(200,16,46,0.35)]"
            >
              Jít sestavit nominaci
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/[0.06] py-8 text-center text-xs text-white/40">
        MS 2026 · Neoficiální fanouškovský nástroj · Česká trikolora inspirována reprezentací
      </footer>
    </div>
  );
}
