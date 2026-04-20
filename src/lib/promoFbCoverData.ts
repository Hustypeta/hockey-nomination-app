import type { LineupStructure, Player } from "@/types";
import { normalizeLineupStructure } from "@/lib/lineupUtils";

/** Statické demo hráče pro promo grafiku — konzistentní s plakáty i mini editorem. */
export const PROMO_FB_PLAYERS: Player[] = [
  { id: "fb-p01", name: "Vězenka Stanislav", position: "G", club: "Promo", league: "—", jerseyNumber: 1 },
  { id: "fb-p02", name: "Hrádek Dominik", position: "G", club: "Promo", league: "—", jerseyNumber: 70 },
  { id: "fb-p03", name: "Šimek Daniel", position: "G", club: "Promo", league: "—", jerseyNumber: 33 },
  { id: "fb-p04", name: "Černoch Roman", position: "F", club: "Promo", league: "—", jerseyNumber: 88, role: "LW" },
  { id: "fb-p05", name: "Nečas Martin", position: "F", club: "Promo", league: "—", jerseyNumber: 93, role: "C" },
  { id: "fb-p06", name: "Bednář Dominik", position: "F", club: "Promo", league: "—", jerseyNumber: 16, role: "RW" },
  { id: "fb-p07", name: "Říčka Jakub", position: "F", club: "Promo", league: "—", jerseyNumber: 27, role: "LW" },
  { id: "fb-p08", name: "Pastřík Daniel", position: "F", club: "Promo", league: "—", jerseyNumber: 91, role: "C" },
  { id: "fb-p09", name: "Rutta Jan", position: "F", club: "Promo", league: "—", jerseyNumber: 44, role: "RW" },
  { id: "fb-p10", name: "Chytil Filip", position: "F", club: "Promo", league: "—", jerseyNumber: 72, role: "LW" },
  { id: "fb-p11", name: "Kämpf David", position: "F", club: "Promo", league: "—", jerseyNumber: 64, role: "C" },
  { id: "fb-p12", name: "Zadina Filip", position: "F", club: "Promo", league: "—", jerseyNumber: 18, role: "RW" },
  { id: "fb-p13", name: "Špaček Michael", position: "F", club: "Promo", league: "—", jerseyNumber: 21, role: "LW" },
  { id: "fb-p14", name: "Šustr Jonáš", position: "F", club: "Promo", league: "—", jerseyNumber: 45, role: "C" },
  { id: "fb-p15", name: "Beránek Tomáš", position: "F", club: "Promo", league: "—", jerseyNumber: 39, role: "RW" },
  { id: "fb-p16", name: "Nestrašil Andrej", position: "F", club: "Promo", league: "—", jerseyNumber: 15, role: "LW" },
  { id: "fb-p17", name: "Morčák Tomáš", position: "D", club: "Promo", league: "—", jerseyNumber: 82, role: "LB" },
  { id: "fb-p18", name: "Nečas Radim", position: "D", club: "Promo", league: "—", jerseyNumber: 22, role: "RB" },
  { id: "fb-p19", name: "Sklenička Libor", position: "D", club: "Promo", league: "—", jerseyNumber: 37, role: "LB" },
  { id: "fb-p20", name: "Doudera Libor", position: "D", club: "Promo", league: "—", jerseyNumber: 6, role: "RB" },
  { id: "fb-p21", name: "Kempný Michal", position: "D", club: "Promo", league: "—", jerseyNumber: 25, role: "LB" },
  { id: "fb-p22", name: "Černák Erik", position: "D", club: "Promo", league: "—", jerseyNumber: 81, role: "RB" },
  { id: "fb-p23", name: "Košťálek Michal", position: "D", club: "Promo", league: "—", jerseyNumber: 74, role: "LB" },
  { id: "fb-p24", name: "Vrána Jakub", position: "F", club: "Promo", league: "—", jerseyNumber: 13, role: "LW" },
  { id: "fb-p25", name: "Zámorský Peter", position: "D", club: "Promo", league: "—", jerseyNumber: 51, role: "LB" },
];

const RAW_LINEUP: LineupStructure = {
  goalies: ["fb-p01", "fb-p02", "fb-p03"],
  forwardLines: [
    { lw: "fb-p04", c: "fb-p05", rw: "fb-p06", x: null },
    { lw: "fb-p07", c: "fb-p08", rw: "fb-p09", x: null },
    { lw: "fb-p10", c: "fb-p11", rw: "fb-p12", x: null },
    { lw: "fb-p13", c: "fb-p14", rw: "fb-p15", x: "fb-p16" },
  ],
  defensePairs: [
    { lb: "fb-p17", rb: "fb-p18" },
    { lb: "fb-p19", rb: "fb-p20" },
    { lb: "fb-p21", rb: "fb-p22" },
    { lb: "fb-p23", rb: null },
  ],
  extraForwards: ["fb-p24"],
  extraDefensemen: ["fb-p25"],
  assistantIds: ["fb-p07", "fb-p09"],
};

export const PROMO_FB_LINEUP = normalizeLineupStructure(RAW_LINEUP);

export const PROMO_FB_CAPTAIN_ID = "fb-p05";

export const PROMO_FB_TITLE = "Moje nominace MS 2026";
