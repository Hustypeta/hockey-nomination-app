/** České názvy zemí podle ISO 3 (hokejové kódy na zápasech). */
const LABEL_CS: Record<string, string> = {
  CZE: "Česko",
  SWE: "Švédsko",
  FIN: "Finsko",
  SUI: "Švýcarsko",
  USA: "USA",
  CAN: "Kanada",
  SVK: "Slovensko",
  GER: "Německo",
  AUT: "Rakousko",
  LAT: "Lotyšsko",
  NOR: "Norsko",
  DEN: "Dánsko",
  FRA: "Francie",
  KAZ: "Kazachstán",
  HUN: "Maďarsko",
  POL: "Polsko",
  ITA: "Itálie",
  SLO: "Slovinsko",
};

export function countryLabelCs(code: string | undefined | null): string {
  const c = String(code ?? "")
    .trim()
    .toUpperCase();
  if (!c) return "—";
  return LABEL_CS[c] ?? c;
}
