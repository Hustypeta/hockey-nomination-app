import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { Player } from "@/types";
import { NominationView } from "./NominationView";

type Props = {
  params: Promise<{ id: string }>;
};

async function getNomination(id: string) {
  const nomination = await prisma.nomination.findUnique({
    where: { id },
  });
  if (!nomination) return null;

  const players = await prisma.player.findMany({
    where: { id: { in: nomination.selectedPlayerIds } },
  });
  const orderedPlayers = nomination.selectedPlayerIds
    .map((pid) => players.find((p) => p.id === pid))
    .filter(Boolean) as Player[];

  const lineupStructure = nomination.lineupStructure as import("@/types").LineupStructure | null;

  return {
    id: nomination.id,
    captainId: nomination.captainId,
    players: orderedPlayers,
    lineupStructure: lineupStructure ?? null,
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

  if (!data) notFound();

  return (
    <NominationView
      players={data.players}
      captainId={data.captainId}
      lineupStructure={data.lineupStructure}
      nominationId={id}
    />
  );
}
