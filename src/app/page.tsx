import type { Metadata } from "next";
import { FifaHomeContent } from "@/components/fifa/FifaHomeContent";
import { LandingContent } from "@/components/LandingContent";
import { SiteShell } from "@/components/site/SiteShell";
import { isFifaDesignEnabled } from "@/lib/fifa/fifaDesignEnabled";
import { loadHomeDashboard } from "@/lib/home/loadHomeDashboard";
import { pageMetadata, PAGE_SEO } from "@/lib/seo";

export const revalidate = 3600;

export const metadata: Metadata = pageMetadata({
  ...PAGE_SEO.home,
  absoluteTitle: true,
});

export default async function HomePage() {
  const fifa = isFifaDesignEnabled();
  const dashboard = fifa ? await loadHomeDashboard() : null;

  return (
    <SiteShell>
      {fifa && dashboard ? <FifaHomeContent dashboard={dashboard} /> : <LandingContent />}
    </SiteShell>
  );
}
