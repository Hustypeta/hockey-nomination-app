"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Users,
  Clock,
  ChevronRight,
  Sparkles,
  Trophy,
  BookOpen,
  LayoutGrid,
} from "lucide-react";
import { AuthorBriefTeaser } from "@/components/AuthorBriefTeaser";
import { ContestTimeBonusCallout } from "@/components/ContestTimeBonusCallout";
import { useContestStats } from "@/hooks/useContestStats";
import type { ContestTimeBonusPercent } from "@/lib/contestTimeBonus";

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
  const contestStats = useContestStats();
  const nominationCount = contestStats.nominationCount;
  const cd = useCountdown(MS_2026_KICKOFF);
  const bonusPercent = [0, 10, 25, 40].includes(contestStats.contestTimeBonusPercent)
    ? (contestStats.contestTimeBonusPercent as ContestTimeBonusPercent)
    : (0 as ContestTimeBonusPercent);

  return (
    <main>
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

          <p className="mx-auto mt-6 max-w-3xl text-center text-base leading-relaxed text-white/75 sm:text-lg">
            Staň se na chvíli trenérem českého národního týmu. Využij naplno výběr z více než 130 hráčů, poskládej si
            formace podle sebe a sdílej svou sestavu pro hokejové MS ve Švýcarsku s ostatními.
          </p>

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

          <ContestTimeBonusCallout
            variant="landing"
            bonusPercent={bonusPercent}
            submissionOpen={contestStats.contestSubmissionOpen}
          />

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

          <AuthorBriefTeaser />

          <div className="mx-auto mt-10 max-w-5xl sm:mt-12">
            <h2 className="text-center font-display text-2xl font-bold uppercase tracking-wide text-white sm:text-3xl">
              Proč to zkusit?
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-center text-xs text-white/45 sm:text-sm">
              <strong className="font-semibold text-white/65">Soupiska v sestavovači je připravená</strong> — můžeš
              nominaci skládat a sdílet hned. K tomu je na webu i{" "}
              <strong className="font-semibold text-white/65">Pick’em na play-off</strong> (ten časem doladíme podle
              losu). Pravidla soutěže najdeš na stránce{" "}
              <Link href="/pravidla-souteze" className="text-cyan-300/90 underline-offset-2 hover:underline">
                Pravidla soutěže
              </Link>
              .
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
              <div className="rounded-2xl border border-white/[0.08] bg-[#0a0e17]/80 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#003087]/25 text-sky-200 ring-1 ring-[#003087]/35">
                  <Users className="h-5 w-5" aria-hidden />
                </div>
                <p className="text-sm leading-relaxed text-white/80">
                  <strong className="text-white">Sestavovač je funkční</strong> — výběr z{" "}
                  <strong className="text-white">více než 130 hráčů</strong>, přehledné lajny a sdílení{" "}
                  <strong className="text-white">odkazem i plakátem</strong>. Tohle je jádro webu a můžeš to hned
                  použít.
                </p>
                <Link
                  href="/sestava"
                  className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl border border-[#003087]/40 bg-[#003087]/15 px-4 py-2.5 text-sm font-semibold text-sky-100 transition hover:border-[#003087]/55 hover:bg-[#003087]/25"
                >
                  Otevřít sestavovač
                  <ChevronRight className="h-4 w-4 opacity-90" aria-hidden />
                </Link>
              </div>
              <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-b from-amber-500/[0.08] to-[#0a0e14]/90 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-200 ring-1 ring-amber-500/30">
                  <Trophy className="h-5 w-5" aria-hidden />
                </div>
                <p className="text-sm leading-relaxed text-white/80">
                  <strong className="text-white">Účast zdarma</strong> — srovnání s oficiální soupiskou a zápisem k{" "}
                  <strong className="text-white">1. zápasu ČR</strong>.{" "}
                  <strong className="text-white">Žebříček</strong> zveřejníme online; u{" "}
                  <strong className="text-white">nejlepší trojky</strong> okomentuju sestavu (text nebo video).{" "}
                  <strong className="text-white">Vítěz</strong> bere <strong className="text-white">hokejový dres</strong>
                  , druhý a třetí menší ceny.
                </p>
                <Link
                  href="/pravidla-souteze"
                  className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl border border-amber-400/35 bg-amber-500/10 px-4 py-2.5 text-sm font-semibold text-amber-100 transition hover:border-amber-300/50 hover:bg-amber-500/15"
                >
                  <BookOpen className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
                  Pravidla soutěže
                </Link>
              </div>
              <div className="rounded-2xl border border-cyan-500/25 bg-gradient-to-b from-cyan-500/[0.07] to-[#0a0e17]/90 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] sm:col-span-2 lg:col-span-1">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-200 ring-1 ring-cyan-500/30">
                  <LayoutGrid className="h-5 w-5" aria-hidden />
                </div>
                <p className="text-sm leading-relaxed text-white/80">
                  <strong className="text-white">Bracket Pick’em</strong> — tipni si play-off: skupiny, čtvrtfinále,
                  semifinále, finále, bronz a pár bonusů.{" "}
                  <strong className="text-white">Zdarma</strong>, bez účtu; soupiska tě sem láká, pick’em si časem
                  ještě vyladíme podle oficiálního losu a soupisky účastníků.
                </p>
                <Link
                  href="/bracket"
                  className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-400/35 bg-cyan-500/10 px-4 py-2.5 text-sm font-semibold text-cyan-100 transition hover:border-cyan-300/50 hover:bg-cyan-500/15"
                >
                  Otevřít Pick’em
                  <ChevronRight className="h-4 w-4 opacity-90" aria-hidden />
                </Link>
              </div>
            </div>
          </div>

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
            <Link
              href="/pravidla-souteze"
              className="text-sm font-medium text-cyan-300/90 underline-offset-4 transition hover:text-cyan-200 hover:underline"
            >
              Pravidla soutěže
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
