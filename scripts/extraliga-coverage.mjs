/**
 * Rozpad kandidátů po extraligových klubech: G, D, F, celkem.
 * node scripts/extraliga-coverage.mjs
 */
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const players = JSON.parse(
  readFileSync(join(root, "czech-ms-2026-candidates-80.json"), "utf8")
);
const mapText = readFileSync(join(root, "src/lib/clubLeague.ts"), "utf8");
const extraligaClubs = [];
const re = /"([^"]+)": "Extraliga"/g;
let m;
while ((m = re.exec(mapText)) !== null) extraligaClubs.push(m[1]);

const byClub = {};
for (const c of extraligaClubs) byClub[c] = { G: 0, D: 0, F: 0 };

for (const p of players) {
  const bucket = byClub[p.club];
  if (!bucket) continue;
  const pos = p.position;
  if (pos === "G" || pos === "D" || pos === "F") bucket[pos] += 1;
}

const rows = extraligaClubs.map((club) => {
  const b = byClub[club];
  const t = b.G + b.D + b.F;
  return { club, ...b, t };
});

rows.sort((a, b) => a.t - b.t || a.club.localeCompare(b.club, "cs"));

console.log("Extraliga v kandidátech (G / D / F = počty podle pozice)\n");
console.log("celk\tG\tD\tF\tklub");
for (const r of rows) {
  console.log(`${r.t}\t${r.G}\t${r.D}\t${r.F}\t${r.club}`);
}

const bezG = rows.filter((r) => r.t > 0 && r.G === 0).map((r) => r.club);
if (bezG.length)
  console.log("\nMají hráče, ale 0 brankářů v soupisce:", bezG.join(", "));
