import type { Metadata } from "next";
import { FifaSubHubContent } from "@/components/fifa/FifaSubHubContent";
import { SiteShell } from "@/components/site/SiteShell";
import { pageMetadata, PAGE_SEO } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(PAGE_SEO.ms2027);

export default function SoutezeMs2027Page() {
  return (
    <SiteShell>
      <FifaSubHubContent
        backHref="/souteze/ceska-reprezentace/a-tym"
        backLabel="Zpět na A-tým"
        kicker="Česká reprezentace · A-tým · MS 2027"
        title="MS 2027"
        subtitle="Mistrovství světa v Německu."
        note="Soutěže a nástroje pro MS 2027 připravujeme. Jakmile budou k dispozici, najdete je tady."
      />
    </SiteShell>
  );
}
