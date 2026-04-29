import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SharePageClient } from "@/app/share/SharePageClient";
import { prisma } from "@/lib/prisma";
import { normalizeLineupStructure } from "@/lib/lineupUtils";
import type { SharePayload } from "@/lib/sharePayload";
import type { LineupStructure } from "@/types";

type Props = {
  params: Promise<{ code: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const row = await prisma.shareLink.findUnique({ where: { code }, select: { title: true } });
  if (!row) return { title: "Odkaz nenalezen" };

  const label = row.title?.trim() || "Sdílená nominace";
  const ogPath = `/l/${encodeURIComponent(code)}/opengraph-image`;

  return {
    title: `MS 2026 – ${label}`,
    description: "Soupiska z editoru Lineup — MS v hokeji 2026.",
    robots: { index: false, follow: true },
    openGraph: {
      title: `MS 2026 – ${label}`,
      description: "Sestava na Mistrovství světa v hokeji 2026",
      type: "website",
      images: [{ url: ogPath, width: 1200, height: 630, alt: label }],
    },
    twitter: {
      card: "summary_large_image",
      title: `MS 2026 – ${label}`,
      images: [ogPath],
    },
  };
}

export default async function ShortSharePage({ params }: Props) {
  const { code } = await params;
  const row = await prisma.shareLink.findUnique({ where: { code } });
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
