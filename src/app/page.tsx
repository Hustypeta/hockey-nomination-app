import type { Metadata } from "next";
import { LandingContent } from "@/components/LandingContent";
import { SiteShell } from "@/components/site/SiteShell";

export const metadata: Metadata = {
  title: {
    absolute: "Sestav si nominaci na MS 2026 a vyhraj dres",
  },
  description:
    "Sestav si nominaci na MS 2026 a vyhraj dres — časový bonus, editor sestavy, plakát a Pick’em play-off. Soutěž pro fanoušky.",
};

export default function HomePage() {
  return (
    <SiteShell>
      <LandingContent />
    </SiteShell>
  );
}
