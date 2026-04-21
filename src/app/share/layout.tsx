import type { Metadata } from "next";

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
        url: "/share/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Lineup · Sestav si nominaci a vyhraj dres",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sestav si nominaci a vyhraj dres — Lineup",
    description:
      "Sestav nominaci českého týmu v editoru, sdílej odkaz s kamarády a sleduj soutěž o dres.",
    images: ["/share/opengraph-image"],
  },
};

export default function ShareLayout({ children }: { children: React.ReactNode }) {
  return children;
}
