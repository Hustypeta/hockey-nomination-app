import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/site/SiteShell";
import { SitePageHero } from "@/components/site/SitePageHero";
import {
  SITE_OG_DEFAULT_IMAGE_HEIGHT,
  SITE_OG_DEFAULT_IMAGE_URL,
  SITE_OG_DEFAULT_IMAGE_WIDTH,
} from "@/lib/siteBranding";

export const metadata: Metadata = {
  title: "Upozornění",
  description: "Informace k předešlému zobrazení výsledků.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/zebricek" },
  openGraph: {
    title: "Upozornění",
    description: "Informace k předešlému zobrazení výsledků.",
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
    title: "Upozornění",
    description: "Informace k předešlému zobrazení výsledků.",
    images: [SITE_OG_DEFAULT_IMAGE_URL],
  },
};

export default function ZebricekNoticePage() {
  return (
    <SiteShell>
      <SitePageHero
        kicker="Informace"
        title="Upozornění"
        subtitle="Tato adresa sloužila jen k dočasnému sdělení."
        align="center"
      />
      <main className="relative z-10 mx-auto max-w-3xl px-4 pb-24 pt-2 sm:px-6">
        <div
          className="rounded-2xl border border-amber-400/35 bg-amber-500/10 px-4 py-5 text-center text-sm leading-relaxed text-amber-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:px-8 sm:text-[15px] sm:leading-snug"
          role="status"
        >
          Omlouváme se — žebříček, který byl zveřejněn, nebyl platný; jednalo se pouze o test.
        </div>
        <p className="mt-8 text-center text-sm text-white/55">
          <Link href="/" className="text-cyan-200/90 underline-offset-4 hover:underline">
            Zpět na úvod
          </Link>
        </p>
      </main>
    </SiteShell>
  );
}
