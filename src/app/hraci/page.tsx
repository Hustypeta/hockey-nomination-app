import type { Metadata } from "next";
import { FifaHraciContent } from "@/components/fifa/FifaHraciContent";
import { SiteShell } from "@/components/site/SiteShell";
import { loadNominationContestPlayers } from "@/lib/nominationContestPlayers";

export const metadata: Metadata = {
  title: "Hráči",
  description: "Český pool hráčů pro nominační soutěž MS 2026 — stejný seznam jako v editoru nominace.",
};

export default function HraciPage() {
  const players = loadNominationContestPlayers();

  return (
    <SiteShell>
      <FifaHraciContent players={players} />
    </SiteShell>
  );
}
