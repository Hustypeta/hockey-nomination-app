import type { Metadata } from "next";
import { FifaSubHubContent } from "@/components/fifa/FifaSubHubContent";
import { SiteShell } from "@/components/site/SiteShell";

export const metadata: Metadata = {
  title: "U20 — Česká reprezentace",
  description: "Turnaje reprezentace do 20 let.",
};

export default function CeskaReprezentaceU20Page() {
  return (
    <SiteShell>
      <FifaSubHubContent
        backHref="/souteze"
        backLabel="Zpět na soutěže"
        kicker="Česká reprezentace · U20"
        title="U20"
        subtitle="Reprezentace do 20 let."
        note="Turnaje této kategorie jsou už uzavřené. Další ročníky přidáme, jakmile budou aktuální."
      />
    </SiteShell>
  );
}
