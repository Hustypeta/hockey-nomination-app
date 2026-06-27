import type { Metadata } from "next";
import { FifaComingSoonContent } from "@/components/fifa/FifaComingSoonContent";
import { EXTRALIGA_DRAFT_FANTASY_TITLE } from "@/lib/fifa/extraligaDraftFantasy";

export const metadata: Metadata = { title: "Design náhled — Extraliga", robots: { index: false, follow: false } };

export default function DesignExtraligaPage() {
  return <FifaComingSoonContent title={EXTRALIGA_DRAFT_FANTASY_TITLE} subtitle="Soutěž připravujeme." />;
}
