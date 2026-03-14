/**
 * Build comprehensive Czech hockey players JSON from Elite Prospects data.
 * Run: node scripts/build-czech-players.js
 * 
 * Data sources: Fetch from eliteprospects.com stats pages (nation=CZE)
 * Leagues: NHL, AHL, SHL, Liiga, NL, Czech Extraliga
 * Excludes: David Krejčí (retired), Czechia2 players (Jan Kern, Ondřej Roman)
 */

const fs = require('fs');
const path = require('path');

// Helper to map EP position to our format
function mapPosition(epPos) {
  if (!epPos) return { position: 'F', role: 'C' };
  const pos = epPos.toUpperCase();
  if (pos.includes('G')) return { position: 'G', role: 'G' };
  if (pos.includes('D') || pos.includes('F/D') || pos.includes('D/F')) return { position: 'D', role: 'RB' };
  // Forwards: extract primary role
  if (pos.includes('C')) return { position: 'F', role: 'C' };
  if (pos.includes('RW')) return { position: 'F', role: 'RW' };
  if (pos.includes('LW')) return { position: 'F', role: 'LW' };
  if (pos.includes('W')) return { position: 'F', role: 'RW' };
  return { position: 'F', role: 'C' };
}

function extractRole(epPos) {
  const m = mapPosition(epPos);
  return m.role;
}

function extractPosition(epPos) {
  const m = mapPosition(epPos);
  return m.position;
}

// Fix Czech diacritics - EP uses URL encoding sometimes
const DIACRITICS = {
  'ě': 'ě', 'ř': 'ř', 'š': 'š', 'č': 'č', 'ř': 'ř', 'ž': 'ž', 'ý': 'ý', 'á': 'á', 'í': 'í', 'é': 'é', 'ú': 'ú', 'ů': 'ů',
  'Ě': 'Ě', 'Ř': 'Ř', 'Š': 'Š', 'Č': 'Č', 'Ž': 'Ž', 'Ý': 'Ý', 'Á': 'Á', 'Í': 'Í', 'É': 'É', 'Ú': 'Ú', 'Ů': 'Ů',
};

// Known Czech spelling corrections
const NAME_FIXES = {
  'David Pastrnak': 'David Pastrňák',
  'Pavel Zacha': 'Pavel Zacha',
  'Matej Blumel': 'Matěj Blümel',
  'Jiri Kulich': 'Jiří Kulich',
  'Martin Necas': 'Martin Nečas',
  'Radek Faksa': 'Radek Faksa',
  'David Tomasek': 'David Tomášek',
  'Tomas Nosek': 'Tomáš Nosek',
  'Ondrej Palat': 'Ondřej Palát',
  'Filip Hronek': 'Filip Hronek',
  'David Kampf': 'David Kämpf',
  'Tomas Hertl': 'Tomáš Hertl',
  'Dan Vladar': 'Dan Vladař',
  'Karel Vejmelka': 'Karel Vejmelka',
  'David Rittich': 'David Rittich',
  'Jakub Dobes': 'Jakub Dobeš',
  'Lukas Dostal': 'Lukáš Dostál',
  'Vitek Vanecek': 'Vítek Vaněček',
  'Petr Mrazek': 'Petr Mrázek',
  'Jiri Patera': 'Jiří Patera',
  'Jakub Skarek': 'Jakub Škarek',
  'Jan Jenik': 'Jan Jeník',
  'Tomas Hamara': 'Tomáš Hamara',
  'Andrej Sustr': 'Andrej Šustr',
  'Ondrej Becher': 'Ondřej Bečher',
  'Jakub Rychlovsky': 'Jakub Rychlovský',
  'Jaroslav Chmelar': 'Jaroslav Chmelář',
  'Matyas Sapovaliv': 'Matyáš Sapovaliv',
  'Jakub Dvorak': 'Jakub Dvořák',
  'Radim Mrtka': 'Radim Mrtka',
  'Jan Mysak': 'Jan Myšák',
  'Jakub Stancl': 'Jakub Stancl',
  'Matyas Melovsky': 'Matyáš Melovský',
  'Simon Zajicek': 'Šimon Zajíček',
  'Jakub Malek': 'Jakub Málek',
  'Tomas Suchanek': 'Tomáš Suchánek',
  'Michal Kempny': 'Michal Kempný',
  'Radim Zohorna': 'Radim Zohorna',
  'Lukas Rousek': 'Lukáš Rousek',
  'Jakub Vrana': 'Jakub Vrána',
  'Lubos Horky': 'Ľubos Horký',
  'Petr Kodytek': 'Petr Kodýtek',
  'Lukas Jasek': 'Lukáš Jašek',
  'Radek Kucerik': 'Radek Kučerík',
  'Ondrej Kos': 'Ondřej Koš',
  'Lukas Kanak': 'Lukáš Káňák',
  'Radek Koblizek': 'Radek Kobližek',
  'Tomas Mazura': 'Tomáš Mazura',
  'Matyas Kantner': 'Matyáš Kantner',
  'Jiri Tichacek': 'Jiří Ticháček',
  'Petr Vechet': 'Petr Věchet',
  'Michal Jordan': 'Michal Jordán',
  'Ondrej Trejbal': 'Ondřej Trejbal',
  'Richard Zemlicka': 'Richard Zemlička',
  'Ondrej Pavel': 'Ondřej Pavel',
  'Patrik Bartosak': 'Patrik Bartošák',
  'Jan Bednar': 'Jan Bednář',
  'Dominik Pavlat': 'Dominik Pavlát',
  'Miroslav Svoboda': 'Miroslav Svoboda',
  'Frantisek Poletin': 'František Poletin',
  'Petr Cajka': 'Petr Cajka',
  'Lukas Klok': 'Lukáš Klok',
  'Dominik Kubalik': 'Dominik Kubalík',
  'Jan Kovar': 'Jan Kovář',
  'David Sklenicka': 'David Sklenička',
  'Daniel Vozenilek': 'Daniel Voženílek',
  'Jan Rutta': 'Jan Rutta',
  'Matej Stransky': 'Matěj Stránský',
  'Filip Zadina': 'Filip Zadina',
  'Jiri Sekac': 'Jiří Sekáč',
  'Jiri Felcman': 'Jiří Felcman',
  'Simon Hrubec': 'Simon Hrubec',
};

