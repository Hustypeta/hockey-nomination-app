/**
 * Fantasy MS — umělé „AI“ portréty (placeholder SVG v /public), stabilně podle `playerId`.
 * Nahraď soubory v `public/assets/fantasy-avatars/` vlastními webp/png — mapování zůstane stejné.
 */
export const MS_FANTASY_AVATAR_POOL_SIZE = 28;

export const MS_FANTASY_AVATAR_PATHS = Array.from(
  { length: MS_FANTASY_AVATAR_POOL_SIZE },
  (_, i) => `/assets/fantasy-avatars/player_${String(i + 1).padStart(2, "0")}.svg`
) as readonly string[];

/** Index 0 .. MS_FANTASY_AVATAR_POOL_SIZE - 1 */
export function msFantasyAvatarIndexFromPlayerId(playerId: string): number {
  let h = 0;
  for (let i = 0; i < playerId.length; i++) h = (h * 31 + playerId.charCodeAt(i)) >>> 0;
  return h % MS_FANTASY_AVATAR_POOL_SIZE;
}

export function msFantasyAvatarPath(playerId: string): string {
  return MS_FANTASY_AVATAR_PATHS[msFantasyAvatarIndexFromPlayerId(playerId)]!;
}
