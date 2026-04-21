import type { Metadata } from "next";
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
      images: [
        {
          url: "/share/opengraph-image",
          width: 1200,
          height: 630,
          alt: "Lineup · Sestav si nominaci a vyhraj dres",
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
      images: ["/share/opengraph-image"],
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
