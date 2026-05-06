import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { loadMs2026Candidates } from "@/lib/ms2026Candidates";
import type { LineupStructure } from "@/types";
import { LineBuilder } from "@/components/LineBuilder";
import { MatchRatingClient } from "@/components/match/MatchRatingClient";

export default async function MatchDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const match = await prisma.match.findUnique({
    where: { slug },
    include: { officialLineup: true },
  });
  if (!match || !match.published || !match.officialLineup) notFound();

  const players = loadMs2026Candidates();
  const lineup = match.officialLineup.lineupStructure as unknown as LineupStructure;

  const grouped = await prisma.matchRating.groupBy({
    by: ["playerId"],
    where: { matchId: match.id },
    _avg: { rating: true },
    _count: { rating: true },
  });
  const ratings = Object.fromEntries(
    grouped.map((r) => [r.playerId, { avg: r._avg.rating ?? 0, count: r._count.rating }])
  ) as Record<string, { avg: number; count: number }>;

  return (
    <main className="min-h-screen bg-[#05080f] text-white">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="font-display text-3xl font-black">{match.title}</h1>
        <p className="mt-2 text-sm text-white/60">
          {match.opponent ? <>Soupeř: <span className="text-white/80">{match.opponent}</span> · </> : null}
          {match.startsAt ? new Date(match.startsAt).toLocaleString("cs-CZ") : "—"}
          {match.venue ? <> · {match.venue}</> : null}
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <h2 className="font-display text-lg font-black">Oficiální sestava</h2>
            <div className="mt-4">
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
            </div>
          </section>

          <section>
            <h2 className="font-display text-lg font-black">Hodnocení hráčů (1–10)</h2>
            <p className="mt-1 text-sm text-white/60">Klikni na číslo u hráče — můžeš hlas kdykoliv přepsat.</p>
            <div className="mt-4">
              <MatchRatingClient
                slug={match.slug}
                players={players}
                lineup={lineup}
                defenseCount={(match.officialLineup.defenseCount as 6 | 7 | 8) ?? 8}
                allowExtraForward={Boolean(match.officialLineup.allowExtraForward)}
                initialRatings={ratings}
              />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

