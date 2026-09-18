import type { Metadata } from "next";
import { Suspense } from "react";
import { SiteShell } from "@/components/site/SiteShell";
import { FifaForumContent } from "@/components/fifa/FifaForumContent";
import { pageMetadata, PAGE_SEO } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(PAGE_SEO.forum);

export default function ForumPage() {
  return (
    <SiteShell>
      <Suspense
        fallback={
          <div className="flex h-full min-h-[40vh] items-center justify-center text-slate-500">
            Načítám fórum…
          </div>
        }
      >
        <FifaForumContent />
      </Suspense>
    </SiteShell>
  );
}
