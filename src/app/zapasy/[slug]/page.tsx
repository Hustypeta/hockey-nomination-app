import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { loadMs2026Candidates } from "@/lib/ms2026Candidates";
import type { LineupStructure } from "@/types";
import { LineBuilder } from "@/components/LineBuilder";
import { MatchRatingClient } from "@/components/match/MatchRatingClient";
import { MatchRatingShareControls } from "@/components/match/MatchRatingShareControls";
import { FlagMark } from "@/components/flags/FlagMark";

// Railway build: do not prerender at build-time (needs DB at runtime).
export const dynamic = "force-dynamic";
export const revalidate = 0;

const PREVIEW_MATCHES: Record<
  string,
  { title: string; homeCode: string; awayCode: string; startsAt: Date; venue: string | null; opponent: string | null }
> = {
  "beijir-cze-swe-2026-05-07-1900": {
    title: "CZE - SWE",
    homeCode: "CZE",
    awayCode: "SWE",
    startsAt: new Date("2026-05-07T19:00:00+02:00"),
    venue: null,
    opponent: null,
  },
  "beijir-fin-cze-2026-05-09-1200": {
    title: "FIN - CZE",
    homeCode: "FIN",
    awayCode: "CZE",
    startsAt: new Date("2026-05-09T12:00:00+02:00"),
    venue: null,
    opponent: null,
  },
  "beijir-sui-cze-2026-05-10-1200": {
    title: "SUI - CZE",
    homeCode: "SUI",
    awayCode: "CZE",
    startsAt: new Date("2026-05-10T12:00:00+02:00"),
    venue: null,
    opponent: null,
  },
};

function splitTeams(m: { homeCode?: string | null; awayCode?: string | null; title: string }) {
  const a = (m.homeCode ?? "").trim();
  const b = (m.awayCode ?? "").trim();
  if (a && b) return { a, b };
  const t = m.title.toUpperCase();
  const match = t.match(/\b([A-Z]{3})\s*[-–—]\s*([A-Z]{3})\b/);
  if (match) return { a: match[1]!, b: match[2]! };
  return null;
}

function matchRatingOpen(startsAt: Date | null): { open: boolean; reason?: string } {
  if (!startsAt) return { open: false, reason: "Hodnocení bude dostupné po skončení zápasu." };
  // Simple heuristic: open ratings after (start + 3h).
  const openAt = startsAt.getTime() + 3 * 60 * 60 * 1000;
  if (Date.now() < openAt) {
    return { open: false, reason: "Hodnocení se otevře až po skončení zápasu." };
  }
  return { open: true };
}