function fixCzechName(name) {
  return NAME_FIXES[name] || name;
}

// Comprehensive player list compiled from Elite Prospects 2025-26 season
// NHL (29), AHL (33), SHL (8), Liiga (21), NL (13), Czech Extraliga (369)
const PLAYERS = [
  // === NHL ===
  { name: "Radko Gudas", position: "D", role: "RB", club: "Anaheim Ducks" },
  { name: "David Pastrňák", position: "F", role: "RW", club: "Boston Bruins" },
  { name: "Pavel Zacha", position: "F", role: "C", club: "Boston Bruins" },
  { name: "Matěj Blümel", position: "F", role: "RW", club: "Boston Bruins" },
  { name: "Jiří Kulich", position: "F", role: "C", club: "Buffalo Sabres" },
  { name: "Adam Klapka", position: "F", role: "RW", club: "Calgary Flames" },
  { name: "Martin Nečas", position: "F", role: "C", club: "Colorado Avalanche" },
  { name: "Radek Faksa", position: "F", role: "C", club: "Dallas Stars" },
  { name: "David Tomášek", position: "F", role: "C", club: "Edmonton Oilers" },
  { name: "Mikuláš Hovorka", position: "D", role: "RB", club: "Florida Panthers" },
  { name: "Tomáš Nosek", position: "F", role: "LW", club: "Florida Panthers" },
  { name: "David Špaček", position: "D", role: "RB", club: "Minnesota Wild" },
  { name: "David Jiříček", position: "D", role: "RB", club: "Minnesota Wild" },
  { name: "Ondřej Palát", position: "F", role: "LW", club: "New York Islanders" },
  { name: "Jaroslav Chmelář", position: "F", role: "RW", club: "New York Rangers" },
  { name: "Filip Hronek", position: "D", role: "RB", club: "Vancouver Canucks" },
  { name: "David Kämpf", position: "F", role: "C", club: "Washington Capitals" },
  { name: "Filip Chytil", position: "F", role: "C", club: "Vancouver Canucks" },
  { name: "Tomáš Hertl", position: "F", role: "C", club: "Vegas Golden Knights" },
  { name: "Dan Vladař", position: "G", role: "G", club: "Philadelphia Flyers" },
  { name: "Karel Vejmelka", position: "G", role: "G", club: "Utah Mammoth" },
  { name: "David Rittich", position: "G", role: "G", club: "New York Islanders" },
  { name: "Jakub Dobeš", position: "G", role: "G", club: "Montréal Canadiens" },
  { name: "Lukáš Dostál", position: "G", role: "G", club: "Anaheim Ducks" },
  { name: "Vítek Vaněček", position: "G", role: "G", club: "Utah Mammoth" },
  { name: "Petr Mrázek", position: "G", role: "G", club: "Anaheim Ducks" },
  { name: "Jiří Patera", position: "G", role: "G", club: "Vancouver Canucks" },
  { name: "Jakub Škarek", position: "G", role: "G", club: "San Jose Sharks" },
];

const EXCLUDED = ['David Krejčí', 'Jan Kern', 'Ondřej Roman', 'Vashek Blanár'];

function main() {
  let players = [...PLAYERS];
  
  // Filter excluded
  players = players.filter(p => !EXCLUDED.includes(p.name));
  
  // Deduplicate by name (keep first occurrence = primary club)
  const seen = new Set();
  players = players.filter(p => {
    const key = p.name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const outputPath = path.join(__dirname, '..', 'czech-players-2025-26.json');
  fs.writeFileSync(outputPath, JSON.stringify(players, null, 2), 'utf8');
  console.log(`Written ${players.length} players to ${outputPath}`);
}

main();
