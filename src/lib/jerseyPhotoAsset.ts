/** Zadní strana dresu (PNG v `public/images/{reprezentace,<klub>}/`) — jméno a číslo se kreslí v kartách / plakátech. */

import { clubFromElhPoolKey, elhPoolKey } from "@/lib/lineupPools";
import type { Player } from "@/types";

const assetV = process.env.NEXT_PUBLIC_ASSET_VERSION?.trim();
const assetQ = assetV && assetV.length > 0 ? `?v=${encodeURIComponent(assetV)}` : "";

/** Soubor: `public/images/reprezentace/cz-jersey-squad-compact.png` — po výměně za novou verzi zvedni `NEXT_PUBLIC_ASSET_VERSION`, ať se obejde CDN cache. */
export const CZ_JERSEY_BACK_BLANK_SRC = `/images/reprezentace/cz-jersey-squad-compact.png${assetQ}`;

/** Brankářský dres: `public/images/reprezentace/brankar.png`. */
export const CZ_GOALIE_JERSEY_BACK_BLANK_SRC = `/images/reprezentace/brankar.png${assetQ}`;

/** HC Dynamo Pardubice — hráčský dres (F/D). */
export const PARDUBICE_JERSEY_SKATER_SRC = `/images/pardubice/pardubice-skater.png${assetQ}`;

/** HC Dynamo Pardubice — brankářský dres (G). */
export const PARDUBICE_JERSEY_GOALIE_SRC = `/images/pardubice/pardubice-goalie.png${assetQ}`;

/** HC Kometa Brno — hráčský dres (F/D). */
export const KOMETA_JERSEY_SKATER_SRC = `/images/brno/brno-skater.png${assetQ}`;

/** HC Kometa Brno — brankářský dres (G). */
export const KOMETA_JERSEY_GOALIE_SRC = `/images/brno/brno-goalie.png${assetQ}`;

/** HC Energie Karlovy Vary — hráčský dres (F/D). */
export const KARLOVY_JERSEY_SKATER_SRC = `/images/vary/vary-skater.png${assetQ}`;

/** HC Energie Karlovy Vary — brankářský dres (G). */
export const KARLOVY_JERSEY_GOALIE_SRC = `/images/vary/vary-goalie.png${assetQ}`;

/** HC Litvínov — hráčský dres (F/D), yellow kit. */
export const LITVINOV_JERSEY_SKATER_SRC = `/images/litvinov/litvinov-skater.png${assetQ}`;

/** HC Litvínov — brankářský dres (G). */
export const LITVINOV_JERSEY_GOALIE_SRC = `/images/litvinov/litvinov-goalie.png${assetQ}`;

/** Rytíři Kladno — hráčský dres (F/D), white kit. */
export const KLADNO_JERSEY_SKATER_SRC = `/images/kladno/kladno-skater.png${assetQ}`;

/** Rytíři Kladno — brankářský dres (G). */
export const KLADNO_JERSEY_GOALIE_SRC = `/images/kladno/kladno-goalie.png${assetQ}`;

/** HC Plzeň — hráčský dres (F/D), white kit. */
export const PLZEN_JERSEY_SKATER_SRC = `/images/plzen/plzen-skater.png${assetQ}`;

/** HC Plzeň — brankářský dres (G). */
export const PLZEN_JERSEY_GOALIE_SRC = `/images/plzen/plzen-goalie.png${assetQ}`;

/** Bílí Tygři Liberec — hráčský dres (F/D), white home kit. */
export const LIBEREC_JERSEY_SKATER_SRC = `/images/liberec/liberec-skater.png${assetQ}`;

/** Bílí Tygři Liberec — brankářský dres (G), white home kit. */
export const LIBEREC_JERSEY_GOALIE_SRC = `/images/liberec/liberec-goalie.png${assetQ}`;

/** HC Oceláři Třinec — hráčský dres (F/D), white home kit. */
export const TRINEC_JERSEY_SKATER_SRC = `/images/trinec/trinec-skater.png${assetQ}`;

/** HC Oceláři Třinec — brankářský dres (G), white home kit. */
export const TRINEC_JERSEY_GOALIE_SRC = `/images/trinec/trinec-goalie.png${assetQ}`;

/** HC Motor České Budějovice — hráčský dres (F/D), blue home kit. */
export const BUDEJOVICE_JERSEY_SKATER_SRC = `/images/budejovice/budejovice-skater.png${assetQ}`;

/** HC Motor České Budějovice — brankářský dres (G), blue home kit. */
export const BUDEJOVICE_JERSEY_GOALIE_SRC = `/images/budejovice/budejovice-goalie.png${assetQ}`;

/** HC Olomouc — hráčský dres (F/D), white body / red shoulders. */
export const OLOMOUC_JERSEY_SKATER_SRC = `/images/olomouc/olomouc-skater.png${assetQ}`;

/** HC Olomouc — brankářský dres (G). */
export const OLOMOUC_JERSEY_GOALIE_SRC = `/images/olomouc/olomouc-goalie.png${assetQ}`;

