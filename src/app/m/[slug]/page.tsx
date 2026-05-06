import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { LineupStructure } from "@/types";
import { LineBuilder } from "@/components/LineBuilder";
import { loadMs2026Candidates } from "@/lib/ms2026Candidates";

export const metadata = {
  title: "Sdílená sestava (zápas)",
  robots: { index: false, follow: false },
};

export default async function MatchShareViewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const row = await prisma.matchShareLink.findUnique({ where: { slug } });
  if (!row) notFound();

  const lineup = row.lineupStructure as unknown as LineupStructure;
  const players = loadMs2026Candidates();
  return (
    <main className="min-h-screen bg-[#05080f] text-white">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="font-display text-2xl font-black">{row.title ?? "Sdílená sestava"}</h1>
        <p className="mt-2 text-sm text-white/60">Sestava na zápas (sdílení).</p>
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <LineBuilder
            mode="match"
            layoutVariant="classic"
            lineup={lineup}
            players={players}
            captainId={row.captainId ?? null}
            onLineupChange={() => undefined}
            onCaptainChange={() => undefined}
            selectedSlot={null}
            onSelectSlot={() => undefined}
            enableDnd={false}
            readOnly
            matchDefenseCount={(row.defenseCount as 6 | 7 | 8) ?? 8}
            matchAllowExtraForward={Boolean(row.allowExtraForward)}
          />
        </div>
      </div>
    </main>
  );
}

