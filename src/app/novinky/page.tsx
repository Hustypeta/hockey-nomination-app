import type { Metadata } from "next";
import { FifaNovinkyPage } from "@/components/fifa/FifaNovinkyPage";
import { SiteShell } from "@/components/site/SiteShell";

export const metadata: Metadata = {
  title: "Novinky na platformě Lineup",
  description: "Co je nového v Hokej Lineup — redesign, funkce a změny v aplikaci.",
};

export default function NovinkyPage() {
  return (
    <SiteShell>
      <FifaNovinkyPage />
    </SiteShell>
  );
}