/** HC Sparta Praha — hráčský dres (F/D), red / black home kit. */
export const SPARTA_JERSEY_SKATER_SRC = `/images/sparta/sparta-skater.png${assetQ}`;

/** HC Sparta Praha — brankářský dres (G). */
export const SPARTA_JERSEY_GOALIE_SRC = `/images/sparta/sparta-goalie.png${assetQ}`;

/** BK Mladá Boleslav — hráčský dres (F/D). */
export const BOLESLAV_JERSEY_SKATER_SRC = `/images/boleslav/boleslav-skater.png${assetQ}`;

/** BK Mladá Boleslav — brankářský dres (G). */
export const BOLESLAV_JERSEY_GOALIE_SRC = `/images/boleslav/boleslav-goalie.png${assetQ}`;

/** Mountfield HK — hráčský dres (F/D). */
export const HRADEC_JERSEY_SKATER_SRC = `/images/hradec/hradec-skater.png${assetQ}`;

/** Mountfield HK — brankářský dres (G). */
export const HRADEC_JERSEY_GOALIE_SRC = `/images/hradec/hradec-goalie.png${assetQ}`;

/** HC Vítkovice — hráčský dres (F/D). */
export const VITKOVICE_JERSEY_SKATER_SRC = `/images/vitkovice/vitkovice-skater.png${assetQ}`;

/** HC Vítkovice — brankářský dres (G). */
export const VITKOVICE_JERSEY_GOALIE_SRC = `/images/vitkovice/vitkovice-goalie.png${assetQ}`;

/** Pozadí plakátu „jen jména“ — národák / ostatní pooly. */
export const NAMES_POSTER_BG_DEFAULT_SRC = `/images/reprezentace/poster-lineup-names-bg.png${assetQ}`;

/** Pozadí plakátu „jen jména“ — HC Dynamo Pardubice. */
export const NAMES_POSTER_BG_PARDUBICE_SRC = `/images/pardubice/pozadi-jmena-pardubice.png${assetQ}`;

/** Pozadí plakátu „jen jména“ — HC Kometa Brno. */
export const NAMES_POSTER_BG_KOMETA_SRC = `/images/brno/pozadi-jmena-brno.png${assetQ}`;

/** Pozadí plakátu „jen jména“ — HC Energie Karlovy Vary. */
export const NAMES_POSTER_BG_KARLOVY_SRC = `/images/vary/pozadi-jmena-vary.png${assetQ}`;

/** Pozadí plakátu „jen jména“ — HC Litvínov. */
export const NAMES_POSTER_BG_LITVINOV_SRC = `/images/litvinov/pozadi-jmena-litvinov.png${assetQ}`;

/** Pozadí plakátu „jen jména“ — Rytíři Kladno. */
export const NAMES_POSTER_BG_KLADNO_SRC = `/images/kladno/pozadi-jmena-kladno.png${assetQ}`;

/** Pozadí plakátu „jen jména“ — HC Plzeň. */
export const NAMES_POSTER_BG_PLZEN_SRC = `/images/plzen/pozadi-jmena-plzen.png${assetQ}`;

/** Pozadí plakátu „jen jména“ — Bílí Tygři Liberec. */
export const NAMES_POSTER_BG_LIBEREC_SRC = `/images/liberec/pozadi-jmena-liberec.png${assetQ}`;

/** Pozadí plakátu „jen jména“ — HC Oceláři Třinec. */
export const NAMES_POSTER_BG_TRINEC_SRC = `/images/trinec/pozadi-jmena-trinec.png${assetQ}`;

/** Pozadí plakátu „jen jména“ — HC Motor České Budějovice. */
export const NAMES_POSTER_BG_BUDEJOVICE_SRC = `/images/budejovice/pozadi-jmena-budejovice.png${assetQ}`;

/** Pozadí plakátu „jen jména“ — HC Olomouc. */
export const NAMES_POSTER_BG_OLOMOUC_SRC = `/images/olomouc/pozadi-jmena-olomouc.png${assetQ}`;

/** Pozadí plakátu „jen jména“ — HC Sparta Praha. */
export const NAMES_POSTER_BG_SPARTA_SRC = `/images/sparta/pozadi-jmena-sparta.png${assetQ}`;

/** Pozadí plakátu „jen jména“ — BK Mladá Boleslav. */
export const NAMES_POSTER_BG_BOLESLAV_SRC = `/images/boleslav/pozadi-jmena-boleslav.png${assetQ}`;

/** Pozadí plakátu „jen jména“ — Mountfield HK. */
export const NAMES_POSTER_BG_HRADEC_SRC = `/images/hradec/pozadi-jmena-hradec.png${assetQ}`;

/** Pozadí plakátu „jen jména“ — HC Vítkovice. */
export const NAMES_POSTER_BG_VITKOVICE_SRC = `/images/vitkovice/pozadi-jmena-vitkovice.png${assetQ}`;

