import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizeLineupStructure } from "@/lib/lineupUtils";
import { resolvePlayersByIds } from "@/lib/resolveNominationPlayers";
import { NominationView } from "./NominationView";

type Props = {
  params: Promise<{ id: string }>;
};

async function getNomination(id: string) {
  const nomination = await prisma.nomination.findUnique({
    where: { id },
  });
  if (!nomination) return null;

  const orderedPlayers = await resolvePlayersByIds(nomination.selectedPlayerIds);

  const rawLineup = nomination.lineupStructure as import("@/types").LineupStructure | null;
  const lineupStructure = rawLineup ? normalizeLineupStructure(rawLineup) : null;

  return {
    id: nomination.id,
    captainId: nomination.captainId,
    players: orderedPlayers,
    lineupStructure,
    createdAt: nomination.createdAt,
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const data = await getNomination(id);
  if (!data) return { title: "Nominace nenalezena" };

  const captain = data.players?.find(
    (p: { id: string } | undefined) => p?.id === data.captainId
  );
  const captainName = captain?.name?.split(" ").pop() || "";

  return {
    title: `MS 2026 – Nominace${captainName ? ` (C: ${captainName})` : ""}`,
    description: `Sestava na Mistrovství světa v hokeji 2026. ${data.players?.length || 0} hráčů.`,
    openGraph: {
      title: `MS 2026 – Má nominace`,
      description: `Sestava na Mistrovství světa v hokeji 2026`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `MS 2026 – Má nominace`,
      description: `Sestava na Mistrovství světa v hokeji 2026`,
    },
  };
}

export default async function NominationPage({ params }: Props) {
  const { id } = await params;
  const data = await getNomination(id);
  const session = await getServerSession(authOptions);

  if (!data) notFound();

  return (
    <NominationView
      players={data.players}
      captainId={data.captainId}
      lineupStructure={data.lineupStructure}
      nominationId={id}
      allowDownload={!!session}
    />
  );
}
