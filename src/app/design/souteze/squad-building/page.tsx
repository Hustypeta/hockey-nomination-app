import type { Metadata } from "next";
import { FifaComingSoonContent } from "@/components/fifa/FifaComingSoonContent";

export const metadata: Metadata = { title: "Design náhled — Squad building", robots: { index: false, follow: false } };

export default function DesignSquadBuildingPage() {
  return <FifaComingSoonContent title="Squad building challenge" />;
}
