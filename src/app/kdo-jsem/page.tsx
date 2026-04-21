import type { Metadata } from "next";
import { KdoJsemContent } from "@/components/KdoJsemContent";
import { SiteShell } from "@/components/site/SiteShell";

export const metadata: Metadata = {
  title: "Kdo jsem",
  description:
    "Tvůrce projektu Lineup — fanouškovský nástroj pro sestavu nominace českého hokeje.",
};

export default function KdoJsemPage() {
  return (
    <SiteShell>
      <KdoJsemContent />
    </SiteShell>
  );
}
