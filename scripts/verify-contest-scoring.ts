import assert from "node:assert/strict";
import { scoreNominationAgainstOfficial } from "../src/lib/contestScoring";
import type { LineupStructure } from "../src/types";

function buildCompleteLineup(ids: string[]): LineupStructure {
  assert.equal(ids.length, 25, "need exactly 25 ids (14F + 8D + 3G)");

  const [
    // 14 forwards
    f1,
    f2,
    f3,
    f4,
    f5,
    f6,
    f7,
    f8,
    f9,
    f10,
    f11,
    f12,
    f13,
    f14,
    // 8 defensemen
    d1,
    d2,
    d3,
    d4,
    d5,
    d6,
    d7,
    d8,
    // 3 goalies
    g1,
    g2,
    g3,
  ] = ids;

  return {
    forwardLines: [
      { lw: f1, c: f2, rw: f3, x: null },
      { lw: f4, c: f5, rw: f6, x: null },
      { lw: f7, c: f8, rw: f9, x: null },
      { lw: f10, c: f11, rw: f12, x: f13 },
    ],
    defensePairs: [
      { lb: d1, rb: d2 },
      { lb: d3, rb: d4 },
      { lb: d5, rb: d6 },
      { lb: d7, rb: null }, // 7. bek je vždy jen LB
    ],
    goalies: [g1, g2, g3],
    extraForwards: [f14],
    extraDefensemen: [d8],
    assistantIds: [],
  };
}

function clone<T>(x: T): T {
  return JSON.parse(JSON.stringify(x)) as T;
}

function replaceSlot(
  lineup: LineupStructure,
  slotKey:
    | "f0-lw"
    | "f0-c"
    | "f0-rw"
    | "f1-lw"
    | "f1-c"
    | "f1-rw"
    | "f2-lw"
    | "f2-c"
    | "f2-rw"
    | "f3-lw"
    | "f3-c"
    | "f3-rw"
    | "f3-x"
    | "xf0"
    | "d0-lb"
    | "d0-rb"
    | "d1-lb"
    | "d1-rb"
    | "d2-lb"
    | "d2-rb"
    | "d3-lb"
    | "xd0"
    | "g0"
    | "g1"
    | "g2",
  playerId: string
): void {
  const m = slotKey.match(/^f(\d)-(lw|c|rw|x)$/);
  if (m) {
    const i = Number(m[1]);
    const pos = m[2] as "lw" | "c" | "rw" | "x";
    lineup.forwardLines[i] = { ...lineup.forwardLines[i], [pos]: playerId } as LineupStructure["forwardLines"][number];
    return;
  }
  const d = slotKey.match(/^d(\d)-(lb|rb)$/);
  if (d) {
    const i = Number(d[1]);
    const side = d[2] as "lb" | "rb";
    lineup.defensePairs[i] = { ...lineup.defensePairs[i], [side]: playerId };
    return;
  }
  const g = slotKey.match(/^g(\d)$/);
  if (g) {
    const i = Number(g[1]);
    lineup.goalies[i] = playerId;
    return;
  }
  if (slotKey === "xf0") {
    lineup.extraForwards = [playerId];
    return;
  }
  if (slotKey === "xd0") {
    lineup.extraDefensemen = [playerId];
    return;
  }
  throw new Error(`unknown slotKey: ${slotKey}`);
}

function swapTwoPlayersInLineup(
  base: LineupStructure,
  a: { slot: Parameters<typeof replaceSlot>[1]; id: string },
  b: { slot: Parameters<typeof replaceSlot>[1]; id: string }
): LineupStructure {
  const next = clone(base);
  replaceSlot(next, a.slot, b.id);
  replaceSlot(next, b.slot, a.id);
  return next;
}

function run() {
  const ids = Array.from({ length: 25 }, (_, i) => `p${i + 1}`);
  const official = buildCompleteLineup(ids);

  // Case 1: exact lineup match, including leadership + time bonus rounding.
  {
    const officialWithAsst = clone(official);
    officialWithAsst.assistantIds = ["p20", "p21"];

    const user = clone(official);
    user.assistantIds = ["p20", "p21"];

    const res = scoreNominationAgainstOfficial(
      user,
      officialWithAsst,
      "p19",
      "p19",
      10
    );
    // 25 slots * 5 = 125
    assert.equal(res.basePlayerPoints, 125);
    // 125 * 1.10 = 137.5 -> round = 138
    assert.equal(res.playerPointsAfterTimeBonus, 138);
    assert.equal(res.captainBonus, 10);
    assert.equal(res.assistantBonus, 8);
    assert.equal(res.totalPoints, 156);
  }

  // Case 2: same-category match (F/D/G) should be 2 points, not 5.
  // We swap 2 forwards (different slots), 2 defensemen, 2 goalies.
  {
    const user1 = swapTwoPlayersInLineup(official, { slot: "f0-lw", id: "p1" }, { slot: "f1-lw", id: "p4" });
    const user2 = swapTwoPlayersInLineup(user1, { slot: "d0-lb", id: "p15" }, { slot: "d1-lb", id: "p17" });
    const user = swapTwoPlayersInLineup(user2, { slot: "g0", id: "p23" }, { slot: "g1", id: "p24" });

    const res = scoreNominationAgainstOfficial(user, official, null, null, 0);
    // 6 swapped players: each would have been 5, becomes 2 => -3 per player
    assert.equal(res.basePlayerPoints, 125 - 6 * 3);
    assert.equal(res.totalPoints, res.basePlayerPoints);
  }

  // Case 3: captain bonus is independent of time bonus.
  {
    const user = clone(official);
    const res0 = scoreNominationAgainstOfficial(user, official, "p2", "p2", 0);
    const res40 = scoreNominationAgainstOfficial(user, official, "p2", "p2", 40);
    assert.equal(res0.captainBonus, 10);
    assert.equal(res40.captainBonus, 10);
    // player points differ, captain same
    assert.notEqual(res0.totalPoints, res40.totalPoints);
    assert.equal(res40.totalPoints - res0.totalPoints, res40.playerPointsAfterTimeBonus - res0.playerPointsAfterTimeBonus);
  }

  // Case 4: assistants - unique matches only, max 2, 4 points each.
  {
    const officialWithAsst = clone(official);
    officialWithAsst.assistantIds = ["p3", "p4"];

    const user = clone(official);
    // duplicates + extra match -> should still count max 2 unique matches
    user.assistantIds = ["p3", "p3", "p4", "p5"];

    const res = scoreNominationAgainstOfficial(user, officialWithAsst, null, null, 0);
    assert.equal(res.assistantBonus, 8);
  }

  // Case 5: negative time bonus should be clamped to 0.
  {
    const user = clone(official);
    const res = scoreNominationAgainstOfficial(user, official, null, null, -999);
    assert.equal(res.timeBonusPercent, 0);
    assert.equal(res.playerPointsAfterTimeBonus, 125);
  }

  console.log("OK: contest scoring rules verified.");
}

run();