export default async function MatchDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const preview = PREVIEW_MATCHES[slug] ?? null;
  const match = preview
    ? null
    : await prisma.match.findUnique({
        where: { slug },
        include: { officialLineup: true },
      });
  if (!preview && (!match || !match.published)) notFound();

  const players = loadMs2026Candidates();
  const lineup = match?.officialLineup?.lineupStructure
    ? (match.officialLineup.lineupStructure as unknown as LineupStructure)
    : null;
  const startsAt = preview ? preview.startsAt : match?.startsAt ?? null;
  const ratingGate = matchRatingOpen(startsAt);

  const ratings = preview
    ? ({} as Record<string, { avg: number; count: number }>)
    : ((await prisma.matchRating.groupBy({
        by: ["playerId"],
        where: { matchId: match!.id },
        _avg: { rating: true },
        _count: { rating: true },
      }).then((grouped) =>
        Object.fromEntries(grouped.map((r) => [r.playerId, { avg: r._avg.rating ?? 0, count: r._count.rating }]))
      )) as Record<string, { avg: number; count: number }>);

  return (
    <main className="min-h-screen bg-[#05080f] text-white">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white text-slate-900 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
          <div className="px-4 py-4 sm:px-6 sm:py-6">
            <div className="flex items-center justify-center gap-6 sm:gap-10">
              {(() => {
                const t = splitTeams(preview ? preview : match!);
                if (!t) return null;
                return (
                  <>
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-black/10 bg-white shadow-sm sm:h-20 sm:w-20">
                        <FlagMark code={t.a} className="h-8 w-12 sm:h-9 sm:w-14" />
                      </div>
                      <div className="text-sm font-semibold text-slate-700">{t.a === "CZE" ? "Česko" : t.a === "SWE" ? "Švédsko" : t.a === "FIN" ? "Finsko" : t.a === "SUI" ? "Švýcarsko" : t.a}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-semibold text-slate-500">
                        {startsAt ? new Date(startsAt).toLocaleString("cs-CZ") : "—"}
                      </div>
                      <div className="mt-2 font-display text-3xl font-black text-slate-900 sm:text-4xl">-</div>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-black/10 bg-white shadow-sm sm:h-20 sm:w-20">
                        <FlagMark code={t.b} className="h-8 w-12 sm:h-9 sm:w-14" />
                      </div>
                      <div className="text-sm font-semibold text-slate-700">{t.b === "CZE" ? "Česko" : t.b === "SWE" ? "Švédsko" : t.b === "FIN" ? "Finsko" : t.b === "SUI" ? "Švýcarsko" : t.b}</div>
                    </div>
                  </>
                );
              })()}
            </div>
            <div className="mt-4 text-center text-xs text-slate-500">
              {(preview ? preview.venue : match?.venue) ? <span>{preview ? preview.venue : match?.venue}</span> : null}
              {(preview ? preview.venue : match?.venue) && (preview ? preview.opponent : match?.opponent) ? (
                <span> · </span>
              ) : null}
              {(preview ? preview.opponent : match?.opponent) ? <span>{preview ? preview.opponent : match?.opponent}</span> : null}
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <h2 className="font-display text-lg font-black">Oficiální sestava</h2>
            <div className="mt-4">
              {lineup && match?.officialLineup ? (
                <LineBuilder
                  mode="match"
                  layoutVariant="classic"
                  lineup={lineup}
                  players={players}
                  captainId={match.officialLineup.captainId ?? null}
                  onLineupChange={() => undefined}
                  onCaptainChange={() => undefined}
                  selectedSlot={null}
                  onSelectSlot={() => undefined}
                  enableDnd={false}
                  readOnly
                  matchDefenseCount={(match.officialLineup.defenseCount as 6 | 7 | 8) ?? 8}
                  matchAllowExtraForward={Boolean(match.officialLineup.allowExtraForward)}
                />
              ) : (
                <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-white/65">
                  Oficiální sestava zatím nebyla oznámena. Jakmile ji admin doplní, zobrazí se tady.
                </div>
              )}
            </div>
          </section>

          <section>
            <h2 className="font-display text-lg font-black">Hodnocení hráčů (1–10)</h2>
            <p className="mt-1 text-sm text-white/60">
              Hodnocení je možné až po skončení zápasu.
            </p>
            {ratingGate.open && !preview ? (
              <MatchRatingShareControls matchSlug={match!.slug} defaultTitle={`Hodnocení — ${match!.title}`} />
            ) : (
              <div className="mt-3 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/65">
                {ratingGate.reason}
              </div>
            )}
            <div className="mt-4">
              {lineup && match?.officialLineup ? (
                <MatchRatingClient
                  slug={match.slug}
                  players={players}
                  lineup={lineup}
                  defenseCount={(match.officialLineup.defenseCount as 6 | 7 | 8) ?? 8}
                  allowExtraForward={Boolean(match.officialLineup.allowExtraForward)}
                  initialRatings={ratings}
                  canRate={ratingGate.open}
                  lockedReason={ratingGate.reason}
                />
              ) : (
                <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-white/65">
                  Hodnocení bude dostupné po oznámení oficiální sestavy a po skončení zápasu.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

