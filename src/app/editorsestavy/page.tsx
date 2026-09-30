import type { Metadata } from "next";
import { Suspense } from "react";
import { MatchLineupBuilderPage } from "@/components/match/MatchLineupBuilderPage";
import { SiteShell } from "@/components/site/SiteShell";
import { pageMetadata, PAGE_SEO } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(PAGE_SEO.matchEditor);

function EditorFallback() {
  return null;
}

export default function EditorSestavyPage() {
  return (
    <SiteShell showFooter={false}>
      <Suspense fallback={<EditorFallback />}>
        <MatchLineupBuilderPage />
      </Suspense>
    </SiteShell>
  );
}
