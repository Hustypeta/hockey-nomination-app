import type { Metadata } from "next";
import { SITE_OG_DEFAULT_IMAGE_URL } from "@/lib/siteBranding";
import { SharePageClient } from "./SharePageClient";

const ogTitle = "Sestav si nominaci a vyhraj dres — Lineup · MS 2026";
const ogDescription =
  "Sestav si nominaci v editoru, sdílej odkaz s kamarády a zapoj se do soutěže o dres.";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ z?: string }>;
}): Promise<Metadata> {
  await searchParams;
  return {
    title: ogTitle,
    description: ogDescription,
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: "/share",
      images: [
        {
          url: SITE_OG_DEFAULT_IMAGE_URL,
          width: 1200,
          height: 630,
          alt: "Sestav si nominaci na MS 2026 a vyhraj dres — Lineup · hokejlineup.cz",
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
      images: [SITE_OG_DEFAULT_IMAGE_URL],
    },
  };
}

export default async function SharePage({
  searchParams,
}: {
  searchParams: Promise<{ z?: string }>;
}) {
  const { z } = await searchParams;
  return <SharePageClient initialZ={z ?? null} />;
}
