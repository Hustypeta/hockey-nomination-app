import type { Metadata } from "next";
import { FifaSubHubContent } from "@/components/fifa/FifaSubHubContent";
import { SiteShell } from "@/components/site/SiteShell";
import { pageMetadata, PAGE_SEO } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(PAGE_SEO.u18);

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
