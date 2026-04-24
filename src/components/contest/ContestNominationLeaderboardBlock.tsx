"use client";

import { useEffect, useState } from "react";

type Row = {
  rank: number;
  nominationId: string;
  displayName: string;
  image: string | null;
  points: number;
  createdAt: string;
  breakdown: {
    basePlayerPoints: number;
    playerPointsAfterTimeBonus: number;
    captainBonus: number;
    assistantBonus: number;
    timeBonusPercent: number;
  };
};

/** Žebříček sestavovací soutěže — data z GET /api/contest/leaderboard. */
export function ContestNominationLeaderboardBlock({ className = "" }: { className?: string }) {
  const [published, setPublished] = useState<boolean | null>(null);
  const [hidden, setHidden] = useState<boolean>(false);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/contest/leaderboard")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(typeof data.error === "string" ? data.error : "Chyba");
          return;
        }
        setPublished(!!data.published);
        setHidden(!!data.hidden);
        setUpdatedAt(typeof data.updatedAt === "string" ? data.updatedAt : null);
        setRows(Array.isArray(data.leaderboard) ? data.leaderboard : []);
      })
      .catch(() => setError("Nepodařilo se načíst žebříček."));
  }, []);

  return (
    <div className={className}>
      <p className="text-sm text-white/65">
        Body se počítají po uložení oficiální soupisky v administraci. Časový bonus podle okamžiku uložení
        nominace uživatelem.
      </p>

      {error ? (
        <p className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {error}
        </p>
      ) : published === null ? (
        <p className="mt-8 text-white/50">Načítám…</p>
      ) : hidden ? (
        <p className="mt-8 rounded-xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white/75">
          Vyhodnocení soutěže zatím není veřejné — probíhá interní testování.
        </p>
      ) : !published ? (
        <p className="mt-8 rounded-xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white/75">
          Oficiální soupiska ještě není zveřejněna — žebříček zatím není k dispozici.
        </p>
      ) : (
        <>
          {updatedAt ? (
            <p className="mt-4 text-xs text-white/45">
              Oficiální soupiska uložena: {new Date(updatedAt).toLocaleString("cs-CZ")}
            </p>
          ) : null}
          <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10 bg-black/25">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-[10px] uppercase tracking-wider text-white/45">
                  <th className="px-3 py-3">#</th>
                  <th className="px-3 py-3">Účastník</th>
                  <th className="px-3 py-3 text-right tabular-nums">Body</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-3 py-8 text-center text-white/50">
                      Zatím žádné platné nominace.
                    </td>
                  </tr>
                ) : (
                  rows.map((r) => (
                    <tr key={r.nominationId} className="border-b border-white/[0.06] last:border-0">
                      <td className="px-3 py-2.5 font-mono text-white/70">{r.rank}</td>
                      <td className="px-3 py-2.5">
                        <span className="font-medium text-white">{r.displayName}</span>
                        <span className="ml-2 text-[10px] text-white/35" title="Časová prémie při odeslání">
                          (+{r.breakdown.timeBonusPercent}% čas)
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right font-display text-lg font-bold tabular-nums text-[#f1c40f]">
                        {r.points}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
