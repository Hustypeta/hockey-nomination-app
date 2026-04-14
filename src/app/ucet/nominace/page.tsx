import type { Metadata } from "next";
import { SiteShell } from "@/components/site/SiteShell";
import { MyNominationsPage } from "@/components/account/MyNominationsPage";

export const metadata: Metadata = {
  title: "Moje nominace",
  description: "Uložené koncepty a náhled soupisky MS 2026.",
};

export default function AccountNominationsRoute() {
  return (
    <SiteShell>
      <MyNominationsPage />
    </SiteShell>
  );
}
