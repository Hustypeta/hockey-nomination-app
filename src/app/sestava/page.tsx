import type { Metadata } from "next";
import { Suspense } from "react";
import { NominationBuilderPage } from "@/components/NominationBuilderPage";
import { SiteShell } from "@/components/site/SiteShell";
import { pageMetadata, PAGE_SEO } from "@/lib/seo";
import { SestavaLoadingFallback } from "./SestavaLoadingFallback";

export const metadata: Metadata = pageMetadata(PAGE_SEO.sestava);

export default function SestavaPage() {
  return (
    <SiteShell showFooter={false}>
      <Suspense fallback={<SestavaLoadingFallback />}>
        <NominationBuilderPage />
      </Suspense>
    </SiteShell>
  );
}
