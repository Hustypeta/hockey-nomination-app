import type { Metadata } from "next";
import { SiteShell } from "@/components/site/SiteShell";
import { Suspense } from "react";
import { BracketPickemContent } from "@/components/bracket/BracketPickemContent";

export const metadata: Metadata = {
  title: "Pick’em",
  description: "Bracket Pick’em pro MS 2026. Vyplň tipy play-off a sdílej je odkazem.",
};

export default function BracketPage() {
  return (
    <SiteShell>
      <Suspense
        fallback={
          <div className="relative z-10 mx-auto max-w-3xl px-4 py-24 text-center">
            <p className="font-display text-sm tracking-wide text-white/55">Načítám bracket…</p>
            <div
              className="nhl25-moje-sestava-accent mx-auto mt-5 h-0.5 w-32 max-w-full rounded-full opacity-70"
              aria-hidden
            />
          </div>
        }
      >
        <BracketPickemContent />
      </Suspense>
    </SiteShell>
  );
}