/** Trenér národního A-týmu (národák) — stejné PNG i pro Pardubice / Kometu / U20 / U18. */
export const CZE_A_TEAM_COACH_IMAGE_SRC = `/images/reprezentace/trener.png${assetQ}`;
export const CZE_A_TEAM_COACH_NAME = "Moták";

/** Trenér reprezentace U20 — pevné jméno na plakátech; obrázek = národák. */
export const CZE_U20_COACH_NAME = "Jan Tomajko";

/** Trenér reprezentace U18 — pevné jméno na plakátech; obrázek = národák. */
export const CZE_U18_COACH_NAME = "Jaroslav Nedvěd";

/** Trenér Dynama Pardubice — pevné jméno na plakátech; obrázek = národák. */
export const PARDUBICE_COACH_NAME = "Filip Pešán";

/** Trenér Komety Brno — pevné jméno na plakátech; obrázek = národák. */
export const KOMETA_COACH_NAME = "Libor Zábranský";

/** Trenér BK Mladá Boleslav — pevné jméno na plakátech; obrázek = národák. */
export const BOLESLAV_COACH_NAME = "Petr Haken";

/** Trenér Bílí Tygři Liberec — pevné jméno na plakátech; obrázek = národák. */
export const LIBEREC_COACH_NAME = "Jiří Kudrna";

/** Trenér HC Energie Karlovy Vary — pevné jméno na plakátech; obrázek = národák. */
export const KARLOVY_COACH_NAME = "Pavel Patera";

/** Trenér HC Litvínov — pevné jméno na plakátech; obrázek = národák. */
export const LITVINOV_COACH_NAME = "Robert Reichel";

/** Trenér HC Motor České Budějovice — pevné jméno na plakátech; obrázek = národák. */
export const BUDEJOVICE_COACH_NAME = "Róbert Petrovický";

/** Trenér HC Oceláři Třinec — pevné jméno na plakátech; obrázek = národák. */
export const TRINEC_COACH_NAME = "Boris Žabka";

/** Trenér HC Olomouc — pevné jméno na plakátech; obrázek = národák. */
export const OLOMOUC_COACH_NAME = "Petr Fiala";

/** Trenér HC Plzeň — pevné jméno na plakátech; obrázek = národák. */
export const PLZEN_COACH_NAME = "Josef Jandač";

/** Trenér HC Sparta Praha — pevné jméno na plakátech; obrázek = národák. */
export const SPARTA_COACH_NAME = "Patrik Augusta";

/** Trenér HC Vítkovice — pevné jméno na plakátech; obrázek = národák. */
export const VITKOVICE_COACH_NAME = "Yorick Treille";

/** Trenér Mountfield HK — pevné jméno na plakátech; obrázek = národák. */
export const HRADEC_COACH_NAME = "Tomáš Martinec";

/** Trenér Rytíři Kladno — pevné jméno na plakátech; obrázek = národák. */
export const KLADNO_COACH_NAME = "Radim Rulík";

export const PARDUBICE_POOL_KEY = elhPoolKey("HC Dynamo Pardubice");
export const KOMETA_POOL_KEY = elhPoolKey("HC Kometa Brno");
export const KARLOVY_POOL_KEY = elhPoolKey("HC Energie Karlovy Vary");
export const LITVINOV_POOL_KEY = elhPoolKey("HC Litvínov");
export const KLADNO_POOL_KEY = elhPoolKey("Rytíři Kladno");
export const PLZEN_POOL_KEY = elhPoolKey("HC Plzeň");
export const LIBEREC_POOL_KEY = elhPoolKey("Bílí Tygři Liberec");
export const TRINEC_POOL_KEY = elhPoolKey("HC Oceláři Třinec");
export const BUDEJOVICE_POOL_KEY = elhPoolKey("HC Motor České Budějovice");
export const OLOMOUC_POOL_KEY = elhPoolKey("HC Olomouc");
export const SPARTA_POOL_KEY = elhPoolKey("HC Sparta Praha");
export const BOLESLAV_POOL_KEY = elhPoolKey("BK Mladá Boleslav");
export const HRADEC_POOL_KEY = elhPoolKey("Mountfield HK");
export const VITKOVICE_POOL_KEY = elhPoolKey("HC Vítkovice");

/** Modifier class for white Pardubice numbers (condensed athletic + navy outline — ČERVENKA #19). */
export const PARDUBICE_JERSEY_NUMBER_CLASS = "jersey-back-number-text--pardubice";

/** Modifier class for white Kometa numbers (thick navy + thin white rim — FLEK #9). */
export const KOMETA_JERSEY_NUMBER_CLASS = "jersey-back-number-text--kometa";

/** Modifier class for solid teal geometric numbers on Karlovy Vary kit (ČERNOCH #21, no outline). */
export const KARLOVY_JERSEY_NUMBER_CLASS = "jersey-back-number-text--karlovy";

/** Modifier class for black Litvínov numbers on yellow kit (thin white outline — KAŠE O. #73). */
export const LITVINOV_JERSEY_NUMBER_CLASS = "jersey-back-number-text--litvinov";

