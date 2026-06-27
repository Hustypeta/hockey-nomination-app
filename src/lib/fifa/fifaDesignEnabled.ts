/** Lokální FIFA redesign — na produkci nechat vypnuté (env nenastavovat). */
export function isFifaDesignEnabled(): boolean {
  return process.env.NEXT_PUBLIC_FIFA_DESIGN?.trim().toLowerCase() === "true";
}
