import type { Metadata } from "next";
import { FifaMs2026HubCard } from "@/components/fifa/FifaMs2026HubCard";
import { FifaMs2027HubCard } from "@/components/fifa/FifaMs2027HubCard";
import { FifaSubHubContent } from "@/components/fifa/FifaSubHubContent";
import { SiteShell } from "@/components/site/SiteShell";
import { pageMetadata, PAGE_SEO } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(PAGE_SEO.aTym);

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
