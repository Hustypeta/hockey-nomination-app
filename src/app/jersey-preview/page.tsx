import type { Metadata } from "next";
import { JerseyPreviewClient } from "@/components/sestava/JerseyPreviewClient";

export const metadata: Metadata = {
  title: "Náhled dresové karty",
  description: "Prémiový vizuál slotu MOJE SESTAVA — náhled pro design.",
  robots: { index: false, follow: false },
};

export default function JerseyPreviewPage() {
  return <JerseyPreviewClient />;
}
