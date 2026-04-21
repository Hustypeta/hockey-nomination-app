import type { Metadata } from "next";
import { LandingContent } from "@/components/LandingContent";
import { SocialCoverPage } from "@/components/social/SocialCoverPage";
import { SiteShell } from "@/components/site/SiteShell";

const homeMetadata: Metadata = {
  title: {
    absolute: "Lineup",
  },
  description:
    "Časový bonus, editor sestavy, plakát a Pick’em play-off. Soutěž pro fanoušky.",
};

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ cover?: string }>;
}): Promise<Metadata> {
  const { cover } = await searchParams;
  if (cover === "true" || cover === "1") {
    return {
      title: { absolute: "Cover — Lineup MS 2026" },
      description: "Statické plátno pro snímek obrazovky — Facebook cover.",
      robots: { index: false, follow: false },
    };
  }
  return homeMetadata;
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ cover?: string }>;
}) {
  const { cover } = await searchParams;
  if (cover === "true" || cover === "1") {
    return <SocialCoverPage />;
  }

  return (
    <SiteShell>
      <LandingContent />
    </SiteShell>
  );
}
