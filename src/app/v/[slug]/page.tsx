import { Metadata } from "next";
import { notFound } from "next/navigation";
import { NominationView } from "@/app/nominations/[id]/NominationView";
import { prisma } from "@/lib/prisma";
import { normalizeLineupStructure } from "@/lib/lineupUtils";
import { resolvePlayersByIds } from "@/lib/resolveNominationPlayers";
import type { LineupStructure } from "@/types";

type Props = {
  params: Promise<{ slug: string }>;
};

async function getNominationBySlug(slug: string) {
  const nomination = await prisma.nomination.findUnique({
    where: { slug },
  });
  if (!nomination) return null;

  const orderedPlayers = await resolvePlayersByIds(nomination.selectedPlayerIds);

  const rawLineup = nomination.lineupStructure as LineupStructure | null;
  const lineupStructure = rawLineup ? normalizeLineupStructure(rawLineup) : null;

  return {
    id: nomination.id,
    captainId: nomination.captainId,
    players: orderedPlayers,
    lineupStructure,
    createdAt: nomination.createdAt,
    timeBonusPercent: nomination.timeBonusPercent,
    title: nomination.title,
    slug: nomination.slug,
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getNominationBySlug(slug);
  if (!data) return { title: "Nominace nenalezena" };

  const captain = data.players?.find((p: { id: string } | undefined) => p?.id === data.captainId);
  const captainName = captain?.name?.split(" ").pop() || "";

  const label = data.title?.trim() || "Má nominace";
  const ogImagePath = `/v/${encodeURIComponent(slug)}/opengraph-image`;

  return {
    title: `MS 2026 – ${label}${captainName ? ` (C: ${captainName})` : ""}`,
    description: `Sestava na Mistrovství světa v hokeji 2026. ${data.players?.length || 0} hráčů.`,
    openGraph: {
      title: `MS 2026 – ${label}`,
      description: `Sestava na Mistrovství světa v hokeji 2026`,
      type: "website",
      images: [{ url: ogImagePath, width: 1200, height: 630, alt: label }],
    },
    twitter: {
      card: "summary_large_image",
      title: `MS 2026 – ${label}`,
      description: `Sestava na Mistrovství světa v hokeji 2026`,
      images: [ogImagePath],
    },
  };
}

export default async function NominationBySlugPage({ params }: Props) {
  const { slug } = await params;
  const data = await getNominationBySlug(slug);

  if (!data) notFound();

  return (
    <NominationView
      players={data.players}
      captainId={data.captainId}
      lineupStructure={data.lineupStructure}
      nominationId={data.id}
      title={data.title}
      allowDownload
      linkToCopy={
        typeof process.env.NEXT_PUBLIC_SITE_URL === "string" && process.env.NEXT_PUBLIC_SITE_URL
          ? `${process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")}/v/${slug}`
          : undefined
      }
    />
  );
}
