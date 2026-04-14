/**
 * Merge Czech players from all leagues into final JSON.
 * Excludes: David Krejčí (retired), Jan Kern, Ondřej Roman (Czechia2), Vashek Blanár (Slovak), Vasyl Spilka (Ukrainian)
 */

const fs = require('fs');
const path = require('path');

// Vyřazení: důchodce (Krejčí), 2. liga (Kern, Roman), cizinci (Blanár, Spilka)
const EXCLUDED = ['David Krejčí', 'David Krejci', 'Jan Kern', 'Ondřej Roman', 'Ondrej Roman', 'Vashek Blanár', 'Vashek Blanar', 'Vasyl Spilka'];

// Other leagues data (NHL, AHL, SHL, Liiga, NL) - from EP stats pages
const OTHER_LEAGUES = [
  { name: "Radko Gudas", position: "D", role: "RB", club: "Anaheim Ducks" },
  { name: "David Pastrňák", position: "F", role: "RW", club: "Boston Bruins" },
  { name: "Pavel Zacha", position: "F", role: "C", club: "Boston Bruins" },
  { name: "Matěj Blümel", position: "F", role: "RW", club: "Providence Bruins" },
  { name: "Jiří Kulich", position: "F", role: "C", club: "Buffalo Sabres" },
  { name: "Adam Klapka", position: "F", role: "RW", club: "Calgary Flames" },
  { name: "Martin Nečas", position: "F", role: "RW", club: "Colorado Avalanche" },
  { name: "Radek Faksa", position: "F", role: "C", club: "Dallas Stars" },
  { name: "David Tomášek", position: "F", role: "C", club: "Färjestad BK" },
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
  { name: "Jiří Patera", position: "G", role: "G", club: "Abbotsford Canucks" },
  { name: "Jakub Škarek", position: "G", role: "G", club: "San Jose Barracuda" },
  { name: "Jan Jeník", position: "F", role: "RW", club: "Belleville Senators" },
  { name: "Tomáš Hamara", position: "D", role: "LB", club: "Belleville Senators" },
  { name: "Andrej Šustr", position: "D", role: "RB", club: "Bridgeport Islanders" },
  { name: "Martin Frk", position: "F", role: "RW", club: "Calgary Wranglers" },
  { name: "Marek Alscher", position: "D", role: "LB", club: "Charlotte Checkers" },
  { name: "Dominik Badinka", position: "D", role: "RB", club: "Chicago Wolves" },
  { name: "Stanislav Svozil", position: "D", role: "LB", club: "Cleveland Monsters" },
  { name: "Eduard Šalé", position: "F", role: "RW", club: "Coachella Valley Firebirds" },
  { name: "Ondřej Bečher", position: "F", role: "C", club: "Grand Rapids Griffins" },
  { name: "Jakub Rychlovský", position: "F", role: "LW", club: "Grand Rapids Griffins" },
  { name: "Matyáš Sapovaliv", position: "F", role: "C", club: "Henderson Silver Knights" },
  { name: "Jakub Brabenec", position: "F", role: "C", club: "Henderson Silver Knights" },
  { name: "Radim Mrtka", position: "D", role: "RB", club: "Rochester Americans" },
  { name: "Jan Myšák", position: "F", role: "C", club: "San Diego Gulls" },
  { name: "Jakub Stancl", position: "F", role: "LW", club: "Springfield Thunderbirds" },
  { name: "Gabriel Szturc", position: "F", role: "C", club: "Syracuse Crunch" },
  { name: "Michal Kunc", position: "F", role: "LW", club: "Tucson Roadrunners" },
  { name: "Matyáš Melovský", position: "F", role: "C", club: "Utica Comets" },
  { name: "Michal Postava", position: "G", role: "G", club: "Grand Rapids Griffins" },
  { name: "Šimon Zajíček", position: "G", role: "G", club: "Providence Bruins" },
  { name: "Jakub Málek", position: "G", role: "G", club: "Utica Comets" },
  { name: "Tomáš Suchánek", position: "G", role: "G", club: "San Diego Gulls" },
  { name: "Michal Kempný", position: "D", role: "LB", club: "Brynäs IF" },
  { name: "Radim Zohorna", position: "F", role: "C", club: "Färjestad BK" },
  { name: "Ronald Knot", position: "D", role: "RB", club: "HC Sparta Praha" },
  { name: "Lukáš Rousek", position: "F", role: "C", club: "HV71" },
  { name: "Jakub Vrána", position: "F", role: "LW", club: "Linköping HC" },
  { name: "Robin Hanzl", position: "F", role: "C", club: "Malmö Redhawks" },
  { name: "Ľubos Horký", position: "F", role: "RW", club: "Rögle BK" },
  { name: "Marek Langhamer", position: "G", role: "G", club: "Malmö Redhawks" },
  { name: "Petr Kodýtek", position: "F", role: "C", club: "HC Ambrì-Piotta" },
  { name: "Lukáš Jašek", position: "F", role: "C", club: "Ilves" },
  { name: "Radek Kučerík", position: "D", role: "RB", club: "Ilves" },
  { name: "Ondřej Koš", position: "F", role: "LW", club: "Ilves" },
  { name: "Jakub Frolo", position: "F", role: "C", club: "Ilves" },
  { name: "Lukáš Káňák", position: "D", role: "LB", club: "KalPa" },
  { name: "Radek Kobližek", position: "F", role: "RW", club: "KooKoo" },
  { name: "Tomáš Mazura", position: "F", role: "C", club: "KooKoo" },
  { name: "Matyáš Kantner", position: "F", role: "LW", club: "Kärpät" },
  { name: "Jiří Ticháček", position: "D", role: "RB", club: "Kärpät" },
  { name: "Samuel Jung", position: "F", role: "RW", club: "Kärpät" },
  { name: "Petr Věchet", position: "F", role: "C", club: "Lukko" },
  { name: "Michal Jordán", position: "D", role: "RB", club: "Pelicans" },
  { name: "Ondřej Trejbal", position: "D", role: "LB", club: "SaiPa" },
  { name: "Richard Zemlička", position: "F", role: "C", club: "SaiPa" },
  { name: "Ondřej Pavel", position: "F", role: "C", club: "Tappara" },
  { name: "Patrik Bartošák", position: "G", role: "G", club: "Pelicans" },
  { name: "Jan Bednář", position: "G", role: "G", club: "Ässät" },
  { name: "Dominik Pavlát", position: "G", role: "G", club: "Ilves" },
  { name: "Miroslav Svoboda", position: "G", role: "G", club: "Sport" },
  { name: "Petr Cajka", position: "F", role: "C", club: "EHC Biel-Bienne" },
  { name: "Lukáš Klok", position: "D", role: "LB", club: "EHC Kloten" },
  { name: "Dominik Kubalík", position: "F", role: "LW", club: "EV Zug" },
  { name: "Jan Kovář", position: "F", role: "C", club: "EV Zug" },
  { name: "David Sklenička", position: "D", role: "RB", club: "EV Zug" },
  { name: "Daniel Voženílek", position: "F", role: "RW", club: "EV Zug" },
  { name: "Jan Rutta", position: "D", role: "RB", club: "Genève-Servette HC" },
  { name: "Matěj Stránský", position: "F", role: "RW", club: "HC Davos" },
  { name: "Filip Zadina", position: "F", role: "RW", club: "HC Davos" },
  { name: "Dominik Binias", position: "F", role: "C", club: "HC Fribourg-Gottéron" },
  { name: "Jiří Sekáč", position: "F", role: "LW", club: "HC Lugano" },
  { name: "Jiří Felcman", position: "F", role: "C", club: "SCL Tigers" },
  { name: "Simon Hrubec", position: "G", role: "G", club: "ZSC Lions" },
  // DEL (německá liga)
  { name: "Kristian Reichel", position: "F", role: "C", club: "Adler Mannheim" },
];

