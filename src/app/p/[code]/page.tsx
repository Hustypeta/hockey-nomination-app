import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { BracketPickemPayload } from "@/types/bracketPickem";
import { SiteShell } from "@/components/site/SiteShell";
import { BracketPickemContent } from "@/components/bracket/BracketPickemContent";

type Props = {
  params: Promise<{ code: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const row = await prisma.shareLink.findUnique({ where: { code }, select: { title: true } });
  if (!row) return { title: "Odkaz nenalezen" };
  return {
    title: "Pick’em · sdílené tipy",
    description: "Sdílené tipy Pick’em — MS v hokeji 2026.",
    robots: { index: false, follow: true },
  };
}

export default async function PickemShortSharePage({ params }: Props) {
  const { code } = await params;
  const row = await prisma.shareLink.findUnique({ where: { code } });
  if (!row) notFound();

  const payload = row.lineupStructure as unknown as BracketPickemPayload;
  return (
    <SiteShell>
      <BracketPickemContent initialPayload={payload} />
    </SiteShell>
  );
}

