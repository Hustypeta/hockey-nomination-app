"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Users,
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
import { TipsportPartnerBanner } from "@/components/marketing/TipsportPartnerBanner";
import { SocialSiteIcons } from "@/components/site/SocialSiteIcons";
import { useContestStats } from "@/hooks/useContestStats";

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

  // Premium micro-animace: fade-in při scrollu (bez vlivu na obsah).
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (els.length === 0) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
    if (reduce || typeof IntersectionObserver === "undefined") {
      els.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            (e.target as HTMLElement).classList.add("is-visible");
            io.unobserve(e.target);
          }
        }
      },
      { root: null, rootMargin: "0px 0px -12% 0px", threshold: 0.12 }
    );
    els.forEach((el, i) => {
      el.style.transitionDelay = `${Math.min(180, i * 45)}ms`;
      io.observe(el);
    });
    return () => io.disconnect();
  }, []);
  return (
    <main className="bg-[#05060f]">
      {/* ——— Hero (fotka jen nahoře ~70vh, zbytek stránky pevná barva) ——— */}
      <section className="relative isolate overflow-hidden border-b border-white/[0.08] bg-[#05060f]">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[70vh] min-h-[28rem] max-h-[52rem] overflow-hidden"
          aria-hidden
        >
          <div className="relative size-full">
            <Image
              src="/images/promo/pozadi.png"
              alt=""
              fill
              priority
              sizes="100vw"
              quality={80}
              className="object-cover object-[center_58%]"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#05060f]/55 via-[#05060f]/35 to-[#05060f]" />
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-transparent to-[#05060f]" />
          </div>
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 sm:pb-24 sm:pt-14 lg:pt-20">
          <div className="mx-auto max-w-2xl text-center lg:max-w-3xl">
            <h1 className="mx-auto max-w-5xl text-balance font-display text-[clamp(2rem,6.5vw,3.75rem)] font-black leading-[1.08] tracking-[0.02em]">
              <span className="inline-block bg-gradient-to-br from-white via-sky-100 to-[#7dd3fc] bg-clip-text text-transparent drop-shadow-[0_4px_48px_rgba(0,0,0,0.75)]">
                Zahraj si Daily Fantasy na MS 2026
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg font-medium leading-relaxed text-slate-200/95 sm:text-xl">
              Každý den si naklikej svůj tým a soutěž s ostatními o poukazy na herní účet v celkové hodnotě 1500 Kč.
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

              <div className="mx-auto mt-8 w-full max-w-xl border-t border-white/12 pt-8 sm:mt-10 sm:pt-9">
                <TipsportPartnerBanner />
              </div>

              <p className="mt-8 text-pretty text-sm leading-relaxed text-slate-200/95 sm:text-[15px]">
                Sledujte projekt Lineup na Facebooku, Instagramu a TikToku.
              </p>
              <div className="mt-4 flex justify-center">
                <SocialSiteIcons size="lg" />
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
              <div
                data-reveal
                className="reveal group relative flex min-h-0 min-w-0 w-full overflow-hidden rounded-3xl border border-sky-400/15 bg-gradient-to-br from-[#0c182e] via-[#080f1a] to-[#03050a] shadow-[0_0_0_1px_rgba(56,189,248,0.06),0_24px_48px_-16px_rgba(0,48,135,0.45),inset_0_1px_0_rgba(255,255,255,0.07)] transition duration-300 hover:border-sky-400/25 hover:shadow-[0_0_0_1px_rgba(56,189,248,0.12),0_28px_56px_-12px_rgba(0,48,135,0.55),inset_0_1px_0_rgba(255,255,255,0.09)]"
              >
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
                        className="group/stat relative flex min-h-[6.75rem] min-w-0 flex-col items-center justify-center gap-2.5 rounded-2xl border border-white/12 bg-gradient-to-b from-white/[0.07] to-black/30 px-2 py-4 shadow-[0_18px_60px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.07)] transition duration-200 hover:-translate-y-0.5 hover:border-sky-300/20 hover:shadow-[0_24px_70px_rgba(0,0,0,0.38),0_0_44px_rgba(0,200,255,0.10),inset_0_1px_0_rgba(255,255,255,0.09)] sm:min-h-[7.25rem] sm:px-3 sm:py-5"
                      >
                        <span
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ring-1 shadow-[0_0_30px_rgba(0,200,255,0.12)] transition group-hover/stat:shadow-[0_0_40px_rgba(0,200,255,0.18)] ${x.tone}`}
                        >
                          <span className="text-[16px] leading-none drop-shadow-[0_0_10px_rgba(255,255,255,0.18)]">
                            {x.icon}
                          </span>
                        </span>
                        <span className="font-display text-[1.9rem] font-black tabular-nums leading-none tracking-tight text-white drop-shadow-[0_4px_28px_rgba(0,0,0,0.55)] sm:text-[2.15rem]">
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

              <div data-reveal className="reveal">
                <ContestsStatusBanner pickemSubmissionOpen={contestStats.pickemSubmissionOpen} />
              </div>
            </div>

          <div className="mt-10">
            <AuthorBriefTeaser />
          </div>

          {/* Jak to funguje / proč */}
          <div className="mx-auto mt-16 max-w-5xl sm:mt-20">
            <h2 className="text-center font-display text-2xl font-bold uppercase tracking-[0.12em] text-white sm:text-3xl">
              Proč to zkusit
            </h2>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4 xl:gap-6">
              <div data-reveal className="reveal group relative rounded-3xl border border-[#003087]/28 bg-gradient-to-b from-[#0f172a]/95 to-[#05070f]/85 p-6 shadow-[0_18px_70px_rgba(0,0,0,0.45),0_0_46px_rgba(0,48,135,0.10)] transition duration-200 hover:-translate-y-1 hover:border-[#003087]/40 hover:shadow-[0_24px_80px_rgba(0,0,0,0.50),0_0_60px_rgba(0,200,255,0.10)]">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#003087]/28 text-sky-200 ring-1 ring-[#003087]/40 shadow-[0_0_36px_rgba(0,48,135,0.18)] transition group-hover:shadow-[0_0_46px_rgba(0,200,255,0.16)]">
                  <Users className="h-6 w-6 drop-shadow-[0_0_10px_rgba(125,211,252,0.35)]" aria-hidden />
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
              <div data-reveal className="reveal group relative rounded-3xl border border-[#c8102e]/28 bg-gradient-to-b from-[#c8102e]/[0.14] to-[#05070f]/85 p-6 shadow-[0_18px_70px_rgba(0,0,0,0.45),0_0_46px_rgba(200,16,46,0.10)] transition duration-200 hover:-translate-y-1 hover:border-[#c8102e]/40 hover:shadow-[0_24px_80px_rgba(0,0,0,0.50),0_0_60px_rgba(255,45,85,0.12)]">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#c8102e]/22 text-[#ffb4c0] ring-1 ring-[#c8102e]/40 shadow-[0_0_36px_rgba(200,16,46,0.18)] transition group-hover:shadow-[0_0_46px_rgba(255,45,85,0.16)]">
                  <Trophy className="h-6 w-6 drop-shadow-[0_0_10px_rgba(255,180,192,0.22)]" aria-hidden />
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
              <div data-reveal className="reveal group relative rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-black/35 p-6 shadow-[0_18px_70px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.06)] transition duration-200 hover:-translate-y-1 hover:border-white/15 hover:shadow-[0_24px_80px_rgba(0,0,0,0.50),0_0_52px_rgba(0,200,255,0.08)]">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white ring-1 ring-white/15 shadow-[0_0_36px_rgba(255,255,255,0.08)] transition group-hover:shadow-[0_0_46px_rgba(0,200,255,0.12)]">
                  <LayoutGrid className="h-6 w-6 drop-shadow-[0_0_10px_rgba(255,255,255,0.16)]" aria-hidden />
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
              <div data-reveal className="reveal group relative rounded-3xl border border-sky-400/22 bg-gradient-to-b from-[#0c182e]/90 to-[#05070f]/85 p-6 shadow-[0_18px_70px_rgba(0,0,0,0.45),0_0_46px_rgba(56,189,248,0.12)] transition duration-200 hover:-translate-y-1 hover:border-sky-400/32 hover:shadow-[0_24px_80px_rgba(0,0,0,0.50),0_0_60px_rgba(0,200,255,0.14)]">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/18 text-sky-100 ring-1 ring-sky-400/35 shadow-[0_0_36px_rgba(56,189,248,0.18)] transition group-hover:shadow-[0_0_46px_rgba(0,200,255,0.18)]">
                  <Sparkles className="h-6 w-6 drop-shadow-[0_0_12px_rgba(56,189,248,0.35)]" aria-hidden />
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
