import type { Metadata } from "next";
import { FifaSubHubContent } from "@/components/fifa/FifaSubHubContent";
import { SiteShell } from "@/components/site/SiteShell";

export const metadata: Metadata = {
  title: "MS 2027 — Česká reprezentace",
  description: "Mistrovství světa v ledním hokeji 2027 v Německu.",
};

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
