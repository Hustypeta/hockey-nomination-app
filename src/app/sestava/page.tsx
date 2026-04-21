import type { Metadata } from "next";
import { Suspense } from "react";
import { NominationBuilderPage } from "@/components/NominationBuilderPage";
import {
  SITE_OG_DEFAULT_IMAGE_HEIGHT,
  SITE_OG_DEFAULT_IMAGE_URL,
  SITE_OG_DEFAULT_IMAGE_WIDTH,
} from "@/lib/siteBranding";
import { SestavaLoadingFallback } from "./SestavaLoadingFallback";

export const metadata: Metadata = {
  title: "Sestav nominaci",
  description:
    "Sestav si nominaci českého týmu na MS 2026, ulož ji a zapoj se do soutěže o dres. Sdílej sestavu s kamarády.",
  openGraph: {
    title: "Sestav si nominaci a vyhraj dres — Lineup · MS 2026",
    description:
      "Vyber hráče v editoru, ulož nominaci a sdílej ji. Zapoj se do soutěže o hokejový dres.",
    url: "/sestava",
    images: [
      {
        url: SITE_OG_DEFAULT_IMAGE_URL,
        width: SITE_OG_DEFAULT_IMAGE_WIDTH,
        height: SITE_OG_DEFAULT_IMAGE_HEIGHT,
        alt: "Sestav si nominaci na MS 2026 a vyhraj dres — Lineup · hokejlineup.cz",
      },
    ],
    type: "website",
    locale: "cs_CZ",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sestav si nominaci a vyhraj dres — Lineup · MS 2026",
    description:
      "Vyber hráče v editoru, ulož nominaci a sdílej ji. Zapoj se do soutěže o hokejový dres.",
    images: [SITE_OG_DEFAULT_IMAGE_URL],
  },
};

export default function SestavaPage() {
  return (
    <Suspense fallback={<SestavaLoadingFallback />}>
      <NominationBuilderPage />
    </Suspense>
  );
}
