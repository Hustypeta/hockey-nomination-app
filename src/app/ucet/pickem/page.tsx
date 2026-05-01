import type { Metadata } from "next";
import { SiteShell } from "@/components/site/SiteShell";
import { MyPickemPage } from "@/components/account/MyPickemPage";

export const metadata: Metadata = {
  title: "Koncepty Pick’em",
  description: "Uložené Pick’em tipy u tvého účtu.",
};

export default function AccountPickemRoute() {
  return (
    <SiteShell>
      <MyPickemPage />
    </SiteShell>
  );
}

