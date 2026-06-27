import type { Metadata } from "next";
import { FifaDailyNewsPage } from "@/components/fifa/FifaDailyNewsPage";
import { SiteShell } from "@/components/site/SiteShell";

export const metadata: Metadata = {
  title: "Lineup News",
  description:
    "Zprávy a přestupy ze světa hokeje — agregace ze Sport.cz, Livesport.cz, ČT Sport a NHL.com/cs.",
};

export default function DailyNewsPage() {
  return (
    <SiteShell>
      <FifaDailyNewsPage />
    </SiteShell>
  );
}
