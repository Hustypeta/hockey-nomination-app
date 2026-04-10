/**
 * Do czech-ms-2026-candidates-80.json doplní jen `jerseyNumber` u hráčů,
 * kteří mají mapované číslo z reprezentace (IIHF MS 2025 / 2024 a doplnění).
 * U ostatních klíč `jerseyNumber` odebere.
 */
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const path = join(root, "czech-ms-2026-candidates-80.json");

/** @type {Record<string, number>} přesné jméno jako v JSON */
const REPRE = {
  "Lukáš Dostál": 1,
  "Radko Gudas": 3,
  "Michal Kempný": 6,
  "David Špaček": 7,
  "Ondřej Beránek": 8,
  "Roman Červenka": 10,
  "Pavel Zacha": 14,
  "Filip Hronek": 17,
  "Filip Zadina": 18,
  "Ondřej Palát": 18,
  "Jakub Flek": 19,
  "Daniel Gazda": 20,
  "Jáchym Kondelík": 22,
  "Lukáš Sedlák": 23,
  "Adam Klapka": 24,
  "Jan Ščotka": 24,
  "Jiří Ticháček": 26,
  "Petr Mrázek": 34,
  "Jakub Krejčík": 36,
  "Jan Rutta": 44,
  "Matěj Stránský": 44,
  "Karel Vejmelka": 50,
  "Libor Hájek": 55,
  "David Kämpf": 64,
  "Ondřej Kaše": 73,
  "Filip Pyrochta": 77,
  "Dan Vladař": 80,
  "Dominik Kubalík": 81,
  "Tomáš Kundrátek": 84,
  "Petr Kodýtek": 86,
  "David Pastrňák": 88,
  "Jakub Lauko": 94,
  "Daniel Voženílek": 96,
  "David Tomášek": 96,
  "Martin Nečas": 98,
  "Tomáš Hertl": 48,
  "Filip Chytil": 72,
  "David Rittich": 31,
  "Radek Faksa": 12,
  "Tomáš Nosek": 92,
  "Jakub Dobeš": 35,
  "David Jiříček": 9,
  "Jakub Vrána": 90,
  "Šimon Hrubec": 30,
  "Patrik Bartošák": 11,
  "Roman Horák": 27,
  "Michal Jordán": 47,
  "Lukáš Klok": 15,
  "Jan Bednář": 33,
  "Kristian Reichel": 37,
};

const rows = JSON.parse(readFileSync(path, "utf-8"));

const out = rows.map((row) => {
  const name = row.name?.trim();
  const { jerseyNumber: _j, nationalTeamNumber: _n, ...rest } = row;
  const fromRepre = name && REPRE[name];
  if (fromRepre != null) {
    return { ...rest, jerseyNumber: fromRepre };
  }
  return { ...rest };
});

writeFileSync(path, JSON.stringify(out, null, 2) + "\n", "utf-8");

const hits = out.filter((r) => r.jerseyNumber != null).length;
console.log(`Hotovo: ${out.length} hráčů, ${hits} s číslem z repre, zbytek bez čísla.`);
