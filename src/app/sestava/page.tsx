import type { Metadata } from "next";
import { Suspense } from "react";
import { NominationBuilderPage } from "@/components/NominationBuilderPage";
import { AppLoadingScreen } from "@/components/AppLoadingScreen";

export const metadata: Metadata = {
  title: "Sestav nominaci",
  description:
    "Vyber brankáře, obránce a útočníky, ulož si sestavu a sdílej ji s kamarády nebo na sociálních sítích.",
};

export default function SestavaPage() {
  return (
    <Suspense fallback={<AppLoadingScreen message="Načítám editor…" />}>
      <NominationBuilderPage />
    </Suspense>
  );
}