/** Modifier class for layered Kladno numbers (navy + white rim + sky outer). */
export const KLADNO_JERSEY_NUMBER_CLASS = "jersey-back-number-text--kladno";

/** Modifier class for layered Plzeň numbers (navy + white rim + sky outer — GULÁŠ #77). */
export const PLZEN_JERSEY_NUMBER_CLASS = "jersey-back-number-text--plzen";

/** Modifier class for Liberec numbers (cyan + white inner + navy outer — ŠIMEK #44). */
export const LIBEREC_JERSEY_NUMBER_CLASS = "jersey-back-number-text--liberec";

/** Modifier class for solid red Třinec numbers on white kit (DAŇO #56, no outline). */
export const TRINEC_JERSEY_NUMBER_CLASS = "jersey-back-number-text--trinec";

/** Modifier class for yellow numbers on Budějovice blue kit (red + navy outline). */
export const BUDEJOVICE_JERSEY_NUMBER_CLASS = "jersey-back-number-text--budejovice";

/** Modifier class for solid red Olomouc numbers on white blank (flat KALUS #31 style; no outline). */
export const OLOMOUC_JERSEY_NUMBER_CLASS = "jersey-back-number-text--olomouc";

/** Modifier class for white angular-block numbers on Sparta red kit (black outline, chest-S vibe). */
export const SPARTA_JERSEY_NUMBER_CLASS = "jersey-back-number-text--sparta";

/** Modifier class for white Mountfield HK numbers on black kit (thin black outline — PAVLÍK #98). */
export const HRADEC_JERSEY_NUMBER_CLASS = "jersey-back-number-text--hradec";

/** Modifier class for white stencil-block Vítkovice numbers on navy kit (KALUS #11). */
export const VITKOVICE_JERSEY_NUMBER_CLASS = "jersey-back-number-text--vitkovice";

/** Modifier class for white Boleslav numbers on green kit (front #24 / #3 style — no back photo). */
export const BOLESLAV_JERSEY_NUMBER_CLASS = "jersey-back-number-text--boleslav";

/** Modifier class for white jersey names on Kometa kit (readable on royal blue). */
export const KOMETA_JERSEY_NAME_CLASS = "jersey-nameplate-text--kometa";

/** Modifier class for white condensed jersey names on Pardubice red kit. */
export const PARDUBICE_JERSEY_NAME_CLASS = "jersey-nameplate-text--pardubice";

/** Modifier class for teal jersey names on Karlovy Vary black kit. */
export const KARLOVY_JERSEY_NAME_CLASS = "jersey-nameplate-text--karlovy";

/** Modifier class for black jersey names on Litvínov yellow kit. */
export const LITVINOV_JERSEY_NAME_CLASS = "jersey-nameplate-text--litvinov";

/** Modifier class for dark blue jersey names on Kladno white kit. */
export const KLADNO_JERSEY_NAME_CLASS = "jersey-nameplate-text--kladno";

/** Modifier class for solid navy jersey names on Plzeň white kit. */
export const PLZEN_JERSEY_NAME_CLASS = "jersey-nameplate-text--plzen";

/** Modifier class for solid navy jersey names on Liberec white kit. */
export const LIBEREC_JERSEY_NAME_CLASS = "jersey-nameplate-text--liberec";

/** Modifier class for solid red jersey names on Třinec white kit. */
export const TRINEC_JERSEY_NAME_CLASS = "jersey-nameplate-text--trinec";

/** Modifier class for solid yellow jersey names on Budějovice blue kit. */
export const BUDEJOVICE_JERSEY_NAME_CLASS = "jersey-nameplate-text--budejovice";

/** Modifier class for solid red jersey names on Olomouc white kit. */
export const OLOMOUC_JERSEY_NAME_CLASS = "jersey-nameplate-text--olomouc";

/** Modifier class for white jersey names on Sparta red kit. */
export const SPARTA_JERSEY_NAME_CLASS = "jersey-nameplate-text--sparta";

/** Modifier class for white jersey names on Mountfield HK black kit (red nameplate bar). */
export const HRADEC_JERSEY_NAME_CLASS = "jersey-nameplate-text--hradec";

/** Modifier class for white jersey names on Vítkovice navy kit. */
export const VITKOVICE_JERSEY_NAME_CLASS = "jersey-nameplate-text--vitkovice";

/** Modifier class for white jersey names on Boleslav green kit. */
export const BOLESLAV_JERSEY_NAME_CLASS = "jersey-nameplate-text--boleslav";

/**
 * PNG blanky mají různý aspect / transparentní padding (národák skater ~25 % boční prázdno;
 * klubové blanky 1536×1024 jsou těsně oříznuté jako národák G).
 * Základ: `object-cover` + `object-top`; vizuální sjednocení přes `.jersey-blank-img` + `data-jersey-kit/kind/team` v CSS.
 */
