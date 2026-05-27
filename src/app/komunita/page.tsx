import type { Metadata } from "next";
import { SiteShell } from "@/components/site/SiteShell";
import { CommunityPublicApp } from "@/components/komunita-public/CommunityPublicApp";

export const metadata: Metadata = {
  title: "Komunita",
  description: "Diskutuj, sdílej sestavy, memy a analýzy s ostatními fanoušky hokeje.",
  alternates: { canonical: "/komunita" },
};

export default function KomunitaPage() {
  return (
    <SiteShell>
      <CommunityPublicApp />
    </SiteShell>
  );
}

