import type { Metadata } from "next";
import { FifaHraciContent } from "@/components/fifa/FifaHraciContent";
import { SiteShell } from "@/components/site/SiteShell";
import { loadNominationContestPlayers } from "@/lib/nominationContestPlayers";
import { pageMetadata, PAGE_SEO } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(PAGE_SEO.hraci);

export default function HraciPage() {
  const players = loadNominationContestPlayers();

  return (
    <SiteShell>
      <FifaHraciContent players={players} />
    </SiteShell>
  );
}
