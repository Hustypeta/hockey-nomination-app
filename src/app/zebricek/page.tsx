import type { Metadata } from "next";
import Link from "next/link";
import { ContestNominationLeaderboardBlock } from "@/components/contest/ContestNominationLeaderboardBlock";
import { PickemLeaderboardSection } from "@/components/zebricek/PickemLeaderboardSection";
import { SiteShell } from "@/components/site/SiteShell";
import { SitePageHero } from "@/components/site/SitePageHero";
import { CONTEST_DEADLINE_CS } from "@/lib/contestTimeBonus";

export const metadata: Metadata = {
  title: "Žebříček",
  description: "Žebříček sestavovací soutěže a Pick’em MS 2026.",
};

export default function LeaderboardHubPage() {
  return (
    <SiteShell>
      <SitePageHero
        kicker="Výsledky"
        title="Žebříček"
        subtitle="Sestavovací soutěž (nominace) a Pick’em play-off — na jedné stránce."
        align="center"
      />
      <main className="relative z-10 mx-auto max-w-3xl px-4 pb-24 pt-2 sm:px-6">
        <section
          id="sestavovaci-soutez"
          className="scroll-mt-28 rounded-2xl border border-white/[0.08] bg-black/20 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:p-8"
        >
          <p className="font-display text-[10px] font-bold uppercase tracking-[0.28em] text-[#f1c40f]/85">
            Sestavovací soutěž
          </p>
          <h2 className="mt-2 font-display text-xl font-bold text-white sm:text-2xl">Nominace na MS</h2>
          <p className="mt-2 text-xs text-white/50">
            Platí pravidla sestavovací soutěže — uzávěrka odeslání nominací {CONTEST_DEADLINE_CS}. Po zveřejnění
            oficiální soupisky se zde zobrazí body všech zapojených účastníků.
          </p>
          <ContestNominationLeaderboardBlock className="mt-5" />
        </section>

        <section
          id="pickem"
          className="mt-10 scroll-mt-28 rounded-2xl border border-white/[0.08] bg-black/20 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:mt-12 sm:p-8"
        >
          <p className="font-display text-[10px] font-bold uppercase tracking-[0.28em] text-sky-300/85">
            Pick’em
          </p>
          <h2 className="mt-2 font-display text-xl font-bold text-white sm:text-2xl">Play-off MS 2026</h2>
          <PickemLeaderboardSection />
        </section>

        <p className="mt-12 text-center text-sm text-white/55">
          <Link href="/pravidla-souteze" className="text-cyan-200/90 underline-offset-4 hover:underline">
            Pravidla soutěže
          </Link>
          {" · "}
          <Link href="/" className="text-white/45 underline-offset-4 hover:text-white/75 hover:underline">
            Úvod
          </Link>
        </p>
      </main>
    </SiteShell>
  );
}
