"use client";

import { FlagMark } from "@/components/flags/FlagMark";
import type { MsFantasyMatchDto } from "@/lib/msFantasyScheduleDisplay";
import { formatMsFantasyMatchClockPrague, parseMsFantasyMatches } from "@/lib/msFantasyScheduleDisplay";

type MsFantasyMatchScheduleProps = {
  matchesRaw: unknown;
  /** Zobrazit zdroj odkaz (fantasy den / přehled). */
  showSourceLink?: boolean;
  /**
   * Kalendářní dny bez zápasů (pauza) — bez věty o uzávěrce fantasy (ta se v UI u těchto dnů neukazuje).
   */
  omitEmptyDayDeadlineHint?: boolean;
  className?: string;
};

export function MsFantasyMatchSchedule({
  matchesRaw,
  showSourceLink,
  omitEmptyDayDeadlineHint,
  className = "",
}: MsFantasyMatchScheduleProps) {
  const matches = parseMsFantasyMatches(matchesRaw);

  return (
    <div className={className}>
      {matches.length === 0 ? (
        <p className="text-[0.7rem] leading-snug text-slate-500 sm:text-xs">
          Tento kalendářní den se na šampionátu nehraje.
          {omitEmptyDayDeadlineHint
            ? null
            : (
                <>
                  {" "}
                  Uzávěrka fantasy odpovídá dalšímu klíčovému začátku v harmonogramu (viz datum uzávěrky výše).
                </>
              )}
        </p>
      ) : (
        <ul className="space-y-1.5 sm:space-y-2">
          {matches.map((m, ix) => (
            <MsFantasyMatchRow key={`${m.startAt}-${ix}`} m={m} />
          ))}
        </ul>
      )}
      {showSourceLink ? (
        <p className="mt-2 text-[0.62rem] leading-snug text-slate-600 sm:text-[0.65rem]">
          Program a časy zápasů dle{" "}
          <a
            href="https://www.iihf.com/en/events/2026/wm/schedule"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400/90 underline decoration-cyan-500/40 underline-offset-2 hover:text-cyan-300"
          >
            oficiálního rozvrhu IIHF (MS 2026)
          </a>
          .
        </p>
      ) : null}
    </div>
  );
}

function MsFantasyMatchRow({ m }: { m: MsFantasyMatchDto }) {
  const time = formatMsFantasyMatchClockPrague(m.startAt);
  const hasTeams = Boolean(m.home && m.away);

  return (
    <li className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-[0.7rem] text-slate-200 sm:text-xs">
      <span className="shrink-0 font-mono tabular-nums text-slate-400">{time}</span>
      {hasTeams ? (
        <span className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5 font-medium">
          <span className="inline-flex items-center gap-1">
            <FlagMark code={m.home!} className="h-3 w-[0.9rem] shrink-0 rounded-sm ring-1 ring-white/20" />
            <span>{m.home}</span>
          </span>
          <span className="text-slate-500">–</span>
          <span className="inline-flex items-center gap-1">
            <span>{m.away}</span>
            <FlagMark code={m.away!} className="h-3 w-[0.9rem] shrink-0 rounded-sm ring-1 ring-white/20" />
          </span>
          {m.group ? (
            <span className="ml-0.5 rounded bg-white/[0.06] px-1.5 py-0.5 text-[0.58rem] font-bold uppercase tracking-wide text-slate-500">
              Sk. {m.group}
            </span>
          ) : null}
        </span>
      ) : (
        <span className="min-w-0 text-slate-200">{m.label ?? m.phase ?? "Zápas"}</span>
      )}
    </li>
  );
}
