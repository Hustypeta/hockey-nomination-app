import type { Metadata } from "next";
import { LandingContent } from "@/components/LandingContent";
import { SocialCoverPage } from "@/components/social/SocialCoverPage";
import { SiteShell } from "@/components/site/SiteShell";
import {
  SITE_OG_DEFAULT_IMAGE_HEIGHT,
  SITE_OG_DEFAULT_IMAGE_URL,
  SITE_OG_DEFAULT_IMAGE_WIDTH,
} from "@/lib/siteBranding";

const homeOgDesc = "Editor sestavy, pick'em, fantasy a hodnocení hráčů.";

const homeMetadata: Metadata = {
  title: {
    absolute: "Lineup – hokejový editor sestavy",
  },
  description: homeOgDesc,
  alternates: {
    canonical: "/",
  },
  /** og:url + obrázek — explicitně pro Facebook Debugger na domovské URL */
  openGraph: {
    type: "website",
    locale: "cs_CZ",
    url: "/",
    siteName: "Lineup",
    title: "Lineup – hokejový editor sestavy",
    description: homeOgDesc,
    images: [
      {
        url: SITE_OG_DEFAULT_IMAGE_URL,
        width: SITE_OG_DEFAULT_IMAGE_WIDTH,
        height: SITE_OG_DEFAULT_IMAGE_HEIGHT,
        alt: "Sestav si nominaci na MS 2026 a vyhraj dres — Lineup · hokejlineup.cz",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lineup – hokejový editor sestavy",
    description: homeOgDesc,
    images: [SITE_OG_DEFAULT_IMAGE_URL],
  },
};

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ cover?: string }>;
}): Promise<Metadata> {
  const { cover } = await searchParams;
  if (cover === "true" || cover === "1") {
    return {
      title: { absolute: "Cover — Lineup MS 2026" },
      description: "Statické plátno pro snímek obrazovky — Facebook cover.",
      robots: { index: false, follow: false },
    };
  }
  return homeMetadata;
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ cover?: string }>;
}) {
  const { cover } = await searchParams;
  if (cover === "true" || cover === "1") {
    return <SocialCoverPage />;
  }

  return (
    <SiteShell>
      <LandingContent />
    </SiteShell>
  );
}
