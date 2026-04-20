import type { Metadata } from "next";
import { PrivacyPolicyContent } from "@/components/PrivacyPolicyContent";
import { SiteShell } from "@/components/site/SiteShell";

export const metadata: Metadata = {
  title: "Ochrana osobních údajů",
  description:
    "Informace o zpracování osobních údajů v aplikaci Lineup (přihlášení Google, účet, nominace, cookies, vaše práva).",
};

export default function OchranaUdajuPage() {
  return (
    <SiteShell>
      <PrivacyPolicyContent />
    </SiteShell>
  );
}
