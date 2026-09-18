import type { Metadata } from "next";
import { FifaExtraligaDraftFantasyContent } from "@/components/fifa/FifaExtraligaDraftFantasyContent";
import { SiteShell } from "@/components/site/SiteShell";
import { pageMetadata, PAGE_SEO } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(PAGE_SEO.extraliga);

export default function SoutezeExtraligaPage() {
  return (
    <SiteShell>
      <FifaExtraligaDraftFantasyContent />
    </SiteShell>
  );
}
