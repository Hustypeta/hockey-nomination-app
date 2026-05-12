import {
  MS_FANTASY_CAP,
  MS_FANTASY_TEAM_SIZE,
  MS_FANTASY_TIER_SALARY,
  salaryForTier,
} from "./msFantasyConfig";

export type RosterPickInput = {
  id: string;
  position: string;
  tier: string;
};

export type LineupValidationOk = { ok: true; salary: number };
export type LineupValidationErr = {
  ok: false;
  error: string;
};

export type LineupValidation = LineupValidationOk | LineupValidationErr;

/**
 * Ověří 6 unikátních hráčů z poolu: 1× G, zbytek F/D, kap podle tierů.
 */
export function validateMsFantasyLineup(picks: RosterPickInput[]): LineupValidation {
  if (!Array.isArray(picks) || picks.length !== MS_FANTASY_TEAM_SIZE) {
    return { ok: false, error: `Musíš vybrat přesně ${MS_FANTASY_TEAM_SIZE} hráčů.` };
  }
  const ids = picks.map((p) => p.id);
  if (new Set(ids).size !== picks.length) {
    return { ok: false, error: "Žádný hráč se nesmí opakovat." };
  }
  let g = 0;
  let salary = 0;
  for (const p of picks) {
    const pos = p.position.trim().toUpperCase();
    if (pos !== "G" && pos !== "D" && pos !== "F") {
      return { ok: false, error: `Neznámá pozice u hráče v sestavě (${pos}).` };
    }
    const tier = p.tier.trim().toUpperCase();
    if (!(tier in MS_FANTASY_TIER_SALARY)) {
      return { ok: false, error: `Neplatný tier „${tier}“.` };
    }
    if (pos === "G") g++;
    salary += salaryForTier(tier);
  }
  if (g !== 1) {
    return {
      ok: false,
      error: "V sestavě musí být přesně jeden brankář a jen bruslaři (út./obránci).",
    };
  }
  if (salary > MS_FANTASY_CAP) {
    return {
      ok: false,
      error: `Součet platů (${salary}) překračuje denní strop ${MS_FANTASY_CAP}.`,
    };
  }
  return { ok: true, salary };
}
