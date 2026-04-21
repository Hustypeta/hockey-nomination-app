import { loadMs2026Candidates } from "../src/lib/ms2026Candidates";

const all = loadMs2026Candidates();

function pick(name: string, club?: string) {
  const m = club ? all.find((p) => p.name === name && p.club === club) : all.find((p) => p.name === name);
  if (!m) throw new Error(`Missing: ${name}${club ? ` @ ${club}` : ""}`);
  return m;
}

const keys: [string, string?][] = [
  ["Lukáš Dostál"],
  ["Jan Bednář", "Ässät"],
  ["Karel Vejmelka"],
  ["Ondřej Palát"],
  ["Pavel Zacha"],
  ["David Pastrňák"],
  ["Roman Červenka"],
  ["Lukáš Sedlák"],
  ["Adam Klapka"],
  ["Jiří Smejkal"],
  ["Tomáš Hertl"],
  ["Jakub Lauko"],
  ["Radan Lenc"],
  ["Radek Faksa"],
  ["Ondřej Kaše"],
  ["Andrej Nestrašil"],
  ["Filip Hronek"],
  ["Jan Košťálek"],
  ["Michal Kempný"],
  ["Ronald Knot"],
  ["Radim Šimek"],
  ["Jan Rutta"],
  ["Filip Král"],
  ["Jakub Vrána"],
  ["Radko Gudas"],
];

for (const [n, c] of keys) pick(n, c);

console.log(JSON.stringify(keys.map(([n, c]) => pick(n, c)), null, 2));
