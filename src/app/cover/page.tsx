import type { Metadata } from "next";
import { SocialCoverPage } from "@/components/social/SocialCoverPage";

export const metadata: Metadata = {
  title: "Cover — Lineup",
  description: "Statické plátno pro snímek obrazovky — Facebook cover.",
  robots: { index: false, follow: false },
};

export default function CoverShortcutPage() {
  return <SocialCoverPage />;
}
