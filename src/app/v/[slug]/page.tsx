import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReadonlySquadBuilderView } from "@/components/ReadonlySquadBuilderView";
import { prisma } from "@/lib/prisma";
import { normalizeLineupStructure } from "@/lib/lineupUtils";
import { loadMs2026Candidates } from "@/lib/ms2026Candidates";
import type { LineupStructure } from "@/types";

type Props = {
  params: Promise<{ slug: string }>;
};

async function getNominationBySlug(slug: string) {
  const nomination = await prisma.nomination.findUnique({
    where: { slug },
  });
  if (!nomination) return null;

  const rawLineup = nomination.lineupStructure as LineupStructure | null;
  const lineupStructure = rawLineup ? normalizeLineupStructure(rawLineup) : null;

  return {
    kind: "nomination" as const,
    id: nomination.id,
    captainId: nomination.captainId,
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
    const all = loadMs2026Candidates();
    const captain = all.find((p) => p.id === nomData.captainId) ?? null;
    const captainName = captain?.name?.split(" ").pop() || "";
    const label = nomData.title?.trim() || "Má nominace";
    const ogImagePath = `/v/${encodeURIComponent(slug)}/opengraph-image`;

    return {
      title: `MS 2026 – ${label}${captainName ? ` (C: ${captainName})` : ""}`,
      description: `Sestava na Mistrovství světa v hokeji 2026.`,
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
  const players = loadMs2026Candidates();
  if (data?.lineupStructure) {
    return (
      <ReadonlySquadBuilderView
        title={data.title}
        players={players}
        captainId={data.captainId ?? null}
        lineupStructure={data.lineupStructure}
      />
    );
  }

  const row = await prisma.shareLink.findUnique({ where: { slug } });
  if (!row) notFound();

  const lineupStructure = normalizeLineupStructure(row.lineupStructure as unknown as LineupStructure);
  return (
    <ReadonlySquadBuilderView
      title={row.title}
      players={players}
      captainId={row.captainId ?? null}
      lineupStructure={lineupStructure}
    />
  );
}
