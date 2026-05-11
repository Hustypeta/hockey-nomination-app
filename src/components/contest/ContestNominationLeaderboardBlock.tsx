"use client";

import { useEffect, useState } from "react";
import { CONTEST_DEADLINE_CS } from "@/lib/contestTimeBonus";

type Row = {
  rank: number;
  displayName: string;
  points: number;
};

function Placeholder() {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
      <p className="text-sm font-semibold leading-relaxed text-white">Žebříček zatím není zobrazen.</p>
      <p className="mt-2 text-sm leading-relaxed text-white/65">
        Veřejný žebříček soutěže o nominace{" "}
        <strong className="font-semibold text-white/85">zveřejníme až po zveřejnění oficiální soupisky reprezentace</strong>{" "}
        (tím vznikne pevné pořadí pro výpočet bodů). Jakmile administrátor soupisku uloží a zveřejní, objeví se tady
        tabulka — mezitím můžeš nominaci dál skládat a odesílat do soutěže podle pravidel.
      </p>
    </div>
  );
}

/**
 * Blok pro /zebricek: dokud API nepublikuje data (oficiální soupiska + veřejný leaderboard), jen vysvětlení;
 * pak tabulka.
 */
export function ContestNominationLeaderboardBlock({ className = "" }: { className?: string }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/contest/leaderboard");
        const data = (await res.json()) as {
          published?: boolean;
          hidden?: boolean;
          leaderboard?: Array<Row & { nominationId?: string }>;
        };
        if (cancelled) return;
        const list = Array.isArray(data.leaderboard) ? data.leaderboard : [];
        if (data.published && !data.hidden && list.length > 0) {
          setRows(
            list.map((r) => ({
              rank: r.rank,
              displayName: r.displayName,
              points: r.points,
            }))
          );
          setReady(true);
        }
      } catch {
        /* ignoruj */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className={className}>
      <p className="font-display text-[10px] font-bold uppercase tracking-[0.28em] text-[#f1c40f]/85">
        Sestavovací soutěž
      </p>
      <h2 className="mt-2 font-display text-xl font-bold text-white sm:text-2xl">Nominace na MS</h2>
      <p className="mt-3 text-sm leading-relaxed text-white/70">
        Platí pravidla sestavovací soutěže — uzávěrka odeslání nominací {CONTEST_DEADLINE_CS}.
      </p>

      {loading ? (
        <p className="mt-6 text-sm text-white/45">Načítám stav žebříčku…</p>
      ) : ready ? (
        <div className="mt-6 space-y-4">
          <p className="text-sm leading-relaxed text-white/75">
            Oficiální soupiska je zveřejněná — žebříček platných nominací podle pravidel soutěže:
          </p>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300/90">Aktuální pořadí</p>
          <ul className="divide-y divide-white/10 rounded-xl border border-white/10 bg-black/30">
            {rows.map((r) => (
              <li key={`${r.rank}-${r.displayName}`} className="flex items-center gap-3 px-4 py-3 text-sm">
                <span className="w-8 shrink-0 font-mono text-white/50">{r.rank}.</span>
                <span className="min-w-0 flex-1 truncate font-semibold text-white">{r.displayName}</span>
                <span className="shrink-0 font-mono tabular-nums text-amber-200">{r.points} b.</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="mt-6">
          <Placeholder />
        </div>
      )}
    </div>
  );
}
