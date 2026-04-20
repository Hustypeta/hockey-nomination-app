import type { Metadata } from "next";
import { SharePageClient } from "./SharePageClient";

const ogTitle = "Sdílená nominace — LineUp · MS 2026";
const ogDescription =
  "Otevři odkaz a zobrazí se celá soupiska českého národního týmu z fanouškovského editoru.";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ z?: string }>;
}): Promise<Metadata> {
  const { z } = await searchParams;
  const hasPayload = Boolean(z?.length);
  return {
    title: ogTitle,
    description: ogDescription,
    openGraph: {
      title: ogTitle,
      description: hasPayload ? ogDescription : "LineUp — editor nominace na MS 2026.",
      images: [
        {
          url: "/share/opengraph-image",
          width: 1200,
          height: 630,
          alt: "LineUp — nominace",
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