export const CZ_JERSEY_CARD_IMG_BASE =
  "jersey-blank-img absolute inset-0 h-full w-full object-cover object-top";

export type JerseyBlankKind = "skater" | "goalie";

/** `data-jersey-kit` — CSS fit scales (národák skater má velké boční padding, klubové PNG skoro žádné). */
export type JerseyKitAttr = "national" | "club";

/** `data-jersey-team` — pool-specific print / color overrides. */
export type JerseyTeamAttr =
  | "brno"
  | "pardubice"
  | "vary"
  | "litvinov"
  | "kladno"
  | "plzen"
  | "liberec"
  | "trinec"
  | "budejovice"
  | "olomouc"
  | "sparta"
  | "boleslav"
  | "hradec"
  | "vitkovice";

const KARLOVY_CLUB_NAMES = new Set(["HC Energie Karlovy Vary"]);
const LITVINOV_CLUB_NAMES = new Set(["HC Litvínov", "HC Verva Litvínov"]);
const KLADNO_CLUB_NAMES = new Set(["Rytíři Kladno"]);
const PLZEN_CLUB_NAMES = new Set(["HC Plzeň", "HC Škoda Plzeň"]);
const LIBEREC_CLUB_NAMES = new Set(["Bílí Tygři Liberec"]);
const TRINEC_CLUB_NAMES = new Set(["HC Oceláři Třinec"]);
const BUDEJOVICE_CLUB_NAMES = new Set(["HC Motor České Budějovice"]);
const OLOMOUC_CLUB_NAMES = new Set(["HC Olomouc"]);
const SPARTA_CLUB_NAMES = new Set(["HC Sparta Praha"]);
const BOLESLAV_CLUB_NAMES = new Set(["BK Mladá Boleslav"]);
const HRADEC_CLUB_NAMES = new Set(["Mountfield HK"]);
const VITKOVICE_CLUB_NAMES = new Set(["HC Vítkovice", "HC Vítkovice Ridera"]);

export function isPardubicePoolKey(poolKey: string | null | undefined): boolean {
  if (!poolKey) return false;
  return clubFromElhPoolKey(poolKey) === "HC Dynamo Pardubice";
}

export function isKometaPoolKey(poolKey: string | null | undefined): boolean {
  if (!poolKey) return false;
  return clubFromElhPoolKey(poolKey) === "HC Kometa Brno";
}

export function isKarlovyPoolKey(poolKey: string | null | undefined): boolean {
  if (!poolKey) return false;
  const club = clubFromElhPoolKey(poolKey);
  return club != null && KARLOVY_CLUB_NAMES.has(club);
}

export function isLitvinovPoolKey(poolKey: string | null | undefined): boolean {
  if (!poolKey) return false;
  const club = clubFromElhPoolKey(poolKey);
  return club != null && LITVINOV_CLUB_NAMES.has(club);
}

export function isKladnoPoolKey(poolKey: string | null | undefined): boolean {
  if (!poolKey) return false;
  const club = clubFromElhPoolKey(poolKey);
  return club != null && KLADNO_CLUB_NAMES.has(club);
}

export function isPlzenPoolKey(poolKey: string | null | undefined): boolean {
  if (!poolKey) return false;
  const club = clubFromElhPoolKey(poolKey);
  return club != null && PLZEN_CLUB_NAMES.has(club);
}

export function isLiberecPoolKey(poolKey: string | null | undefined): boolean {
  if (!poolKey) return false;
  const club = clubFromElhPoolKey(poolKey);
  return club != null && LIBEREC_CLUB_NAMES.has(club);
}

export function isTrinecPoolKey(poolKey: string | null | undefined): boolean {
  if (!poolKey) return false;
  const club = clubFromElhPoolKey(poolKey);
  return club != null && TRINEC_CLUB_NAMES.has(club);
}

export function isBudejovicePoolKey(poolKey: string | null | undefined): boolean {
  if (!poolKey) return false;
  const club = clubFromElhPoolKey(poolKey);
  return club != null && BUDEJOVICE_CLUB_NAMES.has(club);
}

export function isOlomoucPoolKey(poolKey: string | null | undefined): boolean {
  if (!poolKey) return false;
  const club = clubFromElhPoolKey(poolKey);
  return club != null && OLOMOUC_CLUB_NAMES.has(club);
}

export function isSpartaPoolKey(poolKey: string | null | undefined): boolean {
  if (!poolKey) return false;
  const club = clubFromElhPoolKey(poolKey);
  return club != null && SPARTA_CLUB_NAMES.has(club);
}

export function isBoleslavPoolKey(poolKey: string | null | undefined): boolean {
  if (!poolKey) return false;
  const club = clubFromElhPoolKey(poolKey);
  return club != null && BOLESLAV_CLUB_NAMES.has(club);
}

export function isHradecPoolKey(poolKey: string | null | undefined): boolean {
  if (!poolKey) return false;
  const club = clubFromElhPoolKey(poolKey);
  return club != null && HRADEC_CLUB_NAMES.has(club);
}

