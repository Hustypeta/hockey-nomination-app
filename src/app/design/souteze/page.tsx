import type { Metadata } from "next";
import { FifaSoutezeHubContent } from "@/components/fifa/FifaSoutezeHubContent";

export const metadata: Metadata = { title: "Design náhled — Soutěže", robots: { index: false, follow: false } };

export default function DesignSoutezePage() {
  return <FifaSoutezeHubContent />;
}
