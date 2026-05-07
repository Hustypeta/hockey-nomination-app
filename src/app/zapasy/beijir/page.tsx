import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { FlagMark } from "@/components/flags/FlagMark";

export const metadata: Metadata = {
  title: "Zápasy — Beijir hockey games",
  alternates: { canonical: "/zapasy/beijir" },
};

// DB at runtime
export const dynamic = "force-dynamic";
export const revalidate = 0;

const PREVIEW_BEIJIR = [
  { title: "SUI - FIN", homeCode: "SUI", awayCode: "FIN", startsAt: "2026-05-07T15:00:00+02:00", venue: null as string | null },
  { title: "CZE - SWE", homeCode: "CZE", awayCode: "SWE", startsAt: "2026-05-07T19:00:00+02:00", venue: null as string | null },
  { title: "FIN - CZE", homeCode: "FIN", awayCode: "CZE", startsAt: "2026-05-09T12:00:00+02:00", venue: null as string | null },
  { title: "SWE - SUI", homeCode: "SWE", awayCode: "SUI", startsAt: "2026-05-09T16:00:00+02:00", venue: null as string | null },
  { title: "SUI - CZE", homeCode: "SUI", awayCode: "CZE", startsAt: "2026-05-10T12:00:00+02:00", venue: null as string | null },
  { title: "SWE - FIN", homeCode: "SWE", awayCode: "FIN", startsAt: "2026-05-10T16:00:00+02:00", venue: null as string | null },
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

  const formatDate = (d: Date) =>
    d.toLocaleDateString("cs-CZ", { day: "2-digit", month: "2-digit", year: "numeric" });
  const formatTime = (d: Date) => d.toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit" });

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
      : PREVIEW_BEIJIR.map((m, idx) => ({
          slug: `preview-${idx}`,
          title: m.title,
          venue: m.venue,
          startsAt: new Date(m.startsAt),
          homeCode: m.homeCode,
          awayCode: m.awayCode,
          hasOfficial: false,
          clickable: false as const,
        }));

  return (
    <main className="min-h-screen bg-[#05080f] text-white">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="font-display text-3xl font-black">Zápasy</h1>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/zapasy/beijir"
            className="rounded-full border border-white/25 bg-white/[0.08] px-4 py-2 text-sm font-black tracking-wide text-white"
          >
            Beijir hockey games
          </Link>
          <Link
            href="/zapasy/ms-2026"
            className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-black tracking-wide text-white/70 hover:bg-white/[0.05]"
          >
            MS 2026
          </Link>
        </div>

        <div className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-white shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
          {matches.length === 0 ? (
            <div className="border-b border-black/10 bg-amber-50 px-4 py-3 text-[11px] text-amber-900">
              Zatím jsou to jen <strong>náhledové</strong> zápasy. V adminu je jedním tlačítkem založíš do databáze a pak
              půjde doplnit oficiální sestava a hodnocení.
            </div>
          ) : null}
          {list.map((m) => {
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
                      <span className="font-semibold text-slate-400">Bez sestavy</span>
                    )}
                  </div>
                </div>

                <div className="text-sm font-black text-slate-400">-</div>
              </div>
            );

            return m.clickable ? (
              <Link
                key={m.slug}
                href={`/zapasy/${encodeURIComponent(m.slug)}`}
                className="block border-b border-black/10 px-4 py-3 text-slate-900 hover:bg-slate-50 last:border-b-0"
              >
                {Row}
              </Link>
            ) : (
              <div
                key={m.slug}
                className="block border-b border-black/10 px-4 py-3 text-slate-900 opacity-90 last:border-b-0"
              >
                {Row}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}

