import type { Metadata } from "next";
import { SITE_OG_DEFAULT_IMAGE_URL } from "@/lib/siteBranding";

export const metadata: Metadata = {
  title: "Sdílená nominace",
  description:
    "Sestav si nominaci v editoru, sdílej odkaz a zapoj se do soutěže o dres — MS v hokeji 2026.",
  openGraph: {
    title: "Sestav si nominaci a vyhraj dres — Lineup",
    description:
      "Sestav nominaci českého týmu v editoru, sdílej odkaz s kamarády a sleduj soutěž o dres.",
    type: "website",
    locale: "cs_CZ",
    images: [
      {
        url: SITE_OG_DEFAULT_IMAGE_URL,
        width: 1200,
        height: 630,
        alt: "Sestav si nominaci na MS 2026 a vyhraj dres — Lineup · hokejlineup.cz",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sestav si nominaci a vyhraj dres — Lineup",
    description:
      "Sestav nominaci českého týmu v editoru, sdílej odkaz s kamarády a sleduj soutěž o dres.",
    images: [SITE_OG_DEFAULT_IMAGE_URL],
  },
};

export default function ShareLayout({ children }: { children: React.ReactNode }) {
  return children;
}
