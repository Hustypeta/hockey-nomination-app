/** Sdílené typy admin fantasy — bez Prisma (bezpečné pro client komponenty). */

export type FantasyAdminStatInput = {
  rosterPlayerId: string;
  goals?: number;
  assists?: number;
  plusMinus?: number;
  wins?: number;
  goalsAgainst?: number;
  shutouts?: number;
};

export type FantasyAdminPickedPlayer = {
  rosterPlayerId: string;
  code: string;
  name: string;
  team: string;
  position: string;
  tier: string;
  pickCount: number;
  goals: number;
  assists: number;
  plusMinus: number;
  wins: number;
  goalsAgainst: number;
  shutouts: number;
  fantasyPoints: number;
};

export type FantasyAdminLineupResult = {
  lineupId: string;
  userId: string;
  displayName: string;
  points: number;
  salarySpent: number;
  breakdown: Array<{
    rosterPlayerId: string;
    name: string;
    position: string;
    points: number;
  }>;
};
