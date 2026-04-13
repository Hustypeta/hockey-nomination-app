import type { Metadata } from "next";
import { JerseyPreviewClient } from "@/components/sestava/JerseyPreviewClient";
import { SiteShell } from "@/components/site/SiteShell";

export const metadata: Metadata = {
  title: "Náhled dresové karty",
  description: "Prémiový vizuál slotu MOJE SESTAVA — náhled pro design.",
  robots: { index: false, follow: false },
};

export default function JerseyPreviewPage() {
  return (
    <SiteShell>
      <JerseyPreviewClient />
    </SiteShell>
  );
}
