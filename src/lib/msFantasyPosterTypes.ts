/** Data pro IG plakát fantasy sestavy (client-safe). */

export type FantasyPosterPick = {
  id: string;
  code: string;
  name: string;
  team: string;
  position: string;
  salary: number;
  goals: number;
  assists: number;
  plusMinus: number;
  wins: number;
  goalsAgainst: number;
  shutouts: number;
  fantasyPoints: number;
};

export type FantasyLineupPosterPayload = {
  resultId: string;
  lineupId: string;
  gameDayTitle: string;
  gameDaySlug: string;
  points: number;
  salarySpent: number;
  salaryCap: number;
  suggestedDisplayName: string;
  picks: FantasyPosterPick[];
};
