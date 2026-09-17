/**
 * FIFA shell (home, forum, žebříček, editor chrome) is the public product UI.
 * Default on so production matches local. Kill-switch: NEXT_PUBLIC_FIFA_DESIGN=false.
 */
export function isFifaDesignEnabled(): boolean {
  const v = process.env.NEXT_PUBLIC_FIFA_DESIGN?.trim().toLowerCase();
  if (v === "false" || v === "0" || v === "off" || v === "no") return false;
  return true;
}
