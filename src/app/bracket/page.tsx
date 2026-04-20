import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { SiteShell } from "@/components/site/SiteShell";
import { BracketPickemComingSoon } from "@/components/bracket/BracketPickemComingSoon";
import { authOptions } from "@/lib/auth";

/**
 * Plný Pick’em je zatím vypnutý — kód žije v {@link BracketPickemContent}.
 * Obnovení: import Suspense + BracketPickemContent, v default exportu místo ComingSoon
 * vrátit <Suspense fallback={…}><BracketPickemContent /></Suspense>.
 */
// import { Suspense } from "react";
// import { BracketPickemContent } from "@/components/bracket/BracketPickemContent";

export const metadata: Metadata = {
  title: "Pick’em — připravujeme",
  description: "Bracket Pick’em pro MS 2026 připravujeme. Brzy doplníme tipování play-off.",
};

export default async function BracketPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect(`/api/auth/signin?callbackUrl=${encodeURIComponent("/bracket")}`);
  }

  return (
    <SiteShell>
      <BracketPickemComingSoon />
    </SiteShell>
  );
}

/*
function BracketFallback() {
  return (
    <div className="relative z-10 mx-auto max-w-3xl px-4 py-24 text-center">
      <p className="font-display text-sm tracking-wide text-white/55">Načítám bracket…</p>
      <div className="nhl25-moje-sestava-accent mx-auto mt-5 h-0.5 w-32 max-w-full rounded-full opacity-70" aria-hidden />
    </div>
  );
}

export default function BracketPageFull() {
  return (
    <SiteShell>
      <Suspense fallback={<BracketFallback />}>
        <BracketPickemContent />
      </Suspense>
    </SiteShell>
  );
}
*/
