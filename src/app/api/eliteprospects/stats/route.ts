import { NextResponse } from "next/server";

type EpStats = {
  seasonLabel: string;
  league: string;
  team: string;
  gp?: number;
  g?: number;
  a?: number;
  pts?: number;
  plusMinus?: number;
  pim?: number;
};

function toInt(s: string) {
  const n = Number.parseInt(s, 10);
  return Number.isFinite(n) ? n : null;
}

function seasonKey(seasonLabel: string) {
  // "2025-26" -> 2025
  const m = /^(\d{4})-\d{2}$/.exec(seasonLabel.trim());
  return m ? Number(m[1]) : -1;
}

function parseLatestRow(markdownLike: string): EpStats | null {
  const lines = markdownLike.split(/\r?\n/);
  const rows: EpStats[] = [];

  for (const ln of lines) {
    // Example:
    // | 2025-26 | [HC Dynamo Pardubice](...) | [Czechia](...) | 45 | 17 | 29 | 46 | 22 | 22 | ...
    const m =
      /^\|\s*(\d{4}-\d{2})\s*\|\s*\[([^\]]+)\]\([^)]+\)\s*\|\s*\[([^\]]+)\]\([^)]+\)\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|\s*([^|]+)\s*\|/.exec(
        ln,
      );
    if (!m) continue;
    const seasonLabel = m[1] ?? "";
    const team = m[2] ?? "";
    const league = m[3] ?? "";
    const gp = toInt(m[4] ?? "");
    const g = toInt(m[5] ?? "");
    const a = toInt(m[6] ?? "");
    const pts = toInt(m[7] ?? "");
    const pim = toInt(m[8] ?? "");
    const pmRaw = (m[9] ?? "").trim();
    const plusMinus = pmRaw === "-" ? null : toInt(pmRaw);
    if (!seasonLabel || !team || !league) continue;

    rows.push({
      seasonLabel,
      team,
      league,
      gp: gp ?? undefined,
      g: g ?? undefined,
      a: a ?? undefined,
      pts: pts ?? undefined,
      pim: pim ?? undefined,
      plusMinus: plusMinus ?? undefined,
    });
  }

  if (rows.length === 0) return null;

  rows.sort((x, y) => seasonKey(y.seasonLabel) - seasonKey(x.seasonLabel));
  return rows[0] ?? null;
}

export async function POST(req: Request) {
  try {
    const body: unknown = await req.json();
    const url = (body as any)?.url;
    if (typeof url !== "string" || !url.startsWith("https://www.eliteprospects.com/")) {
      return NextResponse.json({ error: "Invalid url" }, { status: 400 });
    }

    const r = await fetch(url, {
      headers: {
        // EP blocks some generic fetches; a UA helps.
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123 Safari/537.36",
        "accept-language": "cs,en;q=0.8",
      },
      cache: "no-store",
    });

    if (!r.ok) {
      return NextResponse.json({ error: `Fetch failed: ${r.status}` }, { status: 502 });
    }
    const text = await r.text();
    const parsed = parseLatestRow(text);
    if (!parsed) return NextResponse.json({ error: "No stats parsed" }, { status: 404 });
    return NextResponse.json(parsed);
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message ?? e) }, { status: 500 });
  }
}

