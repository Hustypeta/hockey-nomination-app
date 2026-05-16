import { getPragueCalendarYmdHm } from "@/lib/contestTimeBonus";

/** Uzávěrka odeslání Pick'em do soutěže (Praha) — před startem MS 2026. */
const PICKEM_SUBMISSION_DEADLINE_YMDHM = "2026-05-15T16:20";

export function isPickemSubmissionOpen(instant: Date): boolean {
  return getPragueCalendarYmdHm(instant) <= PICKEM_SUBMISSION_DEADLINE_YMDHM;
}
