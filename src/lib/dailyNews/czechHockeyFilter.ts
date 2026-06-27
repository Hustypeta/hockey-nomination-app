import { readFileSync } from "fs";
import { join } from "path";

/** URL nebo slug jasně patří hokejové sekci */
const HOCKEY_LINK = /\/hokej\b|\/hokej\/|hokej\.|hokej-|prestupynhl|\bnhl[/-]|\/nhl\b/i;

/** URL nebo slug jasně patří jinému sportu */
const NON_HOCKEY_LINK =
  /\/(fotbal|tenis|tennis|basket|atletik|cyklist|formule|formula|motorsport|motocyk|lyz|biatlon|plavan|golf|florbal|volejbal|hazen|handball|vodni[-_]slalom|sportovni[-_]gymnastik)(\/|[-_.]|$)/i;

/** Klíčová slova hokeje v textu — bez obecného „play off“ (propouštělo fotbal MS) */
const HOCKEY_TEXT =
  /\bhokej|\bhokejist|\bhokejov|\bhokejov[aeyi]|\bnhl\b|stanley\s*cup|mistrovstv[ií]\s+sv[ěe]ta.{0,24}hokej|hokej.{0,24}mistrovstv|\bms[\s-]+hokej|tipsport\s*extraliga|\bextraliga\b/i;

const NON_HOCKEY_SPORT =
  /\b(vodn[ií]\s+slalom|vod[aá]ct|kanoist|šplh|fotbal|fotbalov|tenis|tenisov|basket|atletik|golf|cyklist|formule|motocyk|lyž|biatlon|plav[aá]n|gymnastik|florbal|volejbal|h[aá]zen|wimbledon|grandslam|liga\s+mistr[uů]|premier\s+league|champions\s+league)\b/i;

const CZECH_CONTEXT =
  /\b[cč]esk|\b[cč]ech|\b[cč]r\b|[cč]eskoslov|n[aá]rodn[ií]\s+t[yý]m|reprezentac|zahrani[cč]|nhl|usa|kanad|[šs]v[yý]cars|finsko/i;

/** Explicitní zmínka o českém hráči (NHL.com, EP) */
const CZECH_PLAYER_CONTEXT =
  /\b(czech|czechia|cesk[aeyi](\s|$|\s+(hokej|forwar|defens|goal|player|republ|born|native))|from\s+czech|\bnar\s+czech|\bCZE\b)/i;

/** Diakritika typická pro češtinu — ne é/à/ç z francouzštiny */
const CZECH_SPECIFIC_DIACRITICS = /[ěůřňťďčšž]/iu;

let surnameCache: string[] | null = null;
let playerLexiconCache: { surnames: string[]; fullNames: string[] } | null = null;