function isExcluded(name) {
  const n = name.toLowerCase().replace(/[ěřščžýáíéúů]/g, c => ({'ě':'e','ř':'r','š':'s','č':'c','ž':'z','ý':'y','á':'a','í':'i','é':'e','ú':'u','ů':'u'}[c]||c));
  return EXCLUDED.some(e => n.includes(e.toLowerCase().replace(/[^a-z]/g, '')));
}

function main() {
  const extraligaPath = path.join(__dirname, '..', 'czech-extraliga-players.json');
  const extraliga = JSON.parse(fs.readFileSync(extraligaPath, 'utf8'));
  
  // Extraliga goalies to add (not in skater table)
  const extraligaGoalies = [
    { name: "Vojtěch Mokrý", position: "G", role: "G", club: "BK Mladá Boleslav" },
    { name: "Adam Brízgala", position: "G", role: "G", club: "Rytíři Kladno" },
    { name: "Nick Malik", position: "G", role: "G", club: "HC Škoda Plzeň" },
    { name: "Petr Kváča", position: "G", role: "G", club: "Bílí Tygři Liberec" },
    { name: "Marek Mazanec", position: "G", role: "G", club: "HC Oceláři Třinec" },
    { name: "Dominik Frodl", position: "G", role: "G", club: "HC Energie Karlovy Vary" },
    { name: "Jakub Kovář", position: "G", role: "G", club: "HC Sparta Praha" },
    { name: "Matěj Machovský", position: "G", role: "G", club: "HC Olomouc" },
    { name: "Dominik Hrachovina", position: "G", role: "G", club: "HC Vítkovice" },
    { name: "Roman Will", position: "G", role: "G", club: "HC Dynamo Pardubice" },
    { name: "Aleš Stezka", position: "G", role: "G", club: "HC Kometa Brno" },
    { name: "Milan Klouček", position: "G", role: "G", club: "HC Motor České Budějovice" },
    { name: "Jan Strmeň", position: "G", role: "G", club: "HC Motor České Budějovice" },
    { name: "Pavel Čajan", position: "G", role: "G", club: "HC Verva Litvínov" },
    { name: "Josef Kořenář", position: "G", role: "G", club: "HC Sparta Praha" },
    { name: "Dominik Furch", position: "G", role: "G", club: "BK Mladá Boleslav" },
  ];

  let all = [...OTHER_LEAGUES];
  
  // Add Extraliga - filter excluded, avoid duplicates with other leagues
  const otherNames = new Set(OTHER_LEAGUES.map(p => p.name.toLowerCase()));
  // Kluby 2. ligy (Czechia2) – vyřadit
  const EXCLUDED_CLUBS = new Set([
    'AZ Havířov', 'Draci Šumperk', 'HC Bobři Valašské Meziříčí', 'HC ISMM Kopřivnice',
    'HC LERAM Orli Znojmo', 'HC Slezan Opava', 'HC Spartak Uherský Brod', 'HHK Velké Meziříčí',
    'HK Kroměříž', 'HK Nový Jičín', 'LHK Jestřábi Prostějov', 'SHKM Baník Hodonín',
    'SKLH Žďár nad Sázavou', 'Technika Hockey Brno', 'BK Havlíčkův Brod', 'HC Benátky nad Jizerou',
    'HC Děčín', 'HC Kobra Praha', 'HC Milevsko 1934', 'HC Příbram', 'HC Stadion Cheb',
    'HC Stadion Vrchlabí', 'HC Wikov Hronov', 'HK Kralupy nad Vltavou', 'HC Slovan Ústí nad Labem',
    'IHC Králové Písek', 'Mostečtí lvi', 'SK Kadaň'
  ]);

  for (const p of extraliga) {
    if (isExcluded(p.name)) continue;
    if (EXCLUDED_CLUBS.has(p.club)) continue; // 2. liga
    if (p.name === 'Vasyl Spilka') continue; // Ukrainian
    if (!otherNames.has(p.name.toLowerCase())) {
      all.push(p);
      otherNames.add(p.name.toLowerCase());
    }
  }
  
  // Add Extraliga goalies not already in list
  for (const g of extraligaGoalies) {
    if (!otherNames.has(g.name.toLowerCase())) all.push(g);
  }

  const outPath = path.join(__dirname, '..', 'czech-players-2025-26.json');
  fs.writeFileSync(outPath, JSON.stringify(all, null, 2), 'utf8');
  console.log(`Written ${all.length} Czech players to ${outPath}`);
  console.log('Tip: doplnit pole league: npm run inject:league');
}

main();
