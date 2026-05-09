import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SiteShell } from "@/components/site/SiteShell";
import { FlagMark } from "@/components/flags/FlagMark";

export const metadata: Metadata = {
  title: "Moje hodnocení hráčů | Můj účet",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

function fmtDate(d: Date | null): string {
  if (!d) return "—";
  return new Intl.DateTimeFormat("cs-CZ", {
    timeZone: "Europe/Prague",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

function fmtRating(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "–";
  return n.toFixed(1).replace(".", ",");
}

function splitTeams(m: { homeCode?: string | null; awayCode?: string | null; title: string }) {
  const a = (m.homeCode ?? "").trim();
  const b = (m.awayCode ?? "").trim();
  if (a && b) return { a, b };
  const t = m.title.toUpperCase();
  const match = t.match(/\b([A-Z]{3})\s*[-–—]\s*([A-Z]{3})\b/);
  if (match) return { a: match[1]!, b: match[2]! };
  return null;
}

export default async function MyMatchRatingsPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    redirect("/auth/signin?callbackUrl=/ucet/hodnoceni");
  }

  const raterKey = `u:${userId}`;
  const ratings = await prisma.matchRating.findMany({
    where: { raterKey },
    select: {
      playerId: true,
      rating: true,
      updatedAt: true,
      matchId: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  const matchIds = Array.from(new Set(ratings.map((r) => r.matchId)));
  const matches =
    matchIds.length > 0
      ? await prisma.match.findMany({
          where: { id: { in: matchIds } },
          select: {
            id: true,
            slug: true,
            title: true,
            homeCode: true,
            awayCode: true,
            startsAt: true,
            published: true,
          },
        })
      : [];
  const matchById = new Map(matches.map((m) => [m.id, m]));

  type Group = {
    matchId: string;
    slug: string;
    title: string;
    homeCode: string | null;
    awayCode: string | null;
    startsAt: Date | null;
    published: boolean;
    countRated: number;
    avg: number;
    lastRatedAt: Date;
  };
  const grouped: Group[] = [];
  for (const id of matchIds) {
    const m = matchById.get(id);
    if (!m) continue;
    const rs = ratings.filter((r) => r.matchId === id);
    if (rs.length === 0) continue;
    const sum = rs.reduce((a, b) => a + b.rating, 0);
    const last = rs.reduce(
      (a, b) => (b.updatedAt > a ? b.updatedAt : a),
      new Date(0)
    );
    grouped.push({
      matchId: id,
      slug: m.slug,
      title: m.title,
      homeCode: m.homeCode,
      awayCode: m.awayCode,
      startsAt: m.startsAt,
      published: m.published,
      countRated: rs.length,
      avg: sum / rs.length,
      lastRatedAt: last,
    });
  }
  grouped.sort((a, b) => b.lastRatedAt.getTime() - a.lastRatedAt.getTime());

  return (
    <SiteShell>
      <main>
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:py-14">
          <div className="flex items-baseline justify-between gap-4">
            <h1 className="font-sans text-2xl font-bold text-white sm:text-3xl">Moje hodnocení hráčů</h1>
            <Link
              href="/ucet"
              className="rounded-lg border border-white/12 bg-black/20 px-3 py-1.5 text-xs font-medium text-white/85 hover:bg-white/[0.06]"
            >
              ← Můj účet
            </Link>
          </div>
          <p className="mt-2 text-sm text-white/60">
            Přehled tvých uložených hodnocení hráčů v zápasech. Pro úpravu otevři příslušný zápas.
          </p>

          {grouped.length === 0 ? (
            <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center text-sm text-white/65">
              Zatím jsi neohodnotil žádný zápas. Otevři{" "}
              <Link href="/zapasy" className="font-semibold text-sky-300 hover:underline">
                přehled zápasů
              </Link>{" "}
              a po zápase udělej hodnocení sestavy.
            </div>
          ) : (
            <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
              <ul className="divide-y divide-white/[0.06]">
                {grouped.map((g) => {
                  const teams = splitTeams(g);
                  return (
                    <li key={g.matchId}>
                      <Link
                        href={`/zapasy/${encodeURIComponent(g.slug)}`}
                        className="grid grid-cols-[1fr_auto] items-center gap-3 px-4 py-3 hover:bg-white/[0.04] sm:px-5 sm:py-4"
                      >
                        <div className="min-w-0">
                          <div className="flex min-w-0 items-center gap-2">
                            {teams ? (
                              <>
                                <FlagMark code={teams.a} className="h-4 w-6" />
                                <span className="truncate font-display text-base font-black text-white">
                                  {teams.a} <span className="text-white/35">-</span> {teams.b}
                                </span>
                                <FlagMark code={teams.b} className="h-4 w-6" />
                              </>
                            ) : (
                              <span className="truncate font-display text-base font-black text-white">{g.title}</span>
                            )}
                          </div>
                          <div className="mt-1 text-[11px] text-white/45">
                            {fmtDate(g.startsAt)}
                            <span className="mx-2 text-white/25">·</span>
                            {g.countRated} hráčů ohodnoceno
                            <span className="mx-2 text-white/25">·</span>
                            naposledy {fmtDate(g.lastRatedAt)}
                          </div>
                        </div>
                        <div className="shrink-0 rounded-full bg-emerald-400/15 px-3 py-1 font-display text-sm font-black tabular-nums text-emerald-300">
                          ⌀ {fmtRating(g.avg)}
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </main>
    </SiteShell>
  );
}
