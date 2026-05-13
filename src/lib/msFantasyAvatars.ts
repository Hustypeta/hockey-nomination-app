import type { CSSProperties } from "react";

/**
 * Fantasy MS — jeden sprite (6×3 portréty), stabilní výběr buňky podle `playerId`.
 * Soubor: `public/assets/fantasy-avatar-sprite.png`
 */
export const MS_FANTASY_AVATAR_SPRITE_URL = "/assets/fantasy-avatar-sprite.png" as const;
export const MS_FANTASY_AVATAR_SPRITE_COLS = 6;
export const MS_FANTASY_AVATAR_SPRITE_ROWS = 3;
export const MS_FANTASY_AVATAR_POOL_SIZE = MS_FANTASY_AVATAR_SPRITE_COLS * MS_FANTASY_AVATAR_SPRITE_ROWS;

/** Index 0 .. MS_FANTASY_AVATAR_POOL_SIZE - 1 — stabilní pro dané `playerId`. */
export function msFantasyAvatarIndexFromPlayerId(playerId: string): number {
  let h = 0;
  for (let i = 0; i < playerId.length; i++) h = (h * 31 + playerId.charCodeAt(i)) >>> 0;
  return h % MS_FANTASY_AVATAR_POOL_SIZE;
}

/** Veřejný identifikátor slotu v poolu (např. pro CMS / ladění). */
export function msFantasyAvatarId(playerId: string): string {
  const ix = msFantasyAvatarIndexFromPlayerId(playerId);
  return `avatar_${String(ix + 1).padStart(2, "0")}`;
}

export function msFantasyAvatarCellFromPlayerId(playerId: string): { col: number; row: number } {
  const index = msFantasyAvatarIndexFromPlayerId(playerId);
  return {
    col: index % MS_FANTASY_AVATAR_SPRITE_COLS,
    row: Math.floor(index / MS_FANTASY_AVATAR_SPRITE_COLS),
  };
}

/** Pozadí jedné buňky ze sprite listu (CSS, bez řezání souborů). */
export function msFantasyAvatarSpriteStyle(playerId: string): CSSProperties {
  const { col, row } = msFantasyAvatarCellFromPlayerId(playerId);
  const cols = MS_FANTASY_AVATAR_SPRITE_COLS;
  const rows = MS_FANTASY_AVATAR_SPRITE_ROWS;
  const xPct = cols <= 1 ? 0 : (col / (cols - 1)) * 100;
  const yPct = rows <= 1 ? 0 : (row / (rows - 1)) * 100;
  return {
    backgroundImage: `url("${MS_FANTASY_AVATAR_SPRITE_URL}")`,
    backgroundSize: `${cols * 100}% ${rows * 100}%`,
    backgroundPosition: `${xPct}% ${yPct}%`,
    backgroundRepeat: "no-repeat",
  };
}
