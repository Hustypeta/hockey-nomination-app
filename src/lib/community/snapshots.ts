import type { CommunityAttachmentKind } from "@prisma/client";
import type { LineupStructure } from "@/types";

function lineupFromJson(raw: unknown): LineupStructure {
  return normalizeLineupStructure(raw as LineupStructure);
}
import type { CommunityAttachmentSnapshotV1 } from "@/lib/community/types";
import { normalizeLineupStructure } from "@/lib/lineupUtils";

export function buildNominationSnapshot(input: {
  title: string | null;
  slug: string | null;
  captainId: string | null;
  lineupStructure: unknown;
  createdAt: Date;
}): CommunityAttachmentSnapshotV1 {
  const ls = lineupFromJson(input.lineupStructure);
  const path = input.slug ? `/v/${input.slug}` : undefined;
  return {
    version: 1,
    kind: "NOMINATION",
    title: input.title,
    captainId: input.captainId,
    lineupStructure: ls,
    sourcePath: path,
    createdAt: input.createdAt.toISOString(),
  };
}

export function buildMatchLineupSnapshot(input: {
  title: string | null;
  slug: string | null;
  code: string;
  captainId: string | null;
  lineupStructure: unknown;
  createdAt: Date;
  defenseCount: number;
  allowExtraForward: boolean;
}): CommunityAttachmentSnapshotV1 {
  const ls = lineupFromJson(input.lineupStructure);
  const path = input.slug ? `/m/${input.slug}` : `/m/${input.code}`;
  return {
    version: 1,
    kind: "MATCH_LINEUP",
    title: input.title,
    captainId: input.captainId,
    lineupStructure: ls,
    sourcePath: path,
    meta: {
      defenseCount: input.defenseCount,
      allowExtraForward: input.allowExtraForward,
    },
    createdAt: input.createdAt.toISOString(),
  };
}

export function buildFantasySnapshot(input: {
  gameDayLabel: string;
  pickIds: string[];
  pickTiers: string[];
  salarySpent: number;
  createdAt: Date;
  gameDayId: string;
}): CommunityAttachmentSnapshotV1 {
  return {
    version: 1,
    kind: "FANTASY_LINEUP",
    title: input.gameDayLabel,
    sourcePath: `/fantasy`,
    meta: {
      gameDayId: input.gameDayId,
      pickCount: input.pickIds.length,
      salarySpent: input.salarySpent,
    },
    createdAt: input.createdAt.toISOString(),
  };
}

export function snapshotKindToAttachmentKind(
  kind: CommunityAttachmentSnapshotV1["kind"]
): CommunityAttachmentKind {
  return kind;
}
