"use client";

import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { Gift, Share2, Shield, Users, Clock, ChevronRight, Sparkles } from "lucide-react";
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

            {/* Pravidla v kostce */}
            <div className="mx-auto mt-8 flex max-w-2xl flex-wrap justify-center gap-2 sm:mt-10">
              {[
                { n: "3", t: "brankáři", c: "border-sky-400/30 bg-sky-500/10 text-sky-100" },
                { n: "8", t: "obránců", c: "border-[#003087]/40 bg-[#003087]/15 text-blue-100" },
                { n: "14", t: "útočníků", c: "border-[#c8102e]/35 bg-[#c8102e]/12 text-red-100" },
              ].map((p) => (
                <div
                  key={p.t}
                  className={`flex items-baseline gap-1.5 rounded-full border px-4 py-2 text-sm ${p.c}`}
                >
                  <span className="font-display text-xl font-bold tabular-nums">{p.n}</span>
                  <span className="text-white/80">{p.t}</span>
                </div>
              ))}
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

        {/* ——— PROČ ZKUSIT ——— */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <h2 className="text-center font-display text-3xl font-bold uppercase tracking-wide text-white sm:text-4xl">
            Proč to zkusit
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-sm text-white/50">
            Tři důvody, proč fanoušci tráví u sestavovače víc než u rozbruslení.
          </p>

          <ul className="mt-12 grid gap-6 lg:grid-cols-3">
            <li className="group relative overflow-hidden rounded-2xl border border-[#c8102e]/25 bg-gradient-to-b from-[#c8102e]/[0.12] to-[#0a0e14] p-6 shadow-[0_20px_50px_rgba(200,16,46,0.12)] transition hover:border-[#c8102e]/45 hover:shadow-[0_24px_56px_rgba(200,16,46,0.18)]">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#c8102e]/20 text-[#ff6b7a] ring-1 ring-[#c8102e]/30">
                <Shield className="h-6 w-6" aria-hidden />
              </div>
              <p className="font-display text-xl font-bold text-white">Reálná soupiska</p>
              <p className="mt-2 text-sm leading-relaxed text-white/65">
                Stejná pravidla jako u nominace: 3 + 8 + 14, lajny, náhradníci. Žádné zkratky — jen tvoje volba.
              </p>
            </li>
            <li className="group relative overflow-hidden rounded-2xl border border-[#003087]/30 bg-gradient-to-b from-[#003087]/[0.15] to-[#0a0e14] p-6 shadow-[0_20px_50px_rgba(0,48,135,0.15)] transition hover:border-cyan-400/35 hover:shadow-[0_24px_56px_rgba(0,48,135,0.22)]">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#003087]/25 text-sky-200 ring-1 ring-[#003087]/40">
                <Share2 className="h-6 w-6" aria-hidden />
              </div>
              <p className="font-display text-xl font-bold text-white">Sdílení, které baví</p>
              <p className="mt-2 text-sm leading-relaxed text-white/65">
                Plakát nebo odkaz na sítě. Ukaž kamarádům, kdo by podle tebe měl jet na šampionát.
              </p>
            </li>
            <li className="group relative overflow-hidden rounded-2xl border border-amber-500/25 bg-gradient-to-b from-amber-500/[0.1] to-[#0a0e14] p-6 shadow-[0_20px_50px_rgba(245,158,11,0.08)] transition hover:border-amber-400/40 hover:shadow-[0_24px_56px_rgba(245,158,11,0.12)]">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/15 text-amber-200 ring-1 ring-amber-500/30">
                <Gift className="h-6 w-6" aria-hidden />
              </div>
              <p className="font-display text-xl font-bold text-white">Soutěž (brzy)</p>
              <p className="mt-2 text-sm leading-relaxed text-white/65">
                Chystáme zapojení a ceny pro nejlepší sestavy. Sleduj aktualizace — zapojíš se jedním klikem.
              </p>
            </li>
          </ul>
        </section>

        {/* ——— TOP + TESTIMONIAL PLACEHOLDER ——— */}
        <section className="border-y border-white/[0.06] bg-[#080d16]/80 py-14 sm:py-16">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-12">
            <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-6 sm:p-8">
              <p className="font-display text-lg font-bold uppercase tracking-wide text-amber-200/90">
                Nejlepší sestavy týdne
              </p>
              <p className="mt-3 text-sm leading-relaxed text-white/45">
                Tady brzy uvidíš výběr top nominací od fanoušků. Mezitím sestav svou a pošli ji kamarádům — ať
                mají s čím soutěžit.
              </p>
              <Link
                href="/sestava"
                className="mt-6 inline-flex items-center gap-1 font-semibold text-cyan-300 transition hover:text-cyan-200"
              >
                Chci mezi ně <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <blockquote className="flex flex-col justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-[#0f1828] to-[#0a0e14] p-6 sm:p-8">
              <p className="text-lg leading-relaxed text-white/85 sm:text-xl">
                „Konečně něco, kde si můžu postavit Česko po svém a hned to hodit do skupiny. Jednoduchý,
                rychlý, hokejový.“
              </p>
              <footer className="mt-4 text-sm text-white/45">— anonymní fanoušek (beta test)</footer>
            </blockquote>
          </div>
        </section>

        {/* ——— PRAVIDLA ——— */}
        <section id="pravidla" className="scroll-mt-24 mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
          <h2 className="text-center font-display text-2xl font-bold uppercase tracking-wide text-white sm:text-3xl">
            Pravidla nominace
          </h2>
          <ul className="mt-8 space-y-4 text-sm leading-relaxed text-white/70">
            <li className="flex gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
              <span className="font-bold text-sky-300">•</span>
              Celkem přesně <strong className="text-white">25 hráčů</strong>: 3 brankáři, 8 obránců, 14 útočníků.
            </li>
            <li className="flex gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
              <span className="font-bold text-sky-300">•</span>
              Útočníci a obránci jsou v <strong className="text-white">lajnách</strong> (4 útoky + dvojice); dva
              útočníci jako náhradníci.
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
