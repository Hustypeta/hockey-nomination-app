/** Default title for the match lineup names poster (one header line). */
export const MATCH_LINEUP_SHARE_TITLE_DEFAULT = "Moje sestava na zápas";

/**
 * Hard cap for the names-poster header at 1080px / 30px Bebas Neue, one line.
 * 22 characters fits typical titles (including the default) with a small margin.
 */
export const MATCH_LINEUP_SHARE_TITLE_MAX_LENGTH = 22;

export function clampMatchLineupShareTitle(value: string): string {
  return value.slice(0, MATCH_LINEUP_SHARE_TITLE_MAX_LENGTH);
}