export function isVitkovicePoolKey(poolKey: string | null | undefined): boolean {
  if (!poolKey) return false;
  const club = clubFromElhPoolKey(poolKey);
  return club != null && VITKOVICE_CLUB_NAMES.has(club);
}

/** Klubové PNG dresy (ne národák). */
export function isClubKitPoolKey(poolKey: string | null | undefined): boolean {
  return (
    isPardubicePoolKey(poolKey) ||
    isKometaPoolKey(poolKey) ||
    isKarlovyPoolKey(poolKey) ||
    isLitvinovPoolKey(poolKey) ||
    isKladnoPoolKey(poolKey) ||
    isPlzenPoolKey(poolKey) ||
    isLiberecPoolKey(poolKey) ||
    isTrinecPoolKey(poolKey) ||
    isBudejovicePoolKey(poolKey) ||
    isOlomoucPoolKey(poolKey) ||
    isSpartaPoolKey(poolKey) ||
    isBoleslavPoolKey(poolKey) ||
    isHradecPoolKey(poolKey) ||
    isVitkovicePoolKey(poolKey)
  );
}

export function jerseyKitAttrForPool(poolKey: string | null | undefined): JerseyKitAttr {
  return isClubKitPoolKey(poolKey) ? "club" : "national";
}

/** Club team slug for CSS overrides; `undefined` = national / no team attr. */
export function jerseyTeamAttrForPool(
  poolKey: string | null | undefined
): JerseyTeamAttr | undefined {
  if (isKometaPoolKey(poolKey)) return "brno";
  if (isPardubicePoolKey(poolKey)) return "pardubice";
  if (isKarlovyPoolKey(poolKey)) return "vary";
  if (isLitvinovPoolKey(poolKey)) return "litvinov";
  if (isKladnoPoolKey(poolKey)) return "kladno";
  if (isPlzenPoolKey(poolKey)) return "plzen";
  if (isLiberecPoolKey(poolKey)) return "liberec";
  if (isTrinecPoolKey(poolKey)) return "trinec";
  if (isBudejovicePoolKey(poolKey)) return "budejovice";
  if (isOlomoucPoolKey(poolKey)) return "olomouc";
  if (isSpartaPoolKey(poolKey)) return "sparta";
  if (isBoleslavPoolKey(poolKey)) return "boleslav";
  if (isHradecPoolKey(poolKey)) return "hradec";
  if (isVitkovicePoolKey(poolKey)) return "vitkovice";
  return undefined;
}

/** CSS modifier pro číslo na dresu podle poolu (prázdné = národák default). */
export function jerseyNumberModifierClassForPool(
  poolKey: string | null | undefined
): string {
  if (isPardubicePoolKey(poolKey)) return PARDUBICE_JERSEY_NUMBER_CLASS;
  if (isKometaPoolKey(poolKey)) return KOMETA_JERSEY_NUMBER_CLASS;
  if (isKarlovyPoolKey(poolKey)) return KARLOVY_JERSEY_NUMBER_CLASS;
  if (isLitvinovPoolKey(poolKey)) return LITVINOV_JERSEY_NUMBER_CLASS;
  if (isKladnoPoolKey(poolKey)) return KLADNO_JERSEY_NUMBER_CLASS;
  if (isPlzenPoolKey(poolKey)) return PLZEN_JERSEY_NUMBER_CLASS;
  if (isLiberecPoolKey(poolKey)) return LIBEREC_JERSEY_NUMBER_CLASS;
  if (isTrinecPoolKey(poolKey)) return TRINEC_JERSEY_NUMBER_CLASS;
  if (isBudejovicePoolKey(poolKey)) return BUDEJOVICE_JERSEY_NUMBER_CLASS;
  if (isOlomoucPoolKey(poolKey)) return OLOMOUC_JERSEY_NUMBER_CLASS;
  if (isSpartaPoolKey(poolKey)) return SPARTA_JERSEY_NUMBER_CLASS;
  if (isHradecPoolKey(poolKey)) return HRADEC_JERSEY_NUMBER_CLASS;
  if (isVitkovicePoolKey(poolKey)) return VITKOVICE_JERSEY_NUMBER_CLASS;
  if (isBoleslavPoolKey(poolKey)) return BOLESLAV_JERSEY_NUMBER_CLASS;
  return "";
}

