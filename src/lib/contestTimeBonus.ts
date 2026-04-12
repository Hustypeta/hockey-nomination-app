/**
 * Časový bonus a uzávěrka soutěže — kalendářní dny v času Europe/Prague.
 */

export const CONTEST_TIMEZONE = "Europe/Prague";

/** Uzávěrka odeslání nominace do soutěže (včetně tohoto dne, do půlnoci předcházející 14. 5.). */
const SUBMISSION_LAST_YMD = "2026-05-13";

/** Hranice bonusů (včetně uvedeného dne): do 30. 4. → 40 %, do 7. 5. → 25 %, do 10. 5. → 10 %, poté 0 %. */
const BONUS_40_UNTIL = "2026-04-30";
const BONUS_25_UNTIL = "2026-05-07";
const BONUS_10_UNTIL = "2026-05-10";

export type ContestTimeBonusPercent = 0 | 10 | 25 | 40;

/** YYYY-MM-DD v kalendáři Praha pro daný okamžik (UTC Date). */
export function getPragueCalendarYmd(instant: Date): string {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: CONTEST_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = fmt.formatToParts(instant);
  const y = parts.find((p) => p.type === "year")?.value ?? "1970";
  const m = parts.find((p) => p.type === "month")?.value ?? "01";
  const d = parts.find((p) => p.type === "day")?.value ?? "01";
  return `${y}-${m}-${d}`;
}

export function getTimeBonusPercentForInstant(instant: Date): ContestTimeBonusPercent {
  const ymd = getPragueCalendarYmd(instant);
  if (ymd <= BONUS_40_UNTIL) return 40;
  if (ymd <= BONUS_25_UNTIL) return 25;
  if (ymd <= BONUS_10_UNTIL) return 10;
  return 0;
}

export function isNominationSubmissionOpen(instant: Date): boolean {
  return getPragueCalendarYmd(instant) <= SUBMISSION_LAST_YMD;
}

export function formatContestBonusLabel(percent: ContestTimeBonusPercent): string {
  if (percent === 0) return "bez časového bonusu";
  return `+${percent} % k bodům`;
}

export const CONTEST_DEADLINE_CS =
  "13. května 2026, 23:59 (čas ČR, středoevropský)";
