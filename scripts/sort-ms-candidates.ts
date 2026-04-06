/**
 * Seřadí kandidáty: G → D → F, pak liga → klub → jméno.
 * Doplní Adama Měchuru pokud chybí. npm run sort:candidates
 */
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { leagueForClub } from "../src/lib/clubLeague";

const LEAGUE_ORDER: Record<string, number> = {
  NHL: 0,
  AHL: 1,
  Extraliga: 2,
  SHL: 3,
  Liiga: 4,
  NL: 5,
  DEL: 6,
};

type Row = { name: string; position: string; role: string; club: string };

const path = resolve(__dirname, "..", "czech-ms-2026-candidates-80.json");
const rows = JSON.parse(readFileSync(path, "utf-8")) as Row[];

console.log("Čtení / zápis:", path);

const hasMechura = rows.some(
  (r) => r.name === "Adam Měchura" || r.name === "Adam Mechura"
);
if (!hasMechura) {
  rows.push({
    name: "Adam Měchura",
    position: "F",
    role: "LW",
    club: "HC Plzeň",
  });
}

function leagueRank(club: string): number {
  const L = leagueForClub(club);
  return LEAGUE_ORDER[L] ?? 99;
}

const POS_RANK: Record<string, number> = { G: 0, D: 1, F: 2 };

rows.sort((a, b) => {
  const pa = POS_RANK[a.position] ?? 9;
  const pb = POS_RANK[b.position] ?? 9;
  if (pa !== pb) return pa - pb;

  const la = leagueRank(a.club);
  const lb = leagueRank(b.club);
  if (la !== lb) return la - lb;

  const c = a.club.localeCompare(b.club, "cs");
  if (c !== 0) return c;

  return a.name.localeCompare(b.name, "cs");
});

/** Jedna prázdná řádka mezi řádky = „malá“ mezera mezi ligami. */
const LEAGUE_GAP = ",\n\n";
/** Dvě prázdné řádky mezi bloky G / D / F = „velká“ mezera mezi pozicemi. */
const POSITION_GAP = ",\n\n\n\n";

const lineJson = (r: Row) => "  " + JSON.stringify(r);

function formatPositionRows(posRows: Row[]): string {
  if (posRows.length === 0) return "";
  let out = lineJson(posRows[0]);
  for (let i = 1; i < posRows.length; i++) {
    const sameLeague =
      leagueRank(posRows[i - 1].club) === leagueRank(posRows[i].club);
    const sep = sameLeague ? ",\n" : LEAGUE_GAP;
    out += sep + lineJson(posRows[i]);
  }
  return out;
}

const POS_GROUPS = ["G", "D", "F"] as const;
const blocks = POS_GROUPS.map((pos) =>
  formatPositionRows(rows.filter((r) => r.position === pos))
).filter((block) => block.length > 0);
const compact = "[\n" + blocks.join(POSITION_GAP) + "\n]\n";
writeFileSync(path, compact, "utf-8");
const firstG = rows.find((r) => r.position === "G");
console.log(
  `OK: ${rows.length} hráčů. První brankář (kontrola řazení NHL první): ${firstG?.name} – ${firstG?.club}`
);
