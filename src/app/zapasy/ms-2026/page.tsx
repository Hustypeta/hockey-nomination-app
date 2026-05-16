import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { FlagMark } from "@/components/flags/FlagMark";
import { SiteShell } from "@/components/site/SiteShell";
import { resolveMs2026MatchResult } from "@/lib/ms2026MatchResults";

export const metadata: Metadata = {
  title: "Zápasy — MS 2026",
  alternates: { canonical: "/zapasy/ms-2026" },
};

// DB at runtime
export const dynamic = "force-dynamic";
export const revalidate = 0;

function splitTeams(m: { homeCode?: string | null; awayCode?: string | null; title: string }) {
  const a = (m.homeCode ?? "").trim();
  const b = (m.awayCode ?? "").trim();
  if (a && b) return { a, b };
  const t = m.title.toUpperCase();
  const match = t.match(/\b([A-Z]{3})\s*[-–—]\s*([A-Z]{3})\b/);
  if (match) return { a: match[1]!, b: match[2]! };
  return null;
}

export default async function ZapasyMs2026Page() {
  const matches = await prisma.match.findMany({
    where: { published: true, category: "ms2026" },
    orderBy: [{ startsAt: "asc" }, { createdAt: "asc" }],
    select: {
      slug: true,
      title: true,
      opponent: true,
      startsAt: true,
      venue: true,
      homeCode: true,
      awayCode: true,
      officialLineup: { select: { updatedAt: true } },
    },
  });

  const tz = "Europe/Prague";
  const formatDate = (d: Date) =>
    d.toLocaleDateString("cs-CZ", { timeZone: tz, day: "2-digit", month: "2-digit", year: "numeric" });
  const formatTime = (d: Date) =>
    d.toLocaleTimeString("cs-CZ", { timeZone: tz, hour: "2-digit", minute: "2-digit" });

  return (
    <SiteShell>
      <main>
      <div className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="font-display text-3xl font-black">Zápasy</h1>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/zapasy/ms-2026"
            className="rounded-full border border-white/25 bg-white/[0.08] px-4 py-2 text-sm font-black tracking-wide text-white"
          >
            MS 2026
          </Link>
          <Link
            href="/zapasy/beijir"
            className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-black tracking-wide text-white/70 hover:bg-white/[0.05]"
          >
            Beijir hockey games
          </Link>
        </div>

        <div className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-white shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
          {matches.map((m) => {
            const msResult = resolveMs2026MatchResult({
              category: "ms2026",
              homeCode: m.homeCode,
              awayCode: m.awayCode,
            });
            return (
            <Link
              key={m.slug}
              href={`/zapasy/${encodeURIComponent(m.slug)}`}
              className="block border-b border-black/10 px-4 py-3 text-slate-900 hover:bg-slate-50 last:border-b-0"
            >
              <div className="grid grid-cols-[4.25rem_1fr_auto] items-center gap-3 sm:grid-cols-[5.5rem_1fr_auto]">
                <div className="text-[11px] font-semibold tabular-nums text-slate-500">
                  {m.startsAt ? (
                    <>
                      <div>{formatDate(new Date(m.startsAt))}</div>
                      <div className="text-slate-700">{formatTime(new Date(m.startsAt))}</div>
                    </>
                  ) : (
                    <div>—</div>
                  )}
                </div>

                <div className="min-w-0">
                  {msResult ? (
                    <div className="mb-1 font-mono text-[10px] font-black leading-tight tracking-tight text-slate-800 sm:text-[11px]">
                      {msResult.headline}
                    </div>
                  ) : null}
                  {(() => {
                    const teams = splitTeams(m);
                    if (!teams) {
                      return <div className="truncate font-display text-base font-black">{m.title}</div>;
                    }
                    return (
                      <div className="flex min-w-0 items-center gap-2">
                        <FlagMark code={teams.a} className="h-5 w-7" />
                        <div className="min-w-0 truncate font-display text-base font-black sm:text-lg">
                          {teams.a} <span className="text-slate-400">-</span> {teams.b}
                        </div>
                        <FlagMark code={teams.b} className="h-5 w-7" />
                      </div>
                    );
                  })()}
                  <div className="mt-0.5 text-[11px] text-slate-500">
                    {m.venue ? <>{m.venue}</> : null}
                    {m.venue && m.officialLineup ? <span className="text-slate-300"> · </span> : null}
                    {m.officialLineup ? (
                      <span className="font-semibold text-emerald-700">Sestava</span>
                    ) : (
                      <span className="font-semibold text-slate-400">Bez sestavy</span>
                    )}
                  </div>
                </div>

                <div className="text-sm font-black tabular-nums text-slate-800">
                  {msResult ? (
                    <>
                      {msResult.homeGoals}
                      <span className="mx-0.5 text-slate-400">:</span>
                      {msResult.awayGoals}
                    </>
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </div>
              </div>
            </Link>
            );
          })}
          {matches.length === 0 ? (
            <div className="p-6 text-sm text-slate-600">
              Zatím žádné publikované zápasy.
            </div>
          ) : null}
        </div>
      </div>
      </main>
    </SiteShell>
  );
}

