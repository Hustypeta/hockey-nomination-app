/** Zobrazení na fantasy kartě na ledu — příjmení (poslední token), bez licenčních fotek jde o čistší kartu. */
export function msFantasyLineupCardLastName(fullName: string): string {
  const t = fullName.trim();
  if (!t) return "";
  const parts = t.split(/\s+/).filter(Boolean);
  return parts.length ? (parts[parts.length - 1] ?? t) : t;
}

/** Menší písmo u delších příjmení, aby zůstalo na jednom řádku bez „…“. */
export function msFantasyLineupCardLastNameTextClass(lastName: string): string {
  const len = lastName.trim().length;
  const base =
    "min-w-0 max-w-full flex-1 origin-center text-center font-bold leading-none text-white whitespace-nowrap";
  if (len <= 7) return `${base} text-[0.68rem] sm:text-[0.78rem] md:text-[0.86rem] lg:text-[0.92rem]`;
  if (len <= 9) return `${base} text-[0.6rem] sm:text-[0.7rem] md:text-[0.76rem] lg:text-[0.82rem]`;
  if (len <= 11) return `${base} text-[0.54rem] sm:text-[0.62rem] md:text-[0.68rem] lg:text-[0.74rem]`;
  if (len <= 13) return `${base} text-[0.48rem] sm:text-[0.56rem] md:text-[0.6rem] lg:text-[0.66rem]`;
  if (len <= 15) return `${base} text-[0.44rem] sm:text-[0.5rem] md:text-[0.54rem] lg:text-[0.58rem]`;
  return `${base} text-[0.38rem] sm:text-[0.44rem] md:text-[0.48rem] lg:text-[0.52rem]`;
}

/** Dodatečné zmenšení u velmi dlouhých příjmení (úzký prostor vedle vlajky). */
export function msFantasyLineupCardLastNameStyle(lastName: string): { transform: string } | undefined {
  const len = lastName.trim().length;
  if (len <= 10) return undefined;
  if (len <= 12) return { transform: "scale(0.94)" };
  if (len <= 14) return { transform: "scale(0.88)" };
  if (len <= 16) return { transform: "scale(0.82)" };
  if (len <= 18) return { transform: "scale(0.76)" };
  const scale = Math.max(0.62, 0.98 - (len - 10) * 0.038);
  return { transform: `scale(${scale.toFixed(2)})` };
}