/** CSS modifier pro jméno na dresu (klubové kity mají vlastní barvu; jinak default navy). */
export function jerseyNameModifierClassForPool(
  poolKey: string | null | undefined
): string {
  if (isPardubicePoolKey(poolKey)) return PARDUBICE_JERSEY_NAME_CLASS;
  if (isKometaPoolKey(poolKey)) return KOMETA_JERSEY_NAME_CLASS;
  if (isKarlovyPoolKey(poolKey)) return KARLOVY_JERSEY_NAME_CLASS;
  if (isLitvinovPoolKey(poolKey)) return LITVINOV_JERSEY_NAME_CLASS;
  if (isKladnoPoolKey(poolKey)) return KLADNO_JERSEY_NAME_CLASS;
  if (isPlzenPoolKey(poolKey)) return PLZEN_JERSEY_NAME_CLASS;
  if (isLiberecPoolKey(poolKey)) return LIBEREC_JERSEY_NAME_CLASS;
  if (isTrinecPoolKey(poolKey)) return TRINEC_JERSEY_NAME_CLASS;
  if (isBudejovicePoolKey(poolKey)) return BUDEJOVICE_JERSEY_NAME_CLASS;
  if (isOlomoucPoolKey(poolKey)) return OLOMOUC_JERSEY_NAME_CLASS;
  if (isSpartaPoolKey(poolKey)) return SPARTA_JERSEY_NAME_CLASS;
  if (isHradecPoolKey(poolKey)) return HRADEC_JERSEY_NAME_CLASS;
  if (isVitkovicePoolKey(poolKey)) return VITKOVICE_JERSEY_NAME_CLASS;
  if (isBoleslavPoolKey(poolKey)) return BOLESLAV_JERSEY_NAME_CLASS;
  return "";
}

/** Odhad poolu z hráčů soupisky (uložené sestavy / forum capture). */
export function inferLineupPoolKey(
  players: ReadonlyArray<Pick<Player, "poolKey">>,
  explicit?: string | null
): string | undefined {
  const trimmed = explicit?.trim();
  if (trimmed) return trimmed;
  for (const p of players) {
    const key = p.poolKey?.trim();
    if (key) return key;
  }
  return undefined;
}

export function jerseyBlankSrcForPool(
  poolKey: string | null | undefined,
  kind: JerseyBlankKind
): string {
  if (isPardubicePoolKey(poolKey)) {
    return kind === "goalie" ? PARDUBICE_JERSEY_GOALIE_SRC : PARDUBICE_JERSEY_SKATER_SRC;
  }
  if (isKometaPoolKey(poolKey)) {
    return kind === "goalie" ? KOMETA_JERSEY_GOALIE_SRC : KOMETA_JERSEY_SKATER_SRC;
  }
  if (isKarlovyPoolKey(poolKey)) {
    return kind === "goalie" ? KARLOVY_JERSEY_GOALIE_SRC : KARLOVY_JERSEY_SKATER_SRC;
  }
  if (isLitvinovPoolKey(poolKey)) {
    return kind === "goalie" ? LITVINOV_JERSEY_GOALIE_SRC : LITVINOV_JERSEY_SKATER_SRC;
  }
  if (isKladnoPoolKey(poolKey)) {
    return kind === "goalie" ? KLADNO_JERSEY_GOALIE_SRC : KLADNO_JERSEY_SKATER_SRC;
  }
  if (isPlzenPoolKey(poolKey)) {
    return kind === "goalie" ? PLZEN_JERSEY_GOALIE_SRC : PLZEN_JERSEY_SKATER_SRC;
  }
  if (isLiberecPoolKey(poolKey)) {
    return kind === "goalie" ? LIBEREC_JERSEY_GOALIE_SRC : LIBEREC_JERSEY_SKATER_SRC;
  }
  if (isTrinecPoolKey(poolKey)) {
    return kind === "goalie" ? TRINEC_JERSEY_GOALIE_SRC : TRINEC_JERSEY_SKATER_SRC;
  }
  if (isBudejovicePoolKey(poolKey)) {
    return kind === "goalie" ? BUDEJOVICE_JERSEY_GOALIE_SRC : BUDEJOVICE_JERSEY_SKATER_SRC;
  }
  if (isOlomoucPoolKey(poolKey)) {
    return kind === "goalie" ? OLOMOUC_JERSEY_GOALIE_SRC : OLOMOUC_JERSEY_SKATER_SRC;
  }
  if (isSpartaPoolKey(poolKey)) {
    return kind === "goalie" ? SPARTA_JERSEY_GOALIE_SRC : SPARTA_JERSEY_SKATER_SRC;
  }
  if (isBoleslavPoolKey(poolKey)) {
    return kind === "goalie" ? BOLESLAV_JERSEY_GOALIE_SRC : BOLESLAV_JERSEY_SKATER_SRC;
  }
  if (isHradecPoolKey(poolKey)) {
    return kind === "goalie" ? HRADEC_JERSEY_GOALIE_SRC : HRADEC_JERSEY_SKATER_SRC;
  }
  if (isVitkovicePoolKey(poolKey)) {
    return kind === "goalie" ? VITKOVICE_JERSEY_GOALIE_SRC : VITKOVICE_JERSEY_SKATER_SRC;
  }
  return kind === "goalie" ? CZ_GOALIE_JERSEY_BACK_BLANK_SRC : CZ_JERSEY_BACK_BLANK_SRC;
}

