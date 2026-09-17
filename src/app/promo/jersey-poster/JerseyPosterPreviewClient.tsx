"use client";

import { useSearchParams } from "next/navigation";
import { MatchLineupFullJerseyExportPoster } from "@/components/match/MatchLineupFullJerseyExportPoster";
import { elhPoolKey } from "@/lib/lineupPools";
import type { LineupStructure, Player, Position } from "@/types";

const KITS = [
  { slug: "repre", title: "Repre — dres + jméno", pool: "repre_a", club: "Česko" },
  { slug: "sparta", title: "Sparta — dres + jméno", pool: elhPoolKey("HC Sparta Praha"), club: "HC Sparta Praha" },
  { slug: "trinec", title: "Třinec — dres + jméno", pool: elhPoolKey("HC Oceláři Třinec"), club: "HC Oceláři Třinec" },
  { slug: "kometa", title: "Kometa — dres + jméno", pool: elhPoolKey("HC Kometa Brno"), club: "HC Kometa Brno" },
  { slug: "kladno", title: "Kladno — dres + jméno", pool: elhPoolKey("Rytíři Kladno"), club: "Rytíři Kladno" },
  { slug: "plzen", title: "Plzeň — dres + jméno", pool: elhPoolKey("HC Plzeň"), club: "HC Plzeň" },
  { slug: "litvinov", title: "Litvínov — dres + jméno", pool: elhPoolKey("HC Litvínov"), club: "HC Litvínov" },
  { slug: "liberec", title: "Liberec — dres + jméno", pool: elhPoolKey("Bílí Tygři Liberec"), club: "Bílí Tygři Liberec" },
  { slug: "hradec", title: "Hradec — dres + jméno", pool: elhPoolKey("Mountfield HK"), club: "Mountfield HK" },
] as const;

function mockPlayer(
  id: string,
  name: string,
  position: Position,
  poolKey: string,
  club: string,
  jerseyNumber: number
): Player {
  return {
    id,
    name,
    position,
    club,
    league: poolKey === "repre_a" ? "CZE" : "ELH",
    jerseyNumber,
    pick_rate: 0,
    poolKey,
  };
}

function mockLineup(poolKey: string, club: string, prefix: string) {
  const names: Array<[string, Position, number]> = [
    ["Horák", "F", 10],
    ["Voženílek", "F", 17],
    ["Sobotka", "F", 12],
    ["Forman", "F", 18],
    ["Melovský", "F", 91],
    ["Kovařčík", "F", 43],
    ["Chlapík", "F", 19],
    ["Říčka", "F", 28],
    ["Buchtele", "F", 21],
    ["Dvořák", "F", 11],
    ["Tomášek", "F", 13],
    ["Kousal", "F", 24],
    ["Kempný", "D", 6],
    ["Moravčík", "D", 8],
    ["Krejčík", "D", 44],
    ["Mikliš", "D", 55],
    ["Irving", "D", 4],
    ["Ščotka", "D", 29],
    ["Krenželok", "D", 23],
    ["Mozík", "D", 2],
    ["Kovář", "G", 1],
    ["Machovský", "G", 32],
    ["Sobotka", "F", 72],
  ];
  const last = club.split(" ").slice(-1)[0] ?? club;
  const players = names.map((row, i) =>
    mockPlayer(`${prefix}-${i}`, `${last} ${row[0]}`, row[1], poolKey, club, row[2])
  );
  const id = (i: number) => players[i]?.id ?? null;
  const lineup: LineupStructure = {
    forwardLines: [
      { lw: id(0), c: id(1), rw: id(2), x: null },
      { lw: id(3), c: id(4), rw: id(5), x: null },
      { lw: id(6), c: id(7), rw: id(8), x: null },
      { lw: id(9), c: id(10), rw: id(11), x: null },
    ],
    defensePairs: [
      { lb: id(12), rb: id(13) },
      { lb: id(14), rb: id(15) },
      { lb: id(16), rb: id(17) },
      { lb: id(18), rb: id(19) },
    ],
    goalies: [id(20), id(21), null],
    extraForwards: [id(22)],
    extraDefensemen: [],
    assistantIds: [id(2)],
  };
  return { players, lineup };
}

export function JerseyPosterPreviewClient() {
  const search = useSearchParams();
  const kitSlug = search.get("kit");
  const full = search.get("full") === "1" || Boolean(kitSlug);
  const selected = kitSlug ? KITS.filter((k) => k.slug === kitSlug) : [...KITS];
  const scale = full ? 1 : 0.42;

  return (
    <div id="jersey-poster-preview" className="flex flex-wrap gap-8 bg-slate-200 p-6">
      {selected.map((item) => {
        const data = mockLineup(item.pool, item.club, item.slug);
        return (
          <div key={item.slug} className="flex flex-col gap-2" data-poster-kit={item.slug}>
            <p className="font-semibold text-slate-800">{item.title}</p>
            <div
              className="origin-top-left overflow-hidden"
              style={{
                width: 1080 * scale,
                height: 1350 * scale,
              }}
            >
              <div style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}>
                <MatchLineupFullJerseyExportPoster
                  lineupTitle={item.title}
                  players={data.players}
                  lineup={data.lineup}
                  defenseCount={8}
                  allowExtraForward
                  poolKey={item.pool}
                  captainId={data.players[1]?.id ?? null}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
