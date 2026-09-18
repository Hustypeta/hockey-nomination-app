import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SiteShell } from "@/components/site/SiteShell";
import { SitePageHero } from "@/components/site/SitePageHero";
import { ZebricekPageContent } from "@/components/contest/ZebricekPageContent";
import { ZebricekHubContent } from "@/components/zebricek/ZebricekHubContent";
import { isFifaDesignEnabled } from "@/lib/fifa/fifaDesignEnabled";
import { pageMetadata, PAGE_SEO } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(PAGE_SEO.zebricek);

export default function ZebricekPage() {
  if (isFifaDesignEnabled()) {
    return (
      <SiteShell>
        <Suspense fallback={<p className="py-16 text-center text-sm text-slate-500">Načítám žebříčky…</p>}>
          <ZebricekHubContent />
        </Suspense>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <SitePageHero kicker="MS 2026" title="Žebříček soutěží" align="center" />
      <main className="relative z-10 mx-auto max-w-2xl px-4 pb-24 pt-2 sm:px-6">
        <Suspense fallback={<p className="py-16 text-center text-sm text-white/55">Načítám žebříčky…</p>}>
          <ZebricekPageContent />
        </Suspense>
        <p className="mt-10 text-center text-sm text-white/55">
          <Link href="/" className="text-cyan-200/90 underline-offset-4 hover:underline">
            Zpět na úvod
          </Link>
        </p>
      </main>
    </SiteShell>
  );
}
