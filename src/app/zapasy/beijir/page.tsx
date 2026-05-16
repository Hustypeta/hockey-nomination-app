import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { resolveBeijirMatchResult } from "@/lib/beijirMatchResults";
import { FlagMark } from "@/components/flags/FlagMark";
import { SiteShell } from "@/components/site/SiteShell";

export const metadata: Metadata = {
  title: "Zápasy — Beijir hockey games",
  alternates: { canonical: "/zapasy/beijir" },
};

// DB at runtime
export const dynamic = "force-dynamic";
export const revalidate = 0;

const PREVIEW_BEIJIR = [
  {
    slug: "beijir-cze-swe-2026-05-07-1700",
    title: "CZE - SWE",
    homeCode: "CZE",
    awayCode: "SWE",
    startsAt: "2026-05-07T17:00:00+02:00",
    venue: null as string | null,
  },
  {
    slug: "beijir-fin-cze-2026-05-09-1200",
    title: "FIN - CZE",
    homeCode: "FIN",
    awayCode: "CZE",
    startsAt: "2026-05-09T12:00:00+02:00",
    venue: null as string | null,
  },
  {
    slug: "beijir-sui-cze-2026-05-10-1200",
    title: "SUI - CZE",
    homeCode: "SUI",
    awayCode: "CZE",
    startsAt: "2026-05-10T12:00:00+02:00",
    venue: null as string | null,
  },
] as const;

function splitTeams(m: { homeCode?: string | null; awayCode?: string | null; title: string }) {
  const a = (m.homeCode ?? "").trim();
  const b = (m.awayCode ?? "").trim();
  if (a && b) return { a, b };
  const t = m.title.toUpperCase();
  const match = t.match(/\b([A-Z]{3})\s*[-–—]\s*([A-Z]{3})\b/);
  if (match) return { a: match[1]!, b: match[2]! };
  return null;
}

export default async function ZapasyBeijirPage() {
  const matches = await prisma.match.findMany({
    where: { published: true, category: "beijir" },
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

  const list =
    matches.length > 0
      ? matches.map((m) => ({
          slug: m.slug,
          title: m.title,
          venue: m.venue,
          startsAt: m.startsAt,
          homeCode: m.homeCode,
          awayCode: m.awayCode,
          hasOfficial: Boolean(m.officialLineup),
          clickable: true as const,
        }))
      : PREVIEW_BEIJIR.map((m) => ({
          slug: m.slug,
          title: m.title,
          venue: m.venue,
          startsAt: new Date(m.startsAt),
          homeCode: m.homeCode,
          awayCode: m.awayCode,
          hasOfficial: false,
          clickable: true as const,
        }));

  return (
    <SiteShell>
      <main>
      <div className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="font-display text-3xl font-black">Zápasy</h1>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/zapasy/ms-2026"
            className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-black tracking-wide text-white/70 hover:bg-white/[0.05]"
          >
            MS 2026
          </Link>
          <Link
            href="/zapasy/beijir"
            className="rounded-full border border-white/25 bg-white/[0.08] px-4 py-2 text-sm font-black tracking-wide text-white"
          >
            Beijir hockey games
          </Link>
        </div>

        <div className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-white shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
          {list.map((m) => {
            const beijirResult = resolveBeijirMatchResult({
              slug: m.slug,
              category: "beijir",
              homeCode: m.homeCode,
              awayCode: m.awayCode,
            });
            const Row = (
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
                  {beijirResult ? (
                    <div className="mb-1 font-mono text-[10px] font-black leading-tight tracking-tight text-slate-800 sm:text-[11px]">
                      {beijirResult.headline}
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
                    {m.venue && m.hasOfficial ? <span className="text-slate-300"> · </span> : null}
                    {m.hasOfficial ? (
                      <span className="font-semibold text-emerald-700">Sestava</span>
                    ) : (
                      <span className="font-semibold text-slate-400">Sestava neozn.</span>
                    )}
                  </div>
                </div>

                <div className="text-sm font-black tabular-nums text-slate-800">
                  {beijirResult ? (
                    <>
                      {beijirResult.homeGoals}
                      <span className="text-slate-400">:</span>
                      {beijirResult.awayGoals}
                    </>
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </div>
              </div>
            );

            return (
              <Link
                key={m.slug}
                href={`/zapasy/${encodeURIComponent(m.slug)}`}
                className="block border-b border-black/10 px-4 py-3 text-slate-900 hover:bg-slate-50 last:border-b-0"
              >
                {Row}
              </Link>
            );
          })}
        </div>
      </div>
      </main>
    </SiteShell>
  );
}

