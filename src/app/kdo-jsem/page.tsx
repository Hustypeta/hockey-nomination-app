import type { Metadata } from "next";
import { KdoJsemContent } from "@/components/KdoJsemContent";
import { SiteShell } from "@/components/site/SiteShell";
import { pageMetadata, PAGE_SEO } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(PAGE_SEO.kdoJsem);

export default function KdoJsemPage() {
  return (
    <SiteShell>
      <KdoJsemContent />
    </SiteShell>
  );
}
