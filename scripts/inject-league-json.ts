/**
 * Doplní pole `league` do hráčských JSON podle mapy klubů.
 * Spuštění: npx ts-node --compiler-options {\"module\":\"CommonJS\"} scripts/inject-league-json.ts
 */
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { leagueForClub } from "../src/lib/clubLeague";

type Row = Record<string, unknown>;

function inject(pathRel: string) {
  const path = join(__dirname, "..", pathRel);
  const rows = JSON.parse(readFileSync(path, "utf-8")) as Row[];
  for (const row of rows) {
    const club = String(row.club ?? "");
    row.league = leagueForClub(club);
  }
  writeFileSync(path, JSON.stringify(rows, null, 2) + "\n", "utf-8");
  console.log(`OK ${pathRel}: ${rows.length} řádků`);
}

inject("czech-players-2025-26.json");
inject("czech-ms-2026-candidates-80.json");
