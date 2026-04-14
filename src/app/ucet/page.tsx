import type { Metadata } from "next";
import { SiteShell } from "@/components/site/SiteShell";
import { UserAccountHub } from "@/components/account/UserAccountHub";

export const metadata: Metadata = {
  title: "Můj účet",
  description: "Nová nominace, uložené sestavy a účast v soutěži MS 2026.",
};

export default function AccountPage() {
  return (
    <SiteShell>
      <UserAccountHub />
    </SiteShell>
  );
}
