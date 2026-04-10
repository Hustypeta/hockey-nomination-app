import type { Metadata } from "next";
import { ContestRulesContent } from "@/components/ContestRulesContent";
import { SiteShell } from "@/components/site/SiteShell";

export const metadata: Metadata = {
  title: "Pravidla soutěže",
  description:
    "Vstupné, bodování, ceny a vyhodnocení fanouškovské soutěže nominace na MS v hokeji 2026.",
};

export default function PravidlaSoutezePage() {
  return (
    <SiteShell>
      <ContestRulesContent />
    </SiteShell>
  );
}
