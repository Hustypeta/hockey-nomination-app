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
  ClipboardList,
  MessageSquare,
} from "lucide-react";
import { AuthorBriefTeaser } from "@/components/AuthorBriefTeaser";
import { ContestTimeBonusCallout } from "@/components/ContestTimeBonusCallout";
import { LandingHeroVisual } from "@/components/landing/LandingHeroVisual";
import { useContestStats } from "@/hooks/useContestStats";
import type { ContestTimeBonusPercent } from "@/lib/contestTimeBonus";
import { SITE_BRAND_LINE } from "@/lib/siteBranding";

/** Přibližný start MS 2026 (uprav dle oficiálního termínu). */
const MS_2026_KICKOFF = new Date("2026-05-15T18:00:00+02:00");

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
  const { status: authStatus } = useSession();
  const contestStats = useContestStats();
  const nominationCount = contestStats.nominationCount;
  const cd = useCountdown(MS_2026_KICKOFF);
  const bonusPercent = [0, 10, 25, 40].includes(contestStats.contestTimeBonusPercent)
    ? (contestStats.contestTimeBonusPercent as ContestTimeBonusPercent)
    : (0 as ContestTimeBonusPercent);

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

        <div className="relative z-10 mx-auto max-w-6xl px-4 pb-20 pt-10 sm:px-6 sm:pb-24 sm:pt-14 lg:pt-20">
          <div className="mx-auto max-w-4xl text-center lg:max-w-5xl">
            <p className="mx-auto mb-8 max-w-3xl text-pretty text-lg font-medium leading-snug text-slate-100/95 sm:mb-10 sm:text-xl">
              {SITE_BRAND_LINE}
            </p>
            <h1 className="mx-auto max-w-5xl text-balance font-display text-[clamp(2rem,6.5vw,3.75rem)] font-black leading-[1.08] tracking-[0.02em] text-white drop-shadow-[0_4px_48px_rgba(0,0,0,0.55)]">
              Sestav si nominaci na{" "}
              <span className="bg-gradient-to-r from-white via-white to-sky-100 bg-clip-text text-transparent">
                MS 2026
              </span>{" "}
              a{" "}
              <span className="bg-gradient-to-r from-[#f1c40f] via-[#fde047] to-[#f1c40f] bg-clip-text text-transparent">
                vyhraj dres
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg font-medium leading-relaxed text-slate-200/95 sm:text-xl">
              Staň se na chvíli trenérem českého národního týmu. Využij naplno výběr z více než 130 hráčů,
              poskládej si formace podle sebe a sdílej svou sestavu pro hokejové MS ve Švýcarsku s ostatními.
            </p>

            {authStatus === "authenticated" ? (
              <div className="mx-auto mt-8 flex max-w-xl flex-col gap-3 sm:flex-row sm:justify-center">
                <Link
                  href="/sestava"
                  className="inline-flex min-h-[3rem] flex-1 items-center justify-center gap-2 rounded-xl border border-[#c8102e]/50 bg-[#c8102e]/15 px-5 py-3 text-center font-display text-sm font-bold uppercase tracking-wide text-white transition hover:border-[#f1c40f]/45 hover:bg-[#c8102e]/25"
                >
                  <Sparkles className="h-5 w-5 shrink-0 text-[#f1c40f]" aria-hidden />
                  Nová nominace
                </Link>
                <Link
                  href="/ucet/nominace"
                  className="inline-flex min-h-[3rem] flex-1 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-5 py-3 text-center font-display text-sm font-bold uppercase tracking-wide text-white transition hover:border-sky-400/40 hover:bg-white/[0.1]"
                >
                  <ClipboardList className="h-5 w-5 shrink-0 text-sky-300" aria-hidden />
                  Moje nominace
                </Link>
              </div>
            ) : null}

            {/* Hlavní CTA — velké, červené, glow */}
            <div className="mx-auto mt-10 max-w-xl sm:mt-12">
              <Link
                href="/sestava"
                className="landing-cta-pulse group relative flex min-h-[4.25rem] w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-[#c8102e] via-[#e01e3c] to-[#9e0c24] px-6 py-5 text-center font-display text-xl font-black uppercase tracking-[0.08em] text-white shadow-[0_0_0_1px_rgba(241,196,15,0.45),0_12px_56px_rgba(200,16,46,0.55),0_0_80px_rgba(200,16,46,0.35)] transition hover:scale-[1.02] hover:shadow-[0_0_0_1px_rgba(241,196,15,0.6),0_16px_64px_rgba(200,16,46,0.65)] active:scale-[0.99] sm:min-h-[4.75rem] sm:text-2xl"
              >
                <span
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-60"
                  aria-hidden
                />
                <Sparkles className="relative h-7 w-7 shrink-0 text-[#f1c40f]" aria-hidden />
                <span className="relative">Sestavit nominaci</span>
                <ChevronRight className="relative h-7 w-7 shrink-0 transition group-hover:translate-x-1" aria-hidden />
              </Link>
            </div>

            {/* Sociální důkaz + časový bonus — vedle sebe od většího breakpointu */}
            <div className="mx-auto mt-10 flex w-full max-w-5xl flex-col gap-5 sm:mt-12 lg:flex-row lg:items-stretch lg:gap-6">
              <div className="group relative flex min-h-0 min-w-0 flex-1 overflow-hidden rounded-3xl border border-sky-400/15 bg-gradient-to-br from-[#0c182e]/95 via-[#080f1a]/98 to-[#03050a] shadow-[0_0_0_1px_rgba(56,189,248,0.06),0_24px_48px_-16px_rgba(0,48,135,0.45),inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-xl transition duration-300 hover:border-sky-400/25 hover:shadow-[0_0_0_1px_rgba(56,189,248,0.12),0_28px_56px_-12px_rgba(0,48,135,0.55),inset_0_1px_0_rgba(255,255,255,0.09)] sm:min-h-[8.5rem]">
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
                <div className="relative z-10 flex w-full items-center gap-4 px-5 py-5 sm:gap-5 sm:px-7 sm:py-6">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400/25 via-sky-500/10 to-[#003087]/40 shadow-[0_0_0_1px_rgba(125,211,252,0.25),0_8px_32px_rgba(56,189,248,0.22),inset_0_1px_0_rgba(255,255,255,0.12)] ring-1 ring-sky-300/20 sm:h-16 sm:w-16">
                    <Users
                      className="h-7 w-7 text-sky-100 drop-shadow-[0_0_12px_rgba(56,189,248,0.5)] sm:h-8 sm:w-8"
                      aria-hidden
                    />
                  </div>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="font-display text-[10px] font-bold uppercase tracking-[0.28em] text-sky-200/70">
                      Komunita
                    </p>
                    {nominationCount !== null ? (
                      <>
                        <p className="mt-1 font-display text-4xl font-bold leading-none tabular-nums tracking-tight text-white drop-shadow-[0_2px_24px_rgba(56,189,248,0.35)] sm:text-[2.65rem]">
                          {formatCs(nominationCount)}
                        </p>
                        <p className="mt-2 text-sm leading-snug text-slate-300/95">
                          {nominationCount === 0
                            ? "účastníků v soutěži zatím — buď první"
                            : nominationCount === 1
                              ? "fanoušek už poslal nominaci do soutěže"
                              : nominationCount >= 2 && nominationCount <= 4
                                ? "fanoušci už poslali nominaci do soutěže"
                                : "fanoušků už poslalo nominaci do soutěže"}
                        </p>
                      </>
                    ) : (
                      <p className="mt-2 text-sm text-slate-400">Načítám statistiky komunity…</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex min-h-0 min-w-0 flex-1 flex-col self-stretch">
                <ContestTimeBonusCallout
                  variant="landing"
                  bonusPercent={bonusPercent}
                  submissionOpen={contestStats.contestSubmissionOpen}
                />
              </div>
            </div>
          </div>

          {/* Odpočet — národní barvy */}
          <div className="mx-auto mt-12 max-w-2xl sm:mt-14">
            <div className="rounded-2xl border border-[#c8102e]/25 bg-gradient-to-b from-[#1e293b]/90 to-[#0f172a]/95 p-5 shadow-[0_0_48px_rgba(200,16,46,0.15)] sm:p-6">
              <div className="flex items-center justify-center gap-2 text-white/90">
                <Clock className="h-5 w-5 text-[#f1c40f]" aria-hidden />
                <span className="font-display text-sm font-bold uppercase tracking-[0.22em]">
                  Odpočet do šampionátu
                </span>
              </div>
              {cd.ended ? (
                <p className="mt-4 text-center font-display text-2xl font-bold text-white">MS je tady — sestav sestavu!</p>
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
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-[#f1c40f]/80">
                        {x.l}
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
                  Svoji nominaci můžeš odeslat do soutěže o zajímavé hokejové ceny. Více v{" "}
                  <Link
                    href="/pravidla-souteze"
                    className="font-semibold text-[#f1c40f] underline decoration-[#f1c40f]/35 underline-offset-[3px] transition hover:text-white hover:decoration-white/50"
                  >
                    pravidlech soutěže
                  </Link>
                  .
                </p>
                <Link
                  href="/pravidla-souteze"
                  className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#f1c40f] transition hover:text-white"
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
                  V průběhu šampionátu bude také zpřístupněna Pick’em play-off soutěž, kde si můžeš tipnout výsledek
                  play-off pavouka, nebo kdo vyhraje kanadské bodování šampionátu.
                </p>
                <Link
                  href="/bracket"
                  className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-slate-300 transition hover:text-white"
                >
                  Otevřít Pick’em
                  <ChevronRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
              <div className="rounded-2xl border border-violet-400/20 bg-gradient-to-b from-violet-950/35 to-[#05080f]/90 p-6 shadow-[0_0_40px_rgba(139,92,246,0.12)]">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/20 text-violet-100 ring-1 ring-violet-400/30">
                  <MessageSquare className="h-5 w-5" aria-hidden />
                </div>
                <p className="text-sm leading-relaxed text-slate-200">
                  Připravujeme také fórum, kde bude možné přidávat nominace a rozjet nejrůznější diskuze.
                </p>
                <Link
                  href="/forum"
                  className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-violet-200/95 transition hover:text-white"
                >
                  Fórum
                  <ChevronRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
            </div>
          </div>

          {/* Sekundární CTA */}
          <div className="mx-auto mt-14 flex max-w-md flex-col items-center gap-4 sm:mt-16">
            <Link
              href="/sestava"
              className="text-center text-sm font-semibold text-slate-400 underline-offset-4 transition hover:text-[#f1c40f] hover:underline"
            >
              Nebo přejít rovnou do editoru sestavy →
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
