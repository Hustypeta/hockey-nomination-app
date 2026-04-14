"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SestavaAmbientBackground } from "@/components/sestava/SestavaAmbientBackground";

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

export default function ContestLeaderboardPage() {
  const [published, setPublished] = useState<boolean | null>(null);
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
        setUpdatedAt(typeof data.updatedAt === "string" ? data.updatedAt : null);
        setRows(Array.isArray(data.leaderboard) ? data.leaderboard : []);
      })
      .catch(() => setError("Nepodařilo se načíst žebříček."));
  }, []);

  return (
    <div className="sestava-page-ambient min-h-screen pb-16 text-white">
      <SestavaAmbientBackground />
      <div className="sticky top-0 z-40">
        <SiteHeader />
      </div>
      <main className="relative z-10 mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">Žebříček soutěže</h1>
        <p className="mt-2 text-sm text-white/65">
          Body se počítají až po uložení oficiální soupisky v adminu. Časový bonus bere nominace z uložení
          uživatele.
        </p>

        {error ? (
          <p className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            {error}
          </p>
        ) : published === null ? (
          <p className="mt-8 text-white/50">Načítám…</p>
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
                          <span className="ml-2 text-[10px] text-white/35" title="Detail rozpadu bodů">
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

        <p className="mt-10 text-center text-sm">
          <Link href="/pravidla-souteze" className="text-cyan-200/90 underline-offset-4 hover:underline">
            Pravidla soutěže
          </Link>
          {" · "}
          <Link href="/" className="text-white/50 underline-offset-4 hover:text-white/75 hover:underline">
            Úvod
          </Link>
        </p>
      </main>
    </div>
  );
}
