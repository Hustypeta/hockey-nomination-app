import {
  MS2026_FANTASY_OFFICIAL_GAME_DAYS,
  ms2026FantasySortedMatches,
} from "@/lib/ms2026FantasyOfficialGameDays";
import { parseMsFantasyMatches, type MsFantasyMatchDto } from "@/lib/msFantasyScheduleDisplay";

/**
 * Zápasy pro fantasy den: u známého `slug` z MS 2026 **vždy** data z `MS2026_FANTASY_OFFICIAL_GAME_DAYS`
 * (sjednoceno s [IIHF schedule](https://www.iihf.com/en/events/2026/wm/schedule)), ne z DB — aby UI neukazovalo
 * zastaralý nebo prázdný JSON po starém seedu. Jinak jen parse z `dbMatches`.
 */
export function resolveMsFantasyMatchesFromDbOrOfficial(slug: string, dbMatches: unknown): MsFantasyMatchDto[] {
  const trimmed = slug.trim();
  const official = MS2026_FANTASY_OFFICIAL_GAME_DAYS.find((d) => d.slug === trimmed);
  if (official) {
    return ms2026FantasySortedMatches(official).map((m) => ({
      startAt: m.startAt,
      home: m.home,
      away: m.away,
      group: m.group,
      phase: m.phase,
      label: m.label,
    }));
  }
  return parseMsFantasyMatches(dbMatches);
}
