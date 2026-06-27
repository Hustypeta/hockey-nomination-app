"use client";

import { useEffect, useMemo, useState } from "react";
import { FifaAppPage } from "@/components/fifa/FifaAppPage";
import { FIFA_INPUT, FIFA_KICKER } from "@/lib/fifa/fifaUiClasses";
import type { NominationContestPlayerRow } from "@/lib/nominationContestPlayers";

const POSITION_LABEL: Record<string, string> = {
  G: "Brankář",
  D: "Obránce",
  F: "Útočník",
};

function positionLabel(pos: string) {
  return POSITION_LABEL[pos.toUpperCase()] ?? pos;
}

function roleLabel(role: string | null, position: string) {
  if (!role || role === position) return null;
  return role;
}

export function FifaHraciContent({ players }: { players: NominationContestPlayerRow[] }) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("q");
    if (q) setQuery(q);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return players;
    return players.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.club.toLowerCase().includes(q) ||
        p.league.toLowerCase().includes(q) ||
        positionLabel(p.position).toLowerCase().includes(q) ||
        (p.role?.toLowerCase().includes(q) ?? false)
    );
  }, [players, query]);

  return (
    <FifaAppPage className="!py-2 lg:!py-2.5">
      <div className="fifa-viewport-page">
        <div className="fifa-page-heading fifa-viewport-page-header shrink-0">
          <p className={FIFA_KICKER}>Nominační soutěž MS 2026</p>
          <h1>Hráči</h1>
          <p>
            Český pool pro sestavu nominace — stejní hráči jako v editoru na <span className="text-[var(--fifa-text)]">/sestava</span>.
          </p>
        </div>

        <div className="fifa-viewport-page-body mt-3 flex min-h-0 flex-1 flex-col gap-2 overflow-hidden">
          {players.length === 0 ? (
            <p className="fifa-empty-state shrink-0 text-xs">
              Pool hráčů se nepodařilo načíst — zkontroluj soubor{" "}
              <code className="text-[var(--fifa-text)]">czech-ms-2026-candidates-80.json</code>.
            </p>
          ) : null}
          <div className="flex shrink-0 items-center justify-between gap-3">
            <p className="text-xs text-[var(--fifa-text-secondary)]">
              <span className="font-semibold text-[var(--fifa-text)]">{filtered.length}</span>
              {filtered.length === 1 ? " hráč" : filtered.length < 5 ? " hráči" : " hráčů"}
            </p>
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Hledat…" className={`${FIFA_INPUT} max-w-[14rem] !py-1.5 text-xs`} />
          </div>
          <div className="fifa-panel-scroll fifa-table-wrap min-h-0 flex-1">
            <table className="w-full text-left text-xs lg:text-sm">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Jméno</th>
                  <th>Poz.</th>
                  <th>Klub</th>
                  <th>Liga</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const detail = roleLabel(p.role, p.position);
                  return (
                    <tr key={p.id}>
                      <td className="tabular-nums text-[var(--fifa-text-muted)]">{p.jerseyNumber ?? "—"}</td>
                      <td className="font-medium text-[var(--fifa-text)]">{p.name}</td>
                      <td>
                        {positionLabel(p.position)}
                        {detail ? <span className="ml-1 text-[10px] text-[var(--fifa-text-muted)]">({detail})</span> : null}
                      </td>
                      <td>{p.club}</td>
                      <td className="text-[var(--fifa-text-muted)]">{p.league}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </FifaAppPage>
  );
}
