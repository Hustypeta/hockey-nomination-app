import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { loadMs2026Candidates } from "@/lib/ms2026Candidates";
import { FlagMark } from "@/components/flags/FlagMark";

export const metadata = {
  title: "Sdílené hodnocení (zápas)",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Snapshot = {
  match: {
    slug: string;
    title: string;
    opponent: string | null;
    startsAt: string | null;
    venue: string | null;
    category: string;
    homeCode: string | null;
    awayCode: string | null;
  };
  ratings: Record<string, { avg: number; count: number }>;
  createdAt: string;
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

export default async function MatchRatingSharePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const row = await prisma.matchRatingShareLink.findUnique({ where: { slug } });
  if (!row) notFound();

  const snap = row.snapshot as unknown as Snapshot;
  const players = loadMs2026Candidates();
  const byId = new Map(players.map((p) => [p.id, p]));

  const entries = Object.entries(snap.ratings ?? {})
    .map(([playerId, v]) => ({ playerId, avg: v.avg ?? 0, count: v.count ?? 0 }))
    .sort((a, b) => (b.avg - a.avg) || (b.count - a.count));

  const teams = splitTeams({ title: snap.match.title, homeCode: snap.match.homeCode, awayCode: snap.match.awayCode });

  return (
    <main className="min-h-screen bg-[#05080f] text-white">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-2xl font-black">
              {row.title || "Sdílené hodnocení"}
            </h1>
            <span className="text-xs text-white/55">
              Export: {new Date(snap.createdAt).toLocaleString("cs-CZ")}
            </span>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-white/70">
            {teams ? (
              <div className="flex items-center gap-2">
                <FlagMark code={teams.a} />
                <span className="font-bold text-white">{teams.a}</span>
                <span className="text-white/50">–</span>
                <span className="font-bold text-white">{teams.b}</span>
                <FlagMark code={teams.b} />
              </div>
            ) : (
              <span className="font-bold text-white">{snap.match.title}</span>
            )}
            {snap.match.startsAt ? <span className="text-white/50">·</span> : null}
            {snap.match.startsAt ? <span>{new Date(snap.match.startsAt).toLocaleString("cs-CZ")}</span> : null}
            {snap.match.venue ? <span className="text-white/50">·</span> : null}
            {snap.match.venue ? <span>{snap.match.venue}</span> : null}
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {entries.map((e, i) => {
            const p = byId.get(e.playerId);
            return (
              <div key={e.playerId} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 text-right font-display text-lg font-black text-white/50">
                        {i + 1}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-bold text-white">{p?.name ?? e.playerId}</div>
                        {p ? (
                          <div className="mt-1 text-xs text-white/60">
                            {p.club} · {p.league}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 text-right text-xs text-white/60">
                    <div>
                      <span className="font-bold text-white">{e.avg.toFixed(2)}</span> / 10
                    </div>
                    <div>{e.count} hlasů</div>
                  </div>
                </div>
              </div>
            );
          })}
          {entries.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-sm text-white/60">
              Zatím bez hodnocení.
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}

