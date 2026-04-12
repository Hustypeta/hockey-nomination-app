export type BracketMatchPick = {
  teamLeft: string | null;
  teamRight: string | null;
  winner: string | null;
};

export type BracketBonusPicks = {
  mvp: string;
  topCzechScorer: string;
  pointsLeader: string;
  czechQuarterFinals: string;
  finalTotalGoals: string;
};

export type BracketPickemPayload = {
  v: 1;
  groupAWinner: string | null;
  groupBWinner: string | null;
  quarterfinals: BracketMatchPick[];
  semifinals: BracketMatchPick[];
  final: BracketMatchPick;
  bronze: BracketMatchPick;
  bonus: BracketBonusPicks;
};

export const EMPTY_BRACKET_PICKEM: BracketPickemPayload = {
  v: 1,
  groupAWinner: null,
  groupBWinner: null,
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
    mvp: "",
    topCzechScorer: "",
    pointsLeader: "",
    czechQuarterFinals: "",
    finalTotalGoals: "",
  },
};
