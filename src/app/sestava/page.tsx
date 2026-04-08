import type { Metadata } from "next";
import { NominationBuilderPage } from "@/components/NominationBuilderPage";

export const metadata: Metadata = {
  title: "Sestav nominaci | MS 2026",
  description:
    "Vyber brankáře, obránce a útočníky, ulož si sestavu a sdílej ji s kamarády nebo na sociálních sítích.",
};

export default function SestavaPage() {
  return <NominationBuilderPage />;
}
