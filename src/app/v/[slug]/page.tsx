import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NominationView } from "@/app/nominations/[id]/NominationView";
import { SharePageClient } from "@/app/share/SharePageClient";
import { prisma } from "@/lib/prisma";
import { normalizeLineupStructure } from "@/lib/lineupUtils";
import { resolvePlayersByIds } from "@/lib/resolveNominationPlayers";
import type { SharePayload } from "@/lib/sharePayload";
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
    kind: "nomination" as const,
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

  const nomData = await getNominationBySlug(slug);
  if (nomData) {
    const captain = nomData.players?.find((p) => p?.id === nomData.captainId);
    const captainName = captain?.name?.split(" ").pop() || "";
    const label = nomData.title?.trim() || "Má nominace";
    const ogImagePath = `/v/${encodeURIComponent(slug)}/opengraph-image`;

    return {
      title: `MS 2026 – ${label}${captainName ? ` (C: ${captainName})` : ""}`,
      description: `Sestava na Mistrovství světa v hokeji 2026. ${nomData.players?.length || 0} hráčů.`,
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

  const shareRow = await prisma.shareLink.findUnique({
    where: { slug },
    select: { title: true },
  });
  if (!shareRow) return { title: "Nominace nenalezena" };

  const label = shareRow.title?.trim() || "Sdílená nominace";
  const ogImagePath = `/v/${encodeURIComponent(slug)}/opengraph-image`;

  return {
    title: `MS 2026 – ${label}`,
    description: "Soupiska z editoru Lineup — MS v hokeji 2026.",
    openGraph: {
      title: `MS 2026 – ${label}`,
      description: "Sestava na Mistrovství světa v hokeji 2026",
      type: "website",
      images: [{ url: ogImagePath, width: 1200, height: 630, alt: label }],
    },
    twitter: {
      card: "summary_large_image",
      title: `MS 2026 – ${label}`,
      images: [ogImagePath],
    },
  };
}

export default async function NominationBySlugPage({ params }: Props) {
  const { slug } = await params;

  const data = await getNominationBySlug(slug);
  if (data) {
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

  const row = await prisma.shareLink.findUnique({ where: { slug } });
  if (!row) notFound();

  const lineupStructure = normalizeLineupStructure(row.lineupStructure as unknown as LineupStructure);
  const payload: SharePayload = {
    v: 1,
    captainId: row.captainId,
    lineupStructure,
  };

  return (
    <SharePageClient
      initialZ={null}
      initialPayload={payload}
      nominationTitle={row.title}
    />
  );
}
