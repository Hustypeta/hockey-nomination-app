import type { Metadata } from "next";
import { FifaHomeContent } from "@/components/fifa/FifaHomeContent";

export const metadata: Metadata = { title: "Design náhled — Domů", robots: { index: false, follow: false } };

export default function DesignHomePage() {
  return <FifaHomeContent />;
}
