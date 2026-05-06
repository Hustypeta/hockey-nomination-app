import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Zápasy — Beijir hockey games — MS 2026",
};

export default async function MatchesIndexPage() {
  const matches = await prisma.match.findMany({
    where: { published: true, officialLineup: { isNot: null } },
    orderBy: [{ startsAt: "desc" }, { createdAt: "desc" }],
    select: { slug: true, title: true, opponent: true, startsAt: true, venue: true },
  });

  return (
    <main className="min-h-screen bg-[#05080f] text-white">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="font-display text-3xl font-black">Zápasy</h1>
        <p className="mt-2 text-sm text-white/60">Beijir hockey games · MS 2026</p>

        <div className="mt-8 space-y-3">
          {matches.map((m) => (
            <Link
              key={m.slug}
              href={`/zapasy/${encodeURIComponent(m.slug)}`}
              className="block rounded-2xl border border-white/10 bg-white/[0.03] p-4 hover:bg-white/[0.05]"
            >
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="font-display text-xl font-black">{m.title}</div>
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