export function normalizeForMatch(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

function loadPlayerRows(filename: string): { name?: string }[] {
  try {
    const path = join(process.cwd(), filename);
    return JSON.parse(readFileSync(path, "utf-8")) as { name?: string }[];
  } catch {
    return [];
  }
}

function ingestPlayerName(
  name: string | undefined,
  surnames: Set<string>,
  fullNames: Set<string>,
): void {
  const parts = name?.trim().split(/\s+/) ?? [];
  if (parts.length < 2) return;
  fullNames.add(normalizeForMatch(parts.join(" ")));
  const last = parts[parts.length - 1];
  if (last && last.length >= 4) surnames.add(normalizeForMatch(last));
}

function loadCzechPlayerLexicon(): { surnames: string[]; fullNames: string[] } {
  if (playerLexiconCache) return playerLexiconCache;
  const surnames = new Set<string>();
  const fullNames = new Set<string>();
  for (const file of [
    "czech-ms-2026-candidates-80.json",
    "czech-extraliga-players.json",
    "czech-players-2025-26.json",
  ]) {
    for (const row of loadPlayerRows(file)) {
      ingestPlayerName(row.name, surnames, fullNames);
    }
  }
  playerLexiconCache = { surnames: [...surnames], fullNames: [...fullNames] };
  return playerLexiconCache;
}

function loadCzechSurnames(): string[] {
  if (surnameCache) return surnameCache;
  surnameCache = loadCzechPlayerLexicon().surnames;
  return surnameCache;
}

function surnameRegex(surname: string): RegExp {
  const escaped = surname.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\b${escaped}\\b`);
}

/** Zpráva z NHL.com nebo Elite Prospects musí zmínit konkrétního českého hráče. */
export function matchesCzechPlayerNews(title: string, description: string): boolean {
  const combined = `${title} ${description}`;
  const text = normalizeForMatch(combined);

  if (CZECH_PLAYER_CONTEXT.test(combined) || CZECH_PLAYER_CONTEXT.test(text)) {
    return true;
  }
  const { surnames, fullNames } = loadCzechPlayerLexicon();
  if (fullNames.some((n) => text.includes(n))) {
    return true;
  }
  if (surnames.some((s) => surnameRegex(s).test(text))) {
    return true;
  }

  // Diakritika sama o sobě nestačí — jen jako doplněk k nalezenému jménu v titulku
  if (CZECH_SPECIFIC_DIACRITICS.test(title)) {
    const titleNorm = normalizeForMatch(title);
    return (
      fullNames.some((n) => titleNorm.includes(n)) ||
      surnames.some((s) => surnameRegex(s).test(titleNorm))
    );
  }

  return false;
}

function hasHockeySignal(text: string, link: string): boolean {
  return HOCKEY_TEXT.test(text) || HOCKEY_LINK.test(link);
}

export function matchesCzechHockeyNews(
  title: string,
  description: string,
  link: string,
  mode:
    | "hockey"
    | "filter_hockey"
    | "czech_hockey"
    | "google"
    | "nhl_com"
    | "elite_prospects"
    | "sport_cz_section"
    | "livesport_html"
    | "nhl_cs_czech",
): boolean {
  if (mode === "nhl_cs_czech" || mode === "livesport_html") {
    return Boolean(title.trim() && link.trim());
  }

  if (mode === "sport_cz_section") {
    const linkNorm = link.toLowerCase();
    if (!/\/clanek\/hokej/i.test(linkNorm)) return false;
    return HOCKEY_TEXT.test(normalizeForMatch(`${title} ${description}`));
  }

  if (mode === "nhl_com" || mode === "elite_prospects") {
    return matchesCzechPlayerNews(title, description);
  }

  const titleNorm = normalizeForMatch(title);
  const text = normalizeForMatch(`${title} ${description}`);
  const linkNorm = link.toLowerCase();

  if (NON_HOCKEY_LINK.test(linkNorm) && !HOCKEY_LINK.test(linkNorm)) {
    return false;
  }

  if (NON_HOCKEY_SPORT.test(titleNorm) && !HOCKEY_TEXT.test(titleNorm)) {
    return false;
  }

  if (NON_HOCKEY_SPORT.test(text) && !HOCKEY_TEXT.test(text)) {
    return false;
  }

  if (HOCKEY_LINK.test(linkNorm)) {
    return true;
  }

  if (mode === "hockey") {
    return HOCKEY_TEXT.test(text);
  }

  if (mode === "filter_hockey") {
    if (!HOCKEY_TEXT.test(text)) return false;
    return CZECH_CONTEXT.test(text) || loadCzechSurnames().some((s) => text.includes(s));
  }

  if (mode === "google") {
    if (!hasHockeySignal(text, linkNorm)) {
      return (
        loadCzechSurnames().some((s) => text.includes(s)) &&
        HOCKEY_TEXT.test(text) &&
        !NON_HOCKEY_SPORT.test(text)
      );
    }
    return HOCKEY_TEXT.test(text) || HOCKEY_LINK.test(linkNorm);
  }

  const hasSurname = loadCzechSurnames().some((s) => text.includes(s));
  if (hasSurname && HOCKEY_TEXT.test(text) && !NON_HOCKEY_SPORT.test(titleNorm)) return true;
  return HOCKEY_TEXT.test(text) && CZECH_CONTEXT.test(text);
}
