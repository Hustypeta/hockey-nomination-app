import type { Metadata } from "next";
import { FifaSoutezeHubContent } from "@/components/fifa/FifaSoutezeHubContent";
import { SiteShell } from "@/components/site/SiteShell";

export const metadata: Metadata = {
  title: "Soutěže",
  description: "Rozcestí soutěží — MS 2026, Extraliga, squad building.",
};

export default function SoutezePage() {
  return (
    <SiteShell>
      <FifaSoutezeHubContent />
    </SiteShell>
  );
}
