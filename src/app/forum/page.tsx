import type { Metadata } from "next";
import { SiteShell } from "@/components/site/SiteShell";
import { SitePageHero } from "@/components/site/SitePageHero";
import { BracketPickemComingSoon } from "@/components/bracket/BracketPickemComingSoon";

export const metadata: Metadata = {
  title: "Fórum",
  description: "Sdílení nominací, diskuze a reakce — připravujeme.",
};

export default function ForumPage() {
  return (
    <SiteShell>
      <SitePageHero
        kicker="Komunita"
        title="Fórum"
        subtitle="Tady budou sdílené nominace, komentáře a lajky. Zatím připravujeme rozhraní."
        align="center"
      />
      <BracketPickemComingSoon />
    </SiteShell>
  );
}
