export type BracketMatchPick = {
  teamLeft: string | null;
  teamRight: string | null;
  winner: string | null;
};

export type BracketBonusPicks = {
  /** Nejlepší český střelec (CZ hráč) — ID hráče z kandidátů. */
  topCzechGoalScorerId: string;
  /** Nejlepší český hráč v bodování (CZ hráč) — ID hráče z kandidátů. */
  topCzechPointsLeaderId: string;
  /** Nejtrestanější český hráč (PIM) (CZ hráč) — ID hráče z kandidátů. */
  mostPenalizedCzechPlayerId: string;
  /** Počet gólů českého týmu (číslo jako string kvůli jednoduchému payloadu). */
  czechTeamGoals: string;
  /** Počet trestných minut českého týmu (číslo jako string). */
  czechTeamPim: string;
};

export type BracketPickemPayload = {
  v: 3;
  /** Pořadí týmů ve skupině A (1 → 8). */
  groupAOrder: string[];
  /** Pořadí týmů ve skupině B (1 → 8). */
  groupBOrder: string[];
  quarterfinals: BracketMatchPick[];
  semifinals: BracketMatchPick[];
  final: BracketMatchPick;
  bronze: BracketMatchPick;
  bonus: BracketBonusPicks;
};

export const EMPTY_BRACKET_PICKEM: BracketPickemPayload = {
  v: 3,
  groupAOrder: [],
  groupBOrder: [],
  quarterfinals: [
    { teamLeft: null, teamRight: null, winner: null },
    { teamLeft: null, teamRight: null, winner: null },
    { teamLeft: null, teamRight: null, winner: null },
    { teamLeft: null, teamRight: null, winner: null },
  ],
  semifinals: [
    { teamLeft: null, teamRight: null, winner: null },
    { teamLeft: null, teamRight: null, winner: null },
  ],
  final: { teamLeft: null, teamRight: null, winner: null },
  bronze: { teamLeft: null, teamRight: null, winner: null },
  bonus: {
    topCzechGoalScorerId: "",
    topCzechPointsLeaderId: "",
    mostPenalizedCzechPlayerId: "",
    czechTeamGoals: "",
    czechTeamPim: "",
  },
};
