import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/site/SiteShell";
import { SitePageHero } from "@/components/site/SitePageHero";
import { ContestLeaderboardView } from "@/components/contest/ContestLeaderboardView";
import {
  SITE_OG_DEFAULT_IMAGE_HEIGHT,
  SITE_OG_DEFAULT_IMAGE_URL,
  SITE_OG_DEFAULT_IMAGE_WIDTH,
} from "@/lib/siteBranding";

export const metadata: Metadata = {
  title: "Žebříček nominace",
  description: "Výsledky nominační soutěže MS 2026 — body a pořadí účastníků.",
  alternates: { canonical: "/zebricek" },
  openGraph: {
    title: "Žebříček nominace",
    description: "Výsledky nominační soutěže MS 2026 — body a pořadí účastníků.",
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
    title: "Žebříček nominace",
    description: "Výsledky nominační soutěže MS 2026.",
    images: [SITE_OG_DEFAULT_IMAGE_URL],
  },
};

export default function ZebricekPage() {
  return (
    <SiteShell>
      <SitePageHero
        kicker="Nominační soutěž"
        title="Žebříček"
        subtitle="Body za shodu s oficiální soupiskou — včetně kapitána, asistentů a časového bonusu."
        align="center"
      />
      <main className="relative z-10 mx-auto max-w-2xl px-4 pb-24 pt-2 sm:px-6">
        <ContestLeaderboardView />
        <p className="mt-10 text-center text-sm text-white/55">
          <Link href="/" className="text-cyan-200/90 underline-offset-4 hover:underline">
            Zpět na úvod
          </Link>
        </p>
      </main>
    </SiteShell>
  );
}
