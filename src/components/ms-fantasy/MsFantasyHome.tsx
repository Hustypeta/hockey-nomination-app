"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, BookOpen, Calendar, Gift, Shirt, Ticket, Trophy } from "lucide-react";
import {
  isMsFantasyLineupSubmissionEnabled,
  isMsFantasySchedulePauseDaySlug,
  MS_FANTASY_ACTIVE_NOTICES,
} from "@/lib/msFantasyConfig";
import { MsFantasyNoticeBanner } from "./MsFantasyNoticeBanner";
import { MsFantasyGlassPanel } from "./MsFantasyFrozenArenaShell";
import { MsFantasyMatchSchedule } from "./MsFantasyMatchSchedule";

type DayRow = {
  id: string;
  slug: string;
  title: string;
  lockAt: string;
  isLocked: boolean;
  matches: unknown;
};

export function MsFantasyHome() {
  const [days, setDays] = useState<DayRow[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const fantasySubmissionsEnabled = isMsFantasyLineupSubmissionEnabled();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/fantasy/game-days", { cache: "no-store" });
        if (!res.ok) {
          setErr("Fantasy se nepodařilo načíst.");
          return;
        }
        const data = (await res.json()) as { days: DayRow[] };
        if (!cancelled) setDays(data.days ?? []);
      } catch {
        if (!cancelled) setErr("Bez připojení k serveru.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="pb-12 pt-1 sm:pb-16">
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
        <MsFantasyGlassPanel className="p-4 sm:p-5" glow="cyan">
          <div className="flex items-stretch justify-between gap-3 sm:gap-4">
            <div className="flex min-w-0 flex-1 flex-col pr-1">
              <p className="font-display text-[0.65rem] font-bold uppercase tracking-[0.22em] text-cyan-200/90 sm:text-xs sm:tracking-[0.26em]">
                MS 2026
              </p>
              <h1 className="mt-0.5 font-display text-3xl font-bold leading-none tracking-[0.02em] text-white drop-shadow-[0_2px_20px_rgba(0,0,0,0.45)] sm:text-4xl sm:tracking-tight">
                Fantasy
              </h1>
              <div className="mt-3 flex min-h-[13.5rem] flex-col sm:min-h-[15rem]">
                <p className="text-[0.8125rem] leading-relaxed text-slate-200/90 sm:text-sm">
                  Zde si můžeš každý den vybrat <span className="font-semibold text-white">6 hráčů</span> (1x brankář,
                  2x obránci a 3x útočníci) a poslat je do soutěže. Nezapomeň dodržet budget a že uzávěrka je vždy před
                  prvním zápasem dne.
                  {!fantasySubmissionsEnabled ? (
                    <span className="mt-2 block rounded-lg border border-amber-400/25 bg-amber-500/10 px-2.5 py-1.5 text-[0.8125rem] text-amber-100 sm:px-3 sm:py-2 sm:text-sm">
                      Odesílání sestav na server je zatím vypnuté — fantasy jde jen vyzkoušet v rozhraní.
                    </span>
                  ) : null}
                </p>
                <div
                  className="mt-3 flex flex-1 flex-col rounded-xl border border-[#f1c40f]/40 bg-gradient-to-br from-[#f1c40f]/14 via-amber-950/35 to-[#c8102e]/12 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_0_32px_rgba(241,196,15,0.12)] sm:px-5 sm:py-5"
                  aria-labelledby="ms-fantasy-prizes-heading"
                >
                  <p
                    id="ms-fantasy-prizes-heading"
                    className="flex items-center gap-2 font-display text-xs font-bold uppercase tracking-[0.14em] text-[#f1e6a8] sm:text-[0.8125rem]"
                  >
                    <Gift className="h-4 w-4 shrink-0 text-[#f1c40f] sm:h-[1.125rem] sm:w-[1.125rem]" aria-hidden />
                    O co hrajeme?
                  </p>
                  <ul className="mt-4 flex flex-1 flex-col justify-center gap-3">
                    <li className="flex flex-1 items-center gap-3.5 rounded-lg border border-white/[0.1] bg-black/30 px-3.5 py-3 sm:gap-4 sm:px-4 sm:py-4">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-[#f1c40f]/35 bg-[#f1c40f]/15 text-[#f1c40f] shadow-[0_0_16px_rgba(241,196,15,0.2)] sm:h-12 sm:w-12">
                        <Trophy className="h-5 w-5 sm:h-[1.35rem] sm:w-[1.35rem]" strokeWidth={1.75} aria-hidden />
                      </span>
                      <p className="min-w-0 text-sm leading-relaxed text-slate-100/95 sm:text-[0.9375rem]">
                        <span className="font-display text-lg font-bold tabular-nums text-[#f1c40f] sm:text-xl">
                          500&nbsp;Kč
                        </span>{" "}
                        poukaz na herní účet pro{" "}
                        <span className="font-semibold text-white">celkového vítěze</span> (nejvíc bodů za celé MS).
                      </p>
                    </li>
                    <li className="flex flex-1 items-center gap-3.5 rounded-lg border border-white/[0.1] bg-black/30 px-3.5 py-3 sm:gap-4 sm:px-4 sm:py-4">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-cyan-300/30 bg-cyan-400/10 text-cyan-200 shadow-[0_0_16px_rgba(0,200,255,0.15)] sm:h-12 sm:w-12">
                        <Ticket className="h-5 w-5 sm:h-[1.35rem] sm:w-[1.35rem]" strokeWidth={1.75} aria-hidden />
                      </span>
                      <p className="min-w-0 text-sm leading-relaxed text-slate-100/95 sm:text-[0.9375rem]">
                        <span className="font-display text-lg font-bold tabular-nums text-cyan-200 sm:text-xl">
                          5× 200&nbsp;Kč
                        </span>{" "}
                        poukaz na herní účet v{" "}
                        <span className="font-semibold text-white">tombole</span> (1 odehraný den = 1 lístek do
                        losování).
                      </p>
                    </li>
                  </ul>
                </div>
              </div>
              <p className="mt-4">
                <Link
                  href="/fantasy/pravidla"
                  className="ms-fantasy-save-shimmer group relative inline-flex w-full max-w-md items-center justify-center gap-2 overflow-hidden rounded-lg border border-cyan-300/35 bg-gradient-to-r from-[#0077b6]/90 via-[#00B4FF]/95 to-[#48cae4]/90 px-4 py-2.5 text-xs font-semibold text-[#03050a] shadow-[0_0_20px_rgba(0,180,255,0.28)] transition hover:scale-[1.01] hover:shadow-[0_0_32px_rgba(0,212,255,0.38)] sm:inline-flex sm:w-auto sm:rounded-xl sm:px-5 sm:py-2.5 sm:text-sm"
                >
                  <BookOpen className="relative z-10 h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" aria-hidden />
                  <span className="relative z-10">Kompletní pravidla a fantasy body</span>
                </Link>
              </p>
            </div>
            <div className="flex w-11 shrink-0 flex-col gap-2 self-stretch text-white/90 sm:w-12 sm:gap-2.5">
              <div className="flex min-h-0 flex-1 flex-col items-center justify-center rounded-xl border border-white/12 bg-white/[0.06] shadow-[0_0_16px_rgba(0,200,255,0.12)]">
                <Shirt className="h-5 w-5 sm:h-[1.35rem] sm:w-[1.35rem]" strokeWidth={1.25} aria-hidden />
              </div>
              <div className="flex min-h-0 flex-1 flex-col items-center justify-center rounded-xl border border-white/12 bg-white/[0.06] shadow-[0_0_16px_rgba(0,200,255,0.12)]">
                <Trophy className="h-5 w-5 sm:h-[1.35rem] sm:w-[1.35rem]" strokeWidth={1.25} aria-hidden />
              </div>
              <div className="flex min-h-0 flex-1 flex-col items-center justify-center rounded-xl border border-white/12 bg-white/[0.06] shadow-[0_0_16px_rgba(0,200,255,0.12)]">
                <Ticket className="h-5 w-5 sm:h-[1.35rem] sm:w-[1.35rem]" strokeWidth={1.25} aria-hidden />
              </div>
            </div>
          </div>
        </MsFantasyGlassPanel>

        {MS_FANTASY_ACTIVE_NOTICES.map((notice) => (
          <MsFantasyNoticeBanner key={notice.id} notice={notice} className="mt-4" />
        ))}

        {err ? (
          <p className="mt-4 rounded-xl border border-red-400/35 bg-red-950/40 px-3 py-2.5 text-sm text-red-100 backdrop-blur-md sm:px-4 sm:py-3">
            {err}
          </p>
        ) : null}

        {days === null && !err ? (
          <p className="mt-5 text-center text-sm text-slate-400">Načítám hrací dny…</p>
        ) : null}

        {days && days.length === 0 ? (
          <MsFantasyGlassPanel className="mt-5 px-4 py-6 text-center sm:mt-6 sm:px-5 sm:py-8" glow="subtle">
            <p className="text-sm leading-relaxed text-slate-200">
              Zatím tu nejsou žádné fantasy hrací dny ani pool hráčů — databáze na tomto prostředí ještě neobsahuje
              fantasy data.
            </p>
            <p className="mt-4 text-[0.65rem] leading-relaxed text-slate-500">
              Časy a páry zápasů odpovídají{" "}
              <a
                href="https://www.iihf.com/en/events/2026/wm/schedule"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400/90 underline decoration-cyan-500/35 underline-offset-2 hover:text-cyan-300"
              >
                oficiálnímu rozvrhu IIHF
              </a>
              . Uzávěrka fantasy = začátek prvního zápasu daného dne (CEST).
            </p>
            <p className="mt-4 text-xs leading-relaxed text-slate-400">
              Pro správce serveru: kompletní fantasy MS 2026 najednou:{" "}
              <span className="font-mono text-slate-300">MS_FANTASY_SEED_FANTASY_DATA=true</span> +{" "}
              <span className="font-mono text-slate-300">npm run db:seed</span> (hrací dny + program zápasů z{" "}
              <span className="font-mono text-slate-300">src/lib/ms2026FantasyOfficialGameDays.ts</span> —{" "}
              <strong className="font-semibold text-slate-200">upsert podle slug, odevzdané lineupy zůstanou</strong>;
              soupisky všech repre z <span className="font-mono text-slate-300">data/</span> dle seedu (chybějící JSON
              se přeskočí s varováním), pokud nenastavíš{" "}
              <span className="font-mono text-slate-300">MS_FANTASY_SEED_FANTASY_DATA_SKIP_POOL=true</span> — pak se
              mění jen kalendář / zápasy v DB). Soubor{" "}
              <span className="font-mono text-slate-300">data/ms2026-fantasy-game-days.json</span> drží jen základní
              metadata (slug, uzávěrka) pro rychlý přehled mimo seed. Jen rychlý test bez kalendáře:{" "}
              <span className="font-mono text-slate-300">MS_FANTASY_SEED_SAMPLE=true</span> doplní dva ukázkové hrací
              dny (pool hráčů ne — ten jen z JSON repre), případně zapni jednotlivé týmy{" "}
              <span className="font-mono text-slate-300">MS_FANTASY_SEED_AUT=true</span>,{" "}
              <span className="font-mono text-slate-300">MS_FANTASY_SEED_DEN=true</span>, … Viz{" "}
              <span className="font-mono text-slate-300">prisma/seed.ts</span>.
            </p>
          </MsFantasyGlassPanel>
        ) : null}

        {days && days.length > 0 ? (
          <div className="mt-6 space-y-3 sm:mt-7 sm:space-y-4">
            <ul className="flex flex-col gap-2 sm:gap-3">
              {days.map((d) => {
                const pauseDay = isMsFantasySchedulePauseDaySlug(d.slug);
                return (
                <li key={d.id}>
                  <Link
                    href={`/fantasy/${d.slug}`}
                    className={`
                      group relative flex items-center gap-3 overflow-hidden rounded-xl border border-white/[0.1]
                      bg-gradient-to-r from-white/[0.07] via-white/[0.03] to-transparent px-3 py-3 backdrop-blur-xl
                      shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset,0_6px_24px_rgba(0,0,0,0.22)]
                      transition hover:border-cyan-300/35 hover:shadow-[0_0_32px_rgba(0,200,255,0.16)]
                      sm:gap-4 sm:rounded-2xl sm:px-4 sm:py-4
                      ${d.isLocked ? "opacity-80" : ""}
                    `}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-400/[0.04] to-transparent opacity-0 transition group-hover:opacity-100" />
                    <div
                      className={[
                        "relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
                        "border border-cyan-200/30 bg-gradient-to-br from-cyan-400/25 to-slate-900/80",
                        "shadow-[0_0_20px_rgba(0,200,255,0.3),inset_0_1px_0_rgba(255,255,255,0.2)]",
                        "ring-1 ring-cyan-300/20 sm:h-12 sm:w-12 sm:ring-2",
                      ].join(" ")}
                    >
                      <Calendar className="relative z-10 h-5 w-5 text-cyan-100 sm:h-6 sm:w-6" aria-hidden />
                    </div>
                    <div className="relative min-w-0 flex-1">
                      <p className="truncate font-display text-base font-bold tracking-wide text-white sm:text-lg">
                        {d.title}
                      </p>
                      {pauseDay ? null : (
                        <p className="mt-1 text-xs text-slate-400">
                          Uzávěrka fantasy{" "}
                          <time dateTime={d.lockAt} className="text-slate-300">
                            {new Date(d.lockAt).toLocaleString("cs-CZ", {
                              timeZone: "Europe/Prague",
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </time>{" "}
                          <span className="text-slate-500">(= první zápas dne v čase arény / CEST)</span>
                        </p>
                      )}
                      <div className="mt-2 rounded-lg border border-white/[0.06] bg-black/20 px-2.5 py-2 sm:px-3">
                        <p className="font-display text-[0.58rem] font-bold uppercase tracking-[0.14em] text-slate-500">
                          Zápasy dne
                        </p>
                        <MsFantasyMatchSchedule
                          matchesRaw={d.matches}
                          omitEmptyDayDeadlineHint={pauseDay}
                          className="mt-1.5 max-h-40 overflow-y-auto overscroll-contain pr-0.5 sm:max-h-48"
                        />
                      </div>
                      <p className="mt-1.5">
                        <span
                          className={[
                            "inline-flex rounded-full px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider",
                            d.isLocked ? "bg-slate-800/80 text-slate-400 ring-1 ring-white/10" : "bg-emerald-500/20 text-emerald-200 ring-1 ring-emerald-400/35",
                          ].join(" ")}
                        >
                          {d.isLocked ? "Uzavřeno" : "Otevřeno"}
                        </span>
                      </p>
                    </div>
                    <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-cyan-200 shadow-[0_0_14px_rgba(0,200,255,0.18)] transition group-hover:translate-x-0.5 group-hover:border-cyan-300/40 group-hover:text-white sm:h-10 sm:w-10">
                      <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden />
                    </div>
                  </Link>
                </li>
                );
              })}
            </ul>
            <p className="mt-3 text-center text-[0.65rem] leading-snug text-slate-500 sm:text-xs">
              Časy zápasů v čase arény (CEST). Zdroj:{" "}
              <a
                href="https://www.iihf.com/en/events/2026/wm/schedule"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400/90 underline decoration-cyan-500/35 underline-offset-2 hover:text-cyan-300"
              >
                IIHF — rozvrh MS 2026
              </a>
              .
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
