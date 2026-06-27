import type { Metadata } from "next";
import { FifaNovinkyPage } from "@/components/fifa/FifaNovinkyPage";

export const metadata: Metadata = {
  title: "Design náhled — Novinky platformy",
  robots: { index: false, follow: false },
};

export default function DesignNovinkyPage() {
  return <FifaNovinkyPage />;
}
