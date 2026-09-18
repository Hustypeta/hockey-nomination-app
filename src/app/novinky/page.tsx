import type { Metadata } from "next";
import { FifaNovinkyPage } from "@/components/fifa/FifaNovinkyPage";
import { SiteShell } from "@/components/site/SiteShell";
import { pageMetadata, PAGE_SEO } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(PAGE_SEO.novinky);

export default function NovinkyPage() {
  return (
    <SiteShell>
      <FifaNovinkyPage />
    </SiteShell>
  );
}
