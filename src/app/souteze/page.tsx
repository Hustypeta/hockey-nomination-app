import type { Metadata } from "next";
import { SiteShell } from "@/components/site/SiteShell";
import { pageMetadata, PAGE_SEO } from "@/lib/seo";
import { FifaSoutezeHubContent } from "@/components/fifa/FifaSoutezeHubContent";

export const metadata: Metadata = pageMetadata(PAGE_SEO.souteze);

export default function SoutezePage() {
  return (
    <SiteShell>
      <FifaSoutezeHubContent />
    </SiteShell>
  );
}
