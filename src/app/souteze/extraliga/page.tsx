import type { Metadata } from "next";
import { FifaExtraligaDraftFantasyContent } from "@/components/fifa/FifaExtraligaDraftFantasyContent";
import { EXTRALIGA_DRAFT_FANTASY_TITLE } from "@/lib/fifa/extraligaDraftFantasy";
import { SiteShell } from "@/components/site/SiteShell";

export const metadata: Metadata = {
  title: EXTRALIGA_DRAFT_FANTASY_TITLE,
};

export default function SoutezeExtraligaPage() {
  return (
    <SiteShell>
      <FifaExtraligaDraftFantasyContent />
    </SiteShell>
  );
}
