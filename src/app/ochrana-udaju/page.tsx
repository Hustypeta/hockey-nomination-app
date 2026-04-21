import type { Metadata } from "next";
import { PrivacyPolicyContent } from "@/components/PrivacyPolicyContent";
import { SiteShell } from "@/components/site/SiteShell";

export const metadata: Metadata = {
  title: "Zásady ochrany osobních údajů",
  description:
    "Zásady ochrany osobních údajů pro hokejlineup.cz a Lineup — Google přihlášení, účet, nominace, soutěže, cookies, GDPR.",
};

export default function OchranaUdajuPage() {
  return (
    <SiteShell>
      <PrivacyPolicyContent />
    </SiteShell>
  );
}
