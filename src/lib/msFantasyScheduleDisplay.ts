/** Jedna položka programu MS vrácená z API (`matches` JSON na `MsFantasyGameDay`). */
export type MsFantasyMatchDto = {
  startAt: string;
  home?: string;
  away?: string;
  group?: string;
  phase?: string;
  label?: string;
};

export function parseMsFantasyMatches(raw: unknown): MsFantasyMatchDto[] {
  if (!Array.isArray(raw)) return [];
  const out: MsFantasyMatchDto[] = [];
  for (const x of raw) {
    if (!x || typeof x !== "object") continue;
    const o = x as Record<string, unknown>;
    if (typeof o.startAt !== "string") continue;
    out.push({
      startAt: o.startAt,
      home: typeof o.home === "string" ? o.home : undefined,
      away: typeof o.away === "string" ? o.away : undefined,
      group: typeof o.group === "string" ? o.group : undefined,
      phase: typeof o.phase === "string" ? o.phase : undefined,
      label: typeof o.label === "string" ? o.label : undefined,
    });
  }
  return out.sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
}

export function formatMsFantasyMatchClockPrague(iso: string): string {
  return new Date(iso).toLocaleTimeString("cs-CZ", {
    timeZone: "Europe/Prague",
    hour: "2-digit",
    minute: "2-digit",
  });
}
