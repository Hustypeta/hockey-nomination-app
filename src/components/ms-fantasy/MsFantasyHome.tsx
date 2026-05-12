"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Calendar } from "lucide-react";
import { MS_FANTASY_CAP } from "@/lib/msFantasyConfig";

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
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-8 space-y-3">
        <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-[#00B4FF]/90">MS 2026</p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">Fantasy</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-slate-400">
          Každý hrací den sestavíš <span className="text-slate-200">6 hráčů</span> z poolu (1× brankář, zbytek útočníci
          nebo obránci). Zastropování <span className="text-slate-200">{MS_FANTASY_CAP} kreditů</span> na den. Odevzdání
          musí být před prvním zápasem dne — čas uzávěrky u každého dne níže.
        </p>
      </div>

      {err ? (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{err}</p>
      ) : null}

      {days === null && !err ? (
        <p className="text-sm text-slate-500">Načítám hrací dny…</p>
      ) : null}

      {days && days.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-10 text-center text-slate-400">
          <p className="text-sm leading-relaxed">
            Zatím nejsou v databázi žádné hrací dny ani pool hráčů. Až doplníš Excel a nahraješ data, rozcestník tu
            naplní konkrétní termíny.
          </p>
        </div>
      ) : null}

      {days && days.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {days.map((d) => (
            <li key={d.id}>
              <Link
                href={`/fantasy/${d.slug}`}
                className={`
                  group flex items-center gap-4 rounded-2xl border border-white/[0.09] bg-gradient-to-r from-[#101822]/90 to-[#0a1018]/92
                  px-4 py-4 transition hover:border-[#00B4FF]/35 hover:shadow-[0_0_24px_rgba(0,180,255,0.12)] sm:px-5 sm:py-5
                  ${d.isLocked ? "opacity-75" : ""}
                `}
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#00B4FF]/20 bg-[#00B4FF]/10">
                  <Calendar className="h-6 w-6 text-[#00B4FF]" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-white">{d.title}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Uzávěrka{" "}
                    <time dateTime={d.lockAt}>
                      {new Date(d.lockAt).toLocaleString("cs-CZ", {
                        timeZone: "Europe/Prague",
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </time>{" "}
                    ({d.isLocked ? "uzavřeno" : "otevřeno"})
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 shrink-0 text-[#00B4FF] transition group-hover:translate-x-0.5" />
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
