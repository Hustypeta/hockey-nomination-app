import type { Metadata } from "next";
import { FifaComingSoonContent } from "@/components/fifa/FifaComingSoonContent";

export const metadata: Metadata = { title: "Design náhled — Fórum", robots: { index: false, follow: false } };

export default function DesignForumPage() {
  return <FifaComingSoonContent title="Fórum" subtitle="Komunitní fórum připravujeme." />;
}
