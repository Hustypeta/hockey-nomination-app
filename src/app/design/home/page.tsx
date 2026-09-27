import type { Metadata } from "next";
import { FifaHomeContent } from "@/components/fifa/FifaHomeContent";
import { loadHomeDashboard } from "@/lib/home/loadHomeDashboard";

export const metadata: Metadata = { title: "Design náhled — Domů", robots: { index: false, follow: false } };

export default async function DesignHomePage() {
  const dashboard = await loadHomeDashboard();
  return <FifaHomeContent dashboard={dashboard} />;
}
