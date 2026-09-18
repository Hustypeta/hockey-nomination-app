import type { Metadata } from "next";
import { PrivacyPolicyContent } from "@/components/PrivacyPolicyContent";
import { SiteShell } from "@/components/site/SiteShell";
import { pageMetadata, PAGE_SEO } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(PAGE_SEO.gdpr);

export default function OchranaUdajuPage() {
  return (
    <SiteShell>
      <PrivacyPolicyContent />
    </SiteShell>
  );
}
