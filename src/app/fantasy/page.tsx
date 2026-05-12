import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MsFantasyHome } from "@/components/ms-fantasy/MsFantasyHome";
import { SiteShell } from "@/components/site/SiteShell";
import {
  SITE_OG_DEFAULT_IMAGE_HEIGHT,
  SITE_OG_DEFAULT_IMAGE_URL,
  SITE_OG_DEFAULT_IMAGE_WIDTH,
} from "@/lib/siteBranding";
import { isMsFantasyVisibleToUsers } from "@/lib/msFantasyConfig";

export const metadata: Metadata = {
  title: "Fantasy MS",
  description: "Fantasy nominace hráče na každý hrací den mistrovství světa.",
  alternates: { canonical: "/fantasy" },
  openGraph: {
    title: "Fantasy MS",
    description: "Fantasy nominace hráče na každý hrací den mistrovství světa.",
    url: "/fantasy",
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
    title: "Fantasy MS",
    description: "Fantasy nominace hráče na každý hrací den mistrovství světa.",
    images: [SITE_OG_DEFAULT_IMAGE_URL],
  },
};

export default function FantasyIndexPage() {
  if (!isMsFantasyVisibleToUsers()) notFound();

  return (
    <SiteShell>
      <MsFantasyHome />
    </SiteShell>
  );
}
