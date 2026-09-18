import type { Metadata } from "next";
import { FifaHistoricalLineupContent } from "@/components/fifa/FifaHistoricalLineupContent";
import { SiteShell } from "@/components/site/SiteShell";
import { pageMetadata, PAGE_SEO } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(PAGE_SEO.historical);

export default function SoutezeHistoricalLineupPage() {
  return (
    <SiteShell>
      <FifaHistoricalLineupContent />
    </SiteShell>
  );
}
