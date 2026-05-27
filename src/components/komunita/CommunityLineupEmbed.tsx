"use client";

import Link from "next/link";
import type { CommunityAttachmentSnapshotV1 } from "@/lib/community/types";
import type { Player } from "@/types";
import { CommunityPosterThumb } from "@/components/komunita/CommunityPosterThumb";

export function CommunityLineupEmbed({
  snapshot,
  players,
}: {
  snapshot: CommunityAttachmentSnapshotV1;
  players: Player[];
}) {
  if (snapshot.kind === "FANTASY_LINEUP") {
    const salary = snapshot.meta?.salarySpent;
    const picks = snapshot.meta?.pickCount;
    return (
      <div className="rounded-xl border border-cyan-500/25 bg-cyan-950/30 px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-wider text-cyan-300/80">Fantasy sestava</p>
        <p className="mt-1 font-semibold text-white">{snapshot.title ?? "Fantasy den"}</p>
        <p className="mt-1 text-xs text-white/55">
          {typeof picks === "number" ? `${picks} hráčů` : null}
          {typeof salary === "number" ? ` · ${salary} kreditů` : null}
        </p>
        {snapshot.sourcePath ? (
          <Link href={snapshot.sourcePath} className="mt-2 inline-block text-xs text-cyan-400 hover:underline">
            Otevřít fantasy →
          </Link>
        ) : null}
      </div>
    );
  }

  const ls = snapshot.lineupStructure;
  if (!ls) {
    return (
      <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/50">
        Příloha sestavy
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-start gap-3">
      <CommunityPosterThumb
        players={players}
        lineup={ls}
        captainId={snapshot.captainId ?? null}
        createdAtIso={snapshot.createdAt}
        title={snapshot.title}
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-white">{snapshot.title ?? "Sestava"}</p>
        {snapshot.sourcePath ? (
          <Link
            href={snapshot.sourcePath}
            target="_blank"
            className="mt-1 inline-block text-xs text-cyan-400 hover:underline"
          >
            Otevřít sestavu →
          </Link>
        ) : null}
      </div>
    </div>
  );
}
