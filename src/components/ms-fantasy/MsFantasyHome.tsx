"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, BookOpen, Calendar, Shirt, Ticket, Trophy } from "lucide-react";
import { MS_FANTASY_CAP, isMsFantasyLineupSubmissionEnabled } from "@/lib/msFantasyConfig";
import { MsFantasyGlassPanel } from "./MsFantasyFrozenArenaShell";

type DayRow = {
  id: string;
  slug: string;
  title: string;
  lockAt: string;
  isLocked: boolean;
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
    <div className="pb-16 pt-2 sm:pb-20">
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
        <MsFantasyGlassPanel className="p-6 sm:p-8" glow="cyan">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <p className="font-display text-xs font-bold uppercase tracking-[0.28em] text-cyan-200/95">MS 2026</p>
              <h1 className="mt-2 font-display text-4xl font-bold tracking-[0.02em] text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.45)] sm:text-5xl sm:tracking-tight">
                Fantasy
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-200/90">
                Každý hrací den sestavíš <span className="font-semibold text-white">6 hráčů</span> z poolu (1× brankář,
                zbytek útočníci nebo obránci). Zastropování{" "}
                <span className="font-semibold text-cyan-100">{MS_FANTASY_CAP} kreditů</span> na den. Odevzdání musí být
                před prvním zápasem dne — čas uzávěrky u každého dne níže.
                {!fantasySubmissionsEnabled ? (
                  <span className="mt-2 block rounded-lg border border-amber-400/25 bg-amber-500/10 px-3 py-2 text-amber-100">
                    Odesílání sestav na server je zatím vypnuté — fantasy jde jen vyzkoušet v rozhraní.
                  </span>
                ) : null}
              </p>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-200/90">
                Hrajeme o atraktivní hokejové ceny, konkrétní nabídku v co nejbližší době upřesníme.
              </p>
              <p className="mt-5 font-display text-xl font-bold tracking-wide text-white sm:text-2xl">
                Balíčky a rozšíření — připravujeme
              </p>
              <p className="mt-6">
                <Link
                  href="/fantasy/pravidla"
                  className="ms-fantasy-save-shimmer group relative inline-flex items-center gap-2 overflow-hidden rounded-xl border border-cyan-300/35 bg-gradient-to-r from-[#0077b6]/90 via-[#00B4FF]/95 to-[#48cae4]/90 px-5 py-3 text-sm font-semibold text-[#03050a] shadow-[0_0_28px_rgba(0,180,255,0.35)] transition hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(0,212,255,0.45)]"
                >
                  <BookOpen className="relative z-10 h-4 w-4 shrink-0" aria-hidden />
                  <span className="relative z-10">Kompletní pravidla a fantasy body</span>
                </Link>
              </p>
            </div>
            <div className="flex shrink-0 justify-center gap-4 text-white/90 sm:justify-end sm:gap-6 lg:pt-1">
              <div className="flex h-14 w-14 flex-col items-center justify-center rounded-2xl border border-white/15 bg-white/[0.06] shadow-[0_0_24px_rgba(0,200,255,0.15)] sm:h-16 sm:w-16">
                <Shirt className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={1.25} aria-hidden />
              </div>
              <div className="flex h-14 w-14 flex-col items-center justify-center rounded-2xl border border-white/15 bg-white/[0.06] shadow-[0_0_24px_rgba(0,200,255,0.15)] sm:h-16 sm:w-16">
                <Trophy className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={1.25} aria-hidden />
              </div>
              <div className="flex h-14 w-14 flex-col items-center justify-center rounded-2xl border border-white/15 bg-white/[0.06] shadow-[0_0_24px_rgba(0,200,255,0.15)] sm:h-16 sm:w-16">
                <Ticket className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={1.25} aria-hidden />
              </div>
            </div>
          </div>
        </MsFantasyGlassPanel>

        {err ? (
          <p className="mt-6 rounded-2xl border border-red-400/35 bg-red-950/40 px-4 py-3 text-sm text-red-100 backdrop-blur-md">
            {err}
          </p>
        ) : null}

        {days === null && !err ? (
          <p className="mt-8 text-center text-sm text-slate-400">Načítám hrací dny…</p>
        ) : null}

        {days && days.length === 0 ? (
          <MsFantasyGlassPanel className="mt-8 px-6 py-10 text-center" glow="subtle">
            <p className="text-sm leading-relaxed text-slate-200">
              Zatím tu nejsou žádné fantasy hrací dny ani pool hráčů — databáze na tomto prostředí ještě neobsahuje
              fantasy data.
            </p>
            <p className="mt-4 text-xs leading-relaxed text-slate-400">
              Pro správce serveru: kompletní fantasy MS 2026 najednou:{" "}
              <span className="font-mono text-slate-300">MS_FANTASY_SEED_FANTASY_DATA=true</span> +{" "}
              <span className="font-mono text-slate-300">npm run db:seed</span> (dny z{" "}
              <span className="font-mono text-slate-300">data/ms2026-fantasy-game-days.json</span>, soupisky všech repre
              z <span className="font-mono text-slate-300">data/</span> dle seedu; chybějící JSON se přeskočí s
              varováním). Jen rychlý test bez kalendáře:{" "}
              <span className="font-mono text-slate-300">MS_FANTASY_SEED_SAMPLE=true</span> doplní dva ukázkové hrací
              dny (pool hráčů ne — ten jen z JSON repre), případně zapni jednotlivé týmy{" "}
              <span className="font-mono text-slate-300">MS_FANTASY_SEED_AUT=true</span>,{" "}
              <span className="font-mono text-slate-300">MS_FANTASY_SEED_DEN=true</span>, … Viz{" "}
              <span className="font-mono text-slate-300">prisma/seed.ts</span>.
            </p>
          </MsFantasyGlassPanel>
        ) : null}

        {days && days.length > 0 ? (
          <div className="mt-10 space-y-8">
            <ul className="flex flex-col gap-3 sm:gap-4">
              {days.map((d) => (
                <li key={d.id}>
                  <Link
                    href={`/fantasy/${d.slug}`}
                    className={`
                      group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-white/[0.1]
                      bg-gradient-to-r from-white/[0.07] via-white/[0.03] to-transparent px-4 py-4 backdrop-blur-xl
                      shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset,0_8px_32px_rgba(0,0,0,0.25)]
                      transition hover:border-cyan-300/35 hover:shadow-[0_0_40px_rgba(0,200,255,0.18)]
                      sm:gap-5 sm:px-5 sm:py-5
                      ${d.isLocked ? "opacity-80" : ""}
                    `}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-400/[0.04] to-transparent opacity-0 transition group-hover:opacity-100" />
                    <div
                      className={[
                        "relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full",
                        "border border-cyan-200/30 bg-gradient-to-br from-cyan-400/25 to-slate-900/80",
                        "shadow-[0_0_28px_rgba(0,200,255,0.35),inset_0_1px_0_rgba(255,255,255,0.2)]",
                        "ring-2 ring-cyan-300/20",
                      ].join(" ")}
                    >
                      <Calendar className="relative z-10 h-6 w-6 text-cyan-100" aria-hidden />
                    </div>
                    <div className="relative min-w-0 flex-1">
                      <p className="truncate font-display text-lg font-bold tracking-wide text-white sm:text-xl">
                        {d.title}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        Uzávěrka{" "}
                        <time dateTime={d.lockAt} className="text-slate-300">
                          {new Date(d.lockAt).toLocaleString("cs-CZ", {
                            timeZone: "Europe/Prague",
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </time>
                      </p>
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
                    <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-cyan-200 shadow-[0_0_20px_rgba(0,200,255,0.2)] transition group-hover:translate-x-0.5 group-hover:border-cyan-300/40 group-hover:text-white">
                      <ArrowRight className="h-5 w-5" aria-hidden />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}
