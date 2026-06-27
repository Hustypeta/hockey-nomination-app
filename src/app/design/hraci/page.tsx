import type { Metadata } from "next";
import { FifaHraciContent } from "@/components/fifa/FifaHraciContent";
import { loadNominationContestPlayers } from "@/lib/nominationContestPlayers";

export const metadata: Metadata = {
  title: "Design náhled — Hráči",
  robots: { index: false, follow: false },
};

export default function DesignHraciPage() {
  const players = loadNominationContestPlayers();
  return <FifaHraciContent players={players} />;
}
