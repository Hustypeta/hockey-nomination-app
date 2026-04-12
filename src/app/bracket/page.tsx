import type { Metadata } from "next";
import { Suspense } from "react";
import { SiteShell } from "@/components/site/SiteShell";
import { BracketPickemContent } from "@/components/bracket/BracketPickemContent";

export const metadata: Metadata = {
  title: "Bracket Pick’em — playoff MS 2026",
  description:
    "Vyplň si tip na play-off MS v hokeji 2026: vítězové skupin, čtvrtfinále, semifinále, finále, bronz a bonusové otázky. Zdarma, ukládání v prohlížeči.",
};

function BracketFallback() {
  return (
    <div className="relative z-10 mx-auto max-w-3xl px-4 py-24 text-center text-sm text-white/50">
      Načítám bracket…
    </div>
  );
}

export default function BracketPage() {
  return (
    <SiteShell>
      <Suspense fallback={<BracketFallback />}>
        <BracketPickemContent />
      </Suspense>
    </SiteShell>
  );
}
