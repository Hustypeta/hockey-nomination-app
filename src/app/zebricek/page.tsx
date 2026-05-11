import type { Metadata } from "next";
import Link from "next/link";
import { ContestNominationLeaderboardBlock } from "@/components/contest/ContestNominationLeaderboardBlock";
import { SiteShell } from "@/components/site/SiteShell";
import { SitePageHero } from "@/components/site/SitePageHero";
import {
  SITE_OG_DEFAULT_IMAGE_HEIGHT,
  SITE_OG_DEFAULT_IMAGE_URL,
  SITE_OG_DEFAULT_IMAGE_WIDTH,
} from "@/lib/siteBranding";

export const metadata: Metadata = {
  title: "Žebříček",
  description:
    "Žebříček sestavovací soutěže a Pick’em — výsledky po zveřejnění oficiální soupisky a vyhodnocení.",
  alternates: { canonical: "/zebricek" },
  openGraph: {
    title: "Žebříček",
    description:
      "Žebříček sestavovací soutěže a Pick’em — výsledky po zveřejnění oficiální soupisky a vyhodnocení.",
    url: "/zebricek",
    type: "website",
    locale: "cs_CZ",
    images: [
      {
        url: SITE_OG_DEFAULT_IMAGE_URL,
        width: SITE_OG_DEFAULT_IMAGE_WIDTH,
        height: SITE_OG_DEFAULT_IMAGE_HEIGHT,
        alt: "Lineup · hokejlineup.cz",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Žebříček",
    description:
      "Žebříček sestavovací soutěže a Pick’em — výsledky po zveřejnění oficiální soupisky a vyhodnocení.",
    images: [SITE_OG_DEFAULT_IMAGE_URL],
  },
};

export default function LeaderboardHubPage() {
  return (
    <SiteShell>
      <SitePageHero
        kicker="Výsledky"
        title="Žebříček"
        subtitle="Nominace a Pick’em — žebříček bodů až po zveřejnění oficiální soupisky a vyhodnocení (prázdná stránka ≠ špatný tip)."
        align="center"
      />
      <main className="relative z-10 mx-auto max-w-3xl px-4 pb-24 pt-2 sm:px-6">
        <div
          className="mb-6 rounded-2xl border border-amber-400/35 bg-amber-500/10 px-4 py-4 text-center text-sm leading-relaxed text-amber-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:px-6 sm:text-[15px] sm:leading-snug"
          role="status"
        >
          Omlouváme se — žebříček, který byl zveřejněn, nebyl platný; jednalo se pouze o test.
        </div>
        <section
          id="sestavovaci-soutez"
          className="scroll-mt-28 rounded-2xl border border-white/[0.08] bg-black/20 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:p-8"
        >
          <ContestNominationLeaderboardBlock />
        </section>

        <section
          id="pickem"
          className="mt-10 scroll-mt-28 rounded-2xl border border-white/[0.08] bg-black/20 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:mt-12 sm:p-8"
        >
          <p className="font-display text-[10px] font-bold uppercase tracking-[0.28em] text-sky-300/85">Pick’em</p>
          <h2 className="mt-2 font-display text-xl font-bold text-white sm:text-2xl">Play-off MS 2026</h2>
          <p className="mt-3 text-sm leading-relaxed text-white/65">
            <span className="text-white/80">Stejný princip jako u nominace:</span> dokud nejsou dohrané zápasy a nastavené
            body, žebříček tipérů tu nemusí být — <strong className="font-semibold text-white/90">neznamená to, že byl
            špatný tip</strong>, jen ještě neproběhlo vyhodnocení podle bracketu.
          </p>
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
