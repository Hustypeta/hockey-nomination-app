import type { Metadata } from "next";
import { ContestRulesContent } from "@/components/ContestRulesContent";
import { SiteShell } from "@/components/site/SiteShell";
import { pageMetadata, PAGE_SEO } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(PAGE_SEO.pravidla);

export default function PravidlaSoutezePage() {
  return (
    <SiteShell>
      <ContestRulesContent />
    </SiteShell>
  );
}
