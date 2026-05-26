import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Zápasy — MS 2026",
  robots: { index: false, follow: false },
};

/** Přehled zápasů je skrytý — program je ve Fantasy. */
export default function ZapasyMs2026RedirectPage() {
  redirect("/fantasy");
}
