export function historicalPlayerId(puzzleId: string, name: string): string {
  const slug = name
    .normalize("NFD")
    .replace(/\p{Mn}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `hist:${puzzleId}:${slug || "hrac"}`;
}
