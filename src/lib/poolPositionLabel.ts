import type { Player } from "@/types";

const FWD_ROLES = new Set(["LW", "C", "RW"]);
const FWD_ORDER = ["LW", "C", "RW"] as const;

function forwardTokens(role: string | null | undefined): string[] {
  if (!role?.trim()) return [];
  return role
    .split(/[/|,\s\u2013\u2014]+/)
    .map((t) => t.trim().toUpperCase())
    .filter((t) => FWD_ROLES.has(t));
}

function sortFwd(a: string, b: string) {
  return FWD_ORDER.indexOf(a as (typeof FWD_ORDER)[number]) - FWD_ORDER.indexOf(b as (typeof FWD_ORDER)[number]);
}

/**
 * Krátký štítek do čtverce u hráče v poolu / náhledu.
 * Více křídel (LW+RW) → „LW/RW“; všechny tři (LW+C+RW) → „F“ (aby se vešlo a nepřetékalo).
 */
export function poolPositionSquareLabel(player: Pick<Player, "position" | "role">): string {
  if (player.position === "G") return "G";
  if (player.position === "D") {
    const t = player.role?.trim().toUpperCase();
    if (t === "LB" || t === "RB") return t;
    return "D";
  }
  const uniq = [...new Set(forwardTokens(player.role))].sort(sortFwd);
  if (uniq.length === 0) return "F";
  if (
    uniq.length >= 3 &&
    uniq.includes("LW") &&
    uniq.includes("C") &&
    uniq.includes("RW")
  ) {
    return "F";
  }
  if (uniq.length === 1) return uniq[0];
  return uniq.join("/");
}
