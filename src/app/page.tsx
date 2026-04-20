import type { Metadata } from "next";
import { LandingContent } from "@/components/LandingContent";
import { SiteShell } from "@/components/site/SiteShell";

export const metadata: Metadata = {
  title: {
    absolute: "Lineup",
  },
  description:
    "Časový bonus, editor sestavy, plakát a Pick’em play-off. Soutěž pro fanoušky.",
};

export default function HomePage() {
  return (
    <SiteShell>
      <LandingContent />
    </SiteShell>
  );
}
