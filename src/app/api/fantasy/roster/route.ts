import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { msFantasyNotEnabledResponse } from "@/lib/msFantasyApiGate";
import { salaryForTier } from "@/lib/msFantasyConfig";
import { isAllowedMsFantasyTeamCode, isAllowedMsFantasyTier } from "@/lib/msFantasyRosterFilters";

const MAX_PAGE = 80;

/**
 * Aktivní pool hráčů pro fantasy: jméno (`q`), pozice, repre (`team`), tier (`tier`).
 * `q` — část jména (case-insensitive contains).
 */
export async function GET(request: NextRequest) {
  const gate = msFantasyNotEnabledResponse();
  if (gate) return gate;

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const position = searchParams.get("position")?.trim().toUpperCase() ?? "";
  const teamRaw = searchParams.get("team")?.trim().toUpperCase() ?? "";
  const team = teamRaw && isAllowedMsFantasyTeamCode(teamRaw) ? teamRaw : "";
  const tierRaw = searchParams.get("tier")?.trim().toUpperCase() ?? "";
  const tier = tierRaw && isAllowedMsFantasyTier(tierRaw) ? tierRaw : "";
  const skip = Math.max(0, Math.min(Number(searchParams.get("skip") ?? 0), 10_000));
  let take = Math.min(Number(searchParams.get("take") ?? 40), MAX_PAGE);
  if (!Number.isFinite(take) || take < 1) take = 40;

  const where = {
    active: true,
    ...(position && ["G", "D", "F"].includes(position) ? { position } : {}),
    ...(team ? { team } : {}),
    ...(tier ? { tier } : {}),
    ...(q
      ? {
          name: {
            contains: q,
            mode: "insensitive" as const,
          },
        }
      : {}),
  };

  const items = await prisma.msFantasyRosterPlayer.findMany({
    where,
    skip,
    take,
    orderBy: [{ team: "asc" }, { name: "asc" }, { id: "asc" }],
    select: {
      id: true,
      code: true,
      name: true,
      team: true,
      jerseyNumber: true,
      position: true,
      tier: true,
    },
  });

  return NextResponse.json({
    players: items.map((p) => ({
      ...p,
      tier: p.tier.toUpperCase(),
      salary: salaryForTier(p.tier),
    })),
    nextSkip: items.length === take ? skip + take : null,
  });
}
