import type { Metadata } from "next";
import { Suspense } from "react";
import { MatchLineupBuilderPage } from "@/components/match/MatchLineupBuilderPage";
import { SiteShell } from "@/components/site/SiteShell";
import { pageMetadata, PAGE_SEO } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(PAGE_SEO.matchEditor);

function SestavaFallback() {
  return null;
}

export default function MatchLineupBuilderRoute() {
  return (
    <SiteShell showFooter={false}>
      <Suspense fallback={<SestavaFallback />}>
        <MatchLineupBuilderPage />
      </Suspense>
    </SiteShell>
  );
}
