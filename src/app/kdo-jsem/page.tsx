import type { Metadata } from "next";
import { KdoJsemContent } from "@/components/KdoJsemContent";
import { SiteShell } from "@/components/site/SiteShell";

export const metadata: Metadata = {
  title: "Kdo jsem",
  description: "Krátký úvod k autorovi projektu MS 2026 — fanouškovský editor sestavy nominace.",
};

export default function KdoJsemPage() {
  return (
    <SiteShell>
      <KdoJsemContent />
    </SiteShell>
  );
}