/** Pozadí plakátu „jen jména“ podle poolu (národák = default). */
export function namesPosterBgForPool(poolKey: string | null | undefined): string {
  if (isPardubicePoolKey(poolKey)) return NAMES_POSTER_BG_PARDUBICE_SRC;
  if (isKometaPoolKey(poolKey)) return NAMES_POSTER_BG_KOMETA_SRC;
  if (isKarlovyPoolKey(poolKey)) return NAMES_POSTER_BG_KARLOVY_SRC;
  if (isLitvinovPoolKey(poolKey)) return NAMES_POSTER_BG_LITVINOV_SRC;
  if (isKladnoPoolKey(poolKey)) return NAMES_POSTER_BG_KLADNO_SRC;
  if (isPlzenPoolKey(poolKey)) return NAMES_POSTER_BG_PLZEN_SRC;
  if (isLiberecPoolKey(poolKey)) return NAMES_POSTER_BG_LIBEREC_SRC;
  if (isTrinecPoolKey(poolKey)) return NAMES_POSTER_BG_TRINEC_SRC;
  if (isBudejovicePoolKey(poolKey)) return NAMES_POSTER_BG_BUDEJOVICE_SRC;
  if (isOlomoucPoolKey(poolKey)) return NAMES_POSTER_BG_OLOMOUC_SRC;
  if (isSpartaPoolKey(poolKey)) return NAMES_POSTER_BG_SPARTA_SRC;
  if (isBoleslavPoolKey(poolKey)) return NAMES_POSTER_BG_BOLESLAV_SRC;
  if (isHradecPoolKey(poolKey)) return NAMES_POSTER_BG_HRADEC_SRC;
  if (isVitkovicePoolKey(poolKey)) return NAMES_POSTER_BG_VITKOVICE_SRC;
  return NAMES_POSTER_BG_DEFAULT_SRC;
}

export function posterCoachForPool(poolKey: string | null | undefined): {
  name: string;
  imageSrc: string;
} {
  if (isPardubicePoolKey(poolKey)) {
    return { name: PARDUBICE_COACH_NAME, imageSrc: CZE_A_TEAM_COACH_IMAGE_SRC };
  }
  if (isKometaPoolKey(poolKey)) {
    return { name: KOMETA_COACH_NAME, imageSrc: CZE_A_TEAM_COACH_IMAGE_SRC };
  }
  if (isBoleslavPoolKey(poolKey)) {
    return { name: BOLESLAV_COACH_NAME, imageSrc: CZE_A_TEAM_COACH_IMAGE_SRC };
  }
  if (isLiberecPoolKey(poolKey)) {
    return { name: LIBEREC_COACH_NAME, imageSrc: CZE_A_TEAM_COACH_IMAGE_SRC };
  }
  if (isKarlovyPoolKey(poolKey)) {
    return { name: KARLOVY_COACH_NAME, imageSrc: CZE_A_TEAM_COACH_IMAGE_SRC };
  }
  if (isLitvinovPoolKey(poolKey)) {
    return { name: LITVINOV_COACH_NAME, imageSrc: CZE_A_TEAM_COACH_IMAGE_SRC };
  }
  if (isBudejovicePoolKey(poolKey)) {
    return { name: BUDEJOVICE_COACH_NAME, imageSrc: CZE_A_TEAM_COACH_IMAGE_SRC };
  }
  if (isTrinecPoolKey(poolKey)) {
    return { name: TRINEC_COACH_NAME, imageSrc: CZE_A_TEAM_COACH_IMAGE_SRC };
  }
  if (isOlomoucPoolKey(poolKey)) {
    return { name: OLOMOUC_COACH_NAME, imageSrc: CZE_A_TEAM_COACH_IMAGE_SRC };
  }
  if (isPlzenPoolKey(poolKey)) {
    return { name: PLZEN_COACH_NAME, imageSrc: CZE_A_TEAM_COACH_IMAGE_SRC };
  }
  if (isSpartaPoolKey(poolKey)) {
    return { name: SPARTA_COACH_NAME, imageSrc: CZE_A_TEAM_COACH_IMAGE_SRC };
  }
  if (isVitkovicePoolKey(poolKey)) {
    return { name: VITKOVICE_COACH_NAME, imageSrc: CZE_A_TEAM_COACH_IMAGE_SRC };
  }
  if (isHradecPoolKey(poolKey)) {
    return { name: HRADEC_COACH_NAME, imageSrc: CZE_A_TEAM_COACH_IMAGE_SRC };
  }
  if (isKladnoPoolKey(poolKey)) {
    return { name: KLADNO_COACH_NAME, imageSrc: CZE_A_TEAM_COACH_IMAGE_SRC };
  }
  if (poolKey === "repre_u20") {
    return { name: CZE_U20_COACH_NAME, imageSrc: CZE_A_TEAM_COACH_IMAGE_SRC };
  }
  if (poolKey === "repre_u18") {
    return { name: CZE_U18_COACH_NAME, imageSrc: CZE_A_TEAM_COACH_IMAGE_SRC };
  }
  return { name: CZE_A_TEAM_COACH_NAME, imageSrc: CZE_A_TEAM_COACH_IMAGE_SRC };
}
