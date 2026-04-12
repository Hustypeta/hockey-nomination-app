import type { Metadata } from "next";
import { LandingContent } from "@/components/LandingContent";
import { SiteShell } from "@/components/site/SiteShell";

export const metadata: Metadata = {
  title: "MS 2026 | Sestav nominaci, vyhraj dres — soutěž pro fanoušky",
  description:
    "Sestav si českou soupisku na MS 2026, využij časový bonus a zúčastni se soutěže o hokejový dres. Editor sestavy, plakát, Pick’em play-off.",
};

export default function HomePage() {
  return (
    <SiteShell>
      <LandingContent />
    </SiteShell>
  );
}
