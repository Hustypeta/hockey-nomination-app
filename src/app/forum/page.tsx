import type { Metadata } from "next";
import { Suspense } from "react";
import { SiteShell } from "@/components/site/SiteShell";
import { SitePageHero } from "@/components/site/SitePageHero";
import { BracketPickemComingSoon } from "@/components/bracket/BracketPickemComingSoon";
import { FifaForumContent } from "@/components/fifa/FifaForumContent";
import { isFifaDesignEnabled } from "@/lib/fifa/fifaDesignEnabled";

export const metadata: Metadata = {
  title: "Fórum",
  description: "Sdílení nominací, diskuze a reakce — připravujeme.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/forum" },
};

export default function ForumPage() {
  if (isFifaDesignEnabled()) {
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

  return (
    <SiteShell>
      <SitePageHero
        kicker="Komunita"
        title="Fórum"
        subtitle="Tady budou sdílené nominace, komentáře a lajky. Zatím připravujeme rozhraní."
        align="center"
      />
      <BracketPickemComingSoon />
    </SiteShell>
  );
}
