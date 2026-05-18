"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Users,
  Clock,
  ChevronRight,
  Sparkles,
  Trophy,
  BookOpen,
  LayoutGrid,
  LogIn,
} from "lucide-react";
import { signIn } from "next-auth/react";
import { AuthorBriefTeaser } from "@/components/AuthorBriefTeaser";
import { ContestsStatusBanner } from "@/components/ContestsStatusBanner";
import { LoadingScreenUsefulLinks } from "@/components/LoadingScreenUsefulLinks";
import { SocialSiteIcons } from "@/components/site/SocialSiteIcons";
import { LandingHeroVisual } from "@/components/landing/LandingHeroVisual";
import { useContestStats } from "@/hooks/useContestStats";

import { MERKURXTIP_PROMO_HREF_LANDING, MERKURXTIP_PROMO_IMAGE_SRC } from "@/lib/merkurXtipPromo";
/** Přibližný start MS 2026 (uprav dle oficiálního termínu). */
const MS_2026_KICKOFF = new Date("2026-05-15T16:20:00+02:00");

function useCountdown(target: Date) {
  // Pozor: Client Component se renderuje i na serveru. `Date.now()` při SSR způsobí hydration mismatch.
  // Proto první render držíme deterministický a čas doplníme až po mountu.
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    const raf = requestAnimationFrame(tick);
    const t = setInterval(tick, 1000);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(t);
    };
  }, []);
  return useMemo(() => {
    if (now === null) return null;
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
  const { data: session } = useSession();
  /** Bez přihlášeného uživatele — spolehlivější než jen status (řeší edge případy session). */
  const showGuestLoginPitch = !session?.user;
  const contestStats = useContestStats();
  const nominationCount = contestStats.nominationCount;
  const communityUsersCount = contestStats.communityUsersCount;
  const pickemCount = contestStats.pickemCount;
  const fantasyPlayersCount = contestStats.fantasyPlayersCount;
  const cd = useCountdown(MS_2026_KICKOFF);
  return (
    <main>
      {/* ——— Hero ——— */}
      <section className="relative overflow-hidden border-b border-white/[0.08]">
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0a1628] via-[#05080f] to-[#03050a]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -left-1/3 top-0 h-[min(90vw,600px)] w-[min(90vw,600px)] rounded-full bg-[#c8102e]/25 blur-[120px]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-1/4 bottom-0 h-[min(80vw,520px)] w-[min(80vw,520px)] rounded-full bg-[#003087]/30 blur-[100px]"
          aria-hidden
        />

        <div className="absolute bottom-0 left-0 right-0 h-[min(70vh,560px)] opacity-[0.85] sm:h-[min(65vh,520px)]">
          <LandingHeroVisual className="h-full w-full" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 sm:pb-24 sm:pt-14 lg:pt-20">
          <div className="mx-auto max-w-2xl text-center lg:max-w-3xl">
            <p className="mx-auto max-w-4xl text-pretty px-1">
              <span className="inline-block bg-gradient-to-br from-white via-sky-100 to-sky-200/90 bg-clip-text text-transparent text-[clamp(1rem,3.3vw,1.55rem)] font-semibold leading-snug tracking-[0.01em] drop-shadow-[0_2px_24px_rgba(0,0,0,0.45)] sm:text-[clamp(1.05rem,2.9vw,1.75rem)] sm:leading-snug md:text-[clamp(1.1rem,2.5vw,1.95rem)]">
                Vítejte na platformě Lineup. Zde si můžete stavět a sdílet sestavy českého hokejového týmu a zapojit se do
                celé řady soutěží. Aktuálně běží Fantasy na MS 2026!
              </span>
            </p>

            <h1 className="mx-auto mt-8 max-w-5xl text-balance font-display text-[clamp(2rem,6.5vw,3.75rem)] font-black leading-[1.08] tracking-[0.02em] sm:mt-10">
              <span className="inline-block bg-gradient-to-br from-white via-sky-100 to-[#7dd3fc] bg-clip-text text-transparent drop-shadow-[0_4px_48px_rgba(0,0,0,0.55)]">
                Zahraj si Fantasy na MS 2026
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg font-medium leading-relaxed text-slate-200/95 sm:text-xl">
              Každý den si naklikej svůj tým a soutěž s ostatními a hraj o atraktivní hokejové ceny.
            </p>

            <div className="mx-auto mt-10 max-w-xl sm:mt-12">
              <Link
                href="/fantasy"
                className="landing-cta-pulse group relative flex min-h-[4.25rem] w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-[#c8102e] via-[#e01e3c] to-[#9e0c24] px-6 py-5 text-center font-display text-xl font-black uppercase tracking-[0.08em] text-white shadow-[0_0_0_1px_rgba(125,211,252,0.45),0_12px_56px_rgba(200,16,46,0.55),0_0_80px_rgba(200,16,46,0.35),0_0_48px_rgba(0,180,255,0.2)] transition hover:scale-[1.02] hover:shadow-[0_0_0_1px_rgba(125,211,252,0.55),0_16px_64px_rgba(200,16,46,0.65),0_0_56px_rgba(0,180,255,0.28)] active:scale-[0.99] sm:min-h-[4.75rem] sm:text-2xl"
              >
                <span
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-60"
                  aria-hidden
                />
                <Sparkles className="relative h-7 w-7 shrink-0 text-sky-200" aria-hidden />
                <span className="relative">HRÁT FANTASY</span>
                <ChevronRight className="relative h-7 w-7 shrink-0 transition group-hover:translate-x-1" aria-hidden />
              </Link>

              <div
                className="mx-auto mt-8 w-full max-w-xl border-t border-white/12 pt-8 sm:mt-10 sm:pt-9"
                aria-labelledby="merkurxtip-promo-heading"
              >
                <div
                  className="mx-auto mb-5 h-px w-full max-w-[12rem] bg-gradient-to-r from-transparent via-[#f1c40f]/55 to-transparent sm:mb-6"
                  aria-hidden
                />
                <p
                  id="merkurxtip-promo-heading"
                  className="mx-auto max-w-md text-pretty text-center text-[13px] font-medium leading-snug text-slate-300/95 sm:text-sm sm:leading-relaxed"
                >
                  Rád tipuješ? Vsad si na svůj tip na{" "}
                  <span className="font-semibold text-[#f1c40f]/95">MerkurXtip</span> a získej{" "}
                  <span className="font-semibold text-white">500 Kč zdarma</span>
                </p>
                <a
                  href={MERKURXTIP_PROMO_HREF_LANDING}
                  target="_blank"
                  rel="noopener noreferrer nofollow sponsored"
                  className="mt-4 block overflow-hidden rounded-2xl border border-white/10 bg-black/20 shadow-[0_8px_32px_rgba(0,0,0,0.35)] ring-1 ring-white/[0.06] transition hover:border-[#f1c40f]/35 hover:shadow-[0_12px_40px_rgba(241,196,15,0.12)] sm:mt-5"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- externí hostitel banneru */}
                  <img
                    src={MERKURXTIP_PROMO_IMAGE_SRC}
                    alt="MerkurXtip — partnerská nabídka"
                    className="mx-auto block h-auto w-full max-w-full object-contain"
                    loading="lazy"
                    decoding="async"
                  />
                </a>
              </div>

              <p className="mx-auto mt-8 max-w-xl text-center text-pretty text-sm leading-relaxed text-slate-200/95 sm:mt-10 sm:text-[15px]">
                Pro novinky z hokeje a mnohem více sledujte instagram{" "}
                <Link
                  href="https://www.instagram.com/svet_hokeje/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[#f1c40f] underline decoration-[#f1c40f]/45 underline-offset-2 transition hover:text-amber-200 hover:decoration-amber-200/70"
                >
                  Svět Hokeje
                </Link>
                .
              </p>

              <div className="mx-auto mt-4 flex w-full max-w-xl justify-center">
                <LoadingScreenUsefulLinks />
              </div>

              <p className="mt-8 text-pretty text-sm leading-relaxed text-slate-200/95 sm:text-[15px]">
                Sledujte projekt Lineup na Facebooku a TikToku.
              </p>
              <div className="mt-4 flex justify-center">
                <SocialSiteIcons size="lg" showInstagram={false} />
              </div>
            </div>
          </div>

            {/* Proč se přihlásit — hosté, výš na stránce (dřív bylo až pod dlouhým blokem „Proč to zkusit“). */}
            {showGuestLoginPitch ? (
              <div className="mx-auto mt-10 max-w-5xl sm:mt-12">
                <h2 className="text-center font-display text-2xl font-bold uppercase tracking-[0.12em] text-white sm:text-3xl">
                  Proč se přihlásit
                </h2>
                <div className="mt-6 rounded-2xl border border-sky-400/25 bg-gradient-to-b from-[#0c182e]/95 via-[#080f1a]/98 to-[#05080f]/95 p-6 shadow-[0_0_48px_rgba(56,189,248,0.12),inset_0_1px_0_rgba(255,255,255,0.06)] sm:p-8">
                  <div className="mx-auto max-w-3xl text-center">
                    <p className="text-pretty text-base leading-relaxed text-slate-200 sm:text-lg">
                      Přihlaš se a získej ukládání fantasy sestav a nominací, Pick&apos;em, tvorbu sestav na zápas a
                      hodnocení hráčů!
                    </p>
                    <button
                      type="button"
                      onClick={() => signIn("google", { callbackUrl: "/fantasy" })}
                      className="landing-cta-pulse mt-8 inline-flex min-h-[4rem] w-full max-w-lg items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#003087] via-[#0040a8] to-[#002266] px-8 py-5 font-display text-lg font-black uppercase tracking-[0.08em] text-white shadow-[0_0_0_1px_rgba(125,211,252,0.45),0_12px_48px_rgba(0,48,135,0.45),0_0_64px_rgba(0,180,255,0.18)] transition hover:scale-[1.02] hover:shadow-[0_0_0_1px_rgba(125,211,252,0.55),0_16px_56px_rgba(0,48,135,0.55)] active:scale-[0.99] sm:min-h-[4.25rem] sm:text-xl"
                    >
                      <LogIn className="h-7 w-7 shrink-0 text-sky-200" aria-hidden />
                      Přihlásit se
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Sociální důkaz + stav nominace (nominace pod komunitou) */}
            <div className="mx-auto mt-10 flex w-full max-w-5xl flex-col gap-6 sm:mt-12 sm:gap-8">
              <div className="group relative flex min-h-0 min-w-0 w-full overflow-hidden rounded-3xl border border-sky-400/15 bg-gradient-to-br from-[#0c182e]/95 via-[#080f1a]/98 to-[#03050a] shadow-[0_0_0_1px_rgba(56,189,248,0.06),0_24px_48px_-16px_rgba(0,48,135,0.45),inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-xl transition duration-300 hover:border-sky-400/25 hover:shadow-[0_0_0_1px_rgba(56,189,248,0.12),0_28px_56px_-12px_rgba(0,48,135,0.55),inset_0_1px_0_rgba(255,255,255,0.09)]">
                <div
                  className="pointer-events-none absolute -left-1/4 top-0 h-[140%] w-[70%] bg-[radial-gradient(ellipse_at_30%_0%,rgba(56,189,248,0.22),transparent_58%)]"
                  aria-hidden
                />
                <div
                  className="pointer-events-none absolute -bottom-8 right-0 h-36 w-36 rounded-full bg-[#003087]/35 blur-3xl"
                  aria-hidden
                />
                <div
                  className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-sky-300/35 to-transparent opacity-80"
                  aria-hidden
                />
                <div className="relative z-10 flex w-full flex-col gap-5 px-5 py-6 sm:gap-6 sm:px-7 sm:py-7">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400/25 via-sky-500/10 to-[#003087]/40 shadow-[0_0_0_1px_rgba(125,211,252,0.25),0_8px_32px_rgba(56,189,248,0.22),inset_0_1px_0_rgba(255,255,255,0.12)] ring-1 ring-sky-300/20 sm:h-14 sm:w-14">
                      <Users
                        className="h-6 w-6 text-sky-100 drop-shadow-[0_0_12px_rgba(56,189,248,0.5)] sm:h-7 sm:w-7"
                        aria-hidden
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="font-display text-[11px] font-bold uppercase tracking-[0.22em] text-sky-200/80 sm:text-xs sm:tracking-[0.2em]">
                        Komunita
                      </p>
                    </div>
                  </div>

                  <div className="grid w-full min-w-0 grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                    {[
                      {
                        tone: "bg-[#FF1E2E]/10 ring-[#FF1E2E]/22",
                        icon: "🏆",
                        value: nominationCount,
                        label: "Nominací",
                      },
                      {
                        tone: "bg-[#00B4FF]/10 ring-[#00B4FF]/20",
                        icon: "👥",
                        value: communityUsersCount,
                        label: "V komunitě",
                      },
                      {
                        tone: "bg-[#00E5FF]/10 ring-[#00E5FF]/22",
                        icon: "🏒",
                        value: pickemCount,
                        label: "Pick’emů",
                      },
                      {
                        tone: "bg-[#f1c40f]/10 ring-[#f1c40f]/25",
                        icon: "⭐",
                        value: fantasyPlayersCount,
                        label: "Hráčů Fantasy",
                      },
                    ].map((x) => (
                      <div
                        key={x.label}
                        className="flex min-h-[6.25rem] min-w-0 flex-col items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/[0.05] px-2 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:min-h-[6.5rem] sm:px-3 sm:py-4"
                      >
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1 ${x.tone}`}
                        >
                          <span className="text-[15px] leading-none">{x.icon}</span>
                        </span>
                        <span className="font-display text-[1.65rem] font-black tabular-nums leading-none tracking-tight text-white sm:text-[1.85rem]">
                          {x.value === null ? "—" : formatCs(Number(x.value))}
                        </span>
                        <p className="max-w-[12rem] text-center text-[10px] font-black uppercase leading-snug tracking-[0.12em] text-white/60">
                          {x.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <ContestsStatusBanner pickemSubmissionOpen={contestStats.pickemSubmissionOpen} />

              {/* Odpočet — národní barvy (stejná šířka jako Komunita / soutěž) */}
              <div className="w-full">
                <div className="rounded-2xl border border-[#c8102e]/25 bg-gradient-to-b from-[#1e293b]/90 to-[#0f172a]/95 p-5 shadow-[0_0_48px_rgba(200,16,46,0.15)] sm:p-6">
                  <div className="flex items-center justify-center gap-2 text-white/90">
                    <Clock className="h-5 w-5 text-sky-300" aria-hidden />
                    <span className="font-display text-sm font-bold uppercase tracking-[0.22em]">
                      Odpočet do šampionátu
                    </span>
                  </div>
                  {!cd ? (
                    <div className="mt-5 grid grid-cols-4 gap-2 text-center sm:gap-4" aria-label="Odpočet se načítá">
                      {["dní", "hod", "min", "sek"].map((l) => (
                        <div key={l} className="rounded-xl border border-white/10 bg-black/40 py-3 shadow-inner sm:py-4">
                          <div className="font-display text-3xl font-bold tabular-nums text-white/70 sm:text-4xl">—</div>
                          <div className="text-[10px] font-semibold uppercase tracking-wider text-sky-300/85">{l}</div>
                        </div>
                      ))}
                    </div>
                  ) : cd.ended ? (
                    <p className="mt-5 py-2 text-center font-display text-3xl font-black tracking-wide text-white sm:mt-6 sm:text-4xl md:text-5xl">
                      MS je tady!
                    </p>
                  ) : (
                    <div className="mt-5 grid grid-cols-4 gap-2 text-center sm:gap-4">
                      {[
                        { v: cd.d, l: "dní" },
                        { v: cd.h, l: "hod" },
                        { v: cd.m, l: "min" },
                        { v: cd.s, l: "sek" },
                      ].map((x) => (
                        <div
                          key={x.l}
                          className="rounded-xl border border-white/10 bg-black/40 py-3 shadow-inner sm:py-4"
                        >
                          <div className="font-display text-3xl font-bold tabular-nums text-white sm:text-4xl">{x.v}</div>
                          <div className="text-[10px] font-semibold uppercase tracking-wider text-sky-300/85">
                            {x.l}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

          <p className="mx-auto mt-8 max-w-lg text-center text-xs leading-relaxed text-slate-500">
            Fanouškovská soutěž inspirovaná reálnou nominací — není oficiálním produktem ČSLH.
          </p>

          <div className="mt-10">
            <AuthorBriefTeaser />
          </div>

          {/* Jak to funguje / proč */}
          <div className="mx-auto mt-16 max-w-5xl sm:mt-20">
            <h2 className="text-center font-display text-2xl font-bold uppercase tracking-[0.12em] text-white sm:text-3xl">
              Proč to zkusit
            </h2>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4 xl:gap-6">
              <div className="rounded-2xl border border-[#003087]/30 bg-gradient-to-b from-[#0f172a]/95 to-[#05080f]/90 p-6 shadow-[0_0_40px_rgba(0,48,135,0.15)]">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#003087]/30 text-sky-200 ring-1 ring-[#003087]/40">
                  <Users className="h-5 w-5" aria-hidden />
                </div>
                <p className="text-sm leading-relaxed text-slate-200">
                  V editoru sestavy můžeš vybírat z více než 130 hráčů. Po sestavení nominace lze také grafiku sdílet jako
                  obrázek či odkaz na sociální sítě nebo stáhnout do svého zařízení.
                </p>
                <Link
                  href="/sestava"
                  className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-sky-300 transition hover:text-white"
                >
                  Do editoru
                  <ChevronRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
              <div className="rounded-2xl border border-[#c8102e]/30 bg-gradient-to-b from-[#c8102e]/[0.12] to-[#05080f]/90 p-6 shadow-[0_0_40px_rgba(200,16,46,0.12)]">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#c8102e]/25 text-[#ffb4c0] ring-1 ring-[#c8102e]/40">
                  <Trophy className="h-5 w-5" aria-hidden />
                </div>
                <p className="text-sm leading-relaxed text-slate-200">
                  Svoji nominaci můžeš odeslat do soutěže o zajímavé hokejové ceny.
                </p>
                <Link
                  href="/pravidla-souteze"
                  className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-sky-300 transition hover:text-white"
                >
                  <BookOpen className="h-4 w-4 shrink-0" aria-hidden />
                  Pravidla soutěže
                </Link>
              </div>
              <div className="rounded-2xl border border-white/[0.1] bg-[#0f172a]/80 p-6 shadow-inner">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white ring-1 ring-white/15">
                  <LayoutGrid className="h-5 w-5" aria-hidden />
                </div>
                <p className="text-sm leading-relaxed text-slate-200">
                  Svoje predikční schopnosti si můžeš ověřit také v Pick’emu na MS 2026, kde lze tipovat výsledky
                  skupin, play off pavouka nebo nejlepšího českého střelce turnaje.
                </p>
                <Link
                  href="/bracket"
                  className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-slate-400 transition hover:text-slate-200"
                >
                  Pick’em
                  <ChevronRight className="h-4 w-4 opacity-70" aria-hidden />
                </Link>
              </div>
              <div className="rounded-2xl border border-sky-400/25 bg-gradient-to-b from-[#0c182e]/90 to-[#05080f]/90 p-6 shadow-[0_0_40px_rgba(56,189,248,0.14)]">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500/20 text-sky-100 ring-1 ring-sky-400/35">
                  <Sparkles className="h-5 w-5" aria-hidden />
                </div>
                <p className="text-sm leading-relaxed text-slate-200">
                  Spustili jsme také Fantasy soutěž, kde můžeš soutěžit o atraktivní hokejové ceny.
                </p>
                <Link
                  href="/fantasy"
                  className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-sky-300 transition hover:text-white"
                >
                  Fantasy
                  <ChevronRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
            </div>
          </div>

          {/* Sekundární CTA */}
          <div className="mx-auto mt-14 flex max-w-md flex-col items-center gap-4 sm:mt-16">
            <Link
              href="/sestava"
              className="text-center text-sm font-semibold text-slate-400 underline-offset-4 transition hover:text-sky-300 hover:underline"
            >
              Editor nominace českého týmu (MS 2026) →
            </Link>
            <Link
              href="/pravidla-souteze"
              className="text-sm font-medium text-sky-400/90 underline-offset-4 transition hover:text-sky-300 hover:underline"
            >
              Kompletní pravidla soutěže
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
