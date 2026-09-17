import type { CSSProperties } from "react";
import {
  jerseyKitAttrForPool,
  jerseyTeamAttrForPool,
  type JerseyKitAttr,
  type JerseyTeamAttr,
} from "@/lib/jerseyPhotoAsset";

/**
 * Plakát „dres + jméno“ — stejná mřížka jako národák.
 * Mění se jen vizuální velikost PNG v dlaždici a barva příjmení pod dresem.
 *
 * Klubový blank je těsně oříznutý (~0.97 fill). 0.52 (fill národáku / fill klubu)
 * nechával siluetu ~poloviční a číslo (neskálované) sedělo u lemu.
 * 0.80 = silueta v dlaždici jako národák, bez přetečení rukávů do souseda.
 * G zůstává 0.9 jako národák. Žádné per-team násobky — jen barva jména.
 */
export const POSTER_CLUB_SKATER_SCALE_DEFAULT = 0.8;
export const POSTER_CLUB_GOALIE_SCALE_DEFAULT = 0.9;
export const POSTER_HEM_NAME_COLOR_DEFAULT = "#0a2463";

export type PosterJerseyKit = {
  kit: JerseyKitAttr;
  team?: JerseyTeamAttr;
  skaterScale: number;
  goalieScale: number;
  /** Příjmení pod dresem — čitelné na ledě / bílé. */
  nameColor: string;
};

/**
 * Barva jména: na ledě musí držet kontrast.
 * Světlý / bílý dres → navy/černá (ne šedá).
 * Tmavý dres → barva dresu nebo tmavší akcent (ne bílá — zanikne na ledu).
 * Žlutá / teal na ledě padají pod ~4.5:1 → tmavší token.
 */
const CLUB_POSTER_NAME_COLOR: Record<JerseyTeamAttr, string> = {
  brno: "#001d4a",
  pardubice: "#9b1b2e",
  vary: "#064e4a",
  litvinov: "#0a0a0a",
  kladno: "#0a2a6b",
  plzen: "#00205b",
  liberec: "#001a33",
  trinec: "#c4102e",
  budejovice: "#121b47",
  olomouc: "#9f1239",
  sparta: "#b91c1c",
  boleslav: "#14532d",
  hradec: "#c8102e",
  vitkovice: "#061a3a",
};

const NATIONAL_KIT: PosterJerseyKit = {
  kit: "national",
  skaterScale: 1,
  goalieScale: 0.9,
  nameColor: POSTER_HEM_NAME_COLOR_DEFAULT,
};

export function posterJerseyKitForPool(poolKey: string | null | undefined): PosterJerseyKit {
  const kit = jerseyKitAttrForPool(poolKey);
  const team = jerseyTeamAttrForPool(poolKey);
  if (kit !== "club" || !team) {
    return NATIONAL_KIT;
  }
  return {
    kit: "club",
    team,
    skaterScale: POSTER_CLUB_SKATER_SCALE_DEFAULT,
    goalieScale: POSTER_CLUB_GOALIE_SCALE_DEFAULT,
    nameColor: CLUB_POSTER_NAME_COLOR[team] ?? POSTER_HEM_NAME_COLOR_DEFAULT,
  };
}

export function posterJerseyKitCssVars(kit: PosterJerseyKit): CSSProperties {
  return {
    "--poster-jersey-skater-scale": String(kit.skaterScale),
    "--poster-jersey-goalie-scale": String(kit.goalieScale),
    "--poster-name-color": kit.nameColor,
  } as CSSProperties;
}

/** FIFA picker tile — Extraliga kits only. Repre / unknown pool keeps the default red card. */
export function fifaPoolCardKitClass(poolKey: string | null | undefined): string {
  const team = jerseyTeamAttrForPool(poolKey);
  return team ? `fifa-pool-card--kit fifa-pool-card--${team}` : "";
}
