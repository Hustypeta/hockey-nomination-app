import type { Metadata } from "next";
import { SiteShell } from "@/components/site/SiteShell";
import { MyMatchLineupsPage } from "@/components/account/MyMatchLineupsPage";

export const metadata: Metadata = {
  title: "Zápasové sestavy",
  description: "Uložené odkazy na fanouškovské sestavy na zápas u tvého účtu.",
};

export default function AccountMatchLineupsRoute() {
  return (
    <SiteShell>
      <MyMatchLineupsPage />
    </SiteShell>
  );
}

