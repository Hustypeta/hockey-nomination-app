import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sdílená nominace",
  description: "Podívej se na sestavu českého týmu na MS v hokeji 2026.",
  openGraph: {
    title: "MS 2026 — Sdílená nominace",
    description: "Podívej se na sestavu a porovnej ji se svou.",
    type: "website",
    locale: "cs_CZ",
  },
  twitter: {
    card: "summary_large_image",
    title: "MS 2026 — Sdílená nominace",
    description: "Podívej se na sestavu a porovnej ji se svou.",
  },
};

export default function ShareLayout({ children }: { children: React.ReactNode }) {
  return children;
}
