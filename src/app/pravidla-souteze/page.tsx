import type { Metadata } from "next";
import { ContestRulesContent } from "@/components/ContestRulesContent";
import { SiteShell } from "@/components/site/SiteShell";

export const metadata: Metadata = {
  title: "Pravidla soutěže",
  description:
    "Pravidla nominace na MS v hokeji 2026: bezplatná účast, časový bonus, bodování, ceny a vyhodnocení.",
};

export default function PravidlaSoutezePage() {
  return (
    <SiteShell>
      <ContestRulesContent />
    </SiteShell>
  );
}
