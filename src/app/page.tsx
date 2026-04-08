import type { Metadata } from "next";
import { LandingContent } from "@/components/LandingContent";

export const metadata: Metadata = {
  title: "MS 2026 | Sestav si nominaci na hokejové mistrovství světa",
  description:
    "Interaktivní sestavovač české nominace na MS v hokeji 2026. Lajny, plakát, sdílení na sítích. Uložení v účtu přes Google.",
};

export default function HomePage() {
  return <LandingContent />;
}
