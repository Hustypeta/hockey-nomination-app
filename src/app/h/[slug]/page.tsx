import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { loadMs2026Candidates } from "@/lib/ms2026Candidates";
import { FlagMark } from "@/components/flags/FlagMark";
import {
  type MatchRatingShareSnapshot,
  isPersonalShareSnapshot,
} from "@/lib/matchRatingShareSnapshot";

export const metadata = {
  title: "Sdílené hodnocení (zápas)",
  robots: { index: false, follow: false },
};

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

function fmtRatingComma(n: number): string {
  if (!Number.isFinite(n)) return "–";
  return (Math.round(n * 10) / 10).toFixed(1).replace(".", ",");
}

export default async function MatchRatingSharePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const row = await prisma.matchRatingShareLink.findUnique({ where: { slug } });
  if (!row) notFound();

  const snap = row.snapshot as unknown as MatchRatingShareSnapshot;
  const players = loadMs2026Candidates();
  const byId = new Map(players.map((p) => [p.id, p]));

  const teams = splitTeams({
    title: snap.match.title,
    homeCode: snap.match.homeCode,
    awayCode: snap.match.awayCode,
  });

  let entries: Array<{ playerId: string; display: number; votes?: number }> = [];

  if (isPersonalShareSnapshot(snap)) {
    entries = Object.entries(snap.myRatings)
      .map(([playerId, v]) => ({
        playerId,
        display: typeof v === "number" ? v : 0,
      }))
      .sort((a, b) => b.display - a.display);
  } else {
    const agg = "ratings" in snap ? snap.ratings ?? {} : {};
    entries = Object.entries(agg)
      .map(([playerId, v]) => {
        const cnt = typeof v?.count === "number" ? v.count : 0;
        return {
          playerId,
          display: typeof v?.avg === "number" ? v.avg : 0,
          votes: cnt,
        };
      })
      .sort((a, b) => b.display - a.display || b.votes - a.votes);
  }

  const shareKindBadge = isPersonalShareSnapshot(snap) ? (
    <span className="rounded-full border border-emerald-400/40 bg-emerald-400/15 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-200">
      Osobní známky
    </span>
  ) : (
    <span className="rounded-full border border-amber-400/40 bg-amber-400/15 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-100">
      Průměry fanoušků
    </span>
  );

  return (
    <main className="min-h-screen bg-[#05080f] text-white">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-2xl font-black">{row.title || "Sdílené hodnocení"}</h1>
            {shareKindBadge}
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
          <p className="mt-3 text-xs leading-relaxed text-white/52">
            {isPersonalShareSnapshot(snap)
              ? "Údaje přesně tak, jak je měl v době odkazu uživatel uložené u svého účtu. Veřejná stránka zápasu všem ukazuje jen průměry komunity."
              : "Agregované průměry ze všech hlasů v době vytvoření odkazu (ne jednotlivého člověka)."}
          </p>
        </div>

        <div className="mt-6 space-y-3">
          {entries.map((e, i) => {
            const p = byId.get(e.playerId);
            const personalRow = isPersonalShareSnapshot(snap);
            return (
              <div key={e.playerId} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 text-right font-display text-lg font-black text-white/50">{i + 1}</div>
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
                      <span className="font-bold text-white">{fmtRatingComma(e.display)}</span> / 10
                    </div>
                    {personalRow ? (
                      <div className="text-white/45">osobní známka (snapshot odkazu)</div>
                    ) : (
                      <div>
                        {(e.votes ?? 0)}{" "}
                        {(e.votes ?? 0) === 1 ? "hlas" : (e.votes ?? 0) < 5 ? "hlasy" : "hlasů"}
                      </div>
                    )}
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
