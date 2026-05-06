import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { FlagMark } from "@/components/flags/FlagMark";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const category = sp.category === "ms2026" ? "ms2026" : "beijir";
  const canonical = category === "ms2026" ? "/zapasy/ms-2026" : "/zapasy/beijir";
  return {
    title: "Zápasy — Beijir hockey games — MS 2026",
    alternates: { canonical },
  };
}

// Railway build: do not prerender at build-time (needs DB at runtime).
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

export default async function MatchesIndexPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const sp = await searchParams;
  const category = sp.category === "ms2026" ? "ms2026" : "beijir";
  const matches = await prisma.match.findMany({
    where: { published: true, category, officialLineup: { isNot: null } },
    orderBy: [{ startsAt: "desc" }, { createdAt: "desc" }],
    select: { slug: true, title: true, opponent: true, startsAt: true, venue: true, homeCode: true, awayCode: true },
  });

  return (
    <main className="min-h-screen bg-[#05080f] text-white">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="font-display text-3xl font-black">Zápasy</h1>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/zapasy?category=beijir"
            className={`rounded-full border px-4 py-2 text-sm font-black tracking-wide ${
              category === "beijir"
                ? "border-white/25 bg-white/[0.08] text-white"
                : "border-white/10 bg-white/[0.03] text-white/70 hover:bg-white/[0.05]"
            }`}
          >
            Beijir hockey games
          </Link>
          <Link
            href="/zapasy?category=ms2026"
            className={`rounded-full border px-4 py-2 text-sm font-black tracking-wide ${
              category === "ms2026"
                ? "border-white/25 bg-white/[0.08] text-white"
                : "border-white/10 bg-white/[0.03] text-white/70 hover:bg-white/[0.05]"
            }`}
          >
            MS 2026
          </Link>
        </div>

        <div className="mt-8 space-y-3">
          {matches.map((m) => (
            <Link
              key={m.slug}
              href={`/zapasy/${encodeURIComponent(m.slug)}`}
              className="block rounded-2xl border border-white/10 bg-white/[0.03] p-4 hover:bg-white/[0.05]"
            >
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    {(() => {
                      const teams = splitTeams(m);
                      if (!teams) return null;
                      return (
                        <div className="flex items-center gap-2">
                          <FlagMark code={teams.a} />
                          <div className="font-display text-xl font-black">
                            {teams.a} <span className="text-white/60">–</span> {teams.b}
                          </div>
                          <FlagMark code={teams.b} />
                        </div>
                      );
                    })()}
                    {!splitTeams(m) ? <div className="font-display text-xl font-black">{m.title}</div> : null}
                  </div>
                  <div className="mt-1 text-xs text-white/60">
                    {m.opponent ? <>Soupeř: <span className="text-white/80">{m.opponent}</span></> : null}
                    {m.venue ? <> · {m.venue}</> : null}
                  </div>
                </div>
                <div className="text-xs text-white/55">
                  {m.startsAt ? new Date(m.startsAt).toLocaleString("cs-CZ") : "—"}
                </div>
              </div>
            </Link>
          ))}
          {matches.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-sm text-white/60">
              Zatím žádné publikované zápasy.
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}

