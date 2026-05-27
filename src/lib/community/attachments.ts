import type { CommunityAttachmentKind, PrismaClient } from "@prisma/client";
import {
  buildFantasySnapshot,
  buildMatchLineupSnapshot,
  buildNominationSnapshot,
  snapshotKindToAttachmentKind,
} from "@/lib/community/snapshots";
import type { CommunityAttachmentSnapshotV1 } from "@/lib/community/types";

export type AttachmentInput =
  | { kind: "NOMINATION"; nominationId: string }
  | { kind: "MATCH_LINEUP"; code: string }
  | { kind: "FANTASY_LINEUP"; lineupId: string }
  | { kind: "INLINE_SNAPSHOT"; snapshot: CommunityAttachmentSnapshotV1 };

export function parseAttachmentInputs(raw: unknown): AttachmentInput[] {
  if (!Array.isArray(raw)) return [];
  const out: AttachmentInput[] = [];
  for (const item of raw) {
    if (typeof item !== "object" || item === null) continue;
    const kind = (item as { kind?: string }).kind;
    if (kind === "NOMINATION" && typeof (item as { nominationId?: string }).nominationId === "string") {
      out.push({ kind: "NOMINATION", nominationId: (item as { nominationId: string }).nominationId });
    } else if (kind === "MATCH_LINEUP" && typeof (item as { code?: string }).code === "string") {
      out.push({ kind: "MATCH_LINEUP", code: (item as { code: string }).code });
    } else if (kind === "FANTASY_LINEUP" && typeof (item as { lineupId?: string }).lineupId === "string") {
      out.push({ kind: "FANTASY_LINEUP", lineupId: (item as { lineupId: string }).lineupId });
    }
    if (out.length >= 3) break;
  }
  return out;
}

export async function resolveAttachmentsForUser(
  prisma: PrismaClient,
  userId: string,
  inputs: AttachmentInput[]
): Promise<
  {
    kind: CommunityAttachmentKind;
    nominationId: string | null;
    snapshot: CommunityAttachmentSnapshotV1;
    sortOrder: number;
  }[]
> {
  const resolved: {
    kind: CommunityAttachmentKind;
    nominationId: string | null;
    snapshot: CommunityAttachmentSnapshotV1;
    sortOrder: number;
  }[] = [];

  let order = 0;
  for (const input of inputs) {
    if (input.kind === "NOMINATION") {
      const nom = await prisma.nomination.findFirst({
        where: { id: input.nominationId, userId },
        select: {
          id: true,
          title: true,
          slug: true,
          captainId: true,
          lineupStructure: true,
          createdAt: true,
        },
      });
      if (!nom) continue;
      const snapshot = buildNominationSnapshot(nom);
      resolved.push({
        kind: snapshotKindToAttachmentKind(snapshot.kind),
        nominationId: nom.id,
        snapshot,
        sortOrder: order++,
      });
    } else if (input.kind === "MATCH_LINEUP") {
      const link = await prisma.matchShareLink.findFirst({
        where: { code: input.code, userId },
        select: {
          code: true,
          slug: true,
          title: true,
          captainId: true,
          lineupStructure: true,
          createdAt: true,
          defenseCount: true,
          allowExtraForward: true,
        },
      });
      if (!link) continue;
      const snapshot = buildMatchLineupSnapshot(link);
      resolved.push({
        kind: "MATCH_LINEUP",
        nominationId: null,
        snapshot,
        sortOrder: order++,
      });
    } else if (input.kind === "FANTASY_LINEUP") {
      const lineup = await prisma.msFantasyLineup.findFirst({
        where: { id: input.lineupId, userId },
        include: { gameDay: { select: { id: true, title: true } } },
      });
      if (!lineup) continue;
      const snapshot = buildFantasySnapshot({
        gameDayLabel: lineup.gameDay.title,
        pickIds: lineup.pickIds,
        pickTiers: lineup.pickTiers,
        salarySpent: lineup.salarySpent,
        createdAt: lineup.createdAt,
        gameDayId: lineup.gameDayId,
      });
      resolved.push({
        kind: "FANTASY_LINEUP",
        nominationId: null,
        snapshot,
        sortOrder: order++,
      });
    }
  }
  return resolved;
}
