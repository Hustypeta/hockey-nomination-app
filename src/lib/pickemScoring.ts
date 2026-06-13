import type { BracketPickemPayload } from "@/types/bracketPickem";

export const PICKEM_MAX_POINTS = 86;

const GROUP_POSITION_POINTS = 2;
const QF_POINTS = 3;
const SF_POINTS = 4;
const FINAL_POINTS = 6;
const BRONZE_POINTS = 3;
const BONUS_ITEM_POINTS = 5;

export type PickemKnockoutBreakdownItem = {
  index: number;
  label: string;
  points: number;
  correct: boolean;
  userWinner: string | null;
  officialWinner: string | null;
};

export type PickemBonusBreakdownItem = {
  key: keyof BracketPickemPayload["bonus"];
  label: string;
  points: number;
  correct: boolean;
  userValue: string;
  officialValue: string;
};

export type PickemScoreBreakdown = {
  groupA: { points: number; max: number; correctPositions: number };
  groupB: { points: number; max: number; correctPositions: number };
  quarterfinals: PickemKnockoutBreakdownItem[];
  semifinals: PickemKnockoutBreakdownItem[];
  final: PickemKnockoutBreakdownItem;
  bronze: PickemKnockoutBreakdownItem;
  bonus: { points: number; max: number; items: PickemBonusBreakdownItem[] };
  totalPoints: number;
  maxPoints: number;
};

const QF_LABELS = [
  "Čtvrtfinále 1",
  "Čtvrtfinále 2",
  "Čtvrtfinále 3",
  "Čtvrtfinále 4",
] as const;

const SF_LABELS = ["Semifinále 1", "Semifinále 2"] as const;

const BONUS_LABELS: Record<keyof BracketPickemPayload["bonus"], string> = {
  topCzechGoalScorerId: "Nejlepší český střelec",
  topCzechPointsLeaderId: "Nejlepší český hráč v bodování",
  mostPenalizedCzechPlayerId: "Nejtrestanější český hráč",
  czechTeamGoals: "Góly českého týmu",
  czechTeamPim: "Trestné minuty českého týmu",
};

function scoreGroupOrder(userOrder: string[], officialOrder: string[]) {
  let correctPositions = 0;
  const len = Math.min(userOrder.length, officialOrder.length);
  for (let i = 0; i < len; i++) {
    if (userOrder[i] === officialOrder[i]) correctPositions++;
  }
  return {
    points: correctPositions * GROUP_POSITION_POINTS,
    max: officialOrder.length * GROUP_POSITION_POINTS,
    correctPositions,
  };
}

function scoreKnockoutMatch(
  userWinner: string | null,
  officialWinner: string | null,
  pointsPerMatch: number,
): { points: number; correct: boolean } {
  const correct = Boolean(userWinner && officialWinner && userWinner === officialWinner);
  return { points: correct ? pointsPerMatch : 0, correct };
}

function normBonusValue(v: string): string {
  return v.trim();
}

/** Bodování dle pravidel P3 — porovnání tipu uživatele s oficiálním payloadem. */
export function scorePickemAgainstOfficial(
  user: BracketPickemPayload,
  official: BracketPickemPayload,
): PickemScoreBreakdown {
  const groupA = scoreGroupOrder(user.groupAOrder, official.groupAOrder);
  const groupB = scoreGroupOrder(user.groupBOrder, official.groupBOrder);

  const quarterfinals = user.quarterfinals.map((m, i) => {
    const off = official.quarterfinals[i];
    const scored = scoreKnockoutMatch(m.winner, off?.winner ?? null, QF_POINTS);
    return {
      index: i,
      label: QF_LABELS[i] ?? `Čtvrtfinále ${i + 1}`,
      points: scored.points,
      correct: scored.correct,
      userWinner: m.winner,
      officialWinner: off?.winner ?? null,
    };
  });

  const semifinals = user.semifinals.map((m, i) => {
    const off = official.semifinals[i];
    const scored = scoreKnockoutMatch(m.winner, off?.winner ?? null, SF_POINTS);
    return {
      index: i,
      label: SF_LABELS[i] ?? `Semifinále ${i + 1}`,
      points: scored.points,
      correct: scored.correct,
      userWinner: m.winner,
      officialWinner: off?.winner ?? null,
    };
  });

  const finalScored = scoreKnockoutMatch(user.final.winner, official.final.winner, FINAL_POINTS);
  const final: PickemKnockoutBreakdownItem = {
    index: 0,
    label: "Finále",
    points: finalScored.points,
    correct: finalScored.correct,
    userWinner: user.final.winner,
    officialWinner: official.final.winner,
  };

  const bronzeScored = scoreKnockoutMatch(user.bronze.winner, official.bronze.winner, BRONZE_POINTS);
  const bronze: PickemKnockoutBreakdownItem = {
    index: 0,
    label: "Bronz",
    points: bronzeScored.points,
    correct: bronzeScored.correct,
    userWinner: user.bronze.winner,
    officialWinner: official.bronze.winner,
  };

  const bonusKeys = Object.keys(BONUS_LABELS) as (keyof BracketPickemPayload["bonus"])[];
  const bonusItems: PickemBonusBreakdownItem[] = bonusKeys.map((key) => {
    const userValue = normBonusValue(user.bonus[key]);
    const officialValue = normBonusValue(official.bonus[key]);
    const correct = Boolean(userValue && officialValue && userValue === officialValue);
    return {
      key,
      label: BONUS_LABELS[key],
      points: correct ? BONUS_ITEM_POINTS : 0,
      correct,
      userValue,
      officialValue,
    };
  });

  const bonusPoints = bonusItems.reduce((s, i) => s + i.points, 0);
  const totalPoints =
    groupA.points +
    groupB.points +
    quarterfinals.reduce((s, m) => s + m.points, 0) +
    semifinals.reduce((s, m) => s + m.points, 0) +
    final.points +
    bronze.points +
    bonusPoints;

  return {
    groupA,
    groupB,
    quarterfinals,
    semifinals,
    final,
    bronze,
    bonus: {
      points: bonusPoints,
      max: bonusKeys.length * BONUS_ITEM_POINTS,
      items: bonusItems,
    },
    totalPoints,
    maxPoints: PICKEM_MAX_POINTS,
  };
}
