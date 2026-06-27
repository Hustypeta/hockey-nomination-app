export type DailyNewsSourceBrand = {
  label: string;
  short: string;
  gradient: string;
  glow: string;
  accent: string;
  accentBorder: string;
};

const BRANDS: { match: RegExp; brand: DailyNewsSourceBrand }[] = [
  {
    match: /idnes/i,
    brand: {
      label: "iDNES.cz",
      short: "iDNES",
      gradient: "from-[#8b1530] via-[#1a0a10] to-[#06070c]",
      glow: "rgba(200,16,46,0.45)",
      accent: "#c8102e",
      accentBorder: "rgba(200,16,46,0.55)",
    },
  },
  {
    match: /sport\.cz|sport cz/i,
    brand: {
      label: "Sport.cz",
      short: "Sport",
      gradient: "from-[#b84a08] via-[#1a1008] to-[#06070c]",
      glow: "rgba(232,93,4,0.4)",
      accent: "#e85d04",
      accentBorder: "rgba(232,93,4,0.5)",
    },
  },
  {
    match: /čt|ct sport|ceskatelevize/i,
    brand: {
      label: "ČT Sport",
      short: "ČT",
      gradient: "from-[#004499] via-[#0a1428] to-[#06070c]",
      glow: "rgba(0,91,187,0.45)",
      accent: "#005bbb",
      accentBorder: "rgba(0,91,187,0.55)",
    },
  },
  {
    match: /isport|blesk/i,
    brand: {
      label: "iSport.cz",
      short: "iSport",
      gradient: "from-[#9a1830] via-[#140a14] to-[#06070c]",
      glow: "rgba(224,30,60,0.35)",
      accent: "#e01e3c",
      accentBorder: "rgba(224,30,60,0.5)",
    },
  },
  {
    match: /livesport/i,
    brand: {
      label: "Livesport",
      short: "LS",
      gradient: "from-[#1240a8] via-[#0c1428] to-[#06070c]",
      glow: "rgba(30,107,255,0.42)",
      accent: "#1e6bff",
      accentBorder: "rgba(30,107,255,0.55)",
    },
  },
  {
    match: /nhl\.cz/i,
    brand: {
      label: "NHL.cz",
      short: "NHL",
      gradient: "from-[#6b1020] via-[#101828] to-[#06070c]",
      glow: "rgba(200,16,46,0.3)",
      accent: "#c8102e",
      accentBorder: "rgba(200,16,46,0.45)",
    },
  },
  {
    match: /elite\s*prospects|eliteprospects/i,
    brand: {
      label: "Elite Prospects",
      short: "EP",
      gradient: "from-[#1a4a8f] via-[#0c1428] to-[#06070c]",
      glow: "rgba(30,107,255,0.42)",
      accent: "#1e6bff",
      accentBorder: "rgba(30,107,255,0.55)",
    },
  },
  {
    match: /nhl\.com|nhl news/i,
    brand: {
      label: "NHL.com",
      short: "NHL",
      gradient: "from-[#2a3548] via-[#101828] to-[#06070c]",
      glow: "rgba(148,163,184,0.28)",
      accent: "#94a3b8",
      accentBorder: "rgba(148,163,184,0.4)",
    },
  },
];

const DEFAULT_BRAND: DailyNewsSourceBrand = {
  label: "Lineup News",
  short: "News",
  gradient: "from-[#1a3a8f] via-[#0c1428] to-[#06070c]",
  glow: "rgba(30,107,255,0.38)",
  accent: "#1e6bff",
  accentBorder: "rgba(30,107,255,0.55)",
};

export function getDailyNewsSourceBrand(source: string): DailyNewsSourceBrand {
  const hit = BRANDS.find((b) => b.match.test(source));
  if (hit) return { ...hit.brand, label: source || hit.brand.label };
  return { ...DEFAULT_BRAND, label: source || DEFAULT_BRAND.label };
}
