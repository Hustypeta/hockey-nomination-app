import type { Metadata } from "next";
import { FifaSubHubContent } from "@/components/fifa/FifaSubHubContent";
import { SiteShell } from "@/components/site/SiteShell";

export const metadata: Metadata = {
  title: "U18 — Česká reprezentace",
  description: "Turnaje reprezentace do 18 let.",
};

export default function CeskaReprezentaceU18Page() {
  return (
    <SiteShell>
      <FifaSubHubContent
        backHref="/souteze"
        backLabel="Zpět na soutěže"
        kicker="Česká reprezentace · U18"
        title="U18"
        subtitle="Reprezentace do 18 let."
        note="Turnaje této kategorie jsou už uzavřené. Další ročníky přidáme, jakmile budou aktuální."
      />
    </SiteShell>
  );
}
