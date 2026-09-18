import type { Metadata } from "next";
import { SiteShell } from "@/components/site/SiteShell";
import { Suspense } from "react";
import { BracketPickemContent } from "@/components/bracket/BracketPickemContent";
import { LoadingScreenUsefulLinks } from "@/components/LoadingScreenUsefulLinks";
import { pageMetadata, PAGE_SEO } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(PAGE_SEO.bracket);

export default function BracketPage() {
  return (
    <SiteShell>
      <Suspense
        fallback={
          <div className="relative z-10 mx-auto max-w-4xl px-4 py-10 sm:py-14">
            <LoadingScreenUsefulLinks />
            <div className="mt-10 flex flex-col items-center justify-center gap-3 text-white/75">
              <span
                className="inline-block h-2 w-2 animate-pulse rounded-full bg-sky-400"
                aria-hidden
              />
              <p className="font-display text-sm font-semibold tracking-wide">Načítám bracket…</p>
              <div
                className="nhl25-moje-sestava-accent mx-auto mt-2 h-0.5 w-40 max-w-full rounded-full opacity-70"
                aria-hidden
              />
            </div>
          </div>
        }
      >
        <BracketPickemContent />
      </Suspense>
    </SiteShell>
  );
}
