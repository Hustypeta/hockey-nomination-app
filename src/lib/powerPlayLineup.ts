import type { LineupStructure, PowerPlayRole, PowerPlayUnit } from "@/types";

/** Dočasně vypnuto — editor a export na stránce zápasové sestavy. */
export const POWER_PLAY_UI_ENABLED = false;

export const POWER_PLAY_UNIT_LABELS = ["1. pětka", "2. pětka"] as const;

export const POWER_PLAY_ROLE_LABELS: Record<PowerPlayRole, string> = {
  point: "Modrá",
  left: "Vlevo",
  bumper: "Mezi kruhy",
  right: "Vpravo",
  netFront: "Před brankou",
};

export const EMPTY_POWER_PLAY_UNIT: PowerPlayUnit = {
  point: null,
  left: null,
  bumper: null,
  right: null,
  netFront: null,
};

export function emptyPowerPlayLineup(): LineupStructure["powerPlay"] {
  return {
    units: [
      { ...EMPTY_POWER_PLAY_UNIT },
      { ...EMPTY_POWER_PLAY_UNIT },
    ],
  };
}

export function ensurePowerPlayLineup(lineup: LineupStructure): LineupStructure {
  if (lineup.powerPlay?.units?.length === 2) {
    return {
      ...lineup,
      powerPlay: {
        units: [
          { ...EMPTY_POWER_PLAY_UNIT, ...lineup.powerPlay.units[0] },
          { ...EMPTY_POWER_PLAY_UNIT, ...lineup.powerPlay.units[1] },
        ],
      },
    };
  }
  return { ...lineup, powerPlay: emptyPowerPlayLineup() };
}

export function powerPlayPlayerIds(lineup: LineupStructure): Set<string> {
  const s = new Set<string>();
  const pp = lineup.powerPlay?.units;
  if (!pp) return s;
  for (const u of pp) {
    if (u.point) s.add(u.point);
    if (u.left) s.add(u.left);
    if (u.bumper) s.add(u.bumper);
    if (u.right) s.add(u.right);
    if (u.netFront) s.add(u.netFront);
  }
  return s;
}

export function setPowerPlaySlot(
  lineup: LineupStructure,
  unitIndex: 0 | 1,
  role: PowerPlayRole,
  playerId: string | null
): LineupStructure {
  const base = ensurePowerPlayLineup(lineup);
  const units = base.powerPlay!.units.map((u, i) =>
    i === unitIndex ? { ...u, [role]: playerId } : { ...u }
  ) as [PowerPlayUnit, PowerPlayUnit];
  return { ...base, powerPlay: { units } };
}

export function stripPlayerFromPowerPlay(lineup: LineupStructure, playerId: string): LineupStructure {
  const base = ensurePowerPlayLineup(lineup);
  const units = base.powerPlay!.units.map((u) => ({
    point: u.point === playerId ? null : u.point,
    left: u.left === playerId ? null : u.left,
    bumper: u.bumper === playerId ? null : u.bumper,
    right: u.right === playerId ? null : u.right,
    netFront: u.netFront === playerId ? null : u.netFront,
  })) as [PowerPlayUnit, PowerPlayUnit];
  return { ...base, powerPlay: { units } };
}

export function powerPlayFilledCount(lineup: LineupStructure): number {
  return powerPlayPlayerIds(lineup).size;
}

/** Popisek slotu pro mobilní sheet výběru hráče. */
export function powerPlaySlotPickerLabel(unitIndex: number, role: string): string {
  const unit = POWER_PLAY_UNIT_LABELS[unitIndex === 0 ? 0 : 1] ?? "Pětka";
  const roleLabel =
    role in POWER_PLAY_ROLE_LABELS
      ? POWER_PLAY_ROLE_LABELS[role as PowerPlayRole]
      : role;
  return `${unit} · ${roleLabel}`;
}
