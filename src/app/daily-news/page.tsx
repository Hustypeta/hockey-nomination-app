import type { Metadata } from "next";
import { FifaDailyNewsPage } from "@/components/fifa/FifaDailyNewsPage";
import { SiteShell } from "@/components/site/SiteShell";
import { pageMetadata, PAGE_SEO } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(PAGE_SEO.dailyNews);

export default function DailyNewsPage() {
  return (
    <SiteShell>
      <FifaDailyNewsPage />
    </SiteShell>
  );
}
