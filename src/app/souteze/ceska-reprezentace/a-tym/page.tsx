import type { Metadata } from "next";
import { FifaMs2026HubCard } from "@/components/fifa/FifaMs2026HubCard";
import { FifaMs2027HubCard } from "@/components/fifa/FifaMs2027HubCard";
import { FifaSubHubContent } from "@/components/fifa/FifaSubHubContent";
import { SiteShell } from "@/components/site/SiteShell";

export const metadata: Metadata = {
  title: "A-tým — Česká reprezentace",
  description: "Turnaje seniorské reprezentace — MS 2026 a MS 2027.",
};

export default function CeskaReprezentaceATymPage() {
  return (
    <SiteShell>
      <FifaSubHubContent
        backHref="/souteze"
        backLabel="Zpět na soutěže"
        kicker="Česká reprezentace · A-tým"
        title="A-tým"
        menuCards={[<FifaMs2026HubCard key="ms-2026" />, <FifaMs2027HubCard key="ms-2027" />]}
      />
    </SiteShell>
  );
}
